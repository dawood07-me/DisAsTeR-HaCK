import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert, LogIn, UserPlus, Shield, UserCheck, HeartHandshake,
  Lock, Mail, Phone, MapPin, Rocket, ChevronRight, ChevronLeft,
  Building2, FileCheck, Upload, Loader2, CheckCircle2, Sparkles,
  User, Fingerprint, ScanFace, ShieldCheck, X
} from 'lucide-react';

// ─── STEP CONSTANTS ─────────────────────────────────────
const STEP_ENTRY = 'entry';
const STEP_ROLE = 'role';
const STEP_FORM = 'form';
const STEP_DEMO_SELECT = 'demo_select';
const STEP_DEMO_VERIFY = 'demo_verify';

// ─── ROLE CONFIGS ───────────────────────────────────────
const ROLES = [
  {
    id: 'Citizen',
    label: 'Citizen',
    icon: UserPlus,
    desc: 'Report SOS, Missing Persons & Infrastructure Damage',
    gradient: 'from-blue-600 to-cyan-600',
    border: 'border-blue-500/50',
    bg: 'bg-blue-950/30',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/20'
  },
  {
    id: 'Rescue Team',
    label: 'Rescue Team',
    icon: Shield,
    desc: 'NDRF/SDRF Evacuation & Rescue Operations',
    gradient: 'from-red-600 to-orange-600',
    border: 'border-red-500/50',
    bg: 'bg-red-950/30',
    text: 'text-red-300',
    glow: 'shadow-red-500/20'
  },
  {
    id: 'Government Admin',
    label: 'Government Admin',
    icon: ShieldAlert,
    desc: 'NDMA Command Control & Disaster Governance',
    gradient: 'from-amber-600 to-yellow-600',
    border: 'border-amber-500/50',
    bg: 'bg-amber-950/30',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/20'
  },
  {
    id: 'NGO / Volunteer',
    label: 'NGO / Volunteer',
    icon: HeartHandshake,
    desc: 'Relief Supply & Humanitarian Aid Delivery',
    gradient: 'from-emerald-600 to-teal-600',
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-950/30',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/20'
  }
];

// ─── DEMO ACCOUNTS ──────────────────────────────────────
const DEMO_ACCOUNTS = [
  { role: 'Citizen', email: 'citizen@demo.com', password: '123456', label: 'Login as Citizen', emoji: '👤', color: 'from-blue-600 to-cyan-500' },
  { role: 'Rescue Team', email: 'rescue@demo.com', password: '123456', label: 'Login as Rescue Team', emoji: '🚨', color: 'from-red-600 to-orange-500' },
  { role: 'Government Admin', email: 'admin@gov.in', password: '123456', label: 'Login as Govt Admin', emoji: '🏛️', color: 'from-amber-600 to-yellow-500' },
  { role: 'NGO / Volunteer', email: 'ngo@demo.com', password: '123456', label: 'Login as NGO', emoji: '💚', color: 'from-emerald-600 to-teal-500' }
];

// ─── SIMULATED VERIFICATION STEPS ───────────────────────
const VERIFY_STEPS = [
  { icon: Fingerprint, text: 'Checking credentials...', duration: 1200 },
  { icon: ScanFace, text: 'Verifying identity & biometrics...', duration: 1500 },
  { icon: FileCheck, text: 'Validating official documents...', duration: 1400 },
  { icon: ShieldCheck, text: 'Approval in progress...', duration: 1000 },
  { icon: CheckCircle2, text: 'Verification Successful ✅', duration: 800 }
];

