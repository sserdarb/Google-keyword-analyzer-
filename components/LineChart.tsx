import React from 'react';

interface DataPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
}

const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
};

const LineChart: React.FC<LineChartProps> = ({ data, color = '#f97316' }) => {
    if (!data || data.length < 2) return null;

    const width = 500;
    const height = 250;
    const margin = { top: 20, right: 20, bottom: 50, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    const maxValue = 100; // Trends data is 0-100
    const numYTicks = 5;

    const getX = (index: number) => margin.left + (index / (data.length - 1)) * chartWidth;
    const getY = (value: number) => margin.top + chartHeight - (value / maxValue) * chartHeight;

    const path = data
        .map((d, i) => {
            const x = getX(i);
            const y = getY(d.value);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');

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
                    (data.length < 15 || i % 2 === 0) && <text
                        key={`x-label-${i}`}
                        x={getX(i)}
                        y={height - margin.bottom + 15}
                        textAnchor="middle"
                        className="text-[10px] fill-current text-stone-500 dark:text-gray-400"
                    >
                        {d.date.slice(0, 3)}
                    </text>
                ))}

                {/* Data line */}
                <path d={path} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                 {/* Data points */}
                {data.map((d, i) => (
                    <circle key={`point-${i}`} cx={getX(i)} cy={getY(d.value)} r="3" fill={color} />
                ))}
            </svg>
        </div>
    );
};

export default LineChart;
