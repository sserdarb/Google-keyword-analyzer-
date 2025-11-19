
import React from 'react';
import type { DemographicDistribution } from '../types';

interface VerticalBarChartProps {
  data: DemographicDistribution[];
}

const COLORS = ['#f97316', '#fdba74'];

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({ data }) => {
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

  return (
    <div className="w-full h-48 bg-stone-50 dark:bg-gray-800/60 p-4 rounded-lg flex justify-around items-end gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-grow text-center h-full w-full">
          <div className="w-full h-full flex items-end justify-center">
             <div
                className="w-3/4 max-w-[40px] rounded-t-md transition-all duration-500"
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: COLORS[index % COLORS.length]
                }}
                title={`${item.label}: ${item.value}%`}
              />
          </div>
          <p className="text-xs mt-2 text-stone-600 dark:text-gray-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

export default VerticalBarChart;
