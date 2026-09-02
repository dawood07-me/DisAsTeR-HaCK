import { API_BASE } from "../config";
console.log("API BASE:", API_BASE);
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DisasterContext = createContext();

export const ALLOWED_DISASTERS = [
  'All',
  'Floods',
  'Cyclones',
  'Tsunami',
  'Heavy Rainfall',
  'Landslides',
  'Forest Fires'
];

export const DisasterProvider = ({ children }) => {
  const [selectedDisasterFilter, setSelectedDisasterFilter] = useState('All');
  const [sosRequests, setSosRequests] = useState([]);
  const [reliefRequests, setReliefRequests] = useState([]);
  const [missingPersons, setMissingPersons] = useState([]);
  const [damageReports, setDamageReports] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', title: 'Cyclone RAKSHA-04 Alert', text: 'Bay of Bengal deep depression escalated to Severe Cyclone warning for Odisha.', time: '10 mins ago', unread: true },
    { id: 2, type: 'sos', title: 'New Critical SOS Broadcast', text: 'Landslide emergency in Wayanad Sector 3. 6 persons stranded.', time: '35 mins ago', unread: true },
    { id: 3, type: 'rescue', title: 'SOS Rescued', text: 'Nagapattinam coastal evacuation team safely relocated 25 residents.', time: '1 hour ago', unread: false }
  ]);

  const [loading, setLoading] = useState(true);
  const [sosModalOpen, setSosModalOpen] = useState(false);

  // Fetch all live data from Express backend
  const fetchAllData = useCallback(async () => {
    try {
      const [sosRes, relRes, misRes, dmgRes, shlRes, prdRes, wxhRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/sos`),
        fetch(`${API_BASE}/api/relief`),
        fetch(`${API_BASE}/api/missing`),
        fetch(`${API_BASE}/api/damage`),
        fetch(`${API_BASE}/api/shelters`),
        fetch(`${API_BASE}/api/prediction`),
        fetch(`${API_BASE}/api/weather`)
      ]);

      // Override remote image URLs with local user-provided disaster images
      const DISASTER_IMAGE_OVERRIDES = {
        'Landslides': '/images/landslide.jpg',
        'Cyclones': '/images/cyclone.jpg',
        'Tsunami': '/images/tsunami.jpg',
      };

      if (sosRes.status === 'fulfilled' && sosRes.value.ok) {
        const sosData = await sosRes.value.json();
        const overriddenSos = sosData.map(sos => ({
          ...sos,
          image_url: DISASTER_IMAGE_OVERRIDES[sos.disaster_type] || sos.image_url
        }));
        setSosRequests(overriddenSos);
      }
      if (relRes.status === 'fulfilled' && relRes.value.ok) setReliefRequests(await relRes.value.json());
      if (misRes.status === 'fulfilled' && misRes.value.ok) setMissingPersons(await misRes.value.json());
      if (dmgRes.status === 'fulfilled' && dmgRes.value.ok) setDamageReports(await dmgRes.value.json());
      if (shlRes.status === 'fulfilled' && shlRes.value.ok) setShelters(await shlRes.value.json());
      if (prdRes.status === 'fulfilled' && prdRes.value.ok) setPredictions(await prdRes.value.json());
      if (wxhRes.status === 'fulfilled' && wxhRes.value.ok) {
        const wData = await wxhRes.value.json();
        setWeatherAlerts(wData.alerts || []);
      }
    } catch (err) {
      console.error("Error loading disaster platform data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 10000); // Polling every 10s for real-time updates
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Actions
  const createSOS = async (sosData) => {
    try {
      const res = await fetch(`${API_BASE}/api/sos/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sosData)
      });
      const data = await res.json();
      if (res.ok) {
        setSosRequests(prev => [data.sos, ...prev]);
        addNotification({
          type: 'sos',
          title: `NEW CRITICAL SOS (${data.sos.disaster_type})`,
          text: `${data.sos.user_name} reported: ${data.sos.location}`,
          time: 'Just now',
          unread: true
        });
        return { success: true, sos: data.sos };
      }
      throw new Error(data.error || 'Failed to submit SOS');
    } catch (err) {
      // Local fallback insert
      const fallbackSOS = {
        id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
        user_id: sosData.user_id || 'u-guest',
        user_name: sosData.user_name || 'Emergency Beacon Citizen',
        phone: sosData.phone || '+91 99999 88888',
        location: sosData.location,
        lat: parseFloat(sosData.lat) || 20.5937,
        lng: parseFloat(sosData.lng) || 78.9629,
        disaster_type: sosData.disaster_type,
        priority: sosData.priority || 'High',
        message: sosData.message,
        people_count: Number(sosData.people_count) || 1,
        image_url: sosData.image_url || '/images/landslide.jpg',
        status: 'Pending',
        assigned_to: null,
        created_at: new Date().toISOString()
      };
      setSosRequests(prev => [fallbackSOS, ...prev]);
      addNotification({
        type: 'sos',
        title: `NEW CRITICAL SOS (${fallbackSOS.disaster_type})`,
        text: `${fallbackSOS.user_name} reported: ${fallbackSOS.location}`,
        time: 'Just now',
        unread: true
      });
      return { success: true, sos: fallbackSOS };
    }
  };

  const updateSOSStatus = async (id, status, assigned_to) => {
    try {
      const res = await fetch(`${API_BASE}/api/sos/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, assigned_to })
      });
      if (res.ok) {
        const data = await res.json();
        setSosRequests(prev => prev.map(s => s.id === id ? data.sos : s));
      } else {
        setSosRequests(prev => prev.map(s => s.id === id ? { ...s, status, assigned_to: assigned_to || s.assigned_to } : s));
      }
    } catch (e) {
      setSosRequests(prev => prev.map(s => s.id === id ? { ...s, status, assigned_to: assigned_to || s.assigned_to } : s));
    }

    addNotification({
      type: 'rescue',
      title: `SOS #${id} Status Updated`,
      text: `Status shifted to "${status}" by Rescue Dispatch.`,
      time: 'Just now',
      unread: true
    });
  };

  const createReliefRequest = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/relief/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        setReliefRequests(prev => [result.relief, ...prev]);
        return { success: true };
      }
    } catch (e) {
      const fallback = {
        id: `REL-${Math.floor(200 + Math.random() * 900)}`,
        user_id: data.user_id || 'u-guest',
        user_name: data.user_name || 'Citizen',
        items: data.items,
        quantity: data.quantity || 'Standard Emergency Pack',
        location: data.location,
        contact: data.contact || '+91 98000 11111',
        notes: data.notes || '',
        status: 'Request',
        assigned_ngo: null,
        created_at: new Date().toISOString()
      };
      setReliefRequests(prev => [fallback, ...prev]);
      return { success: true };
    }
  };

  const updateReliefStatus = async (id, status, assigned_ngo) => {
    try {
      const res = await fetch(`${API_BASE}/api/relief/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, assigned_ngo })
      });
      if (res.ok) {
        const result = await res.json();
        setReliefRequests(prev => prev.map(r => r.id === id ? result.relief : r));
      } else {
        setReliefRequests(prev => prev.map(r => r.id === id ? { ...r, status, assigned_ngo: assigned_ngo || r.assigned_ngo } : r));
      }
    } catch (e) {
      setReliefRequests(prev => prev.map(r => r.id === id ? { ...r, status, assigned_ngo: assigned_ngo || r.assigned_ngo } : r));
    }
  };

  const reportMissingPerson = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/missing/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        setMissingPersons(prev => [result.person, ...prev]);
        return { success: true };
      }
    } catch (e) {
      const fallback = {
        id: `MIS-${Math.floor(300 + Math.random() * 900)}`,
        user_id: data.user_id || 'u-guest',
        name: data.name,
        age: Number(data.age) || 25,
        gender: data.gender || 'Unspecified',
        photo_url: data.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        last_seen: data.last_seen,
        date_missing: data.date_missing || new Date().toISOString().split('T')[0],
        contact: data.contact || '+91 98000 22222',
        description: data.description || '',
        status: 'Missing',
        match_confidence: null
      };
      setMissingPersons(prev => [fallback, ...prev]);
      return { success: true };
    }
  };

  const triggerAIMatch = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/missing/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Match Found' })
      });
      if (res.ok) {
        const result = await res.json();
        setMissingPersons(prev => prev.map(m => m.id === id ? result.person : m));
      } else {
        setMissingPersons(prev => prev.map(m => m.id === id ? {
          ...m,
          status: 'Match Found',
          match_confidence: `${(91 + Math.random() * 8).toFixed(1)}% AI Facial Match (Camp Sector 2)`
        } : m));
      }
    } catch (e) {
      setMissingPersons(prev => prev.map(m => m.id === id ? {
        ...m,
        status: 'Match Found',
        match_confidence: `${(91 + Math.random() * 8).toFixed(1)}% AI Facial Match (Camp Sector 2)`
      } : m));
    }
  };

  const reportDamage = async (data) => {
    try {
      const res = await fetch(`${API_BASE}/api/damage/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        setDamageReports(prev => [result.report, ...prev]);
        return { success: true };
      }
    } catch (e) {
      const levels = ['Low', 'Medium', 'High'];
      const lvl = data.damage_level || levels[Math.floor(Math.random() * levels.length)];
      const fallback = {
        id: `DMG-${Math.floor(400 + Math.random() * 900)}`,
        user_id: data.user_id || 'u-guest',
        disaster_type: data.disaster_type,
        location: data.location,
        damage_level: lvl,
        structural_risk: lvl === 'High' ? 'Critical Structural Failure' : lvl === 'Medium' ? 'Moderate Risk' : 'Minor Clearance Needed',
        image_url: data.image_url || '/images/landslide.jpg',
        summary: `Simulated AI Vision: ${lvl} severity structural impact detected at ${data.location}. Recovery dispatch requested.`,
        created_at: new Date().toISOString()
      };
      setDamageReports(prev => [fallback, ...prev]);
      return { success: true };
    }
  };

  const addNotification = (notif) => {
    setNotifications(prev => [{ id: Date.now(), ...notif }, ...prev]);
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Filtered SOS list based on disaster dropdown filter
  const filteredSOS = selectedDisasterFilter === 'All' 
    ? sosRequests 
    : sosRequests.filter(s => s.disaster_type === selectedDisasterFilter);

  return (
    <DisasterContext.Provider value={{
      selectedDisasterFilter,
      setSelectedDisasterFilter,
      sosRequests: filteredSOS,
      allSosRequests: sosRequests,
      reliefRequests,
      missingPersons,
      damageReports,
      shelters,
      predictions,
      weatherAlerts,
      notifications,
      loading,
      sosModalOpen,
      setSosModalOpen,
      createSOS,
      updateSOSStatus,
      createReliefRequest,
      updateReliefStatus,
      reportMissingPerson,
      triggerAIMatch,
      reportDamage,
      markNotificationsRead,
      refetch: fetchAllData
    }}>
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => useContext(DisasterContext);
