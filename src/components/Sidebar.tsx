// Sidebar.tsx
import React from 'react';

import '../styles/Sidebar.css';

interface SidebarProps {
    activeTab: 'referrals' | 'plan' | 'task' | 'settings' | 'education' | 'cash';
    setActiveTab: React.Dispatch<React.SetStateAction<'referrals' | 'plan' | 'task' | 'settings' | 'education' | 'cash'>>;
    user: any;
    balance: number | null;
    refCount: number | null;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, balance, refCount }) => {
    return (
        <div className="sidebar">
            <div className="user-section">
                <span className="rank">🏆 {user?.status || 4} ранг</span>
                <div className="avatar-wrapper">
                    <img src="/avatar.jpg" alt="avatar" className="avatar" />
                    <span className="checkmark">✔</span>
                </div>
                <div className="username">{user?.username || '—'}</div>
                <div className="referrals">{refCount || 0} рефералов</div>
                <div className="balance">
                    ${balance?.toLocaleString() || '0'}
                </div>
            </div>

            <div className="menu">
                <div className={`menu-item ${activeTab === 'referrals' ? 'active' : ''}`} onClick={() => setActiveTab('referrals')}>
                     Команда
                </div>
                <div className={`menu-item ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => setActiveTab('plan')}>
                     Тарифы
                </div>
                <div className={`menu-item ${activeTab === 'cash' ? 'active' : ''}`} onClick={() => setActiveTab('cash')}>
                     Касса
                </div>
                <div className={`menu-item ${activeTab === 'task' ? 'active' : ''}`} onClick={() => setActiveTab('task')}>
                     Задания
                </div>
                <div className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                     Настройки
                </div>
                <div className={`menu-item ${activeTab === 'education' ? 'active' : ''}`} onClick={() => setActiveTab('education')}>
                     Обучение
                </div>
            </div>
        </div>
    );
};

export default Sidebar;