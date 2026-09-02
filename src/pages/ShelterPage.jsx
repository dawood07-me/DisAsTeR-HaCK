import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { IndiaMap } from '../components/IndiaMap';
import { Home, Users, MapPin, Phone, CheckCircle2, Shield, Plus } from 'lucide-react';

export const ShelterPage = () => {
  const { shelters } = useDisaster();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">MODULE 8: SHELTER & RELIEF HUB MANAGEMENT</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Capacity Tracking, Evacuation Beds Occupancy & Essential Facility Grids
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="space-y-2">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Shelter Locations Map
        </h3>
        <IndiaMap height="360px" />
      </div>

      {/* Shelters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shelters.map(shl => {
          const occupancyPercent = Math.round((shl.current_occupancy / shl.capacity) * 100);
          const availableBeds = shl.capacity - shl.current_occupancy;

          return (
            <div key={shl.id} className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 transition-colors duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-black text-xs text-cyan-700 dark:text-cyan-400">{shl.id} • {shl.state}</span>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">{shl.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> {shl.district}, {shl.state}
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  {shl.status}
                </span>
              </div>

              {/* Capacity Progress Bar */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Occupancy Level</span>
                  <span className="text-cyan-700 dark:text-cyan-300 font-mono">{shl.current_occupancy} / {shl.capacity} beds ({occupancyPercent}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      occupancyPercent > 90 ? 'bg-red-500' : occupancyPercent > 70 ? 'bg-amber-500' : 'bg-cyan-500'
                    }`} 
                    style={{ width: `${occupancyPercent}%` }} 
                  />
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex justify-end">
                  {availableBeds > 0 ? `✓ ${availableBeds} beds available` : '⚠️ Shelter At Full Capacity'}
                </div>
              </div>

              {/* Facility Tags */}
              <div className="space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Available Facilities & Utilities:</div>
                <div className="flex flex-wrap gap-1.5">
                  {shl.facilities.map(f => (
                    <span key={f} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-cyan-600 dark:text-cyan-400" /> {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Person */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                <span>Officer: <b className="text-slate-900 dark:text-slate-200">{shl.contact_person}</b></span>
                <span className="flex items-center gap-1 text-slate-900 dark:text-slate-200 font-semibold">
                  <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> {shl.phone}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
