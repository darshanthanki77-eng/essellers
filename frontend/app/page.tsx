'use client';

import { useState, useEffect } from 'react';
import {
    AmountReceivablesCard,
    TotalLifetimeSalesCard,
    TodaySalesCard,
    ThisMonthSalesCard,
    LastMonthSalesCard
} from '@/components/dashboard/MetricCard';
import SalesChart from '@/components/dashboard/SalesChart';
import FeaturedProductsCarousel from '@/components/products/FeaturedProductsCarousel';
import { TrendingUp, Package, Zap, Sparkles, Activity, ArrowUpRight, Globe, CheckCircle2, Heart, Eye, Gem, Shield, Clock, ArrowRight } from 'lucide-react';
import Shell from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, isLoading: authLoading, updateUser } = useAuth();
    const router = useRouter();

    // Original Stats from DB
    const [stats, setStats] = useState({
        amountReceivables: 0,
        totalLifetimeSales: 0,
        todaySales: 0,
        todayChange: 0,
        thisMonthSales: 0,
        thisMonthChange: 0,
        lastMonthSales: 0,
        netProfit: 0,
        netProfitMargin: 0,
        planName: 'Free Plan',
        productLimit: 0,
        totalProducts: 0,
        remainingProducts: 0,
    });

    const [chartData] = useState<any[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Fetch original stats from Database
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            setIsLoading(true);
            try {
                // Ensure profile info is fresh — pull both auth profile AND shop settings
                // so the greeting shows the latest shop name set in Shop Profile
                const [profileRes, shopRes] = await Promise.all([
                    api.get('/auth/profile'),
                    api.get('/sellers/shop-settings'),
                ]);
                if (profileRes.success || profileRes._id) {
                    const freshUser = profileRes.success ? profileRes.data : profileRes;
                    // Prefer shop_name from ShopProfile (settings) as it's explicitly set by user
                    if (shopRes.success && shopRes.data?.shop_name) {
                        freshUser.shop_name = shopRes.data.shop_name;
                    }
                    updateUser(freshUser);
                }

                // Fetch basic stats
                const statsRes = await api.get('/sellers/stats');
                if (statsRes.success) {
                    const dbStats = statsRes.stats;
                    setStats(prev => ({
                        ...prev,
                        totalLifetimeSales: dbStats.totalSales || 0,
                        amountReceivables: dbStats.guaranteeMoney || 0,
                        planName: dbStats.planName || 'Free Plan',
                        productLimit: dbStats.productLimit || 0,
                        totalProducts: dbStats.totalProducts || 0,
                        remainingProducts: dbStats.remainingProducts || 0,
                    }));
                }

                // Fetch real products for carousel (featured by admin)
                const productsRes = await api.get('/products/featured');
                if (productsRes.success) {
                    setFeaturedProducts(productsRes.data || []);
                }

                // Note: If other endpoints (Chart, Health, Feed) are not yet fully implemented in backend, 
                // they will stay empty/zero as requested (only original data)

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    // Optimized Loading: Show Shell immediately to feel fast
    if (authLoading) return null;
    if (!user) return null;

    return (
        <Shell>
            <div className="space-y-10 pb-20 max-w-[1600px] mx-auto transition-all duration-500">


                {/* Hero Welcome Section */}
                <section className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-700 rounded-[2.5rem] opacity-90 group-hover:opacity-100 transition-opacity duration-1000 shadow-[0_20px_50px_rgba(79,70,229,0.3)]"></div>
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                    {/* Floating Decorative Elements */}
                    <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
                    <div className="absolute bottom-[-20%] left-[10%] w-48 h-48 bg-purple-400/20 rounded-full blur-3xl animate-float"></div>

                    <div className="relative z-10 p-6 sm:p-10 lg:p-14 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
                        <div className="text-white space-y-4 md:space-y-6 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 animate-fade-in shadow-inner mx-auto md:mx-0">
                                <Zap className="w-3 md:w-4 h-3 md:h-4 text-yellow-300 fill-yellow-300" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Live Store Intelligence</span>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl sm:text-4xl lg:text-7xl font-black tracking-tight animate-slide-up leading-tight">
                                    Hello, <span className="text-yellow-300">{(user.shop_name || user.name || 'Seller').toUpperCase()}</span>!
                                </h1>
                                <p className="text-base md:text-xl text-primary-50 opacity-90 animate-slide-up stagger-1 max-w-lg mx-auto md:mx-0">
                                    Welcome back to your dashboard. All systems are online and running smoothly.
                                </p>
                            </div>
                        </div>

                        {/* Single Store Health Card */}
                        <div className="relative animate-float-premium">
                            <div className="glass-card !bg-white/98 dark:!bg-slate-900/98 border-white/50 dark:border-slate-800/50 p-7 w-76 backdrop-blur-3xl shadow-[0_25px_60px_rgba(0,0,0,0.13)] rotate-2 hover:rotate-0 transition-all duration-700 relative overflow-hidden group/card" style={{ width: '300px' }}>
                                {/* Top accent bar */}
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500"></div>

                                {/* Subtle background glow */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-100/40 rounded-full blur-3xl"></div>

                                <div className="relative z-10 text-left space-y-5">
                                    {/* Header Row */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shadow-inner">
                                                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-100">Store Health</span>
                                        </div>
                                        <span className="text-[10px] font-black text-white px-3 py-1.5 bg-emerald-500 rounded-full tracking-wider shadow-md flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse inline-block"></span>
                                            ACTIVE
                                        </span>
                                    </div>

                                    {/* Score */}
                                    <div>
                                        <h4 className="text-[3.8rem] font-black text-slate-900 dark:text-slate-100 leading-none tracking-tighter">98%</h4>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5">
                                            <span>Performance</span>
                                            <span className="text-emerald-600 dark:text-emerald-400">Excellent</span>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)] transition-all duration-1000"
                                                style={{ width: '98%' }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Last Updated */}
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shadow-sm" />
                                        Last Updated: <span className="text-slate-600 dark:text-slate-300 font-bold">Today</span>
                                    </p>

                                    {/* Show Detail Button — visible to all (admin can control via backend) */}
                                    <button
                                        onClick={() => { }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 active:scale-95"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Show Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* Main Stats Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 animate-slide-up stagger-1">
                    <div className="sm:col-span-2 lg:col-span-2">
                        <AmountReceivablesCard amount={stats.amountReceivables} />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-2">
                        <TotalLifetimeSalesCard amount={stats.totalLifetimeSales} />
                    </div>
                    <div className="sm:col-span-2 sm:col-start-1 md:col-start-auto lg:col-span-1">
                        <TodaySalesCard amount={stats.todaySales} change={stats.todayChange} />
                    </div>
                </section>

                {/* Sub Stats & Net Profit Row */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up stagger-2">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ThisMonthSalesCard amount={stats.thisMonthSales} change={stats.thisMonthChange} />
                        <LastMonthSalesCard amount={stats.lastMonthSales} />
                    </div>

                    <div className="premium-card relative overflow-hidden group/profit min-h-[250px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-success-600 to-emerald-700 group-hover:scale-110 transition-transform duration-700 opacity-95"></div>
                        <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-between text-white text-left">
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-success-200 truncate">Total Net Profit</p>
                                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mt-2 leading-none truncate">
                                        ${stats.netProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                    </h3>
                                </div>
                                <div className="p-3 md:p-4 bg-white/20 rounded-2xl shadow-xl backdrop-blur-md group-hover/profit:rotate-12 transition-transform shrink-0">
                                    <TrendingUp className="w-8 h-8 md:w-10 md:h-10" />
                                </div>
                            </div>

                            <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-white/20">
                                <div className="flex justify-between items-end gap-2 text-left">
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider truncate">Margin Percentage</p>
                                        <p className="text-2xl md:text-3xl font-black text-yellow-300">{stats.netProfitMargin}%</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="flex items-center gap-1 text-success-300 font-bold justify-end">
                                            <ArrowUpRight className="w-4 h-4" />
                                            <span className="text-xs md:text-sm">Active</span>
                                        </div>
                                        <p className="text-[9px] md:text-[10px] text-white/40 uppercase tracking-widest font-bold">Data Status</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Analytics Split */}
                {/* Performance & Analytics Section - Full Width */}
                <section className="animate-slide-up stagger-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-8 px-4 gap-4 text-left">
                        <div className="flex items-center gap-4 w-full">
                            <div className="p-3.5 bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[1.2rem] shrink-0 border border-gray-100 dark:border-slate-800">
                                <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 leading-none tracking-tight">Performance</h2>
                                <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold mt-1.5 tracking-wide">Real-time revenue stream tracking</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card p-6 md:p-10 !bg-white/60 dark:!bg-slate-900/60">
                        <SalesChart data={chartData} />
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="animate-slide-up stagger-4 space-y-8 text-left">
                        <div className="glass-card p-6 !bg-white/40 dark:!bg-slate-800/40 border-white/60 dark:border-slate-700/60 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold flex items-center gap-2 dark:text-slate-100">
                                    <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    Live Shop Feed
                                </h3>
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
                                </span>
                            </div>
                            <div className="space-y-4">
                                {isLoading ? (
                                    <p className="text-xs text-gray-400 p-4 text-center">Syncing feed...</p>
                                ) : (
                                    <p className="text-xs text-gray-400 dark:text-slate-500 p-8 text-center bg-white/30 dark:bg-slate-900/30 rounded-2xl italic">No recent activity detected.</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="text-left">
                        <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.2)] h-full transition-all duration-500" style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)' }}>
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]"></div>
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

                            <div className="relative z-10 p-8 flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Current Plan</p>
                                            <p className="text-xs font-bold text-white/70">Subscription Current Plan</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-white bg-white/20 border border-white/30 px-4 py-1.5 rounded-full tracking-[0.15em] backdrop-blur-md">ACTIVE</span>
                                </div>

                                {/* Central Diamond */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.2)] border border-white/30 mb-6 relative">
                                        <div className="absolute inset-0 bg-white/30 rounded-full blur-xl scale-75"></div>
                                        <Gem className="w-12 h-12 text-white drop-shadow-2xl relative z-10" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md text-center">ENTERPRISE PRO</h3>

                                    <div className="flex items-baseline gap-2 mt-2">
                                        <span className="text-4xl font-black text-white">$450</span>
                                        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Single Charge</span>
                                    </div>
                                </div>

                                {/* Features Pills */}
                                <div className="flex flex-wrap justify-center gap-2 mb-8 flex-1">
                                    {[
                                        { text: '18,000 Products Limit', icon: '⚡' },
                                        { text: 'Multiple Storefronts', icon: '🌐' },
                                        { text: 'Dedicated Account Manager', icon: '👤' },
                                        { text: 'API Access', icon: '📡' },
                                        { text: 'Global Logistics Network', icon: '🌍' },
                                        { text: 'Whiteglove Onboarding', icon: '💎' }
                                    ].map((f, i) => (
                                        <span key={i} className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-[10px] font-bold text-white backdrop-blur-md flex items-center gap-1.5">
                                            <span className="opacity-80">{f.icon}</span> {f.text}
                                        </span>
                                    ))}
                                </div>

                                {/* Bottom Button & Stats */}
                                <div className="space-y-6">
                                    <button onClick={() => router.push('/packages')} className="w-full flex items-center justify-center gap-2 py-4 bg-white text-primary-700 rounded-2xl font-black text-sm tracking-uppercase transition-all shadow-xl active:scale-95">
                                        Upgrade Level <ArrowRight className="w-5 h-5" />
                                    </button>

                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-xl font-black text-white">3.2K</p>
                                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Used</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-white">6.8K</p>
                                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Remaining</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-pink-200">30d</p>
                                            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Expires</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sections */}
                <section className="animate-slide-up stagger-4 text-left">
                    <div className="flex items-center justify-between mb-8 px-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-gray-100 dark:border-slate-800">
                                <Package className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="text-left">
                                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-slate-100 leading-none">Your Products</h2>
                                <p className="text-sm text-gray-400 dark:text-slate-500 font-medium mt-1">Real-time inventory from your store</p>
                            </div>
                        </div>
                    </div>
                    {featuredProducts.length > 0 ? (
                        <FeaturedProductsCarousel products={featuredProducts} />
                    ) : (
                        <div className="glass-card p-20 text-center !bg-white/40 dark:!bg-slate-800/40 border-dashed border-2 border-gray-200 dark:border-slate-700">
                            <Package className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-slate-400 font-medium">No products found in your store.</p>
                            <button onClick={() => router.push('/products')} className="mt-4 text-primary-600 dark:text-primary-400 font-black text-sm uppercase tracking-widest hover:underline">Add First Product</button>
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className="text-center pt-16 mt-16 border-t border-gray-100 dark:border-slate-800">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-400 dark:text-slate-500">
                            © 2026 <span className="gradient-text font-black tracking-tighter">SmartSeller Pro</span>.
                            All systems operational.
                        </p>
                    </div>
                </footer>
            </div >

            <style jsx global>{`
                @keyframes float-premium {
                    0%, 100% { transform: translateY(0) scale(1) rotate(0); }
                    50% { transform: translateY(-15px) scale(1.02) rotate(2deg); }
                }
                .animate-float-premium {
                    animation: float-premium 6s ease-in-out infinite;
                }
                @keyframes scale-in {
                    0% { opacity: 0; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
            `}</style>
        </Shell >
    );
}
