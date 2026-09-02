import React, { useState } from 'react';
import { useDisaster, ALLOWED_DISASTERS } from '../context/DisasterContext';
import { StatusBadge } from '../components/StatusBadge';
import { AlertOctagon, MapPin, Phone, Users, Clock, Filter, Plus, ShieldAlert } from 'lucide-react';

export const SOSPage = () => {
  const { sosRequests, setSosModalOpen, selectedDisasterFilter, setSelectedDisasterFilter } = useDisaster();
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = sosRequests.filter(s => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-red-300 dark:border-red-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-500 animate-pulse" />
            <h1 className="text-xl font-black text-slate-900 dark:text-white">MODULE 3: SOS EMERGENCY BEACON SYSTEM</h1>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-Time distress broadcasts dispatched with auto-GPS coordinates & satellite telemetry
          </p>
        </div>

        <button
          onClick={() => setSosModalOpen(true)}
          className="radar-pulse flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white font-extrabold px-5 py-3 rounded-xl text-sm shadow-xl shadow-red-900/50 border border-red-400/40 transition active:scale-95"
        >
          <AlertOctagon className="w-5 h-5 animate-bounce" />
          <span>TRIGGER RED SOS BEACON NOW</span>
        </button>
      </div>

      {/* SOS Lifecycle Pipeline Graphic */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-2">SOS BEACON LIFECYCLE FLOW</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
          <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-400 shadow-sm">
            1. PENDING (Signal Broadcasted)
          </div>
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-400 shadow-sm">
            2. ACCEPTED (NDRF Assigned)
          </div>
          <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/80 text-cyan-800 dark:text-cyan-400 shadow-sm">
            3. ON THE WAY (En Route)
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-400 shadow-sm">
            4. RESCUED (Evacuated to Shelter)
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors duration-200">
        
        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Status:</span>
          {['All', 'Pending', 'Accepted', 'On The Way', 'Rescued'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st ? 'bg-cyan-600 text-white shadow' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Disaster Type Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Disaster Type:</span>
          <select
            value={selectedDisasterFilter}
            onChange={(e) => setSelectedDisasterFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs font-bold px-3 py-1.5 focus:outline-none"
          >
            {ALLOWED_DISASTERS.map(d => (
              <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d}</option>
            ))}
          </select>
        </div>

      </div>

      {/* SOS Requests Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(sos => (
          <div 
            key={sos.id} 
            className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between transition-colors duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-sm text-cyan-700 dark:text-cyan-400">{sos.id}</span>
                <StatusBadge status={sos.status} />
              </div>

              {sos.image_url && (
                <div className="w-full h-36 rounded-xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800">
                  <img src={sos.image_url} alt="Disaster evidence" className="w-full h-full object-cover" />
                </div>
              )}

              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{sos.disaster_type}</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" />
                <span className="font-semibold">{sos.location}</span>
              </p>

              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 mt-3 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-200">Distress Message:</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{sos.message}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span>Reporter: <b className="text-slate-900 dark:text-slate-200">{sos.user_name}</b></span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> {sos.people_count} Stranded</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Phone: <b className="text-slate-800 dark:text-slate-300">{sos.phone}</b></span>
                <span className="font-bold text-red-600 dark:text-red-400">{sos.priority} Urgency</span>
              </div>

              {sos.assigned_to && (
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/60 font-semibold">
                  ⚡ Assigned Unit: {sos.assigned_to}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
