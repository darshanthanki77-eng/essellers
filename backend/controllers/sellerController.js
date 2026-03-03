const mongoose = require('mongoose');
const Seller = require('../models/Seller');
const PaymentDetails = require('../models/PaymentDetails');
const Product = require('../models/Product');
const Order = require('../models/Order');
const GuaranteeMoney = require('../models/GuaranteeMoney');

const SellerProduct = require('../models/SellerProduct');
const ShopProfile = require('../models/ShopProfile');
const Package = require('../models/Package');
const { getAvailableBalance } = require('../utils/wallet');

// @desc    Get seller dashboard statistics
// @route   GET /api/sellers/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const seller = await Seller.findById(sellerId);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        // --- Consistent ID Matching Logic ---
        // Some collections store seller_id as ObjectId, some as Number (the 'id' field), some as String.
        // We catch all possibilities here.
        const sellerIdFilter = [
            seller._id,
            seller.id,
            String(seller._id),
            String(seller.id)
        ].filter(v => v !== undefined && v !== null);

        // 1. Total Products
        const totalProducts = await SellerProduct.countDocuments({
            seller_id: { $in: sellerIdFilter }
        });

        // 2. Total Orders (assigned to this seller)
        const totalOrders = await Order.countDocuments({
            seller_id: { $in: sellerIdFilter }
        });

        // 3. Total Sales (Confirmed/Completed orders volume)
        // More robust aggregation: filter out empty totals before converting
        const salesResult = await Order.aggregate([
            {
                $match: {
                    seller_id: { $in: sellerIdFilter },
                    status: { $regex: 'processing|shipped|completed|delivered', $options: 'i' }
                }
            },
            {
                $project: {
                    order_total_val: {
                        $cond: {
                            if: { $and: [{ $ne: ["$order_total", ""] }, { $ne: ["$order_total", null] }] },
                            then: { $toDouble: "$order_total" },
                            else: 0
                        }
                    }
                }
            },
            { $group: { _id: null, total: { $sum: "$order_total_val" } } }
        ]);
        const totalSales = salesResult.length > 0 ? salesResult[0].total : 0;

        // 4. Guarantee Money (Sum of approved records)
        // Linking by seller.id which is the numeric ID used in GuaranteeMoney collection
        const guaranteeResult = await GuaranteeMoney.aggregate([
            { $match: { seller_id: { $in: [seller.id, String(seller.id)] }, status: 1 } },
            { $group: { _id: null, total: { $sum: { $toDouble: { $ifNull: ["$amount", 0] } } } } }
        ]);
        const guaranteeMoney = guaranteeResult.length > 0 ? (guaranteeResult[0].total || 0) : 0;

        // 5. Package & Product Limits
        const activePackage = await Package.findOne({ seller_id: seller._id, status: 1 }).sort({ created_at: -1 });
        const productLimit = activePackage ? activePackage.product_limit : 0;
        const remainingProducts = Math.max(0, productLimit - totalProducts);

        // 6. Category-wise Counts
        // First get all items to get their product detail categories
        const myProductLinks = await SellerProduct.find({ seller_id: { $in: sellerIdFilter } });
        const productIds = myProductLinks.map(l => l.product_id);

        const categoryCounts = await Product.aggregate([
            {
                $match: {
                    $or: [
                        { _id: { $in: productIds.filter(id => mongoose.isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id)) } },
                        { id: { $in: productIds } }
                    ]
                }
            },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const availableBalance = await getAvailableBalance(seller._id);

        res.status(200).json({
            success: true,
            stats: {
                totalProducts,
                totalOrders,
                totalSales,
                guaranteeMoney: seller.guarantee_balance || guaranteeMoney,
                mainWallet: availableBalance,
                productLimit,
                remainingProducts,
                planName: activePackage ? activePackage.type : 'N/A',
                categoryCounts
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all sellers
// @route   GET /api/sellers
// @access  Public/Admin
exports.getSellers = async (req, res) => {
    try {
        const sellers = await Seller.find({}).sort({ createdAt: -1 });

        const sellersWithDetails = await Promise.all(sellers.map(async (seller) => {
            const payment = await PaymentDetails.findOne({ seller_id: seller._id });
            return {
                ...seller.toObject(),
                payment: payment || {
                    bank_name: 'N/A',
                    account_name: 'N/A',
                    account_number: 'N/A',
                    routing_number: 'N/A'
                }
            };
        }));

        res.status(200).json({
            success: true,
            count: sellers.length,
            sellers: sellersWithDetails
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get details for a specific seller
// @route   GET /api/sellers/:id
// @access  Public/Admin
exports.getSellerById = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }
        const payment = await PaymentDetails.findOne({ seller_id: seller._id });

        res.status(200).json({
            success: true,
            seller: {
                ...seller.toObject(),
                payment: payment || {}
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update seller details
// @route   PUT /api/sellers/:id
// @access  Private/Admin
exports.updateSeller = async (req, res) => {
    try {
        const sellerId = req.params.id;
        const {
            name, email, password, shop_name, freeze,
            bank_name, account_name, account_number, routing_number,
            usdt_link, usdt_address
        } = req.body;

        const seller = await Seller.findById(sellerId);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        // Update Seller Fields
        if (name) seller.name = name;
        if (email) seller.email = email;
        if (shop_name) seller.shop_name = shop_name;
        if (typeof freeze !== 'undefined') seller.freeze = freeze;

        // Password update (will be hashed by pre-save hook if modified)
        if (password && password.trim() !== '') {
            seller.password = password;
        }

        await seller.save();

        // Update Payment Details
        let payment = await PaymentDetails.findOne({ seller_id: seller._id });

        if (!payment) {
            payment = new PaymentDetails({ seller_id: seller._id });
        }

        if (bank_name) payment.bank_name = bank_name;
        if (account_name) payment.account_name = account_name;
        if (account_number) payment.account_number = account_number;
        if (routing_number) payment.routing_number = routing_number;
        if (usdt_link) payment.usdt_link = usdt_link;
        if (usdt_address) payment.usdt_address = usdt_address;

        await payment.save();

        res.status(200).json({
            success: true,
            message: 'Seller updated successfully',
            seller: {
                ...seller.toObject(),
                payment
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new seller
// @route   POST /api/sellers
// @access  Private/Admin
exports.createSeller = async (req, res) => {
    try {
        const {
            name, email, password, trans_password, shop_name,
            cert_type, ratings, views
        } = req.body;

        const sellerExists = await Seller.findOne({ email });

        if (sellerExists) {
            return res.status(400).json({ success: false, message: 'Seller already exists with this email' });
        }

        let cert_front = '';
        let cert_back = '';

        if (req.files) {
            if (req.files.cert_front) {
                cert_front = `/uploads/${req.files.cert_front[0].filename}`;
            }
            if (req.files.cert_back) {
                cert_back = `/uploads/${req.files.cert_back[0].filename}`;
            }
        }

        const seller = await Seller.create({
            name,
            email,
            password,
            trans_password,
            shop_name,
            cert_type,
            cert_front,
            cert_back,
            ratings: ratings || 0,
            views: views || 0,
            verified: 1, // Auto-verify if created by admin
        });

        if (seller) {
            // Create empty payment details for the new seller
            await PaymentDetails.create({ seller_id: seller._id });

            res.status(201).json({
                success: true,
                message: 'Seller created successfully',
                seller
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid seller data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Get Shop Settings
// @route   GET /api/sellers/shop-settings
// @access  Private/Seller
exports.getShopSettings = async (req, res) => {
    try {
        const sellerId = req.user._id;
        let shopProfile = await ShopProfile.findOne({ seller_id: sellerId });

        if (!shopProfile) {
            // Return default/empty structure if not found
            return res.status(200).json({
                success: true,
                data: {
                    shop_name: req.user.shop_name || '', // Fallback to seller's shop_name
                    shop_logo: '',
                    shop_contact: '',
                    shop_address: '',
                    shop_metatitle: '',
                    shop_metadesc: '',
                    language: req.user.language || 'English (US)',
                    settings: req.user.settings || {
                        currency: 'USD',
                        timezone: 'UTC',
                        theme: 'light',
                        notifications: { orders: true, stock: true, reviews: false, reports: false },
                        twoFactor: false
                    }
                }
            });
        }

        res.status(200).json({
            success: true,
            data: {
                ...(shopProfile ? shopProfile.toObject() : {}),
                language: req.user.language || 'English (US)',
                settings: req.user.settings || {
                    currency: 'USD',
                    timezone: 'UTC',
                    theme: 'light',
                    notifications: { orders: true, stock: true, reviews: false, reports: false },
                    twoFactor: false
                }
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Shop Settings
// @route   PUT /api/sellers/shop-settings
// @access  Private/Seller
exports.updateShopSettings = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const {
            shop_name,
            shop_contact,
            shop_address,
            shop_metatitle,
            shop_metadesc,
            language,
            settings
        } = req.body;

        if (language) {
            req.user.language = language;
        }

        if (settings) {
            // Merge settings object to avoid overwriting all but keep top level structure
            req.user.settings = { ...req.user.settings, ...settings };
        }

        if (language || settings) {
            await req.user.save();
        }

        let shopProfile = await ShopProfile.findOne({ seller_id: sellerId });

        let shop_logo = '';
        if (req.files && req.files.shop_logo) {
            shop_logo = `/uploads/${req.files.shop_logo[0].filename}`;
        }

        if (shopProfile) {
            // Update
            shopProfile.shop_name = shop_name || shopProfile.shop_name;
            shopProfile.shop_contact = shop_contact || shopProfile.shop_contact;
            shopProfile.shop_address = shop_address || shopProfile.shop_address;
            shopProfile.shop_metatitle = shop_metatitle || shopProfile.shop_metatitle;
            shopProfile.shop_metadesc = shop_metadesc || shopProfile.shop_metadesc;

            if (shop_logo) {
                shopProfile.shop_logo = shop_logo;
            }

            await shopProfile.save();
        } else {
            // Create
            shopProfile = await ShopProfile.create({
                seller_id: sellerId,
                shop_name: shop_name || req.user.shop_name,
                shop_contact,
                shop_address,
                shop_metatitle,
                shop_metadesc,
                shop_logo
            });
        }

        res.status(200).json({
            success: true,
            message: 'Shop settings updated successfully',
            data: shopProfile
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const seller = await Seller.findById(req.user._id);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        if (!(await seller.matchPassword(currentPassword))) {
            return res.status(400).json({ success: false, message: 'Invalid current password' });
        }

        seller.password = newPassword;
        await seller.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update Transaction Password
// @route   PUT /api/sellers/transaction-password
// @access  Private
exports.updateTransactionPassword = async (req, res) => {
    try {
        const { currentPassword, newTransactionPassword } = req.body;
        const seller = await Seller.findById(req.user._id);

        if (!seller) {
            return res.status(404).json({ success: false, message: 'Seller not found' });
        }

        // Must verify current login password to change transaction password
        if (!(await seller.matchPassword(currentPassword))) {
            return res.status(400).json({ success: false, message: 'Invalid current login password' });
        }

        seller.trans_password = newTransactionPassword;
        await seller.save();

        res.status(200).json({
            success: true,
            message: 'Transaction password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getSellers: exports.getSellers,
    getSellerById: exports.getSellerById,
    getDashboardStats: exports.getDashboardStats,
    updateSeller: exports.updateSeller,
    createSeller: exports.createSeller,
    getShopSettings: exports.getShopSettings,
    updateShopSettings: exports.updateShopSettings,
    updateTransactionPassword: exports.updateTransactionPassword,
    updatePassword: exports.updatePassword
};
