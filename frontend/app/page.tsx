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
import { TrendingUp, Package, Zap, Sparkles, Activity, ArrowUpRight, Gem, ArrowRight } from 'lucide-react';
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

                        {/* Compact Plan Card */}
                        <div className="relative animate-float-premium shrink-0" style={{ width: '270px' }}>
                            <div className="relative overflow-hidden rounded-[1.6rem] rotate-2 hover:rotate-0 transition-all duration-700 shadow-[0_25px_60px_rgba(0,0,0,0.25)]" style={{ background: 'linear-gradient(135deg, #6C63FF 0%, #9F7AEA 50%, #EC4899 100%)' }}>
                                {/* Glass overlay */}
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                                {/* Glow orb */}
                                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>

                                <div className="relative z-10 p-5">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-inner">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-white/60 uppercase tracking-[0.18em]">Current Plan</p>
                                                <p className="text-[10px] font-bold text-white/80">
                                                    {stats.planName === 'Free Plan' ? 'Free subscription' : 'Premium subscription'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[8px] font-black text-white bg-white/20 border border-white/30 px-2.5 py-1 rounded-full tracking-widest backdrop-blur-md">
                                            ACTIVE
                                        </span>
                                    </div>

                                    {/* Plan Icon */}
                                    <div className="flex justify-center mb-3">
                                        <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/40">
                                            <Gem className="w-8 h-8 text-white drop-shadow-lg" />
                                        </div>
                                    </div>

                                    {/* Plan Name */}
                                    <h3 className="text-center text-lg font-black text-white tracking-tight mb-3 drop-shadow-sm">
                                        {stats.planName || 'Free Plan'}
                                    </h3>

                                    {/* Feature Badges */}
                                    <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                                        <span className="text-[9px] font-bold text-white bg-white/15 border border-white/25 px-2 py-1 rounded-full backdrop-blur-sm">
                                            ⚡ {stats.productLimit > 0 ? `${(stats.productLimit / 1000).toFixed(0)}K Limit` : 'No Limit'}
                                        </span>
                                        <span className="text-[9px] font-bold text-white bg-white/15 border border-white/25 px-2 py-1 rounded-full backdrop-blur-sm">
                                            📈 20% Profit
                                        </span>
                                        <span className="text-[9px] font-bold text-white bg-white/15 border border-white/25 px-2 py-1 rounded-full backdrop-blur-sm">
                                            🛡️ 24/7 Support
                                        </span>
                                        <span className="text-[9px] font-bold text-white bg-white/15 border border-white/25 px-2 py-1 rounded-full backdrop-blur-sm">
                                            📡 API Access
                                        </span>
                                    </div>

                                    {/* Upgrade Button */}
                                    <button
                                        onClick={() => router.push('/packages')}
                                        className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white/95 hover:bg-white text-slate-800 rounded-xl font-black text-xs tracking-wide transition-all shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        Upgrade Level <ArrowRight className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-1 mt-4 pt-3 border-t border-white/20 text-center">
                                        <div>
                                            <p className="text-sm font-black text-white leading-none">{stats.totalProducts > 999 ? `${(stats.totalProducts / 1000).toFixed(1)}K` : stats.totalProducts}</p>
                                            <p className="text-[8px] font-bold text-white/50 uppercase tracking-wide mt-0.5">Used</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-cyan-300 leading-none">{stats.remainingProducts > 999 ? `${(stats.remainingProducts / 1000).toFixed(1)}K` : stats.remainingProducts}</p>
                                            <p className="text-[8px] font-bold text-white/50 uppercase tracking-wide mt-0.5">Remaining</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white leading-none">30d</p>
                                            <p className="text-[8px] font-bold text-white/50 uppercase tracking-wide mt-0.5">Expires</p>
                                        </div>
                                    </div>
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

                    <section className="animate-slide-up stagger-4 text-left">
                        <div className="premium-card p-6 bg-gradient-to-br from-slate-900 to-indigo-900 text-white relative overflow-hidden group h-full">
                            <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/5 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-bold mb-2">Quick Actions</h3>
                            <p className="text-sm text-indigo-100/60 leading-relaxed mb-4">Manage your store performance, products, and health metrics all in one place.</p>
                            <div className="flex flex-col gap-2">
                                <button className="text-xs font-bold text-white underline decoration-primary-500 decoration-2 underline-offset-4 hover:text-primary-400 transition-colors text-left">View Store Health →</button>
                                <button className="text-xs font-bold text-white underline decoration-violet-400 decoration-2 underline-offset-4 hover:text-violet-300 transition-colors text-left">View Virtual Store →</button>
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
