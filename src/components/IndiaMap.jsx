import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useDisaster } from '../context/DisasterContext';
import { Map, Layers, Navigation, AlertOctagon, ShieldCheck, Home } from 'lucide-react';

export const IndiaMap = ({ height = '520px', filterType = 'All' }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);

  const { sosRequests, shelters } = useDisaster();
  const [mapStyle, setMapStyle] = useState('roadmap'); // 'roadmap' | 'satellite' | 'terrain'

  // Tile URLs for Google Maps
  const googleTileUrls = {
    roadmap: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    satellite: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    terrain: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Map centered over India
      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Default Google Maps Roadmap Tile Layer
      const initialTileLayer = L.tileLayer(googleTileUrls.roadmap, {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps Infrastructure Data'
      }).addTo(map);

      tileLayerRef.current = initialTileLayer;
      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }
  }, []);

  // Update Tile Layer when user toggles Google Maps style
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newLayer = L.tileLayer(googleTileUrls[mapStyle], {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps Infrastructure Data'
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }
  }, [mapStyle]);

  // Render Small Round Disaster & Resource Logo Markers on Google Maps
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Helper: Disaster Logo & Color Mapping
    const getDisasterDetails = (type) => {
      switch (type) {
        case 'Floods':
          return { logo: '🌊', color: '#0284c7', bg: '#0369a1', name: 'Floods' };
        case 'Cyclones':
          return { logo: '🌀', color: '#9333ea', bg: '#7e22ce', name: 'Cyclones' };
        case 'Landslides':
          return { logo: '⛰️', color: '#ea580c', bg: '#c2410c', name: 'Landslides' };
        case 'Heavy Rainfall':
          return { logo: '🌧️', color: '#2563eb', bg: '#1d4ed8', name: 'Heavy Rainfall' };
        case 'Tsunami':
          return { logo: '🌊', color: '#0891b2', bg: '#0e7490', name: 'Tsunami' };
        case 'Forest Fires':
          return { logo: '🔥', color: '#dc2626', bg: '#b91c1c', name: 'Forest Fires' };
        default:
          return { logo: '🚨', color: '#ef4444', bg: '#991b1b', name: 'Emergency' };
      }
    };

    // Compact Small Round Pin Marker Builder (34px x 34px Circle)
    const createSmallRoundDisasterMarker = (disasterType, priority, isCritical) => {
      const details = getDisasterDetails(disasterType);
      
      return L.divIcon({
        className: 'custom-google-disaster-round-marker',
        html: `
          <div style="
            position: relative;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: rgba(15, 23, 42, 0.95);
            border: 2.5px solid ${details.color};
            box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 12px ${details.color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 17px;
            cursor: pointer;
            transition: transform 0.2s ease;
          " title="${disasterType} Beacon">
            ${details.logo}
            ${isCritical ? `
              <span style="
                position: absolute;
                top: -2px;
                right: -2px;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #ef4444;
                border: 1.5px solid white;
                box-shadow: 0 0 8px #ef4444;
              "></span>
            ` : ''}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });
    };

    // 1. Plot SOS Emergency Beacons with Small Round Logos
    sosRequests.forEach(sos => {
      if (filterType !== 'All' && sos.disaster_type !== filterType) return;

      const isCritical = sos.priority === 'Critical';
      const icon = createSmallRoundDisasterMarker(
        sos.disaster_type, 
        sos.priority, 
        isCritical
      );

      const marker = L.marker([sos.lat || 20.5, sos.lng || 78.9], { icon });

      const popupContent = `
        <div style="padding: 4px; min-width: 230px; font-family: system-ui, sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid #334155; padding-bottom: 6px;">
            <span style="font-weight: 900; font-size: 13px; color: #38bdf8;">${sos.id} • ${sos.disaster_type}</span>
            <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: ${isCritical ? '#991b1b' : '#1e293b'}; color: ${isCritical ? '#fca5a5' : '#38bdf8'};">
              ${sos.priority.toUpperCase()}
            </span>
          </div>
          <div style="font-size: 12px; margin-top: 6px; color: #f1f5f9;">📍 <b>${sos.location}</b></div>
          <div style="font-size: 11px; margin-top: 4px; color: #94a3b8; line-height: 1.3;">"${sos.message}"</div>
          <div style="font-size: 11px; margin-top: 8px; font-weight: 800; color: #34d399; display: flex; justify-content: space-between; align-items: center;">
            <span>STATUS: ${sos.status.toUpperCase()}</span>
            <span style="color: #cbd5e1;">👥 ${sos.people_count || 1} Stranded</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersGroup.addLayer(marker);
    });

    // 2. Add Shelter Hub Markers (Small Round 30px Pin)
    shelters.forEach(shelter => {
      const icon = L.divIcon({
        className: 'custom-google-shelter-round-marker',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #0284c7;
            border: 2px solid white;
            box-shadow: 0 0 10px #0284c7;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            cursor: pointer;
          " title="${shelter.name}">
            🏠
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([shelter.lat || 21.0, shelter.lng || 83.0], { icon });

      const popupContent = `
        <div style="font-family: system-ui; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #38bdf8;">🏠 ${shelter.name}</div>
          <div style="font-size: 12px; margin-top: 4px; color: #cbd5e1;">📍 ${shelter.district}, ${shelter.state}</div>
          <div style="font-size: 11px; margin-top: 6px; color: #34d399; font-weight: 700;">
            Bed Occupancy: ${shelter.current_occupancy} / ${shelter.capacity} beds
          </div>
          <div style="font-size: 11px; margin-top: 2px; color: #94a3b8;">📞 ${shelter.phone}</div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersGroup.addLayer(marker);
    });

    // 3. NDRF Battalion Deployment Bases (Small Round 30px Pin)
    const rescueBases = [
      { name: "NDRF Battalion 4", lat: 13.0827, lng: 79.6678, status: "Active Search & Evacuation Ops" },
      { name: "SDRF Assam Riverine Base", lat: 26.1445, lng: 91.7362, status: "Deployed - Flood Rescue" },
      { name: "NDRF Odisha Cyclone Unit", lat: 20.2961, lng: 85.8245, status: "Standby Response" }
    ];

    rescueBases.forEach(base => {
      const icon = L.divIcon({
        className: 'custom-google-ndrf-round-marker',
        html: `
          <div style="
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #10b981;
            border: 2px solid white;
            box-shadow: 0 0 10px #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            cursor: pointer;
          " title="${base.name}">
            ⚡
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([base.lat, base.lng], { icon });
      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 4px;">
          <div style="font-weight: 800; font-size: 13px; color: #34d399;">⚡ ${base.name}</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Status: ${base.status}</div>
        </div>
      `);
      markersGroup.addLayer(marker);
    });

  }, [sosRequests, shelters, filterType]);

  return (
    <div className="relative isolate w-full rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl z-0">
      
      {/* Top Google Maps Mode Switcher Header Bar */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto z-20 flex flex-wrap items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl text-xs font-bold">
        <span className="px-1.5 text-[10px] uppercase font-black text-cyan-400 flex items-center gap-1">
          <Map className="w-3.5 h-3.5 text-cyan-400" /> GOOGLE MAPS:
        </span>
        
        <button
          onClick={() => setMapStyle('roadmap')}
          className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
            mapStyle === 'roadmap'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Google Standard
        </button>

        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
            mapStyle === 'satellite'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite Hybrid
        </button>

        <button
          onClick={() => setMapStyle('terrain')}
          className={`px-2.5 py-1 rounded-lg transition text-[11px] ${
            mapStyle === 'terrain'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Terrain
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs space-y-1.5 font-medium">
        <div className="font-extrabold text-[10px] text-cyan-400 uppercase tracking-wider mb-1">
          LIVE DISASTER & RESOURCE MAP
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-red-500 flex items-center justify-center text-[10px]">🌊</span> Active Disaster (Round Logo)
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-600 flex items-center justify-center text-[10px]">🏠</span> Shelter Hub Pin
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px]">⚡</span> NDRF Rescue Base
        </div>
      </div>

    </div>
  );
};
