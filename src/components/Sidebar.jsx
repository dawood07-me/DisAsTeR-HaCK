import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  CloudLightning, 
  AlertOctagon, 
  LifeBuoy, 
  PackageCheck, 
  UserX, 
  FileWarning, 
  Home, 
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, role: 'All' },
    { id: 'prediction', label: 'AI Prediction', icon: BrainCircuit, badge: 'AI', role: 'All' },
    { id: 'weather', label: 'Weather Alerts', icon: CloudLightning, role: 'All' },
    { id: 'sos', label: 'SOS Emergency', icon: AlertOctagon, color: 'text-red-400', role: 'All' },
    { id: 'rescue', label: 'Rescue Dashboard', icon: LifeBuoy, badge: 'Ops', role: ['Rescue Team', 'Government Admin'] },
    { id: 'relief', label: 'Relief Supplies', icon: PackageCheck, role: 'All' },
    { id: 'missing', label: 'Missing Persons', icon: UserX, role: 'All' },
    { id: 'damage', label: 'Damage Reports', icon: FileWarning, role: 'All' },
    { id: 'shelter', label: 'Shelter Hubs', icon: Home, role: 'All' },
    { id: 'admin', label: 'Admin Command', icon: ShieldCheck, badge: 'Admin', role: ['Government Admin'] }
  ];

  const currentRole = user?.role || 'Citizen';

  const isVisible = (itemRole) => {
    if (itemRole === 'All') return true;
    if (Array.isArray(itemRole)) return itemRole.includes(currentRole);
    return itemRole === currentRole;
  };

  const navContent = (
    <div className="flex flex-col h-full space-y-4">
      
      {/* Mobile Drawer Close Header */}
      <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-800">
        <div className="font-extrabold text-sm text-cyan-400 tracking-wider">RAKSHAI OPS MENU</div>
        <button 
          onClick={onCloseMobile}
          className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current User Card */}
      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">LOGGED IN AS</div>
        <div className="font-bold text-slate-100 truncate text-sm">{user?.name || 'Citizen User'}</div>
        <div className="text-xs text-cyan-400 font-medium flex items-center gap-1.5 mt-0.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          {currentRole}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          NAVIGATION MODULES
        </div>
        {navItems.map(item => {
          const visible = isVisible(item.role);
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (!visible) return null;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-cyan-900/30 border border-cyan-400/40'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color || 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-cyan-900 text-white' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Allowed Disasters Notice */}
      <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-900/40 text-[11px] text-slate-400 space-y-1 mt-auto shrink-0">
        <div className="font-bold text-cyan-400 flex items-center gap-1">
          <span>🇮🇳 Active Disaster Scope</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Floods • Cyclones • Tsunami • Heavy Rainfall • Landslides • Forest Fires
        </p>
      </div>

      {/* Logout Action Button */}
      {user && (
        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            logout();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 transition-all group shrink-0"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
            <span>Log Out</span>
          </div>
          <span className="text-[9px] font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/50 uppercase tracking-wider">
            Exit
          </span>
        </button>
      )}

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Pinned on left, hidden on mobile) */}
      <aside className="hidden lg:flex w-64 bg-slate-900/60 border-r border-slate-800/80 flex-col p-3 shrink-0 min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Slide-In Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[10000] lg:hidden flex">
          {/* Backdrop Blur */}
          <div 
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 border-r border-slate-700 h-full p-4 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
