
import React, { useState, useEffect } from 'react';
import type { ReportData } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface CampaignPlannerProps {
  reportData: Partial<ReportData>;
}

interface PlanTask {
    id: string;
    source: string;
    task: string;
}

type PlannerState = {
    unscheduled: PlanTask[];
    weeks: PlanTask[][]; // Array of 4 weeks, each week is an array of tasks
};

const CampaignPlanner: React.FC<CampaignPlannerProps> = ({ reportData }) => {
  const { t } = useTranslations();
  const [plannerState, setPlannerState] = useState<PlannerState>({ unscheduled: [], weeks: [[], [], [], []] });
  const [newTask, setNewTask] = useState('');
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);

  useEffect(() => {
    const extractTasks = (): PlanTask[] => {
        const tasks: PlanTask[] = [];
        let idCounter = 0;

        reportData.contentStrategy?.pillars.forEach(p => {
            p.postIdeas.forEach(idea => {
                tasks.push({ id: `task-${idCounter++}`, source: p.pillar || t('tabContent'), task: `Write: ${idea.title}` });
            });
        });

        reportData.googleAdsStrategy?.campaigns.forEach(c => {
             tasks.push({ id: `task-${idCounter++}`, source: 'Google Ads', task: `Launch '${c.campaignType}' campaign` });
        });

        reportData.socialMediaCampaign?.platforms.forEach(p => {
            p.contentIdeas.forEach(idea => {
                tasks.push({ id: `task-${idCounter++}`, source: p.platform, task: idea.title });
            });
        });

        return tasks;
    };
    
    setPlannerState({ unscheduled: extractTasks(), weeks: [[], [], [], []] });
  }, [reportData, t]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: PlanTask, sourceId: string, sourceIndex: number) => {
    e.dataTransfer.setData('task', JSON.stringify({ task, sourceId, sourceIndex }));
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    setDragOverTarget(null);
    const data = JSON.parse(e.dataTransfer.getData('task'));
    const { task, sourceId, sourceIndex } = data as { task: PlanTask; sourceId: string; sourceIndex: number };
    
    setPlannerState(prevState => {
        const newState = JSON.parse(JSON.stringify(prevState)); // Deep copy

        // Remove from source
        if (sourceId === 'unscheduled') {
            newState.unscheduled.splice(sourceIndex, 1);
        } else {
            const weekIndex = parseInt(sourceId.split('-')[1]);
            newState.weeks[weekIndex].splice(sourceIndex, 1);
        }
        
        // Add to target
        if (targetId === 'unscheduled') {
            newState.unscheduled.unshift(task); // Add to top
        } else {
            const weekIndex = parseInt(targetId.split('-')[1]);
            newState.weeks[weekIndex].push(task);
        }

        return newState;
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (dragOverTarget !== targetId) {
        setDragOverTarget(targetId);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      setDragOverTarget(null);
  };

  const handleAddTask = () => {
      if(newTask.trim()) {
          const task: PlanTask = { id: `custom-${Date.now()}`, source: 'Custom', task: newTask.trim() };
          setPlannerState(prev => ({...prev, unscheduled: [task, ...prev.unscheduled]}));
          setNewTask('');
      }
  };
  
  const sourceColorMap: { [key: string]: string } = {
    'Google Ads': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'Facebook': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    'Instagram': 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
    'LinkedIn': 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
    'TikTok': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    'Custom': 'bg-stone-100 text-stone-800 dark:bg-gray-700 dark:text-gray-200',
    'default': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  };

  const DraggableTask: React.FC<{ task: PlanTask, onDragStart: (e: React.DragEvent<HTMLDivElement>) => void }> = ({ task, onDragStart }) => (
      <div 
        draggable 
        onDragStart={onDragStart}
        className="p-2 bg-white dark:bg-gray-900/70 rounded-lg shadow-sm border border-stone-200 dark:border-gray-700/50 cursor-grab active:cursor-grabbing text-left"
      >
          <p className="text-sm font-medium text-stone-800 dark:text-gray-200">{task.task}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block ${sourceColorMap[task.source] || sourceColorMap['default']}`}>
            {task.source}
          </span>
      </div>
  );

  const DropRow: React.FC<{ title: string; rowId: string; tasks: PlanTask[] }> = ({ title, rowId, tasks }) => (
    <div
        onDrop={(e) => handleDrop(e, rowId)}
        onDragOver={(e) => handleDragOver(e, rowId)}
        onDragLeave={handleDragLeave}
        className={`p-3 rounded-lg transition-all duration-200 bg-stone-50 dark:bg-gray-800/60 ${dragOverTarget === rowId ? 'ring-2 ring-orange-500 shadow-lg' : ''}`}
    >
        <h4 className="font-bold text-stone-700 dark:text-gray-300 mb-3">{title}</h4>
        <div className="min-h-[5rem] flex flex-wrap gap-2 p-2 rounded-md border-2 border-dashed border-transparent">
            {tasks.map((task, index) => (
                <DraggableTask 
                    key={task.id} 
                    task={task} 
                    onDragStart={(e) => handleDragStart(e, task, rowId, index)} 
                />
            ))}
            {tasks.length === 0 && (
                <div className="flex-grow text-center text-sm text-stone-400 dark:text-gray-500 py-6">
                    {t('dropTasksHere')}
                </div>
            )}
        </div>
    </div>
  );

  return (
    <div className="space-y-4">
        <p className="text-sm text-stone-600 dark:text-gray-400">{t('campaignPlannerDescription')}</p>
        <div className="flex flex-col md:flex-row gap-6">
            {/* Task Pool */}
            <div 
              className="md:w-1/3 lg:w-1/4 flex-shrink-0 bg-stone-50 dark:bg-gray-800/60 p-3 rounded-lg flex flex-col max-h-[70vh]"
            >
                <h3 className="text-lg font-bold text-stone-800 dark:text-gray-200 mb-3 px-1">{t('unscheduledTasks')}</h3>
                <div className="flex gap-2 mb-3 px-1">
                    <input 
                        type="text"
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        placeholder={t('plannerAddTaskPlaceholder')}
                        className="flex-grow p-2 text-sm bg-white dark:bg-gray-900/50 border border-stone-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <button onClick={handleAddTask} className="bg-orange-500 hover:bg-orange-600 text-white font-bold p-2 rounded-lg text-sm transition-colors flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    </button>
                </div>
                <div 
                  onDrop={(e) => handleDrop(e, 'unscheduled')}
                  onDragOver={(e) => handleDragOver(e, 'unscheduled')}
                  onDragLeave={handleDragLeave}
                  className={`flex-grow overflow-y-auto pr-1 space-y-3 p-1 rounded-md transition-all ${dragOverTarget === 'unscheduled' ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''}`}
                >
                   {plannerState.unscheduled.map((task, index) => (
                        <DraggableTask 
                          key={task.id} 
                          task={task} 
                          onDragStart={(e) => handleDragStart(e, task, 'unscheduled', index)} 
                        />
                    ))}
                </div>
            </div>
            
            {/* Weekly Planner */}
            <div className="flex-grow space-y-4">
                {plannerState.weeks.map((weekTasks, i) => (
                    <DropRow key={i} title={`${t('week')} ${i+1}`} rowId={`week-${i}`} tasks={weekTasks} />
                ))}
            </div>
        </div>
    </div>
  );
};

export default CampaignPlanner;