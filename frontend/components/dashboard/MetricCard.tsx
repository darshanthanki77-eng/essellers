'use client';

import { TrendingUp, TrendingDown, DollarSign, Calendar, ShoppingBag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string;
    subtitle?: string;
    change?: number;
    icon: React.ReactNode;
    color: 'primary' | 'success' | 'warning' | 'danger';
}

const colorClasses = {
    primary: 'text-primary-600 bg-primary-50 border-primary-100',
    success: 'text-success-600 bg-success-50 border-success-100',
    warning: 'text-warning-600 bg-warning-50 border-warning-100',
    danger: 'text-danger-600 bg-danger-50 border-danger-100',
};

const iconGradients = {
    primary: 'from-primary-500 to-indigo-600 shadow-primary-200',
    success: 'from-success-500 to-emerald-600 shadow-success-200',
    warning: 'from-warning-500 to-orange-600 shadow-warning-200',
    danger: 'from-danger-500 to-rose-600 shadow-danger-200',
};

export default function MetricCard({ title, value, subtitle, change, icon, color }: MetricCardProps) {
    const isPositive = change !== undefined && change >= 0;

    return (
        <div className="glass-card p-5 md:p-6 group cursor-default hover:border-primary-300 transition-all duration-500 relative overflow-hidden h-full flex flex-col justify-between">
            {/* Background Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${color === 'primary' ? 'bg-primary-500' :
                color === 'success' ? 'bg-success-500' :
                    color === 'warning' ? 'bg-warning-500' : 'bg-danger-500'
                }`} />

            <div className="flex items-start justify-between relative z-10 gap-2">
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] truncate">{title}</p>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-slate-100 tracking-tight transition-transform group-hover:translate-x-1 duration-500 truncate mt-1">
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-1 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-slate-700 shrink-0" />
                            {subtitle}
                        </p>
                    )}
                </div>
                <div className={`p-3 md:p-4 rounded-2xl bg-gradient-to-br shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0 ${iconGradients[color]}`}>
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
            </div>

            <div className="mt-4 md:mt-6 flex items-end justify-between relative z-10">
                {change !== undefined ? (
                    <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-[10px] md:text-[11px] font-black ${isPositive ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400' : 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
                            }`}>
                            {isPositive ? (
                                <ArrowUpRight className="w-3 h-3" />
                            ) : (
                                <ArrowDownRight className="w-3 h-3" />
                            )}
                            {Math.abs(change)}%
                        </div>
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none hidden sm:block">Trend</span>
                    </div>
                ) : (
                    <div className="h-6" /> // Spacer
                )}

                <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                            <div className={`w-full h-full opacity-20 bg-gradient-to-br ${iconGradients[color]}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Progress Line (Animated on hover) */}
            <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent group-hover:w-full transition-all duration-700 opacity-50" />
        </div>
    );
}

export function AmountReceivablesCard({ amount }: { amount: number }) {
    return (
        <MetricCard
            title="Receivables"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            subtitle="Pending clearance"
            icon={<DollarSign className="w-6 h-6" />}
            color="warning"
        />
    );
}

export function TotalLifetimeSalesCard({ amount }: { amount: number }) {
    return (
        <MetricCard
            title="Total Revenue"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            subtitle="Life-to-date"
            icon={<ShoppingBag className="w-6 h-6" />}
            color="success"
        />
    );
}

export function TodaySalesCard({ amount, change }: { amount: number; change: number }) {
    return (
        <MetricCard
            title="Sales Velocity"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            change={change}
            icon={<Calendar className="w-6 h-6" />}
            color="primary"
        />
    );
}

export function ThisMonthSalesCard({ amount, change }: { amount: number; change: number }) {
    return (
        <MetricCard
            title="Monthly Target"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            change={change}
            icon={<Calendar className="w-6 h-6" />}
            color="primary"
        />
    );
}

export function LastMonthSalesCard({ amount }: { amount: number }) {
    return (
        <MetricCard
            title="Previous Performance"
            value={`$${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
            subtitle="Closed month"
            icon={<Calendar className="w-6 h-6" />}
            color="primary"
        />
    );
}
