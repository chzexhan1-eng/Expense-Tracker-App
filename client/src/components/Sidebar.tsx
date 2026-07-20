import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from './Toast';
import {
  LayoutDashboard,
  ArrowRightLeft,
  PieChart,
  TrendingUp,
  BrainCircuit,
  Settings,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, apiFetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', name: 'Transactions', icon: ArrowRightLeft },
    { id: 'budgets', name: 'Budgets', icon: PieChart },
    { id: 'reports', name: 'Analytics', icon: TrendingUp },
    { id: 'ai-coach', name: 'AI Coach', icon: BrainCircuit },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await apiFetch('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('Notifications marked as read', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-notion-sidebar-dark border-b border-notion-border-light dark:border-notion-border-dark sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-stripe-primary flex items-center justify-center text-white font-bold shadow-md">
            A
          </div>
          <span className="font-semibold tracking-tight text-notion-text-light dark:text-notion-text-dark">Antigravity</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-1.5 rounded-lg text-notion-text-muted-light dark:text-notion-text-muted-dark hover:bg-gray-100 dark:hover:bg-notion-border-dark transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-notion-sidebar-dark" />
              )}
            </button>
          </div>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-notion-text-muted-light dark:text-notion-text-muted-dark hover:bg-gray-100 dark:hover:bg-notion-border-dark transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {/* Hamburger Menu */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-notion-text-light dark:text-notion-text-dark hover:bg-gray-100 dark:hover:bg-notion-border-dark transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar & Mobile Drawer container */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 w-64 md:w-60 lg:w-64 glass-panel border-r border-notion-border-light dark:border-notion-border-dark flex flex-col justify-between py-6 px-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:h-screen animate-slide-in-left`}
      >
        <div className="flex flex-col gap-6">
          {/* App Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-stripe-primary to-purple-500 flex items-center justify-center text-white font-bold shadow-premium animate-pulse-glow">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-base tracking-tight text-notion-text-light dark:text-notion-text-dark leading-none">Antigravity</h1>
                <span className="text-[10px] text-notion-text-muted-light dark:text-notion-text-muted-dark font-medium tracking-wider uppercase">Expense Tracker</span>
              </div>
            </div>
            {/* Close Button on Mobile Drawer */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-notion-border-dark text-notion-text-light dark:text-notion-text-dark"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ease-out ${
                    isActive
                      ? 'bg-white/80 dark:bg-notion-border-dark/80 text-stripe-primary dark:text-white shadow-premium border border-white/20 dark:border-white/5 backdrop-blur-xs font-semibold'
                      : 'text-notion-text-muted-light dark:text-notion-text-muted-dark hover:bg-gray-200/55 dark:hover:bg-notion-border-dark/50 hover:text-notion-text-light dark:hover:text-notion-text-dark'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-stripe-primary' : ''}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-4">
          <div className="h-[1px] bg-notion-border-light dark:bg-notion-border-dark" />
          
          {/* Notifications, Theme for Desktop */}
          <div className="hidden md:flex items-center justify-between px-2">
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="flex items-center gap-2 text-xs font-semibold text-notion-text-muted-light dark:text-notion-text-muted-dark hover:text-notion-text-light dark:hover:text-notion-text-dark transition-colors relative"
              >
                <Bell className="h-4.5 w-4.5" />
                Notifications
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center bg-stripe-primary text-white text-[9px] h-4.5 min-w-4.5 px-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-notion-text-muted-light dark:text-notion-text-muted-dark hover:bg-gray-200/70 dark:hover:bg-notion-border-dark transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/40 dark:bg-notion-border-dark/20 border border-notion-border-light/45 dark:border-notion-border-dark/45 shadow-sm">
              <div className="flex items-center gap-2">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-8.5 w-8.5 rounded-full object-cover border border-notion-border-light dark:border-notion-border-dark" />
                ) : (
                  <div className="h-8.5 w-8.5 rounded-full bg-stripe-primary/10 text-stripe-primary dark:bg-stripe-primary/20 dark:text-white flex items-center justify-center font-bold text-xs">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="max-w-[120px]">
                  <p className="font-semibold text-xs text-notion-text-light dark:text-notion-text-dark truncate leading-snug">{user.name}</p>
                  <p className="text-[10px] text-notion-text-muted-light dark:text-notion-text-muted-dark truncate">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-1 rounded-lg text-notion-text-muted-light dark:text-notion-text-muted-dark hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Notifications Dropdown Panel overlay */}
      {showNotifDropdown && (
        <div
          className="fixed md:absolute top-16 md:top-auto md:bottom-20 left-4 right-4 md:left-64 md:right-auto z-50 max-w-sm w-auto bg-white dark:bg-notion-sidebar-dark border border-notion-border-light dark:border-notion-border-dark shadow-xl rounded-xl p-4 flex flex-col gap-3 animate-fade-in"
          style={{ width: '320px' }}
        >
          <div className="flex items-center justify-between border-b border-notion-border-light dark:border-notion-border-dark pb-2">
            <span className="font-bold text-xs tracking-tight text-notion-text-light dark:text-notion-text-dark">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markNotificationsRead}
                className="text-[10px] text-stripe-primary font-bold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-notion-text-muted-light dark:text-notion-text-muted-dark">
                No notifications yet.
              </div>
            ) : (
              notifications.slice(0, 8).map((notif) => (
                <div
                  key={notif.id}
                  className={`p-2 rounded-lg border text-xs transition-colors ${
                    notif.read
                      ? 'bg-transparent border-transparent text-notion-text-muted-light dark:text-notion-text-muted-dark'
                      : 'bg-stripe-primary/5 border-stripe-primary/10 text-notion-text-light dark:text-notion-text-dark'
                  }`}
                >
                  <p className="font-bold">{notif.title}</p>
                  <p className="mt-0.5 text-gray-500 dark:text-gray-400">{notif.message}</p>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 mt-1 block">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setShowNotifDropdown(false)}
            className="w-full text-center text-[10px] font-bold text-notion-text-muted-light dark:text-notion-text-muted-dark hover:text-notion-text-light dark:hover:text-notion-text-dark pt-1 border-t border-notion-border-light dark:border-notion-border-dark"
          >
            Close
          </button>
        </div>
      )}

      {/* Backdrop overlay on mobile when sidebar is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}
    </>
  );
};
