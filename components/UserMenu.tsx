import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface UserMenuProps {
    user: User;
    onLogout: () => void;
    onAdminClick: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onAdminClick }) => {
    const { t } = useTranslations();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isAdmin = user.id === 'admin';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAdminClick = () => {
        onAdminClick();
        setIsOpen(false);
    };

    const handleLogoutClick = () => {
        onLogout();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-300 font-bold uppercase"
            >
                {user.email.charAt(0)}
            </button>
            {isOpen && (
                 <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 rounded-lg shadow-xl z-20 py-1">
                     <div className="px-4 py-2 border-b border-stone-200 dark:border-gray-700">
                        <p className="text-sm text-stone-500 dark:text-gray-400">Signed in as</p>
                        <p className="font-semibold text-stone-900 dark:text-gray-100 truncate">{user.email}</p>
                     </div>
                     <div className="py-1">
                        {isAdmin && (
                            <button onClick={handleAdminClick} className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700/60">
                                {t('adminPanelTitle')}
                            </button>
                        )}
                        <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-stone-100 dark:hover:bg-gray-700/60">
                            {t('logoutButton')}
                        </button>
                     </div>
                 </div>
            )}
        </div>
    );
};

export default UserMenu;
