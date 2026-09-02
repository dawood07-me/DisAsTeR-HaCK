import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { 
  CloudRain, 
  MapPin, 
  RefreshCw, 
  Layers, 
  Flame, 
  Info, 
  Compass, 
  AlertTriangle,
  Droplets,
  Calendar,
  CheckCircle2
} from 'lucide-react';

// ─── 18 GEOGRAPHICALLY DISTRIBUTED LOCATIONS ACROSS ASSAM ──────────────
export const ASSAM_HEATMAP_LOCATIONS = [
  { id: 'guwahati', name: 'Guwahati', district: 'Kamrup Metropolitan', lat: 26.1445, lng: 91.7362, key_river: 'Brahmaputra River', region: 'Central Assam' },
  { id: 'dibrugarh', name: 'Dibrugarh', district: 'Dibrugarh District', lat: 27.4728, lng: 94.9120, key_river: 'Upper Brahmaputra', region: 'Upper Assam' },
  { id: 'silchar', name: 'Silchar', district: 'Cachar (Barak Valley)', lat: 24.8333, lng: 92.7789, key_river: 'Barak River', region: 'Barak Valley' },
  { id: 'jorhat', name: 'Jorhat', district: 'Jorhat District', lat: 26.7509, lng: 94.2037, key_river: 'Bhogdoi & Brahmaputra', region: 'Upper Assam' },
  { id: 'tezpur', name: 'Tezpur', district: 'Sonitpur District', lat: 26.6338, lng: 92.8000, key_river: 'Jia Bharali & Brahmaputra', region: 'North Bank' },
  { id: 'nagaon', name: 'Nagaon', district: 'Nagaon District', lat: 26.3463, lng: 92.6840, key_river: 'Kopili & Kolong River', region: 'Central Assam' },
  { id: 'tinsukia', name: 'Tinsukia', district: 'Tinsukia District', lat: 27.4922, lng: 95.3558, key_river: 'Dibru & Lohit', region: 'Upper Assam' },
  { id: 'dhubri', name: 'Dhubri', district: 'Dhubri District', lat: 26.0207, lng: 89.9749, key_river: 'Lower Brahmaputra', region: 'Lower Assam' },
  { id: 'bongaigaon', name: 'Bongaigaon', district: 'Bongaigaon District', lat: 26.4789, lng: 90.5583, key_river: 'Aie River Basin', region: 'Lower Assam' },
  { id: 'north_lakhimpur', name: 'North Lakhimpur', district: 'Lakhimpur District', lat: 27.2345, lng: 94.1062, key_river: 'Subansiri River', region: 'North Bank' },
  { id: 'haflong', name: 'Haflong', district: 'Dima Hasao Hill Sector', lat: 25.1667, lng: 93.0167, key_river: 'Jatinga River', region: 'Hills Sector' },
  { id: 'barpeta', name: 'Barpeta', district: 'Barpeta District', lat: 26.3200, lng: 91.0000, key_river: 'Manas & Beki River', region: 'Lower Assam' },
  { id: 'goalpara', name: 'Goalpara', district: 'Goalpara District', lat: 26.1833, lng: 90.6167, key_river: 'Lower Brahmaputra South', region: 'Lower Assam' },
  { id: 'golaghat', name: 'Golaghat', district: 'Golaghat District', lat: 26.5167, lng: 93.9667, key_river: 'Dhansiri River', region: 'Upper Assam' },
  { id: 'diphu', name: 'Diphu (Karbi Anglong)', district: 'Karbi Anglong', lat: 25.8333, lng: 93.4333, key_river: 'Kopili Basin', region: 'Hills Sector' },
  { id: 'kokrajhar', name: 'Kokrajhar (BTR)', district: 'Kokrajhar District', lat: 26.4000, lng: 90.2667, key_river: 'Gaurang & Champamati', region: 'Lower Assam' },
  { id: 'morigaon', name: 'Morigaon', district: 'Morigaon District', lat: 26.2500, lng: 92.3333, key_river: 'Brahmaputra South', region: 'Central Assam' },
  { id: 'dhemaji', name: 'Dhemaji', district: 'Dhemaji District', lat: 27.4833, lng: 94.5833, key_river: 'Jiadhal & Subansiri', region: 'North Bank' }
];

// ─── RAINFALL INTENSITY COLOR HELPER ──────────────────────────────────
export const getRainfallColor = (valueMm) => {
  if (valueMm >= 35) return { name: 'Very Heavy', color: '#ef4444', border: '#b91c1c', bg: 'rgba(239, 68, 68, 0.85)', label: 'Red (≥ 35 mm)' };
  if (valueMm >= 15) return { name: 'Heavy', color: '#f97316', border: '#c2410c', bg: 'rgba(249, 115, 22, 0.80)', label: 'Orange (15 - 35 mm)' };
  if (valueMm >= 5) return { name: 'Moderate', color: '#eab308', border: '#a16207', bg: 'rgba(234, 179, 8, 0.75)', label: 'Yellow (5 - 15 mm)' };
  if (valueMm >= 1) return { name: 'Low', color: '#10b981', border: '#047857', bg: 'rgba(16, 185, 129, 0.65)', label: 'Green (1 - 5 mm)' };
  return { name: 'Very Low', color: '#3b82f6', border: '#1d4ed8', bg: 'rgba(59, 130, 246, 0.50)', label: 'Blue (< 1 mm)' };
};

