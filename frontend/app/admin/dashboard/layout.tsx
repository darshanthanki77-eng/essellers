'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard, Users, Package, CreditCard, ArrowDownCircle,
    ShoppingCart, Box, LogOut, Shield, Menu, X, ChevronRight, Settings, Sparkles, LifeBuoy
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { label: 'Users', icon: Users, href: '/admin/dashboard/users' },
    { label: 'Packages', icon: Package, href: '/admin/dashboard/packages' },
    { label: 'Package Plans', icon: Package, href: '/admin/dashboard/package-plans' },
    { label: 'Spread Packages', icon: Sparkles, href: '/admin/dashboard/spread-packages' },
    { label: 'Recharge', icon: CreditCard, href: '/admin/dashboard/recharge' },
    { label: 'Withdraw', icon: ArrowDownCircle, href: '/admin/dashboard/withdraw' },
    { label: 'Orders', icon: ShoppingCart, href: '/admin/dashboard/orders' },
    { label: 'Products', icon: Box, href: '/admin/dashboard/products' },
    { label: 'Support', icon: LifeBuoy, href: '/admin/dashboard/support' },
    { label: 'Crypto Settings', icon: Settings, href: '/admin/dashboard/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [adminUser, setAdminUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);


    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        const user = localStorage.getItem('adminUser');
        if (!token || !user) {
            router.push('/admin');
            return;
        }
        try {
            const parsed = JSON.parse(user);
            if (parsed.role !== 'admin') { router.push('/admin'); return; }
            setAdminUser(parsed);
        } catch { router.push('/admin'); }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin');
    };

    if (!adminUser) {
        return (
            <div style={{
                minHeight: '100vh', background: '#0f0c29',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1',
                    animation: 'spin 0.8s linear infinite'
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0f0c29', fontFamily: "'Inter', sans-serif" }}>
            {/* Sidebar */}
            <aside style={{
                width: sidebarOpen ? '260px' : '70px',
                background: 'rgba(255,255,255,0.04)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column',
                transition: 'width 0.3s ease', overflow: 'hidden', flexShrink: 0,
                position: 'sticky', top: 0, height: '100vh'
            }}>
                {/* Logo */}
                <div style={{
                    padding: '20px 16px', display: 'flex', alignItems: 'center',
                    gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div style={{
                        width: '36px', height: '36px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Shield size={18} color="white" />
                    </div>
                    {sidebarOpen && (
                        <div>
                            <div style={{ color: 'white', fontWeight: '800', fontSize: '14px', lineHeight: 1 }}>Admin Panel</div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>ESSmartseller</div>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            marginLeft: 'auto', background: 'none', border: 'none',
                            color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px',
                            display: 'flex', alignItems: 'center', flexShrink: 0
                        }}
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    padding: '11px 12px', borderRadius: '12px', marginBottom: '4px',
                                    background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))' : 'transparent',
                                    border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                    color: isActive ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    whiteSpace: 'nowrap', overflow: 'hidden'
                                }}>
                                    <item.icon size={18} style={{ flexShrink: 0, color: isActive ? '#818cf8' : 'rgba(255,255,255,0.4)' }} />
                                    {sidebarOpen && (
                                        <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
                                    )}
                                    {sidebarOpen && isActive && (
                                        <ChevronRight size={14} style={{ marginLeft: 'auto', color: '#818cf8' }} />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User info */}
                <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', flexShrink: 0, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: '700', fontSize: '13px'
                        }}>
                            {adminUser.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        {sidebarOpen && (
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ color: 'white', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminUser.name}</div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Admin</div>
                            </div>
                        )}
                        {sidebarOpen && (
                            <button onClick={handleLogout} style={{
                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                                cursor: 'pointer', padding: '4px', display: 'flex'
                            }}>
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
                {children}
            </main>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                ::-webkit-scrollbar { width: 6px; height: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
                a:hover > div { background: rgba(255,255,255,0.06) !important; border-color: rgba(255,255,255,0.08) !important; color: rgba(255,255,255,0.8) !important; }
            `}</style>
        </div>
    );
}
