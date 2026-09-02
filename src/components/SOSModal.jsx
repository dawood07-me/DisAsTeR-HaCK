import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisaster, ALLOWED_DISASTERS } from '../context/DisasterContext';
import { AlertOctagon, MapPin, X, Navigation, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SOSModal = () => {
  const { user } = useAuth();
  const { sosModalOpen, setSosModalOpen, createSOS } = useDisaster();

  const [disasterType, setDisasterType] = useState('Floods');
  const [location, setLocation] = useState('Guwahati Flood Sector 4, Assam');
  const [lat, setLat] = useState('26.1445');
  const [lng, setLng] = useState('91.7362');
  const [priority, setPriority] = useState('Critical');
  const [message, setMessage] = useState('');
  const [peopleCount, setPeopleCount] = useState(3);
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [locating, setLocating] = useState(false);

  if (!sosModalOpen) return null;

  const handleAutoLocate = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toFixed(4));
          setLng(pos.coords.longitude.toFixed(4));
          setLocation(`GPS Coordinates: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
          setLocating(false);
        },
        (err) => {
          // Fallback location preset
          setLocation('Wayanad High Altitude Emergency Zone, Kerala');
          setLat('11.6854');
          setLng('76.1320');
          setLocating(false);
        }
      );
    } else {
      setLocation('Bhubaneswar Coastal Command Zone, Odisha');
      setLat('20.2961');
      setLng('85.8245');
      setLocating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const sosPayload = {
      user_id: user?.id || 'u-cit-guest',
      user_name: user?.name || 'Emergency Beacon Citizen',
      phone: user?.phone || '+91 98765 43210',
      location,
      lat,
      lng,
      disaster_type: disasterType,
      priority,
      message: message || `Urgent evacuation required for ${peopleCount} stranded individuals due to ${disasterType}.`,
      people_count: Number(peopleCount),
      image_url: imageUrl || '/images/landslide.jpg'
    };

    const res = await createSOS(sosPayload);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setSosModalOpen(false);
      }, 2000);
    }
  };

  const disasterOptions = ALLOWED_DISASTERS.filter(d => d !== 'All');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-200">
        
        {/* Modal Top Emergency Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-white animate-bounce" />
            <div>
              <h3 className="font-extrabold text-base text-white tracking-wide">BROADCAST EMERGENCY SOS</h3>
              <p className="text-xs text-red-100 font-medium">Direct Satellite Link to NDRF & SDRF Command</p>
            </div>
          </div>
          <button
            onClick={() => setSosModalOpen(false)}
            className="p-1 rounded-lg bg-red-900/40 text-red-100 hover:bg-red-900/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/50 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400">SOS EMERGENCY BEACON ACTIVATED</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Your distress signal and GPS location have been logged. Rescue team units nearby are being dispatched to your coordinates!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Disaster Type Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Select Natural Disaster Type
              </label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              >
                {disasterOptions.map(d => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d}</option>
                ))}
              </select>
            </div>

            {/* GPS Location & Auto Fetch */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Location / Address
                </label>
                <button
                  type="button"
                  onClick={handleAutoLocate}
                  disabled={locating}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                  {locating ? 'Capturing GPS...' : 'Auto-Capture GPS'}
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-red-500 dark:text-red-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Street name, landmark, district..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 placeholder-slate-400 dark:placeholder-slate-500"
                />
              </div>
            </div>

            {/* Grid: Priority & People count */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Urgency Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 focus:outline-none"
                >
                  <option value="Critical" className="bg-white dark:bg-slate-900 text-red-600 dark:text-red-400">CRITICAL (Imminent Threat)</option>
                  <option value="High" className="bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400">HIGH (Trapped / Injured)</option>
                  <option value="Medium" className="bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400">MEDIUM (Water Rising)</option>
                  <option value="Low" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">LOW (Precautionary)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Stranded Persons
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Emergency Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Distress Message & Needs
              </label>
              <textarea
                rows="3"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe current situation (e.g. stranded on roof, elderly person needs medical assistance...)"
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Photo URL / Upload simulation */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Photo Evidence URL (Optional)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/disaster-photo.jpg"
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-xl shadow-red-900/50 flex items-center justify-center gap-2 border border-red-400/40 transition active:scale-98"
            >
              <Send className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
              {submitting ? 'TRANSMITTING SATELLITE SOS...' : 'SEND SOS EMERGENCY BROADCAST NOW'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
