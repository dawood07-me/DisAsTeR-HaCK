import React from 'react';
import { useDisaster, ALLOWED_DISASTERS } from '../context/DisasterContext';
import { IndiaMap } from '../components/IndiaMap';
import { WeatherWidget } from '../components/WeatherWidget';
import { StatusBadge } from '../components/StatusBadge';
import { 
  AlertOctagon, 
  Home, 
  UserX, 
  BrainCircuit, 
  Filter, 
  LifeBuoy, 
  Phone, 
  ArrowRight,
  ShieldCheck,
  Truck,
  FileWarning
} from 'lucide-react';

export const Dashboard = ({ setActiveTab }) => {
  const { 
    selectedDisasterFilter, 
    setSelectedDisasterFilter, 
    sosRequests, 
    allSosRequests,
    shelters, 
    missingPersons, 
    predictions,
    setSosModalOpen
  } = useDisaster();

  // Metrics
  const activeSosCount = allSosRequests.filter(s => s.status !== 'Rescued').length;
  const criticalCount = allSosRequests.filter(s => s.priority === 'Critical' && s.status !== 'Rescued').length;
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupancy = shelters.reduce((acc, s) => acc + s.current_occupancy, 0);
  const missingCount = missingPersons.filter(m => m.status === 'Missing').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <h1 className="text-xl font-black text-white">NATIONAL DISASTER EMERGENCY GRID</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-Time AI Telemetry, SOS Beacon Tracking & NDRF/SDRF Rescue Command
          </p>
        </div>

        {/* Filter bar by Allowed Disasters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700">
          <div className="flex items-center gap-1.5 px-2.5 text-xs text-slate-400 font-bold border-r border-slate-800">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>DISASTER FILTER:</span>
          </div>
          {ALLOWED_DISASTERS.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDisasterFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedDisasterFilter === d
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-950 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Emergency Metrics Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: SOS Beacons */}
        <div 
          onClick={() => setActiveTab('sos')}
          className="glass-panel glass-panel-hover p-4 rounded-2xl border border-slate-800 cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>ACTIVE SOS BEACONS</span>
            <div className="p-2 rounded-xl bg-red-950/80 text-red-400 border border-red-800/60">
              <AlertOctagon className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{activeSosCount}</span>
            <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-900">
              {criticalCount} CRITICAL
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Distress signals needing immediate evacuation</p>
        </div>

        {/* Card 2: Shelters Capacity */}
        <div 
          onClick={() => setActiveTab('shelter')}
          className="glass-panel glass-panel-hover p-4 rounded-2xl border border-slate-800 cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>SHELTER OCCUPANCY</span>
            <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalOccupancy}</span>
            <span className="text-xs text-slate-400">/ {totalShelterCapacity} beds</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-cyan-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.round((totalOccupancy / totalShelterCapacity) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 3: AI Disaster Prediction Index */}
        <div 
          onClick={() => setActiveTab('prediction')}
          className="glass-panel glass-panel-hover p-4 rounded-2xl border border-slate-800 cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>AI RISK PREDICTION</span>
            <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/60">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">89%</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-900">
              CYCLONE RAKSHA
            </span>
          </div>
          <p className="text-[11px] text-slate-400">96.4% confidence prediction model</p>
        </div>

        {/* Card 4: Missing Persons */}
        <div 
          onClick={() => setActiveTab('missing')}
          className="glass-panel glass-panel-hover p-4 rounded-2xl border border-slate-800 cursor-pointer space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>MISSING PERSONS</span>
            <div className="p-2 rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/60">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{missingCount}</span>
            <span className="text-xs text-purple-400 font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-900">
              AI MATCH ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Relief camp facial recognition scanning</p>
        </div>

      </div>

      {/* FEATURE ROW 1: Live Meteorological Radar & Quick Dispatch Actions (Side by Side Horizontally) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Side: Live Meteorological Radar (Takes 2 Columns out of 3) */}
        <div className="lg:col-span-2">
          <WeatherWidget />
        </div>

        {/* Right Side: Quick Dispatch Actions (Takes 1 Column) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Quick Dispatch Actions</h3>
                <p className="text-[11px] text-slate-400">Emergency Operations Direct Triggers</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2.5">
            <button
              onClick={() => setSosModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 flex items-center justify-between border border-red-400/40 transition active:scale-95"
            >
              <span className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 animate-bounce" /> BROADCAST RED SOS BEACON
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('relief')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-between border border-slate-700 transition"
            >
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" /> REQUEST RELIEF SUPPLIES
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('damage')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-between border border-slate-700 transition"
            >
              <span className="flex items-center gap-2">
                <FileWarning className="w-4 h-4 text-amber-400" /> REPORT DAMAGE (AI VISION)
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

      </div>

      {/* FEATURE ROW 2: Live Interactive India Map (Below Weather Radar & Quick Dispatch) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                Live Interactive India Map
                <span className="text-xs text-cyan-400 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {selectedDisasterFilter} Layer
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Geospatial tracking of SOS Distress Beacons, Relief Shelters, and NDRF Battalions
              </p>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('rescue')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 shrink-0"
          >
            Open Full Command Map <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <IndiaMap height="520px" filterType={selectedDisasterFilter} />
      </div>

      {/* FEATURE ROW 3: Active Emergency SOS Feed (Below Map) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="font-extrabold text-base text-white">Active Emergency SOS Feed</h2>
          </div>
          <button
            onClick={() => setActiveTab('sos')}
            className="text-xs text-cyan-400 hover:underline font-bold"
          >
            View All ({sosRequests.length})
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sosRequests.slice(0, 3).map(sos => (
            <div key={sos.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-cyan-400">{sos.id}</span>
                <StatusBadge status={sos.status} />
              </div>

              <div>
                <div className="font-bold text-sm text-slate-100">{sos.disaster_type} • {sos.location}</div>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{sos.message}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Victims: <b className="text-white">{sos.people_count}</b></span>
                <span className="font-bold text-red-400">{sos.priority}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
