import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisaster } from '../context/DisasterContext';
import { StatusBadge } from '../components/StatusBadge';
import { PackageCheck, HeartHandshake, MapPin, Plus, CheckCircle2, Clock, Truck, Shield } from 'lucide-react';

export const ReliefPage = () => {
  const { user } = useAuth();
  const { reliefRequests, createReliefRequest, updateReliefStatus } = useDisaster();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState(['Food', 'Water']);
  const [quantity, setQuantity] = useState('50 Emergency Packs');
  const [location, setLocation] = useState('Relief Camp #2, Silchar, Assam');
  const [contact, setContact] = useState('+91 98450 66778');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Food', 'Water', 'Medicines', 'Baby care', 'Essentials'];

  const toggleItem = (cat) => {
    if (selectedItems.includes(cat)) {
      setSelectedItems(selectedItems.filter(i => i !== cat));
    } else {
      setSelectedItems([...selectedItems, cat]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    await createReliefRequest({
      user_id: user?.id || 'u-cit-guest',
      user_name: user?.name || 'Relief Requester',
      items: selectedItems,
      quantity,
      location,
      contact,
      notes
    });

    setSubmitting(false);
    setShowRequestModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">MODULE 5: RELIEF SUPPLY DELIVERY & NGO GRID</h1>
              <p className="text-xs text-slate-400">
                End-to-End logistics tracking for Food Kits, Clean Water, Medicines, Baby Care & Essentials
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-lg border border-emerald-400/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> REQUEST RELIEF SUPPLIES
        </button>
      </div>

      {/* Pipeline Status Flow */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">RELIEF DELIVERY FLOW</div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400">
            1. REQUEST (Created)
          </div>
          <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/80 text-blue-400">
            2. ACCEPTED (NGO Assigned)
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400">
            3. DELIVERING (In Transit)
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400">
            4. DELIVERED (Fulfilled)
          </div>
        </div>
      </div>

      {/* Relief Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-400" /> New Relief Supply Request
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Select Supply Categories Needed</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => toggleItem(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedItems.includes(cat)
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Quantity Needed</label>
                <input
                  type="text"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50 Food Rations, 100 Water Cans"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Delivery Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Shelter name or village location"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Contact Person & Phone</label>
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Specific Notes / Special Urgency</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Infant formula needed, insulin cold storage required..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow"
                >
                  {submitting ? 'Submitting...' : 'Submit Relief Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Relief Requests Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reliefRequests.map(rel => (
          <div key={rel.id} className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs text-emerald-400">{rel.id}</span>
                <StatusBadge status={rel.status} />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {rel.items.map(item => (
                  <span key={item} className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-bold border border-emerald-800">
                    {item}
                  </span>
                ))}
              </div>

              <h3 className="font-extrabold text-sm text-white">{rel.quantity}</h3>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {rel.location}
              </p>

              {rel.notes && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 mt-2">
                  "{rel.notes}"
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between items-center">
                <span>Requested by: <b className="text-slate-200">{rel.user_name}</b></span>
                <span>📞 {rel.contact}</span>
              </div>

              {rel.assigned_ngo && (
                <div className="text-[11px] text-cyan-400 font-semibold bg-cyan-950/40 p-2 rounded-lg border border-cyan-900">
                  🤝 Managed by: {rel.assigned_ngo}
                </div>
              )}

              {/* NGO Controls */}
              <div className="flex gap-1.5 pt-1">
                {rel.status === 'Request' && (
                  <button
                    onClick={() => updateReliefStatus(rel.id, 'Accepted', user?.name || 'Seva Foundation NGO')}
                    className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold"
                  >
                    Accept Dispatch
                  </button>
                )}
                {rel.status === 'Accepted' && (
                  <button
                    onClick={() => updateReliefStatus(rel.id, 'Delivering', rel.assigned_ngo)}
                    className="w-full py-1.5 rounded-lg bg-cyan-600 text-white text-[11px] font-bold"
                  >
                    Set "Delivering"
                  </button>
                )}
                {rel.status === 'Delivering' && (
                  <button
                    onClick={() => updateReliefStatus(rel.id, 'Delivered', rel.assigned_ngo)}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                  >
                    Mark "Delivered"
                  </button>
                )}
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
