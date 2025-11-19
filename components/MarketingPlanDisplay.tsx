import React from 'react';
import type { MarketingPlanTask } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface MarketingPlanDisplayProps {
  plan: MarketingPlanTask[];
}

const MarketingPlanDisplay: React.FC<MarketingPlanDisplayProps> = ({ plan }) => {
  const { t } = useTranslations();

  if (!plan || plan.length === 0) {
    return null;
  }

  const groupedByWeek: { [week: number]: MarketingPlanTask[] } = plan.reduce((acc, task) => {
    (acc[task.week] = acc[task.week] || []).push(task);
    return acc;
  }, {} as { [week: number]: MarketingPlanTask[] });
  
  const PriorityPill: React.FC<{ priority: 'High' | 'Medium' | 'Low' }> = ({ priority }) => {
    const map = {
        High: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${map[priority]}`}>{t(`priority${priority}`)}</span>;
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedByWeek).map(([week, tasks]) => (
        <div key={week}>
          <h3 className="text-xl font-semibold text-stone-800 dark:text-gray-200 mb-3">{t('week')} {week}</h3>
          <div className="overflow-x-auto bg-white dark:bg-gray-900/50 rounded-lg border border-stone-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-50 dark:bg-gray-800 text-left text-xs text-stone-600 dark:text-gray-300 uppercase">
                <tr>
                  <th className="p-3 w-32">{t('planDay')}</th>
                  <th className="p-3 w-40">{t('planChannel')}</th>
                  <th className="p-3">{t('planTask')}</th>
                  <th className="p-3">{t('planDetails')}</th>
                  <th className="p-3 w-32">{t('planPriority')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-gray-700/50">
                {tasks.map((task, index) => (
                  <tr key={index}>
                    <td className="p-3 font-medium text-stone-800 dark:text-gray-200">{task.day}</td>
                    <td className="p-3 text-stone-600 dark:text-gray-400">{task.channel}</td>
                    <td className="p-3 font-medium text-stone-800 dark:text-gray-200">{task.task}</td>
                    <td className="p-3 text-stone-600 dark:text-gray-400">{task.details}</td>
                    <td className="p-3"><PriorityPill priority={task.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketingPlanDisplay;
