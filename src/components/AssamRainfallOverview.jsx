import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CloudRain, 
  Sparkles,
  MapPin, 
  RefreshCw, 
  Thermometer, 
  Wind, 
  Droplets, 
  ShieldAlert, 
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Check,
  Brain,
  Layers,
  Bell
} from 'lucide-react';
import { ASSAM_DISTRICTS } from '../config/assamDistricts';
import { fetchDistrictWeatherDataAndPredict } from '../services/lstmRainfallModel';

export const AssamRainfallOverview = () => {
  const [selectedDistrictId, setSelectedDistrictId] = useState('guwahati');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  const dropdownRef = useRef(null);

  const selectedDistrict = ASSAM_DISTRICTS.find(d => d.id === selectedDistrictId) || ASSAM_DISTRICTS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch telemetry & trigger LSTM inference pipeline
  const loadDistrictData = useCallback(async (district) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDistrictWeatherDataAndPredict(district);
      setTelemetry(result);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load district rainfall & LSTM model:', err);
      setError('Telemetry stream temporarily interrupted.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDistrictData(selectedDistrict);
  }, [selectedDistrict, loadDistrictData]);

  const handleRefresh = () => {
    loadDistrictData(selectedDistrict);
  };

  // Format date time e.g., "02 Jun 2025, 11:30 AM"
  const formatTimestamp = (date) => {
    if (!date) return 'Just now';
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const weather = telemetry?.weather || {
    current_rain_mm_h: 0.0,
    rain_24h_mm: 0.5,
    rain_prob_pct: 40,
    temp_c: 27.5,
    feels_like_c: 29.1,
    humidity_pct: 84,
    dew_point_c: 24.6,
    wind_kmh: 0.5,
    pressure_hpa: 1002,
    current_intensity: 'Dry / Clear Sky'
  };

  const prediction = telemetry?.prediction || {
    predictedRainRate: 12.4,
    predictionIntensity: 'Moderate Rain',
    forecastHorizon: 'Next 6 Hours',
    trend: 'Rising',
    trendDescription: 'Increasing rainfall expected',
    riskLevel: 'HIGH',
    riskColor: 'rose',
    riskAction: 'Stay Alert',
    riskMessage: 'Precipitation within normal range for Brahmaputra/Barak basin.',
    forecast12Hours: [0.0, 0.0, 0.0, 0.1, 0.3, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0]
  };

  // Risk display helper
  const isHighOrCritical = prediction.riskLevel === 'HIGH' || prediction.riskLevel === 'CRITICAL';
  const isModerate = prediction.riskLevel === 'MODERATE';
  const isSafe = prediction.riskLevel === 'GREEN / SAFE' || prediction.riskLevel === 'LOW';

  return (
    <div className="w-full bg-[#070D18] border border-slate-800/80 rounded-2xl p-5 md:p-7 shadow-2xl text-slate-100 font-sans transition-all duration-300">
      
      {/* ========================================================
          1. HEADER & DISTRICT SELECTOR
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/60">
        
        {/* Title and Subtitle */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex-shrink-0 mt-0.5">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                AI Rainfall Dashboard
              </h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-normal mt-0.5">
              Real-time & AI-Powered Rainfall Insights for {selectedDistrict.fullName}
            </p>
          </div>
        </div>

        {/* District Selector & Refresh Timestamp */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Custom Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D1627] hover:bg-[#121E36] border border-slate-700/70 hover:border-blue-500/60 text-slate-200 text-xs md:text-sm font-semibold transition-all duration-200 shadow-sm"
            >
              <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>{selectedDistrict.fullName}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 max-h-80 overflow-y-auto rounded-xl bg-[#0D1627] border border-slate-700/80 shadow-2xl py-1.5 z-50 divide-y divide-slate-800/40">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Assam District / Region (12 Total)
                </div>
                {ASSAM_DISTRICTS.map((district) => {
                  const isSelected = district.id === selectedDistrictId;
                  return (
                    <button
                      key={district.id}
                      onClick={() => {
                        setSelectedDistrictId(district.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-blue-600/20 text-blue-400 font-bold' 
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{district.fullName}</div>
                        <div className="text-[10px] text-slate-500">{district.district} • {district.basin}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            title="Refresh live rainfall & re-run LSTM prediction"
            className="p-2 rounded-xl bg-[#0D1627] hover:bg-[#121E36] border border-slate-700/70 text-slate-400 hover:text-white transition-all flex items-center justify-center"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Last Updated Timestamp */}
          <div className="text-right pl-2 hidden sm:block">
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Last Updated:
            </span>
            <span className="text-xs text-slate-300 font-medium font-mono">
              {formatTimestamp(lastRefreshed)}
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================
          2. RISK & REGIONAL BASIN STATUS BANNER
          ======================================================== */}
      <div className={`mt-5 p-3.5 md:p-4 rounded-xl border flex items-center gap-3.5 transition-all duration-300 ${
        isHighOrCritical
          ? 'bg-rose-950/30 border-rose-900/60 text-rose-300'
          : isModerate
          ? 'bg-amber-950/30 border-amber-900/60 text-amber-300'
          : 'bg-[#091C1C]/70 border-emerald-900/50 text-emerald-300'
      }`}>
        <div className={`p-2 rounded-lg ${
          isHighOrCritical 
            ? 'bg-rose-900/40 text-rose-400 border border-rose-700/40' 
            : isModerate
            ? 'bg-amber-900/40 text-amber-400 border border-amber-700/40'
            : 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/40'
        }`}>
          {isHighOrCritical ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-xs md:text-sm tracking-wide uppercase">
              {prediction.riskLevel}
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="font-bold text-xs md:text-sm tracking-wide text-white uppercase">
              {selectedDistrict.name}, ASSAM, INDIA
            </span>
          </div>
          <p className="text-xs text-slate-300 font-normal mt-0.5 truncate md:whitespace-normal">
            {prediction.riskMessage}
          </p>
        </div>
      </div>

      {/* ========================================================
          3. ROW 1: FOUR KEY PREDICTION & TELEMETRY CARDS
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        
        {/* CARD 1: CURRENT RAIN RATE (Live API) */}
        <div className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-teal-500/40 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-teal-400" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400">
                Current Rain Rate
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800/60 text-[10px] font-mono font-bold tracking-wide">
              LIVE API
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline">
              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                {weather.current_rain_mm_h.toFixed(1) === '0.0' ? '0' : weather.current_rain_mm_h.toFixed(1)}
              </span>
              <span className="text-sm font-normal text-slate-400 ml-1.5 font-mono">
                mm/h
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Intensity:</span>
            <span className="font-semibold text-slate-200">
              {weather.current_intensity}
            </span>
          </div>
        </div>

        {/* CARD 2: PREDICTED RAIN RATE (LSTM AI Model) */}
        <div className="bg-[#0B1220] border border-purple-900/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-purple-500/50 transition-all duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-400">
                Predicted Rain Rate
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-950/90 text-purple-300 border border-purple-800/70 text-[10px] font-mono font-bold tracking-wide">
              AI MODEL
            </span>
          </div>

          <div className="my-4">
            <div className="flex items-baseline">
              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                {prediction.predictedRainRate.toFixed(1)}
              </span>
              <span className="text-sm font-normal text-slate-400 ml-1.5 font-mono">
                mm/h
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Prediction: {prediction.forecastHorizon}
            </div>
          </div>

          <div>
            <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-900/30 text-purple-300 border border-purple-700/40">
              {prediction.predictionIntensity}
            </span>
          </div>
        </div>

        {/* CARD 3: TREND (Calculated from LSTM Sequence) */}
        <div className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all duration-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
              Trend
            </span>
          </div>

          <div className="my-3 flex flex-col items-center justify-center text-center">
            {/* Visual Vector Arrow */}
            <div className="my-1">
              {prediction.trend === 'Rising' ? (
                <svg className="w-14 h-9 text-amber-400" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 4 24 L 20 18 L 36 22 L 52 6" />
                  <path d="M 40 6 L 52 6 L 52 18" />
                </svg>
              ) : prediction.trend === 'Falling' ? (
                <svg className="w-14 h-9 text-emerald-400" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 4 6 L 20 14 L 36 10 L 52 24" />
                  <path d="M 40 24 L 52 24 L 52 12" />
                </svg>
              ) : (
                <svg className="w-14 h-9 text-cyan-400" viewBox="0 0 60 30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M 4 15 L 52 15" />
                  <path d="M 42 7 L 52 15 L 42 23" />
                </svg>
              )}
            </div>

            <div className={`text-base font-bold mt-1 ${
              prediction.trend === 'Rising' ? 'text-amber-400' : prediction.trend === 'Falling' ? 'text-emerald-400' : 'text-cyan-400'
            }`}>
              {prediction.trend}
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center">
            {prediction.trendDescription}
          </div>
        </div>

        {/* CARD 4: RISK LEVEL */}
        <div className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all duration-200">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-rose-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">
              Risk Level
            </span>
          </div>

          <div className="my-2 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <ShieldAlert className={`w-12 h-12 ${
                isHighOrCritical ? 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]' : isModerate ? 'text-amber-500 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 'text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              }`} />
            </div>

            <div className={`text-xl md:text-2xl font-black uppercase tracking-wider mt-1.5 ${
              isHighOrCritical ? 'text-rose-500' : isModerate ? 'text-amber-500' : 'text-emerald-400'
            }`}>
              {prediction.riskLevel}
            </div>
          </div>

          <div className="text-xs text-slate-400 text-center font-medium">
            {prediction.riskAction}
          </div>
        </div>

      </div>

      {/* ========================================================
          4. ROW 2: FOUR METEOROLOGICAL TELEMETRY CARDS
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        
        {/* CARD 5: 24H CUMULATIVE RAIN */}
        <div className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-200">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400">
              24h Cumulative Rain
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline">
              <span className="text-3xl md:text-4xl font-extrabold text-cyan-300 font-mono tracking-tight">
                {weather.rain_24h_mm.toFixed(1)}
              </span>
              <span className="text-sm font-normal text-slate-400 ml-1.5 font-mono">
                mm
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="text-slate-400">
              Probability: <span className="font-bold text-cyan-400 font-mono">{weather.rain_prob_pct}%</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800/90 text-cyan-300 border border-slate-700/80 text-[10px] font-mono font-bold">
              API TOTAL
            </span>
          </div>
        </div>

        {/* CARD 6: TEMPERATURE */}
        <div className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all duration-200">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-rose-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400">
              Temperature
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl md:text-4xl font-extrabold text-white font-mono tracking-tight">
              {weather.temp_c.toFixed(1)}°C
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-1">
            Feels like: <span className="font-semibold text-slate-200 font-mono">{weather.feels_like_c.toFixed(1)}°C</span>
          </div>
        </div>

        {/* CARD 7: HUMIDITY */}
        <div className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all duration-200">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400">
              Humidity
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl md:text-4xl font-extrabold text-white font-mono tracking-tight">
              {weather.humidity_pct}%
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-1">
            Dew Point: <span className="font-semibold text-slate-200 font-mono">{weather.dew_point_c.toFixed(1)}°C</span>
          </div>
        </div>

        {/* CARD 8: WIND VELOCITY */}
        <div className="bg-[#0B1220] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all duration-200">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
              Wind Velocity
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline">
              <span className="text-3xl md:text-4xl font-extrabold text-amber-400 font-mono tracking-tight">
                {weather.wind_kmh.toFixed(1)}
              </span>
              <span className="text-sm font-normal text-slate-400 ml-1.5 font-mono">
                km/h
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-1">
            Pressure: <span className="font-semibold text-slate-200 font-mono">{weather.pressure_hpa} hPa</span>
          </div>
        </div>

      </div>

      {/* ========================================================
          5. 12-HOUR RAIN TELEMETRY FORECAST PANEL (LSTM OUTPUT)
          ======================================================== */}
      <div className="mt-5 bg-[#0A101C] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
        
        {/* Forecast Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-wide">
              12-Hour Rain Telemetry Forecast — {selectedDistrict.name}, Assam
            </h3>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Values in mm/h
          </div>
        </div>

        {/* 12 Columns Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 md:gap-3 mt-4">
          {prediction.forecast12Hours.map((val, idx) => {
            const numVal = Number(val) || 0;
            const hourLabel = `+${idx + 1}h`;
            
            // Calculate fill height percentage (max reference 25 mm/h)
            const maxRef = 20;
            const fillHeightPct = Math.min(100, Math.max(8, (numVal / maxRef) * 100));

            const hasActiveRain = numVal > 0.05;

            return (
              <div key={idx} className="flex flex-col items-center">
                
                {/* Top Number */}
                <div className="text-xs font-mono font-bold text-cyan-400 mb-1.5">
                  {numVal.toFixed(1)}
                </div>

                {/* Vertical Gauge Container */}
                <div className="w-full h-14 bg-[#0D1627] border border-slate-800/80 rounded-lg p-0.5 flex flex-col justify-end overflow-hidden relative shadow-inner">
                  {/* Gauge Bar */}
                  <div 
                    className={`w-full rounded transition-all duration-500 ${
                      hasActiveRain 
                        ? 'bg-gradient-to-t from-cyan-500 to-teal-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]' 
                        : 'bg-slate-800/40'
                    }`}
                    style={{ 
                      height: hasActiveRain ? `${fillHeightPct}%` : '4px' 
                    }}
                  />
                </div>

                {/* Bottom Hour Label */}
                <div className="text-[11px] font-mono text-slate-400 mt-1.5 font-medium">
                  {hourLabel}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
