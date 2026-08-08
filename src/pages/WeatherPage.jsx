import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import { WeatherWidget } from '../components/WeatherWidget';
import { CloudRain, Wind, Droplets, Thermometer, ShieldAlert, Compass, Eye } from 'lucide-react';

export const WeatherPage = () => {
  const { weatherAlerts } = useDisaster();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            MODULE 2: WEATHER SYSTEM & SEVERE WARNINGS
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-950 text-cyan-400 border border-blue-800">
              IMD LIVE TELEMETRY
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time atmospheric monitoring across Bay of Bengal, Arabian Sea, Western Ghats & Northeast River Basins
          </p>
        </div>
      </div>

      {/* Main Weather Widget */}
      <WeatherWidget />

      {/* Grid of Weather Regional Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {weatherAlerts.map(w => (
          <div key={w.region} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white">{w.region}</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                w.warning_level.includes('RED') ? 'bg-red-950 text-red-400 border-red-800' : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {w.warning_level}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                  <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temperature
                </span>
                <span className="font-black text-sm text-slate-100 mt-1 block">{w.temp}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Rainfall
                </span>
                <span className="font-black text-sm text-cyan-300 mt-1 block">{w.rain_mm}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                  <Wind className="w-3.5 h-3.5 text-amber-400" /> Wind Velocity
                </span>
                <span className="font-black text-sm text-amber-300 mt-1 block">{w.wind_kmh}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                  <Droplets className="w-3.5 h-3.5 text-blue-400" /> Humidity
                </span>
                <span className="font-black text-sm text-blue-300 mt-1 block">{w.humidity}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-400 text-[11px]">IMD Advisory Warning:</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{w.warning_message}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
