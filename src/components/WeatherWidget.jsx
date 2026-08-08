import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { CloudRain, Wind, Droplets, Thermometer, AlertTriangle, ShieldCheck } from 'lucide-react';

export const WeatherWidget = () => {
  const { weatherAlerts } = useDisaster();
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);

  const current = weatherAlerts[selectedRegionIndex] || {
    region: "Puri & Coastal Odisha",
    disaster_type: "Cyclones",
    temp: "27.4°C",
    rain_mm: "45 mm/h",
    wind_kmh: "88 km/h",
    humidity: "94%",
    pressure: "982 hPa",
    warning_level: "RED ALERT",
    warning_message: "Severe Cyclonic Storm warning. Fishermen advised not to venture into deep sea."
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-700/80 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Live Meteorological Radar</h3>
            <p className="text-[11px] text-slate-400">Integrated IMD & OpenWeather Telemetry</p>
          </div>
        </div>

        {/* Region Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
          {weatherAlerts.map((w, idx) => (
            <button
              key={w.region}
              onClick={() => setSelectedRegionIndex(idx)}
              className={`px-3 py-1.5 rounded-lg transition font-bold text-[11px] whitespace-nowrap ${
                selectedRegionIndex === idx
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {w.region.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Warning Banner */}
      <div className={`p-3 rounded-xl border flex items-start gap-3 ${
        current.warning_level.includes('RED') 
          ? 'bg-red-950/40 border-red-800/60 text-red-300' 
          : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
      }`}>
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <div className="font-extrabold text-xs tracking-wide">{current.warning_level} • {current.region}</div>
          <p className="text-xs text-slate-300 mt-0.5">{current.warning_message}</p>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Temperature
          </div>
          <div className="font-black text-lg text-slate-100 mt-1">{current.temp}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Precipitation
          </div>
          <div className="font-black text-lg text-cyan-300 mt-1">{current.rain_mm}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Wind className="w-3.5 h-3.5 text-amber-400" /> Wind Velocity
          </div>
          <div className="font-black text-lg text-amber-300 mt-1">{current.wind_kmh}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-400" /> Relative Humidity
          </div>
          <div className="font-black text-lg text-blue-300 mt-1">{current.humidity}</div>
        </div>
      </div>
    </div>
  );
};
