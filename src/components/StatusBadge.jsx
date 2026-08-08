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
          bg: 'bg-red-950/80 text-red-400 border-red-500/40',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
        };
      // High / Accepted / Request
      case 'High':
      case 'Accepted':
      case 'ORANGE ALERT':
      case 'Request':
        return {
          bg: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
          icon: <Clock className="w-3.5 h-3.5 text-amber-400" />
        };
      // On The Way / Delivering / Medium
      case 'On The Way':
      case 'Delivering':
      case 'Medium':
        return {
          bg: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40',
          icon: <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        };
      // Rescued / Delivered / Low / Match Found
      case 'Rescued':
      case 'Delivered':
      case 'Low':
      case 'Match Found':
      case 'Active':
        return {
          bg: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'Missing':
        return {
          bg: 'bg-purple-950/80 text-purple-400 border-purple-500/40',
          icon: <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
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
