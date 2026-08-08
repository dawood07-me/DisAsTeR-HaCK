import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisaster } from '../context/DisasterContext';
import { IndiaMap } from '../components/IndiaMap';
import { StatusBadge } from '../components/StatusBadge';
import { LifeBuoy, ShieldCheck, CheckCircle2, Navigation, AlertOctagon, UserCheck, Filter } from 'lucide-react';

export const RescuePage = () => {
  const { user } = useAuth();
  const { allSosRequests, updateSOSStatus } = useDisaster();
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assignedUnitName, setAssignedUnitName] = useState('NDRF Battalion 4 Odisha');

  const isAuthorizedRole = ['Rescue Team', 'Government Admin'].includes(user?.role);

  const filtered = allSosRequests.filter(s => {
    if (priorityFilter !== 'All' && s.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-blue-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-800">
              <LifeBuoy className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">MODULE 4: RESCUE TEAM DISPATCH DASHBOARD</h1>
              <p className="text-xs text-slate-400">
                Authorized Command Console for NDRF, SDRF, Army & Coast Guard Rescue Operations
              </p>
            </div>
          </div>
        </div>

        {!isAuthorizedRole && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-semibold">
            ⚠️ You are viewing as {user?.role || 'Citizen'}. Switch role to "Rescue Team" or "Govt Admin" in top bar to test dispatch controls.
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="space-y-2">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400" /> Tactical Dispatch Map View
        </h3>
        <IndiaMap height="400px" />
      </div>

      {/* Priority Filter Header */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-300 uppercase">Filter SOS Priority:</span>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                priorityFilter === p ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white bg-slate-900/60'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Total SOS Cases: <b className="text-white">{filtered.length}</b>
        </div>
      </div>

      {/* Rescue SOS Requests Table / Cards */}
      <div className="space-y-4">
        {filtered.map(sos => (
          <div 
            key={sos.id} 
            className={`glass-panel p-5 rounded-2xl border transition ${
              sos.priority === 'Critical' ? 'border-red-900/60 bg-red-950/10' : 'border-slate-800'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* SOS Info */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="font-black text-base text-cyan-400">{sos.id}</span>
                  <span className="font-extrabold text-sm text-white">{sos.disaster_type}</span>
                  <StatusBadge status={sos.priority} />
                  <StatusBadge status={sos.status} />
                </div>

                <div className="text-xs text-slate-300 font-medium">
                  📍 <b className="text-slate-100">{sos.location}</b> • Victims Stranded: <b className="text-red-400">{sos.people_count}</b>
                </div>

                <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  "{sos.message}"
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span>Contact: <b className="text-slate-200">{sos.user_name} ({sos.phone})</b></span>
                  {sos.assigned_to && (
                    <span className="text-emerald-400 font-bold">⚡ Assigned: {sos.assigned_to}</span>
                  )}
                </div>
              </div>

              {/* Dispatch Action Controls */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                
                {sos.status === 'Pending' && (
                  <button
                    onClick={() => updateSOSStatus(sos.id, 'Accepted', assignedUnitName)}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5 transition"
                  >
                    <UserCheck className="w-4 h-4" /> ACCEPT & ASSIGN UNIT
                  </button>
                )}

                {(sos.status === 'Pending' || sos.status === 'Accepted') && (
                  <button
                    onClick={() => updateSOSStatus(sos.id, 'On The Way', assignedUnitName)}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5 transition"
                  >
                    <Navigation className="w-4 h-4" /> MARK "ON THE WAY"
                  </button>
                )}

                {sos.status !== 'Rescued' && (
                  <button
                    onClick={() => updateSOSStatus(sos.id, 'Rescued', assignedUnitName)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow flex items-center justify-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> MARK AS RESCUED
                  </button>
                )}

                {sos.status === 'Rescued' && (
                  <div className="px-4 py-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> EVACUATION COMPLETE
                  </div>
                )}

              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
