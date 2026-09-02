import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import { WeatherWidget } from '../components/WeatherWidget';
import { AssamRainfallOverview } from '../components/AssamRainfallOverview';
import { CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';

export const WeatherPage = () => {
  const { weatherAlerts } = useDisaster();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            MODULE 2: WEATHER SYSTEM & SEVERE WARNINGS
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-cyan-700 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
              IMD LIVE TELEMETRY
            </span>
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time atmospheric monitoring across Bay of Bengal, Arabian Sea, Western Ghats & Northeast River Basins
          </p>
        </div>
      </div>

      {/* Dedicated Assam Rainfall Overview Section */}
      <AssamRainfallOverview />

      {/* Main Weather Widget */}
      <WeatherWidget />

      {/* Grid of Weather Regional Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {weatherAlerts.map(w => (
          <div key={w.region} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">{w.region}</span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                w.warning_level.includes('RED') ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
              }`}>
                {w.warning_level}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-100 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[10px]">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" /> Temperature
                </span>
                <span className="font-black text-sm text-slate-900 dark:text-slate-100 mt-1 block">{w.temp}</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[10px]">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Rainfall
                </span>
                <span className="font-black text-sm text-cyan-700 dark:text-cyan-300 mt-1 block">{w.rain_mm}</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[10px]">
                  <Wind className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Wind Velocity
                </span>
                <span className="font-black text-sm text-amber-700 dark:text-amber-300 mt-1 block">{w.wind_kmh}</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[10px]">
                  <Droplets className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Humidity
                </span>
                <span className="font-black text-sm text-blue-700 dark:text-blue-300 mt-1 block">{w.humidity}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-slate-950/60 border border-amber-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 space-y-1">
              <div className="font-bold text-amber-700 dark:text-amber-400 text-[11px]">IMD Advisory Warning:</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{w.warning_message}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
