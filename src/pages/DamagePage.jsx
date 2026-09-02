import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisaster, ALLOWED_DISASTERS } from '../context/DisasterContext';
import { StatusBadge } from '../components/StatusBadge';
import { FileWarning, Sparkles, MapPin, Plus, Image as ImageIcon, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DamagePage = () => {
  const { user } = useAuth();
  const { damageReports, reportDamage } = useDisaster();

  const [showModal, setShowModal] = useState(false);
  const [disasterType, setDisasterType] = useState('Landslides');
  const [location, setLocation] = useState('Chamoli Highway KM 42, Uttarakhand');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80');
  const [damageLevel, setDamageLevel] = useState('High');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sampleImages = [
    { title: 'Tsunami Surge Wave', url: '/images/tsunami.jpg' },
    { title: 'Landslide Slope Failure', url: '/images/landslide.jpg' },
    { title: 'Cyclone Satellite View', url: '/images/cyclone.jpg' },
    { title: 'Flood River Inundation', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80' },
    { title: 'Forest Wildfire Flames', url: 'https://images.unsplash.com/photo-1579407364450-481fe10f0037?auto=format&fit=crop&w=600&q=80' },
    { title: 'Heavy Rainfall Torrent', url: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    await reportDamage({
      user_id: user?.id || 'u-cit-guest',
      disaster_type: disasterType,
      location,
      image_url: imageUrl,
      damage_level: damageLevel,
      summary
    });

    setSubmitting(false);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <FileWarning className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">MODULE 7: AI VISION DAMAGE ASSESSMENT</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Automated Structural Hazard Analysis & Infrastructure Loss Severity Quantification
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-lg border border-amber-400/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> UPLOAD DAMAGE PHOTO (AI SCAN)
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white transition-colors duration-200">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Upload Infrastructure Damage Evidence
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Disaster Category</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {ALLOWED_DISASTERS.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Location of Damaged Site</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Select Preset Evidence Photo URL</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {sampleImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className={`p-1 rounded-xl border text-left text-[10px] ${
                        imageUrl === img.url ? 'border-amber-500 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <img src={img.url} alt={img.title} className="w-full h-12 object-cover rounded-lg mb-1" />
                      <span className="truncate block">{img.title}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/damage-image.jpg"
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Assess Severity (or let AI evaluate)</label>
                <select
                  value={damageLevel}
                  onChange={(e) => setDamageLevel(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-amber-600 dark:text-amber-400"
                >
                  <option value="High" className="bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400">HIGH DAMAGE (Critical Foundation Loss)</option>
                  <option value="Medium" className="bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400">MEDIUM DAMAGE (Impaired Transport/Grid)</option>
                  <option value="Low" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">LOW DAMAGE (Debris / Minor Infiltration)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow"
                >
                  {submitting ? 'Running AI Vision Analysis...' : 'Submit & Analyze Damage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Damage Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {damageReports.map(dmg => (
          <div key={dmg.id} className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-amber-600 dark:text-amber-400">{dmg.id} • {dmg.disaster_type}</span>
              <StatusBadge status={dmg.damage_level} />
            </div>

            <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img src={dmg.image_url} alt={dmg.disaster_type} className="w-full h-full object-cover" />
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> {dmg.location}
              </h3>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-1">
                Structural Risk: {dmg.structural_risk}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> AI Vision Inspection Report:
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{dmg.summary}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
