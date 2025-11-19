import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import * as authService from '../services/authService';
import { useTranslations } from '../hooks/useTranslations';

const UserManagement: React.FC = () => {
  const { t } = useTranslations();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(authService.getAllUsers());
  }, []);

  const handleApprove = (userId: string) => {
    authService.approveUser(userId);
    setUsers(authService.getAllUsers());
  };

  const StatusPill: React.FC<{ status: 'pending' | 'approved' }> = ({ status }) => {
    const isPending = status === 'pending';
    const classes = isPending
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
      : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${classes}`}>{status}</span>;
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900/50 rounded-xl border border-stone-200 dark:border-gray-700/50">
        <h2 className="text-xl font-bold text-stone-900 dark:text-gray-100 mb-4">{t('userManagement')}</h2>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-3">
                {users.map(user => (
                    <div key={user.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-stone-50 dark:bg-gray-800/60 rounded-lg">
                        <div className="flex-grow">
                            <p className="font-semibold text-stone-800 dark:text-gray-200">{user.email}</p>
                            <p className="text-sm text-stone-500 dark:text-gray-400">{user.phone}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 sm:mt-0">
                            <StatusPill status={user.status} />
                            {user.status === 'pending' && (
                                <button
                                    onClick={() => handleApprove(user.id)}
                                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 text-sm rounded-lg"
                                >
                                    Approve
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default UserManagement;