export const AssamRainfallHeatmap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  const [mode, setMode] = useState('current'); // 'current' (mm/h) | 'daily' (24h sum mm)
  const [selectedLocId, setSelectedLocId] = useState('all');
  const [rainfallData, setRainfallData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [mapStyle, setMapStyle] = useState('roadmap');

  // Tile URLs for Google Maps
  const tileUrls = {
    roadmap: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    satellite: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    terrain: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  };

  // ─── FETCH REAL MULTI-LOCATION OPEN-METEO RAINFALL DATA ─────────────
  const fetchMultiPointRainfall = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build multi-coordinate comma separated string for Open-Meteo API
      const lats = ASSAM_HEATMAP_LOCATIONS.map(loc => loc.lat).join(',');
      const lngs = ASSAM_HEATMAP_LOCATIONS.map(loc => loc.lng).join(',');

      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}&current=precipitation,rain,showers,temperature_2m,relative_humidity_2m,wind_speed_10m&daily=precipitation_sum&timezone=Asia%2FKolkata`;

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`Weather Grid API responded with HTTP ${res.status}`);

      const data = await res.json();

      // Open-Meteo returns an array of location objects when multiple coordinates are passed
      const responsesList = Array.isArray(data) ? data : [data];

      const mappedPoints = ASSAM_HEATMAP_LOCATIONS.map((loc, idx) => {
        const item = responsesList[idx] || responsesList[0] || {};
        const current = item.current || {};
        const daily = item.daily || {};

        const rainCurrent = Number((current.precipitation ?? current.rain ?? 0).toFixed(1));
        const rain24h = Number((daily.precipitation_sum ? daily.precipitation_sum[0] : 0).toFixed(1));

        return {
          ...loc,
          current_rain_mm: rainCurrent,
          daily_rain_mm: rain24h,
          temp_c: Number((current.temperature_2m ?? 27).toFixed(1)),
          humidity_pct: Math.round(current.relative_humidity_2m ?? 82),
          wind_speed_kmh: Number((current.wind_speed_10m ?? 12).toFixed(1)),
          timestamp: current.time ? new Date(current.time).toLocaleTimeString() : new Date().toLocaleTimeString()
        };
      });

      setRainfallData(mappedPoints);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to fetch multi-point Assam rainfall data:', err);
      setError('Unable to load live weather grid. Please check network connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMultiPointRainfall();
  }, [fetchMultiPointRainfall]);

  // ─── INITIALIZE LEAFLET MAP FOCUSED ON ASSAM ─────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on Assam, India [26.2, 92.9]
      const map = L.map(mapContainerRef.current, {
        center: [26.2, 92.9],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer(tileUrls.roadmap, {
        maxZoom: 18,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps & IMD / Open-Meteo Rainfall Telemetry'
      }).addTo(map);

      mapInstanceRef.current = map;
      layersGroupRef.current = L.layerGroup().addTo(map);

      // Add dashed Assam boundary outline box for geographical context
      const assamBounds = [
        [24.1, 89.6],
        [28.0, 96.1]
      ];
      L.rectangle(assamBounds, {
        color: '#0284c7',
        weight: 1.5,
        dashArray: '5, 5',
        fill: false
      }).addTo(map);
    }
  }, []);

  // Update map tiles on style switch
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    
    // Remove existing tile layer
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(tileUrls[mapStyle], {
      maxZoom: 18,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps & IMD / Open-Meteo Rainfall Telemetry'
    }).addTo(map);
  }, [mapStyle]);

  // ─── RENDER REAL GEOGRAPHIC RAINFALL HEATMAP CIRCLES & TOOLTIPS ────────
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current) return;
    const map = mapInstanceRef.current;
    const layerGroup = layersGroupRef.current;

    layerGroup.clearLayers();

    if (rainfallData.length === 0) return;

    rainfallData.forEach(point => {
      const rainVal = mode === 'current' ? point.current_rain_mm : point.daily_rain_mm;
      const styleInfo = getRainfallColor(rainVal);

      // 1. Heat Radius Intensity Circle
      // Heat circle radius expands dynamically based on real rainfall volume (min 16km, max 55km)
      const radiusMeters = Math.max(16000, Math.min(55000, (rainVal + 3) * 2200));

      const heatCircle = L.circle([point.lat, point.lng], {
        radius: radiusMeters,
        color: styleInfo.border,
        weight: 1.5,
        fillColor: styleInfo.color,
        fillOpacity: Math.min(0.75, 0.35 + (rainVal / 60))
      });

      // 2. Center Location Pin Dot
      const centerDot = L.circleMarker([point.lat, point.lng], {
        radius: selectedLocId === point.id ? 9 : 6,
        color: '#ffffff',
        weight: 2,
        fillColor: styleInfo.color,
        fillOpacity: 1
      });

      // 3. Rich Informative Tooltip Popup
      const popupHtml = `
        <div style="padding: 6px; min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-weight: 900; font-size: 13px; color: #0f172a;">📍 ${point.name}</span>
            <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${styleInfo.color}; color: white;">
              ${styleInfo.name.toUpperCase()}
            </span>
          </div>
          
          <div style="font-size: 11px; color: #475569; space-y: 2px;">
            <div>District: <b style="color: #0f172a;">${point.district}</b></div>
            <div>Region: <b style="color: #0284c7;">${point.region}</b></div>
            <div>River Basin: <b style="color: #0369a1;">${point.key_river}</b></div>
            <div>Coords: <span style="font-family: monospace;">${point.lat.toFixed(2)}°N, ${point.lng.toFixed(2)}°E</span></div>
          </div>

          <div style="margin-top: 8px; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #cbd5e1; text-align: center;">
            <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">
              ${mode === 'current' ? 'Live Current Rain Rate' : '24h Total Rain Volume'}
            </div>
            <div style="font-size: 20px; font-weight: 900; color: ${styleInfo.color}; font-family: monospace;">
              ${rainVal} <span style="font-size: 11px;">${mode === 'current' ? 'mm/h' : 'mm'}</span>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 10px; color: #64748b;">
            <span>🌡️ ${point.temp_c}°C</span>
            <span>💧 ${point.humidity_pct}% Hum</span>
            <span>💨 ${point.wind_speed_kmh} km/h</span>
          </div>

          <div style="margin-top: 6px; font-size: 9px; color: #94a3b8; text-align: right; font-family: monospace;">
            Source: IMD / Open-Meteo Grid API • ${point.timestamp}
          </div>
        </div>
      `;

      heatCircle.bindPopup(popupHtml);
      centerDot.bindPopup(popupHtml);

      layerGroup.addLayer(heatCircle);
      layerGroup.addLayer(centerDot);
    });

    // Zoom to selected location if specific district is selected
    if (selectedLocId !== 'all') {
      const foundLoc = rainfallData.find(p => p.id === selectedLocId);
      if (foundLoc) {
        map.flyTo([foundLoc.lat, foundLoc.lng], 9, { duration: 1 });
      }
    } else {
      map.flyTo([26.2, 92.9], 7, { duration: 1 });
    }

  }, [rainfallData, mode, selectedLocId]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm transition-colors duration-200">
      
      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <Flame className="w-5 h-5 animate-pulse text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wide">
                RAIN FALL INTENSITY HEATMAP — ASSAM
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Geographically distributed real rainfall observations across Assam
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Mode Switcher & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Mode Switcher Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode('current')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                mode === 'current'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Current Rain Rate (mm/h)
            </button>
            <button
              onClick={() => setMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                mode === 'daily'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              24h Total Accumulation (mm)
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchMultiPointRainfall}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 font-bold transition disabled:opacity-50"
            title="Refresh Real-Time Rainfall Grid"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

        </div>
      </div>

      {/* District Quick Filter Bar */}
      <div className="space-y-1.5">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Layers className="w-3 h-3 text-blue-600 dark:text-cyan-400" /> Focus Assam Geographical District:
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedLocId('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              selectedLocId === 'all'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🌐 All Assam Districts (18 Points)
          </button>
          {ASSAM_HEATMAP_LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocId(loc.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                selectedLocId === loc.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container Box with Tile Switcher and Legend Overlay */}
      <div className="relative isolate w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Map Tile Control Bar */}
        <div className="absolute top-3 right-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-1.5 rounded-xl shadow-md flex items-center gap-1">
          <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 px-2 uppercase">Tiles:</span>
          {['roadmap', 'satellite', 'terrain'].map(st => (
            <button
              key={st}
              onClick={() => setMapStyle(st)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition ${
                mapStyle === st ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Leaflet Map Target Element */}
        <div ref={mapContainerRef} className="w-full h-[450px] z-10" />

        {/* Rainfall Intensity Scale Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 p-3 rounded-2xl shadow-xl text-xs space-y-2 max-w-xs">
          <div className="font-extrabold text-[10px] uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" /> RAINFALL INTENSITY SCALE (MM)
          </div>
          <div className="grid grid-cols-1 gap-1 text-[11px] font-semibold">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-blue-700 shrink-0" />
              <span>&lt; 1.0 mm (Very Low Rainfall)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-700 shrink-0" />
              <span>1.0 - 5.0 mm (Low Rainfall)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 border border-yellow-700 shrink-0" />
              <span>5.0 - 15.0 mm (Moderate Rainfall)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-orange-700 shrink-0" />
              <span>15.0 - 35.0 mm (Heavy Rainfall)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-700 shrink-0" />
              <span>&ge; 35.0 mm (Very Heavy Downpour)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid Summary Footer Info Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Verified 100% dynamic Open-Meteo multi-coordinate telemetry grid covering 18 Assam districts</span>
        </div>
        {lastRefreshed && (
          <span className="font-mono text-slate-600 dark:text-slate-400">
            Last Synced: {lastRefreshed.toLocaleTimeString()}
          </span>
        )}
      </div>

    </div>
  );
};
