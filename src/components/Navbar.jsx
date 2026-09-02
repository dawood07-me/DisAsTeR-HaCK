import React, { useState, useEffect } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShieldAlert, 
  Bell, 
  Radio, 
  AlertOctagon, 
  Clock, 
  Menu,
  Sun,
  Moon
} from 'lucide-react';

export const Navbar = ({ onToggleMobileMenu }) => {
  const { notifications, markNotificationsRead, setSosModalOpen } = useDisaster();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-[9999] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 lg:px-8 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Side: Mobile 3-Lines Hamburger Menu Button + Brand & Live Status */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Hamburger Menu Toggle (Three Lines Icon) - Mobile Only */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition active:scale-95"
            aria-label="Toggle Navigation Menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/30 shrink-0">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-lg sm:text-xl tracking-wider text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-cyan-500 to-slate-900 dark:from-blue-400 dark:via-cyan-300 dark:to-white">
                  Raksh<span className="text-cyan-600 dark:text-cyan-400">AI</span>
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800">
                  INDIA OPS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
                <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                <span>Live Emergency Grid</span>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono">{timeString}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Action Controls (Theme Toggle, SOS Button & Notifications Bell) */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light and Dark Mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-cyan-600 animate-in spin-in-180 duration-300" />
            )}
          </button>

          {/* Quick SOS Red Emergency Button */}
          <button
            onClick={() => setSosModalOpen(true)}
            className="radar-pulse relative group flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-red-900/50 border border-red-400/30 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <AlertOctagon className="w-4 h-4 text-white animate-bounce" />
            <span>SOS</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) markNotificationsRead();
              }}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Emergency Alerts
                  </h4>
                  <button 
                    onClick={markNotificationsRead} 
                    className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-2.5 rounded-lg border text-xs ${
                        n.type === 'sos' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200' :
                        n.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200' :
                        'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};

