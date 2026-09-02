import React, { useState } from 'react';
import { useDisaster, ALLOWED_DISASTERS } from '../context/DisasterContext';
import { StatusBadge } from '../components/StatusBadge';
import { BrainCircuit, AlertTriangle, ShieldCheck, Clock, MapPin, Sparkles, Filter, Activity } from 'lucide-react';

export const AIPrediction = () => {
  const { predictions } = useDisaster();
  const [selectedDisaster, setSelectedDisaster] = useState('All');

  const filteredPredictions = selectedDisaster === 'All'
    ? predictions
    : predictions.filter(p => p.disaster_type === selectedDisaster);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <BrainCircuit className="w-6 h-6 animate-pulse text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                MODULE 1: AI DISASTER PREDICTION ENGINE
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800">
                  INSIGHTS AI 4.0
                </span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Predictive Machine Learning algorithms analyzing Satellite SAR, IMD Doppler, and Hydrological Data
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          {ALLOWED_DISASTERS.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDisaster(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedDisaster === d
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPredictions.map(pred => (
          <div 
            key={pred.id} 
            className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative overflow-hidden flex flex-col justify-between transition-colors duration-200"
          >
            {/* Top Risk Percentage Circle */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {pred.disaster_type}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">{pred.title}</h3>
              </div>
              <StatusBadge status={pred.severity} />
            </div>

            {/* Risk Gauge Metric */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">PROBABILITY RISK</div>
                <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{pred.risk_percentage}%</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">AI CONFIDENCE</div>
                <div className="text-lg font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1 justify-end">
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> {pred.confidence}%
                </div>
              </div>
            </div>

            {/* Risk Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Threat Horizon</span>
                <span className="text-rose-600 dark:text-rose-400">{pred.risk_percentage}% Threshold</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    pred.risk_percentage > 85 ? 'bg-red-500' : pred.risk_percentage > 70 ? 'bg-amber-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${pred.risk_percentage}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-200">Affected Regions:</span>
                  <div className="text-slate-600 dark:text-slate-400 text-[11px]">{pred.affected_regions.join(', ')}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-200">Predicted Timeframe: </span>
                  <span className="text-amber-700 dark:text-amber-300 font-semibold">{pred.predicted_time}</span>
                </div>
              </div>
            </div>

            {/* AI Summary Box */}
            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> AI Model Diagnostic Summary:
              </div>
              <p className="leading-relaxed">{pred.ai_summary}</p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
