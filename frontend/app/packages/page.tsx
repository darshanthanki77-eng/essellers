'use client';

import { useState, useEffect } from 'react';
import Shell from '@/components/layout/Shell';
import { Package, CheckCircle2, Star, Zap, ArrowRight, ShieldCheck, Sparkles, X, Lock, AlertTriangle, RefreshCw, Gem } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Plans are now fetched from the bankend database

export default function PackagesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [transPassword, setTransPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [purchasedTypes, setPurchasedTypes] = useState<Set<string>>(new Set());
    const [loadingPackages, setLoadingPackages] = useState(true);
    const [plans, setPlans] = useState<any[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
    }, [user, authLoading, router]);

    useEffect(() => {
        const loadPkg = async () => {
            setLoadingPackages(true);
            try {
                const res = await api.get('/packages');
                if (res.success && res.packages?.length > 0) {
                    const types = new Set<string>(res.packages.map((p: any) => p.type));
                    setPurchasedTypes(types);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingPackages(false);
            }
        };

        const fetchPlans = async () => {
            setLoadingPlans(true);
            try {
                const res = await api.get('/packages/plans');
                if (res.success) {
                    setPlans(res.data);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingPlans(false);
            }
        };

        if (user) {
            loadPkg();
            fetchPlans();
        }
    }, [user]);

    const isAlreadyPurchased = (pkgName: string) =>
        purchasedTypes.has(pkgName);

    const handleOpenModal = (pkg: any) => {
        if (isAlreadyPurchased(pkg.name)) return;
        setMessage('');
        setIsError(false);
        setTransPassword('');
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handlePurchase = async () => {
        if (!transPassword) {
            setMessage('Please enter your transaction password.');
            setIsError(true);
            return;
        }
        setIsSubmitting(true);
        setMessage('');
        setIsError(false);

        try {
            const response = await api.post('/packages/purchase', {
                packageId: selectedPackage.sku,
                trans_password: transPassword
            });

            if (response.success) {
                setMessage(response.message || '🎉 Package activated!');
                setIsError(false);
                setPurchasedTypes(prev => new Set([...prev, selectedPackage.name]));
                setTimeout(() => {
                    setIsModalOpen(false);
                    setMessage('');
                    setTransPassword('');
                }, 2500);
            }
        } catch (error: any) {
            setMessage(error.message || 'Something went wrong.');
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const purchasedCount = purchasedTypes.size;

    if (authLoading || !user) return null;

    return (
        <Shell>
            <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">
                {/* Hero Header */}
                <div className="text-center space-y-6 max-w-4xl mx-auto py-12 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-500/5 blur-[120px] rounded-full -z-10 animate-pulse" />

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md border border-primary-200/50 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        Expand Your Empire
                    </div>

                    <h1 className="text-4xl lg:text-8xl font-black text-gray-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700">
                        Choose Your <br /><span className="gradient-text italic">Growth Path</span>
                    </h1>

                    <p className="text-gray-500 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
                        Activate premium store tiers with a <strong>one-time payment</strong>. Buy all three to unlock the ultimate selling experience.
                    </p>

                    {/* Progress indicator */}
                    {!loadingPackages && purchasedCount > 0 && (
                        <div className="inline-flex items-center gap-4 px-6 py-4 bg-emerald-50/50 backdrop-blur-sm border border-emerald-100 rounded-3xl mt-4 animate-scale-in">
                            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-emerald-900 font-black text-sm uppercase tracking-widest leading-none mb-1">Portfolio Status</p>
                                <p className="text-emerald-700 text-xs font-bold leading-none">
                                    {purchasedCount} of 3 package{purchasedCount > 1 ? 's' : ''} active
                                </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                                {plans.map(p => (
                                    <div key={p.sku} className={`w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm ${purchasedTypes.has(p.name) ? 'bg-emerald-500' : 'bg-gray-200'}`} title={p.name} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Packages Grid */}
                {loadingPlans ? (
                    <div className="py-20 text-center">
                        <RefreshCw className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Secure Packs...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch pt-4">
                        {plans.map((pkg) => {
                            const purchased = isAlreadyPurchased(pkg.name);
                            const isPremium = true; // All cards now use the premium design

                            return (
                                <div key={pkg.sku} className={`relative group flex flex-col ${pkg.popular ? 'scale-105 z-10' : ''}`}>
                                    {pkg.popular && !purchased && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl z-20 flex items-center gap-2 animate-bounce">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            Most Popular
                                        </div>
                                    )}

                                    <div className={`relative overflow-hidden rounded-[2.5rem] p-8 h-full flex flex-col bg-gradient-to-br transition-all duration-700 shadow-xl ${pkg.name === 'Starter Merchant' ? 'from-blue-500 via-cyan-500 to-blue-600' :
                                        pkg.name === 'Professional Seller' ? 'from-indigo-600 via-purple-600 to-pink-500' :
                                            'from-slate-800 via-slate-900 to-black'
                                        }`}>
                                        {/* Background Noise/Decoration */}
                                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

                                        <div className="relative z-10 h-full flex flex-col items-center text-center space-y-8">
                                            {/* Top Row: Icon & Status */}
                                            <div className="w-full flex justify-between items-center mb-2">
                                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                                    <Package className="w-6 h-6 text-white" />
                                                </div>
                                                {purchased && (
                                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest border border-white/30">Active License</span>
                                                )}
                                            </div>

                                            {/* Center Premium Icon */}
                                            <div className="relative py-4">
                                                <div className="w-32 h-32 bg-white/15 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl animate-float-premium">
                                                    <div className="p-5 bg-gradient-to-br from-blue-100 to-white rounded-full shadow-inner relative z-10">
                                                        <Gem className={`w-12 h-12 ${pkg.name === 'Starter Merchant' ? 'text-blue-500' :
                                                            pkg.name === 'Professional Seller' ? 'text-purple-600' :
                                                                'text-slate-800'
                                                            }`} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Plan Name & Price */}
                                            <div className="space-y-1">
                                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic drop-shadow-lg">{pkg.name}</h3>
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <span className="text-4xl font-black text-white">{pkg.price_label}</span>
                                                    <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">/ Life</span>
                                                </div>
                                            </div>

                                            {/* Features List */}
                                            <ul className="w-full bg-white/5 backdrop-blur-md rounded-[2rem] p-6 space-y-3 flex-1 border border-white/10">
                                                {pkg.features.map((feature: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-3 text-left">
                                                        <div className="p-1 bg-white/10 rounded-lg shrink-0">
                                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                                        </div>
                                                        <span className="text-xs font-bold text-white/90 leading-tight">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* Action Button */}
                                            <button
                                                onClick={() => handleOpenModal(pkg)}
                                                disabled={purchased}
                                                className={`w-full py-5 rounded-[1.8rem] text-sm font-black transition-all flex items-center justify-center gap-2 group/btn shadow-2xl ${purchased
                                                    ? 'bg-white/20 text-white cursor-default'
                                                    : 'bg-white text-slate-900 hover:scale-[1.03] active:scale-[0.98]'
                                                    }`}
                                            >
                                                {purchased ? 'Owned' : 'Upgrade Level'}
                                                {!purchased && <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Note Area */}
                <div className="flex items-center gap-4 p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[80px] rounded-full -mr-32 -mt-32" />
                    <div className="p-4 bg-white/5 rounded-2xl relative z-10">
                        <Zap className="w-8 h-8 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xl font-black text-white tracking-tight uppercase">Strategic Expansion</p>
                        <p className="text-sm text-slate-400 font-medium mt-1 max-w-2xl leading-relaxed">
                            Packages are cumulative. Activating high-tier plans provides superior logistics and lower overheads instantly across your entire operation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Purchase Confirmation Modal */}
            {isModalOpen && selectedPackage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !isSubmitting && setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-scale-in border border-white/20">
                        <button
                            onClick={() => !isSubmitting && setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-10">
                            <div className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${selectedPackage.color} flex items-center justify-center mb-6 shadow-xl`}>
                                <Zap className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Activate Tier</h3>
                            <p className="text-gray-500 text-sm font-bold mt-2 uppercase tracking-widest">
                                Confirming {selectedPackage.name}
                            </p>
                        </div>

                        {message && (
                            <div className={`p-5 mb-8 rounded-2xl text-sm font-black flex items-start gap-3 animate-fade-in ${isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                {isError ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                                {message}
                            </div>
                        )}

                        <div className="space-y-8">
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Investment</span>
                                    <span className="text-2xl font-black text-gray-900">{selectedPackage.price_label}</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Lock</span>
                                    <span className="text-xs font-black text-emerald-600 flex items-center gap-1">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Lifetime Access
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Lock className="w-3.5 h-3.5" /> Secure Confirmation
                                </label>
                                <input
                                    type="password"
                                    value={transPassword}
                                    onChange={(e) => setTransPassword(e.target.value)}
                                    placeholder="Enter Trans Password"
                                    className="w-full px-6 py-5 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-[1.5rem] font-bold text-center tracking-widest transition-all outline-none"
                                    disabled={isSubmitting}
                                />
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={isSubmitting}
                                className={`w-full py-6 rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl ${isSubmitting
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary-600 text-white shadow-primary-200 hover:scale-[1.02] active:scale-[0.98]'
                                    }`}
                            >
                                {isSubmitting ? 'Verifying Gateway...' : 'Secure Activation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style jsx global>{`
                @keyframes float-premium {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-10px) rotate(2deg); }
                }
                .animate-float-premium {
                    animation: float-premium 5s ease-in-out infinite;
                }
            `}</style>
        </Shell>
    );
}
