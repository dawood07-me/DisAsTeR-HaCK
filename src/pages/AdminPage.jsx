import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisaster } from '../context/DisasterContext';
import {
  ShieldCheck, AlertOctagon, Users, Home, Activity, Lock, Radio, Server,
  CheckCircle2, XCircle, Clock, UserCheck, UserX, Eye, Loader2,
  Building2, Mail, Phone, MapPin, FileCheck, Shield, HeartHandshake, UserPlus
} from 'lucide-react';

// ─── ROLE BADGE HELPER ──────────────────────────────────
const RoleBadge = ({ role }) => {
  const configs = {
    'Citizen': { color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800/60', icon: UserPlus },
    'Rescue Team': { color: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800/60', icon: Shield },
    'Government Admin': { color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60', icon: ShieldCheck },
    'NGO / Volunteer': { color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60', icon: HeartHandshake }
  };
  const config = configs[role] || configs['Citizen'];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-extrabold ${config.color}`}>
      <Icon className="w-3 h-3" /> {role}
    </span>
  );
};

// ─── STATUS BADGE ───────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === 'Approved') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 text-[10px] font-extrabold">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </span>
    );
  }
  if (status === 'Rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800/60 text-[10px] font-extrabold">
        <XCircle className="w-3 h-3" /> Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 text-[10px] font-extrabold">
      <Clock className="w-3 h-3" /> Pending
    </span>
  );
};

export const AdminPage = () => {
  const { user } = useAuth();
  const { allSosRequests, reliefRequests, shelters, missingPersons } = useDisaster();

  // Registered users state
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewingProof, setViewingProof] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const totalSOS = allSosRequests.length;
  const rescuedCount = allSosRequests.filter(s => s.status === 'Rescued').length;
  const rescueSuccessRate = totalSOS > 0 ? Math.round((rescuedCount / totalSOS) * 100) : 100;

  // Fetch registered users
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      if (res.ok) {
        const data = await res.json();
        setRegisteredUsers(data);
      }
    } catch (err) {
      // Fallback demo data
      setRegisteredUsers([
        { id: 'u-demo-cit', name: 'Citizen Demo User', email: 'citizen@demo.com', role: 'Citizen', verification_status: 'Approved', phone: '+91 98765 00001', location: 'Guwahati, Assam' },
        { id: 'u-demo-res', name: 'NDRF Rescue Demo Commander', email: 'rescue@demo.com', role: 'Rescue Team', verification_status: 'Approved', organization: 'NDRF Battalion 4', phone: '+91 91234 00002' },
        { id: 'u-demo-adm', name: 'NDMA Admin Director', email: 'admin@gov.in', role: 'Government Admin', verification_status: 'Approved', department: 'NDMA', phone: '+91 94444 00003' },
        { id: 'u-pending-1', name: 'Sgt. Ravi Kumar', email: 'ravi@rescue.org', role: 'Rescue Team', verification_status: 'Pending', organization: 'State DRF Unit 7', phone: '+91 99887 76655' },
      ]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Approve or Reject a user
  const handleVerify = async (userId, status) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`${API_BASE}/api/users/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, verification_status: status })
      });
      if (res.ok) {
        // Update local state
        setRegisteredUsers(prev =>
          prev.map(u => u.id === userId ? { ...u, verification_status: status } : u)
        );
      }
    } catch (err) {
      // Fallback: update local state anyway for demo
      setRegisteredUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, verification_status: status } : u)
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered users
  const filteredUsers = filterStatus === 'All'
    ? registeredUsers
    : registeredUsers.filter(u => u.verification_status === filterStatus);

  const pendingCount = registeredUsers.filter(u => u.verification_status === 'Pending').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-300 dark:border-amber-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">GOVERNMENT ADMIN COMMAND CONTROL PANEL</h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                National Disaster Management Authority (NDMA) System Governance & Oversight
              </p>
            </div>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
          <Server className="w-4 h-4" /> NDMA SERVER GRID: ONLINE
        </div>
      </div>

      {/* Admin Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 transition-colors duration-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">TOTAL SOS BEACONS LOGGED</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{totalSOS}</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {rescueSuccessRate}% Rescued
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 transition-colors duration-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">ACTIVE RELIEF REQUESTS</div>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400">{reliefRequests.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">NGO logistics dispatched</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 transition-colors duration-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">SHELTER NETWORK HUBS</div>
          <div className="text-3xl font-black text-cyan-700 dark:text-cyan-400">{shelters.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">24/7 Evacuation centers</div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 transition-colors duration-200">
          <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">REGISTERED USERS</div>
          <div className="text-3xl font-black text-purple-700 dark:text-purple-400">{registeredUsers.length}</div>
          <div className="text-xs text-amber-700 dark:text-amber-400 font-bold">
            {pendingCount > 0 ? `${pendingCount} Pending Approval` : 'All verified'}
          </div>
        </div>
      </div>

      {/* ═══ USER APPROVAL PANEL ═══════════════════════════ */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> User Verification & Approval Panel
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-600 text-white text-[10px] font-extrabold animate-pulse">
                {pendingCount} PENDING
              </span>
            )}
          </h3>

          {/* Filter Tabs */}
          <div className="flex gap-1 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
            {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition ${
                  filterStatus === status
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        {usersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-spin" />
            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No users found with status "{filterStatus}"
          </div>
        ) : (
          <div className="space-y-2">
            {filteredUsers.map(u => (
              <div key={u.id} className={`p-4 rounded-xl border transition-all ${
                u.verification_status === 'Pending'
                  ? 'bg-amber-50/60 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800/40'
                  : u.verification_status === 'Rejected'
                    ? 'bg-red-50/60 dark:bg-red-950/10 border-red-200 dark:border-red-800/30'
                    : 'bg-slate-100/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60'
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* User Info */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{u.name}</span>
                      <RoleBadge role={u.role} />
                      <StatusBadge status={u.verification_status} />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</span>
                      {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {u.phone}</span>}
                      {u.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {u.location}</span>}
                      {u.organization && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {u.organization}</span>}
                      {u.department && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {u.department}</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {u.id_proof && (
                      <button
                        onClick={() => setViewingProof(u)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-[10px] font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition"
                      >
                        <Eye className="w-3 h-3" /> View ID
                      </button>
                    )}

                    {u.verification_status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleVerify(u.id, 'Approved')}
                          disabled={actionLoading === u.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 transition disabled:opacity-50"
                        >
                          {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                          APPROVE
                        </button>
                        <button
                          onClick={() => handleVerify(u.id, 'Rejected')}
                          disabled={actionLoading === u.id}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-extrabold flex items-center gap-1 transition disabled:opacity-50"
                        >
                          {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserX className="w-3 h-3" />}
                          REJECT
                        </button>
                      </>
                    )}

                    {u.verification_status === 'Rejected' && (
                      <button
                        onClick={() => handleVerify(u.id, 'Approved')}
                        disabled={actionLoading === u.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold flex items-center gap-1 transition disabled:opacity-50"
                      >
                        {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3 h-3" />}
                        RE-APPROVE
                      </button>
                    )}

                    {u.verification_status === 'Approved' && (
                      <button
                        onClick={() => handleVerify(u.id, 'Rejected')}
                        disabled={actionLoading === u.id}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900 text-slate-700 dark:text-slate-400 hover:text-red-700 dark:hover:text-red-300 text-[10px] font-extrabold flex items-center gap-1 transition disabled:opacity-50 border border-slate-300 dark:border-slate-700"
                      >
                        <UserX className="w-3 h-3" /> REVOKE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ID Proof Viewer Modal */}
      {viewingProof && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewingProof(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-900 dark:text-white transition-colors duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> ID Proof Document
              </h3>
              <button onClick={() => setViewingProof(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p><span className="font-bold text-slate-900 dark:text-slate-300">Name:</span> {viewingProof.name}</p>
                <p><span className="font-bold text-slate-900 dark:text-slate-300">Role:</span> {viewingProof.role}</p>
                <p><span className="font-bold text-slate-900 dark:text-slate-300">Email:</span> {viewingProof.email}</p>
              </div>
              {viewingProof.id_proof && (
                <img
                  src={viewingProof.id_proof}
                  alt="ID Proof Document"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 object-cover max-h-64"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Broadcast Alert Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 transition-colors duration-200">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-red-500 animate-pulse" /> Emergency Cell Broadcast Override
        </h3>

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Issue nationwide or state-specific IMD Red Alert emergency warnings directly to mobile networks across affected hazard sectors.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow">
              BROADCAST COASTAL CYCLONE RED ALERT
            </button>
            <button className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow">
              BROADCAST RIVERINE FLOOD WARNING
            </button>
            <button className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs shadow">
              DISPATCH NDRF BATTALION REINFORCEMENTS
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
