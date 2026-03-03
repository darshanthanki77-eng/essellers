'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint, DateRange } from '@/types';
import { Calendar, TrendingUp, DollarSign, ShoppingCart, CreditCard } from 'lucide-react';

interface SalesChartProps {
    data: ChartDataPoint[];
}

type ChartType = 'line' | 'bar';
type MetricType = 'sales' | 'profit' | 'orders' | 'aov';

const metricConfig = {
    sales: {
        label: 'Gross Sales',
        color: '#4F46E5',
        icon: DollarSign,
    },
    profit: {
        label: 'Net Profit',
        color: '#10B981',
        icon: TrendingUp,
    },
    orders: {
        label: 'Order Volume',
        color: '#F59E0B',
        icon: ShoppingCart,
    },
    aov: {
        label: 'Average Order Value',
        color: '#EF4444',
        icon: CreditCard,
    },
};

export default function SalesChart({ data }: SalesChartProps) {
    const [chartType, setChartType] = useState<ChartType>('line');
    const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['sales', 'profit']);
    const [dateRange, setDateRange] = useState<DateRange>('7days');

    const toggleMetric = (metric: MetricType) => {
        setSelectedMetrics(prev =>
            prev.includes(metric)
                ? prev.filter(m => m !== metric)
                : [...prev, metric]
        );
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800">
                    <p className="font-semibold text-gray-900 dark:text-slate-100 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-600 dark:text-slate-400">{entry.name}:</span>
                            <span className="font-semibold text-gray-900 dark:text-slate-100">
                                {entry.name === 'Order Volume'
                                    ? entry.value
                                    : `$${entry.value.toLocaleString()}`}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const ChartComponent = chartType === 'line' ? LineChart : BarChart;

    return (
        <div className="chart-container">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">Sales Statistics</h2>
                    <p className="text-sm text-gray-600 dark:text-slate-400 font-medium tracking-tight">Track your performance over time</p>
                </div>

                {/* Chart Type Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setChartType('line')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${chartType === 'line'
                            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-md'
                            : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Line Chart
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${chartType === 'bar'
                            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-md'
                            : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                            }`}
                    >
                        Bar Chart
                    </button>
                </div>
            </div>

            {/* Metric Selection */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {(Object.keys(metricConfig) as MetricType[]).map((metric) => {
                    const config = metricConfig[metric];
                    const Icon = config.icon;
                    const isSelected = selectedMetrics.includes(metric);

                    return (
                        <button
                            key={metric}
                            onClick={() => toggleMetric(metric)}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${isSelected
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                                : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: isSelected ? `${config.color}20` : '#F3F4F6' }}
                                >
                                    <Icon
                                        className="w-4 h-4"
                                        style={{ color: isSelected ? config.color : '#6B7280' }}
                                    />
                                </div>
                                <span className={`text-sm font-medium ${isSelected ? 'text-gray-900 dark:text-slate-100' : 'text-gray-600 dark:text-slate-400'}`}>
                                    {config.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                {(['7days', '30days', '6months', '12months'] as DateRange[]).map((range) => (
                    <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${dateRange === range
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        {range === '7days' && 'Last 7 Days'}
                        {range === '30days' && 'Last 30 Days'}
                        {range === '6months' && 'Last 6 Months'}
                        {range === '12months' && 'Last 12 Months'}
                    </button>
                ))}
            </div>

            {/* Chart */}
            <div className="h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f033" />
                        <XAxis
                            dataKey="date"
                            stroke="#94a3b8"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#94a3b8"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                        />

                        {selectedMetrics.map((metric) => {
                            const config = metricConfig[metric];
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const Component = (chartType === 'line' ? Line : Bar) as any;

                            return (
                                <Component
                                    key={metric}
                                    type={chartType === 'line' ? 'monotone' : undefined}
                                    dataKey={metric}
                                    name={config.label}
                                    stroke={config.color}
                                    fill={config.color}
                                    strokeWidth={chartType === 'line' ? 3 : undefined}
                                    dot={chartType === 'line' ? { fill: config.color, r: 4 } : undefined}
                                    activeDot={chartType === 'line' ? { r: 6 } : undefined}
                                />
                            );
                        })}
                    </ChartComponent>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-800">
                {selectedMetrics.map((metric) => {
                    const config = metricConfig[metric];
                    const total = data.reduce((sum, item) => sum + item[metric], 0);
                    const average = total / (data.length || 1);

                    return (
                        <div key={metric} className="text-center">
                            <p className="text-xs text-gray-600 dark:text-slate-400 mb-1">Avg {config.label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-slate-100 leading-none">
                                {metric === 'orders'
                                    ? Math.round(average)
                                    : `$${average.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