export const AuthPage = () => {
  const { login, signup, loading } = useAuth();
  const [step, setStep] = useState(STEP_ENTRY);
  const [fadeIn, setFadeIn] = useState(true);

  // Role selection
  const [selectedRole, setSelectedRole] = useState(null);

  // Login/Register mode
  const [isLogin, setIsLogin] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [idProof, setIdProof] = useState(null);
  const [error, setError] = useState('');

  // Demo mode
  const [demoAccount, setDemoAccount] = useState(null);
  const [verifyStepIndex, setVerifyStepIndex] = useState(0);
  const [verifyComplete, setVerifyComplete] = useState(false);

  // Animation transition
  const changeStep = (newStep) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(newStep);
      setError('');
      setFadeIn(true);
    }, 200);
  };

  // ─── DEMO MODE VERIFY ANIMATION ─────────────────────
  useEffect(() => {
    if (step !== STEP_DEMO_VERIFY || !demoAccount) return;

    setVerifyStepIndex(0);
    setVerifyComplete(false);

    let currentIndex = 0;

    const runStep = () => {
      if (currentIndex >= VERIFY_STEPS.length) {
        setVerifyComplete(true);
        // Auto-login after final step
        setTimeout(async () => {
          await login(demoAccount.email, demoAccount.password);
        }, 600);
        return;
      }

      setVerifyStepIndex(currentIndex);
      currentIndex++;
      setTimeout(runStep, VERIFY_STEPS[currentIndex - 1].duration);
    };

    const startDelay = setTimeout(runStep, 400);
    return () => clearTimeout(startDelay);
  }, [step, demoAccount]);

  // ─── FORM SUBMISSION (Real Login/Register) ───────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const res = await login(email, password);
      if (!res.success) setError(res.message || 'Invalid credentials');
    } else {
      if (!name) return setError('Name is required');
      if (!email) return setError('Email is required');
      if (!password || password.length < 6) return setError('Password must be at least 6 characters');

      const signupData = {
        name, email, password,
        role: selectedRole,
        phone, location,
        organization: organization || undefined,
        department: department || undefined,
        id_proof: idProof ? 'uploaded_id_proof_document.pdf' : undefined
      };
      const res = await signup(signupData);
      if (!res.success) setError(res.message || 'Registration failed');
    }
  };

  // ─── ID Proof file handler ───────────────────────────
  const handleIdProofChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setIdProof(file);
  };

  // ─── RENDER FUNCTIONS ────────────────────────────────

  // ═══ STEP 1: ENTRY PAGE ═══════════════════════════════
  const renderEntryPage = () => (
    <div className="space-y-8">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-2xl shadow-cyan-500/30 ring-2 ring-cyan-400/30">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black tracking-wider text-white">
          Raksh<span className="text-cyan-400">AI</span>
        </h1>
        <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
          AI-Powered Natural Disaster Management & Rescue Platform for India
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Real Login/Register */}
        <button
          onClick={() => changeStep(STEP_ROLE)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-3 border border-cyan-400/30 transition-all active:scale-[0.98] group"
        >
          <LogIn className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          LOGIN / REGISTER
          <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Demo Mode */}
        <button
          onClick={() => changeStep(STEP_DEMO_SELECT)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-purple-950/50 flex items-center justify-center gap-3 border border-purple-400/30 transition-all active:scale-[0.98] group"
        >
          <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          🚀 TRY DEMO MODE (Quick Access)
          <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] text-slate-600 font-medium">
        Built for India's National Disaster Response Framework • Hackathon 2026
      </p>
    </div>
  );

  // ═══ STEP 2: ROLE SELECTION ═══════════════════════════
  const renderRoleSelection = () => (
    <div className="space-y-6">
      <button onClick={() => changeStep(STEP_ENTRY)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-bold transition">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white">Who are you?</h2>
        <p className="text-xs text-slate-400 font-medium">Select your role to continue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ROLES.map(role => {
          const Icon = role.icon;
          const selected = selectedRole === role.id;
          return (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRole(role.id);
                setError('');
              }}
              className={`p-4 rounded-2xl border text-left transition-all group ${
                selected
                  ? `${role.border} ${role.bg} ring-2 ring-cyan-400/60 shadow-lg ${role.glow}`
                  : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${role.gradient} text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                {selected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
              </div>
              <span className="font-extrabold text-sm text-white block">{role.label}</span>
              <span className="text-[11px] text-slate-400 mt-1 block leading-relaxed">{role.desc}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          if (!selectedRole) return setError('Please select a role first');
          changeStep(STEP_FORM);
        }}
        disabled={!selectedRole}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-2 border border-cyan-400/30 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        CONTINUE <ChevronRight className="w-4 h-4" />
      </button>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium text-center">
          ⚠️ {error}
        </div>
      )}
    </div>
  );

  // ═══ STEP 3: LOGIN / REGISTER FORM ════════════════════
  const renderForm = () => {
    const roleConfig = ROLES.find(r => r.id === selectedRole) || ROLES[0];

    return (
      <div className="space-y-5">
        <button onClick={() => changeStep(STEP_ROLE)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-bold transition">
          <ChevronLeft className="w-4 h-4" /> Change Role
        </button>

        {/* Current Role Badge */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${roleConfig.bg} ${roleConfig.border} border`}>
          <roleConfig.icon className={`w-4 h-4 ${roleConfig.text}`} />
          <span className={`text-xs font-extrabold ${roleConfig.text}`}>{roleConfig.label}</span>
        </div>

        {/* Auth Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`py-2.5 text-xs font-bold rounded-lg transition ${
              isLogin ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            LOGIN
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`py-2.5 text-xs font-bold rounded-lg transition ${
              !isLogin ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name (register only) */}
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={selectedRole === 'Government Admin' ? 'officer@ndma.gov.in' : 'your@email.com'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
            {!isLogin && selectedRole === 'Government Admin' && (
              <p className="text-[10px] text-amber-400/80 mt-1 font-medium">
                ⚡ Emails ending with @gov.in get instant approval
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Role-specific onboarding fields (Register only) */}
          {!isLogin && (
            <>
              {/* Phone & Location for all roles */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="City, State"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Rescue Team: Organization + ID Proof */}
              {selectedRole === 'Rescue Team' && (
                <div className="space-y-3 p-3 rounded-xl bg-red-950/20 border border-red-900/40">
                  <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Rescue Team Verification</p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Organization Name</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        placeholder="e.g. NDRF Battalion 4"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Upload ID Proof Document</label>
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-cyan-500 transition">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400">{idProof ? idProof.name : 'Choose file...'}</span>
                      <input type="file" className="hidden" onChange={handleIdProofChange} accept="image/*,.pdf" />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500">⏳ Your account will be verified by a Government Admin</p>
                </div>
              )}

              {/* Government Admin: Department + ID Proof */}
              {selectedRole === 'Government Admin' && (
                <div className="space-y-3 p-3 rounded-xl bg-amber-950/20 border border-amber-900/40">
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Government Admin Verification</p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department Name</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="e.g. NDMA, Ministry of Home Affairs"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Upload Official ID Proof</label>
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-cyan-500 transition">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-xs text-slate-400">{idProof ? idProof.name : 'Choose file...'}</span>
                      <input type="file" className="hidden" onChange={handleIdProofChange} accept="image/*,.pdf" />
                    </label>
                  </div>
                </div>
              )}

              {/* NGO: Organization (optional) */}
              {selectedRole === 'NGO / Volunteer' && (
                <div className="space-y-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">NGO / Volunteer Details</p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Organization Name (Optional)</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        placeholder="e.g. Seva India Foundation"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-2 border border-cyan-400/30 transition-all active:scale-[0.98] disabled:opacity-50 mt-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> AUTHENTICATING...
              </>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" /> LOGIN
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> CREATE ACCOUNT
              </>
            )}
          </button>
        </form>
      </div>
    );
  };

  // ═══ DEMO SELECT SCREEN ═══════════════════════════════
  const renderDemoSelect = () => (
    <div className="space-y-6">
      <button onClick={() => changeStep(STEP_ENTRY)} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 font-bold transition">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/20">
          <Rocket className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white">🚀 Demo Mode</h2>
        <p className="text-xs text-slate-400 font-medium">Quick access with pre-verified accounts</p>
      </div>

      <div className="space-y-2.5">
        {DEMO_ACCOUNTS.map(account => (
          <button
            key={account.role}
            onClick={() => {
              setDemoAccount(account);
              changeStep(STEP_DEMO_VERIFY);
            }}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${account.color} hover:brightness-110 text-white font-extrabold text-sm shadow-lg transition-all active:scale-[0.98] border border-white/10 group`}
          >
            <span className="text-2xl">{account.emoji}</span>
            <div className="text-left flex-1">
              <span className="block text-sm font-extrabold">{account.label}</span>
              <span className="block text-[10px] font-medium opacity-80">{account.email}</span>
            </div>
            <ChevronRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}
      </div>

      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-center">
        <p className="text-[10px] text-purple-300 font-medium">
          🔐 All demo accounts are pre-verified with <span className="font-bold">password: 123456</span>
        </p>
      </div>
    </div>
  );

  // ═══ DEMO VERIFY ANIMATION ════════════════════════════
  const renderDemoVerify = () => (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className={`inline-flex p-4 rounded-3xl ${verifyComplete ? 'bg-gradient-to-tr from-emerald-600 to-green-600' : 'bg-gradient-to-tr from-purple-600 to-blue-600'} text-white shadow-2xl transition-all duration-500`}>
          {verifyComplete ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <Loader2 className="w-10 h-10 animate-spin" />
          )}
        </div>
        <h2 className="text-xl font-black text-white">
          {verifyComplete ? 'Access Granted!' : 'Verifying Identity...'}
        </h2>
        {demoAccount && (
          <p className="text-xs text-slate-400 font-medium">
            {demoAccount.emoji} {demoAccount.role} • {demoAccount.email}
          </p>
        )}
      </div>

      {/* Verification Steps */}
      <div className="space-y-2">
        {VERIFY_STEPS.map((vs, index) => {
          const StepIcon = vs.icon;
          const isActive = index === verifyStepIndex && !verifyComplete;
          const isComplete = index < verifyStepIndex || verifyComplete;
          const isPending = index > verifyStepIndex && !verifyComplete;

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${
                isComplete
                  ? 'bg-emerald-950/30 border-emerald-800/60'
                  : isActive
                    ? 'bg-blue-950/40 border-blue-700/60 shadow-md shadow-blue-900/30'
                    : 'bg-slate-900/40 border-slate-800/40 opacity-40'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                isComplete ? 'bg-emerald-900/60 text-emerald-400' : isActive ? 'bg-blue-900/60 text-blue-400' : 'bg-slate-800 text-slate-500'
              }`}>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-xs font-bold ${
                isComplete ? 'text-emerald-300' : isActive ? 'text-blue-300' : 'text-slate-500'
              }`}>
                {vs.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${verifyComplete ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
          style={{ width: `${verifyComplete ? 100 : ((verifyStepIndex + 1) / VERIFY_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );

  // ═══ MAIN RENDER ══════════════════════════════════════
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/50 via-slate-950 to-slate-950">
      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-500/8 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500/8 blur-[100px]" />
        {step === STEP_DEMO_VERIFY && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px] animate-pulse" />
        )}
      </div>

      <div className={`w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {/* Inner glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {step === STEP_ENTRY && renderEntryPage()}
        {step === STEP_ROLE && renderRoleSelection()}
        {step === STEP_FORM && renderForm()}
        {step === STEP_DEMO_SELECT && renderDemoSelect()}
        {step === STEP_DEMO_VERIFY && renderDemoVerify()}
      </div>
    </div>
  );
};
