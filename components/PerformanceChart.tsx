import React from 'react';
import type { PerformanceTrendItem } from '../types';

interface LineConfig {
    dataKey: keyof PerformanceTrendItem;
    color: string;
    label: string;
}

interface PerformanceChartProps {
    data: PerformanceTrendItem[];
    lines: LineConfig[];
}

const formatNumber = (num: number) => {
    // Use Intl.NumberFormat for compact, locale-aware number formatting (e.g., 1.5K, 2M)
    try {
        return new Intl.NumberFormat(undefined, { 
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(num);
    } catch (e) {
        // Fallback for older browsers or errors
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toString();
    }
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, lines }) => {
    if (!data || data.length === 0) return null;

    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const allValues = data.flatMap(d => lines.map(line => d[line.dataKey] as number || 0));
    const maxValue = Math.max(...allValues, 0);
    const numYTicks = 5;

    const getX = (index: number) => margin.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => margin.top + chartHeight - (value / maxValue) * chartHeight;

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Y-axis with grid lines */}
                {[...Array(numYTicks + 1)].map((_, i) => {
                    const y = margin.top + (i / numYTicks) * chartHeight;
                    const value = maxValue * (1 - i / numYTicks);
                    return (
                        <g key={`y-tick-${i}`}>
                            <line
                                x1={margin.left}
                                y1={y}
                                x2={width - margin.right}
                                y2={y}
                                className="stroke-stone-200 dark:stroke-gray-700"
                                strokeWidth="1"
                            />
                            <text
                                x={margin.left - 8}
                                y={y}
                                dy="0.32em"
                                textAnchor="end"
                                className="text-[10px] fill-current text-stone-500 dark:text-gray-400"
                            >
                                {formatNumber(value)}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis labels */}
                {data.map((d, i) => (
                    i % 2 === 0 && <text
                        key={`x-label-${i}`}
                        x={getX(i)}
                        y={height - margin.bottom + 15}
                        textAnchor="middle"
                        className="text-[10px] fill-current text-stone-500 dark:text-gray-400"
                    >
                        {d.month.slice(0, 3)}
                    </text>
                ))}

                {/* Data lines */}
                {lines.map(line => {
                    const path = data
                        .map((d, i) => {
                            const x = getX(i);
                            const y = getY(d[line.dataKey] as number || 0);
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                        })
                        .join(' ');
                    
                    return <path key={line.dataKey} d={path} stroke={line.color} strokeWidth="2" fill="none" />;
                })}
            </svg>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 text-xs">
                {lines.map(line => (
                    <div key={line.dataKey} className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: line.color }}></span>
                        <span className="text-stone-700 dark:text-gray-300">{line.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PerformanceChart;