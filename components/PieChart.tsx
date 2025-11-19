
import React from 'react';
import type { DemographicDistribution } from '../types';

interface PieChartProps {
  data: DemographicDistribution[];
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const total = data.reduce((acc, item) => acc + item.value, 0);
  let accumulated = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <svg viewBox="0 0 42 42" className="w-32 h-32">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${percentage} ${100 - percentage}`;
          const strokeDashoffset = 25 - accumulated;
          accumulated += percentage;

          return (
            <circle
              key={index}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={COLORS[index % COLORS.length]}
              strokeWidth="10"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 21 21)"
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center text-sm">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-semibold text-stone-700 dark:text-gray-300">{item.label}:</span>
            <span className="ml-1 text-stone-600 dark:text-gray-400">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
