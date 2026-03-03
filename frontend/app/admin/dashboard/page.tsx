'use client';

import { useEffect, useState } from 'react';
import { Users, Package, CreditCard, ArrowDownCircle, ShoppingCart, Box, TrendingUp, Clock, AlertCircle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
            padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start'
        }}>
            <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon size={20} color={color} />
            </div>
            <div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{label}</div>
                <div style={{ color: 'white', fontSize: '24px', fontWeight: '800', lineHeight: 1 }}>{value}</div>
                {sub && <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '4px' }}>{sub}</div>}
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => { if (d.success) setStats(d.stats); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            <div style={{
                width: '40px', height: '40px', border: '3px solid rgba(99,102,241,0.3)',
                borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite'
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{
                    fontSize: '28px', fontWeight: '800', margin: '0 0 6px',
                    background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>Welcome Back, Admin 👋</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
                    Here's an overview of your platform
                </p>
            </div>

            {/* Alert badges */}
            {stats && (stats.pendingRecharges > 0 || stats.pendingWithdrawals > 0) && (
                <div style={{
                    display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px'
                }}>
                    {stats.pendingRecharges > 0 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                            borderRadius: '10px', padding: '10px 16px'
                        }}>
                            <AlertCircle size={16} color="#fbbf24" />
                            <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600' }}>
                                {stats.pendingRecharges} Recharge requests pending
                            </span>
                        </div>
                    )}
                    {stats.pendingWithdrawals > 0 && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '10px', padding: '10px 16px'
                        }}>
                            <AlertCircle size={16} color="#f87171" />
                            <span style={{ color: '#f87171', fontSize: '13px', fontWeight: '600' }}>
                                {stats.pendingWithdrawals} Withdrawal requests pending
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Stats grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px', marginBottom: '32px'
            }}>
                <StatCard icon={Users} label="Total Sellers" value={stats?.totalUsers ?? 0} sub={`+${stats?.newSellers ?? 0} this month`} color="#6366f1" />
                <StatCard icon={Box} label="Products" value={stats?.totalProducts ?? 0} sub="In storehouse" color="#8b5cf6" />
                <StatCard icon={ShoppingCart} label="Total Orders" value={stats?.totalOrders ?? 0} sub={`${stats?.ordersThisMonth ?? 0} this month`} color="#06b6d4" />
                <StatCard icon={CreditCard} label="Recharges" value={stats?.totalRecharges ?? 0} sub={`${stats?.pendingRecharges ?? 0} pending`} color="#10b981" />
                <StatCard icon={ArrowDownCircle} label="Withdrawals" value={stats?.totalWithdrawals ?? 0} sub={`${stats?.pendingWithdrawals ?? 0} pending`} color="#f59e0b" />
                <StatCard icon={Package} label="Packages" value={stats?.totalPackages ?? 0} sub="Purchased" color="#ec4899" />
                <StatCard icon={TrendingUp} label="Revenue" value={`₹${(stats?.totalRevenue ?? 0).toFixed(0)}`} sub="Total recharges approved" color="#14b8a6" />
            </div>

            {/* Quick Links */}
            <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', padding: '24px'
            }}>
                <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: '0 0 16px' }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Manage Users', href: '/admin/dashboard/users', color: '#6366f1' },
                        { label: 'Approve Recharges', href: '/admin/dashboard/recharge', color: '#10b981' },
                        { label: 'Process Withdrawals', href: '/admin/dashboard/withdraw', color: '#f59e0b' },
                        { label: 'View Orders', href: '/admin/dashboard/orders', color: '#06b6d4' },
                        { label: 'Add Products', href: '/admin/dashboard/products', color: '#8b5cf6' },
                    ].map(a => (
                        <a key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                padding: '10px 18px', borderRadius: '10px',
                                background: `${a.color}22`, border: `1px solid ${a.color}44`,
                                color: a.color, fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                            }}>
                                {a.label}
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
