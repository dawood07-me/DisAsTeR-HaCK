import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, Navigation, ShieldCheck, HelpCircle } from 'lucide-react';

export const StatusBadge = ({ status, type = 'status' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      // SOS & Priority: Critical / Pending
      case 'Critical':
      case 'Pending':
      case 'RED ALERT':
        return {
          bg: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border-red-300 dark:border-red-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse" />
        };
      // High / Accepted / Request
      case 'High':
      case 'Accepted':
      case 'ORANGE ALERT':
      case 'Request':
        return {
          bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-500/40',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        };
      // On The Way / Delivering / Medium
      case 'On The Way':
      case 'Delivering':
      case 'Medium':
        return {
          bg: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-400 border-cyan-300 dark:border-cyan-500/40',
          icon: <Navigation className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-bounce" />
        };
      // Rescued / Delivered / Low / Match Found
      case 'Rescued':
      case 'Delivered':
      case 'Low':
      case 'Match Found':
      case 'Active':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        };
      case 'Missing':
        return {
          bg: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-400 border-purple-300 dark:border-purple-500/40',
          icon: <HelpCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        };
      default:
        return {
          bg: 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
          icon: <ShieldCheck className="w-3.5 h-3.5" />
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} transition-all`}>
      {style.icon}
      <span>{status}</span>
    </span>
  );
};
