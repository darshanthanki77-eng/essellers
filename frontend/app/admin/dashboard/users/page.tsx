'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Trash2, Shield, ShieldOff, CheckCircle, XCircle, RefreshCw, Package } from 'lucide-react';

function Badge({ children, color }: any) {
    const colors: any = {
        green: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
        red: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
        yellow: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
        gray: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)', text: 'rgba(255,255,255,0.5)' },
    };
    const c = colors[color] || colors.gray;
    return (
        <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
            background: c.bg, border: `1px solid ${c.border}`, color: c.text
        }}>{children}</span>
    );
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/admin/users?page=${page}&keyword=${keyword}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (data.success) {
            setUsers(data.users);
            setTotal(data.total);
            setPages(data.pages);
        }
        setLoading(false);
    }, [page, keyword]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleAction = async (id: string, updates: any) => {
        setActionLoading(id);
        const token = localStorage.getItem('adminToken');
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(updates)
        });
        await fetchUsers();
        setActionLoading(null);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        setActionLoading(id);
        const token = localStorage.getItem('adminToken');
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, {
            method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
        });
        await fetchUsers();
        setActionLoading(null);
    };

    return (
        <div style={{ padding: '32px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px' }}>Manage Users</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>{total} total sellers</p>
                </div>
                <button onClick={fetchUsers} style={{
                    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '10px', color: '#818cf8', padding: '8px 12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600'
                }}>
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '20px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                    value={keyword}
                    onChange={e => { setKeyword(e.target.value); setPage(1); }}
                    placeholder="Search by name, email, shop..."
                    style={{
                        width: '100%', padding: '10px 10px 10px 36px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px', color: 'white', fontSize: '14px', outline: 'none',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* Table */}
            <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {['ID', 'Name', 'Email', 'Shop', 'Status', 'Verified', 'Products', 'Actions'].map(h => (
                                    <th key={h} style={{
                                        padding: '14px 16px', textAlign: 'left',
                                        fontSize: '11px', fontWeight: '700',
                                        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em'
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Loading...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No users found</td></tr>
                            ) : users.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>{u.id || '—'}</td>
                                    <td style={{ padding: '12px 16px', fontWeight: '600', fontSize: '14px' }}>{u.name}</td>
                                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{u.email}</td>
                                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{u.shop_name}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <Badge color={u.freeze === 1 ? 'red' : 'green'}>{u.freeze === 1 ? 'Frozen' : 'Active'}</Badge>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <Badge color={u.verified === 1 ? 'green' : 'yellow'}>{u.verified === 1 ? 'Verified' : 'Pending'}</Badge>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button
                                            onClick={() => router.push(`/admin/dashboard/products?seller_id=${u._id}&seller_name=${encodeURIComponent(u.name || u.shop_name || 'Seller')}`)}
                                            title="View Products"
                                            style={{
                                                background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                                                borderRadius: '8px', padding: '5px 10px', cursor: 'pointer',
                                                color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px',
                                                fontSize: '11px', fontWeight: '700'
                                            }}
                                        >
                                            <Package size={12} /> View
                                        </button>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                onClick={() => handleAction(u._id, { freeze: u.freeze === 1 ? 0 : 1 })}
                                                disabled={actionLoading === u._id}
                                                title={u.freeze === 1 ? 'Unfreeze' : 'Freeze'}
                                                style={{
                                                    background: u.freeze === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                                    border: u.freeze === 1 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(239,68,68,0.3)',
                                                    borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                                                    color: u.freeze === 1 ? '#10b981' : '#f87171', display: 'flex'
                                                }}
                                            >
                                                {u.freeze === 1 ? <ShieldOff size={14} /> : <Shield size={14} />}
                                            </button>
                                            <button
                                                onClick={() => handleAction(u._id, { verified: u.verified === 1 ? 0 : 1 })}
                                                disabled={actionLoading === u._id}
                                                title={u.verified === 1 ? 'Unverify' : 'Verify'}
                                                style={{
                                                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                                                    borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                                                    color: '#818cf8', display: 'flex'
                                                }}
                                            >
                                                {u.verified === 1 ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u._id, u.name)}
                                                disabled={actionLoading === u._id}
                                                style={{
                                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                                    borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                                                    color: '#f87171', display: 'flex'
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{
                        padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px',
                        borderTop: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)} style={{
                                width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                                background: p === page ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
                                color: p === page ? 'white' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                            }}>{p}</button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
