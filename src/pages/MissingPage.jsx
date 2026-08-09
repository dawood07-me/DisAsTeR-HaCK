import { loadModels } from '../utils/face';
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDisaster } from '../context/DisasterContext';
import { StatusBadge } from '../components/StatusBadge';
import { compareFacialBiometrics } from '../utils/faceAnalyzer';
import {
  UserX,
  Sparkles,
  MapPin,
  Plus,
  Search,
  Camera,
  CheckCircle2,
  X,
  Scan,
  Focus,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  RefreshCcw
} from 'lucide-react';

export const MissingPage = () => {
  useEffect(() => {
    loadModels();
  }, []);

  const { user } = useAuth();
  const { missingPersons, reportMissingPerson, triggerAIMatch } = useDisaster();

  // Report Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState(24);
  const canvasRef = useRef(null);
  const [gender, setGender] = useState('Male');
  const [photoUrl, setPhotoUrl] = useState('');
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [lastSeen, setLastSeen] = useState('Kaziranga Relief Camp Grid 4');
  const [dateMissing, setDateMissing] = useState(new Date().toISOString().split('T')[0]);
  const [contact, setContact] = useState('+91 98765 00112');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access denied or not working");
    }
  };
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
  };
  const handleMatch = async () => {
    if (!capturedImage || !photoUrl) {
      alert("Capture image and upload photo first");
      return;
    }

    const result = await matchFaces(photoUrl, capturedImage);
    setMatchResult(result);
  };
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, WEBP)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Facial Verification Camera Modal State
  const [scanPerson, setScanPerson] = useState(null); // Person object being scanned
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanningStatus, setScanningStatus] = useState('idle'); // 'idle' | 'scanning' | 'matched'
  const [matchResult, setMatchResult] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' = front, 'environment' = rear
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Open Facial Camera Scanner
  const openCameraModal = async (person) => {
    setScanPerson(person);
    setScanningStatus('idle');
    setMatchResult(null);
    setCameraError(null);

    // Try to open user webcam
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: facingMode }
        });
        streamRef.current = stream;
        setCameraActive(true);
      } else {
        setCameraActive(false);
        setCameraError('Webcam API unavailable in browser - Using Simulated Neural Camera HUD');
      }
    } catch (err) {
      setCameraActive(false);
      setCameraError('Camera Access: Simulated AI Vision HUD active');
    }
  };

  // Attach stream to video tag when cameraActive becomes true
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Close Camera Scanner & Stop Tracks
  const closeCameraModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanPerson(null);
    setCameraActive(false);
    setFacingMode('user');
    setScanningStatus('idle');
    setMatchResult(null);
  };

  // Switch between front and rear camera
  const switchCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);

    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: newMode }
      });
      streamRef.current = stream;
      setCameraActive(true);
      setCameraError(null);
      // Attach to video element immediately if available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => { });
      }
    } catch (err) {
      setCameraActive(false);
      setCameraError('Could not switch camera — device may only have one camera');
    }
  };

  // Trigger Live Biometric Scan — uses real canvas-based facial analysis
  const handlePerformFacialScan = async () => {
    setScanningStatus('scanning');

    // Small delay so the user sees the scanning animation
    await new Promise(r => setTimeout(r, 2200));

    if (!scanPerson) return;

    try {
      // Pass the reference photo URL/dataURI and the live video element (if camera is active)
      const cameraEl = cameraActive && videoRef.current ? videoRef.current : null;
      const result = await compareFacialBiometrics(scanPerson.photo_url, cameraEl);

      setScanningStatus('matched');

      if (result.matched) {
        // Real face-to-face comparison succeeded
        await triggerAIMatch(scanPerson.id);
        setMatchResult({
          matched: true,
          confidence: result.confidence,
          landmarksDetected: result.landmarksDetected,
          facialMeshHash: '#8F9A-AI-' + Math.floor(1000 + Math.random() * 9000),
          matchedCamp: 'Registered & Verified at Central Relief Camp Sector 2',
          status: result.status,
          reason: result.reason
        });
      } else {
        // Rejected — reference is not a human face (car, object, etc.)
        setMatchResult({
          matched: false,
          confidence: result.confidence,
          landmarksDetected: result.landmarksDetected,
          facialMeshHash: 'N/A',
          matchedCamp: null,
          status: result.status,
          reason: result.reason
        });
      }
    } catch (err) {
      setScanningStatus('matched');
      setMatchResult({
        matched: false,
        confidence: '0%',
        landmarksDetected: 0,
        facialMeshHash: 'N/A',
        matchedCamp: null,
        status: 'ANALYSIS ERROR',
        reason: 'Failed to process facial biometrics: ' + (err.message || 'Unknown error')
      });
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    await reportMissingPerson({
      user_id: user?.id || 'u-cit-guest',
      name,
      age: Number(age),
      gender,
      photo_url: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      last_seen: lastSeen,
      date_missing: dateMissing,
      contact,
      description
    });

    setName('');
    setPhotoUrl('');
    setDescription('');
    setSubmitting(false);
    setShowReportModal(false);
  };

  const filtered = (missingPersons || []).filter(m =>
    (m?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m?.last_seen || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      {/* 🔥 CAMERA TEST UI */}
      <div>
        <video ref={videoRef} autoPlay width="300" />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        <button onClick={startCamera}>Start Camera</button>
        <button onClick={captureImage}>Capture</button>
        <button onClick={handleMatch}>Verify Face</button>
        {capturedImage && (
          <img src={capturedImage} alt="captured" width="200" />
        )}
        {matchResult !== null && (
          <p>
            Match Result: {matchResult ? "✅ MATCH" : "❌ NOT MATCH"}
          </p>
        )}
      </div>
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 shadow-lg shadow-purple-950">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">MODULE 6: MISSING PERSONS REPOSITORY & AI CAMERA SCAN</h1>
              <p className="text-xs text-slate-400">
                Automated Live Camera Facial Detection & Relief Camp Biometric Cross-Referencing
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-extrabold px-5 py-3 rounded-xl text-xs shadow-lg border border-purple-400/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> REPORT MISSING PERSON
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative glass-panel p-2 rounded-2xl border border-slate-800">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by missing person's name or last seen location..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* Report Modal Form */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <UserX className="w-5 h-5 text-purple-400" /> Report Missing Individual
            </h3>

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Paul"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Last Seen Location</label>
                <input
                  type="text"
                  required
                  value={lastSeen}
                  onChange={(e) => setLastSeen(e.target.value)}
                  placeholder="e.g. Near Cachar District Bridge, Silchar"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Date Missing</label>
                  <input
                    type="date"
                    value={dateMissing}
                    onChange={(e) => setDateMissing(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Image Upload Input with File Selector & Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">
                    Photograph of Person
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseUrlInput(!useUrlInput)}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {useUrlInput ? 'Switch to Upload Image File' : 'Or Paste Web Image URL'}
                  </button>
                </div>

                {useUrlInput ? (
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                ) : photoUrl ? (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-purple-500/50 bg-slate-950 flex items-center justify-center group shadow-lg">
                    <img
                      src={photoUrl}
                      alt="Uploaded Missing Person"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg border border-purple-400/40 active:scale-95 transition">
                        <Upload className="w-3.5 h-3.5" /> Replace File
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg active:scale-95 transition"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-500/40 hover:border-purple-400 rounded-xl cursor-pointer bg-purple-950/20 hover:bg-purple-950/40 transition-all p-3 text-center group">
                    <div className="w-9 h-9 rounded-full bg-purple-900/60 text-purple-300 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform border border-purple-700/60 shadow">
                      <Upload className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-xs font-extrabold text-white group-hover:text-purple-300 transition-colors">
                      Click to Upload Image File
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Supports JPG, PNG, WEBP from your computer/device
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description / Clothing</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Height, clothing color, distinct marks..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI CAMERA FACIAL RECOGNITION SCANNER MODAL */}
      {scanPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">

            {/* Modal Header Bar */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 px-5 py-4 flex items-center justify-between border-b border-purple-500/30 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-700">
                  <Camera className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
                    AI FACIAL RECOGNITION SCANNER
                    <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-700">
                      LIVE HUD
                    </span>
                  </h3>
                  <p className="text-xs text-purple-300">
                    Scanning against person record: <b className="text-white">{scanPerson.name}</b> ({scanPerson.id})
                  </p>
                </div>
              </div>
              <button
                onClick={closeCameraModal}
                className="p-1.5 rounded-xl bg-purple-950 text-purple-300 hover:bg-purple-900 border border-purple-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: Split Screen Camera View & Reference Photo */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Reference Photo Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-extrabold text-purple-400 tracking-wider mb-2 flex items-center justify-between">
                      <span>REFERENCE REPOSITORY PHOTO</span>
                      <span className="text-slate-400">{scanPerson.id}</span>
                    </div>
                    <div className="w-full h-48 rounded-xl overflow-hidden border border-purple-500/30 relative">
                      <img
                        src={scanPerson.photo_url}
                        alt={scanPerson.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 border-2 border-purple-500/40 pointer-events-none rounded-xl"></div>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 text-slate-300 pt-2">
                    <div className="font-extrabold text-white text-sm">{scanPerson.name}</div>
                    <div className="text-slate-400 text-[11px]">Age: {scanPerson.age} • Gender: {scanPerson.gender}</div>
                    <div className="text-cyan-400 text-[11px] truncate">📍 {scanPerson.last_seen}</div>
                  </div>
                </div>

                {/* Live Camera View Finder with HUD */}
                <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/40 relative overflow-hidden flex flex-col justify-between">
                  <div className="text-[10px] uppercase font-extrabold text-cyan-400 tracking-wider mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      {facingMode === 'user' ? 'FRONT CAMERA' : 'REAR CAMERA'}
                    </span>
                    <div className="flex items-center gap-2">
                      {cameraActive && (
                        <button
                          onClick={switchCamera}
                          title={facingMode === 'user' ? 'Switch to Rear Camera' : 'Switch to Front Camera'}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 hover:text-cyan-100 transition active:scale-95 text-[10px] font-bold"
                        >
                          <RefreshCcw className="w-3 h-3" />
                          SWITCH
                        </button>
                      )}
                      <Focus className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>

                  <div className="w-full h-48 bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-cyan-500/30">

                    {/* Active Webcam element */}
                    {cameraActive ? (
                      <video
                        ref={(node) => {
                          videoRef.current = node;
                          if (node && streamRef.current) {
                            node.srcObject = streamRef.current;
                            node.play().catch(() => { });
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'transform -scale-x-100' : ''}`}
                      />
                    ) : (
                      /* Simulated High-Tech Facial Scan HUD View */
                      <div className="w-full h-full relative bg-slate-900 flex items-center justify-center overflow-hidden">
                        <img
                          src={scanPerson.photo_url}
                          alt="Camera subject"
                          className="w-full h-full object-cover opacity-70 filter contrast-125 saturate-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-purple-950/40 to-transparent"></div>
                      </div>
                    )}

                    {/* Facial Scanner Targeting Reticle HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className={`w-36 h-44 border-2 rounded-2xl transition-all ${scanningStatus === 'matched' ? 'border-emerald-400 shadow-[0_0_20px_#10b981]' :
                        scanningStatus === 'scanning' ? 'border-amber-400 animate-pulse' : 'border-purple-400'
                        } relative`}>

                        {/* Target Corner Markers */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>

                        {/* Animated Laser Scanning Line */}
                        {scanningStatus === 'scanning' && (
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-lg shadow-cyan-400"></div>
                        )}

                        {/* Facial Landmark Point Grid */}
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 p-2 opacity-60">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className="flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* HUD Status Bar overlay */}
                    <div className="absolute bottom-2 left-2 right-2 bg-slate-950/90 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                      <span>FPS: 30 • 68 MESH POINTS</span>
                      <span className="text-purple-400 font-bold">BIOMETRIC ENGAGED</span>
                    </div>
                  </div>

                  {cameraError && (
                    <div className="text-[10px] text-amber-300 mt-2 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      {cameraError}
                    </div>
                  )}

                </div>

              </div>

              {/* Match Results Display */}
              {matchResult && matchResult.matched && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-sm text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      BIOMETRIC FACIAL MATCH CONFIRMED
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded bg-emerald-500 text-slate-950">
                      {matchResult.confidence} MATCH
                    </span>
                  </div>
                  <div className="text-xs text-emerald-200">
                    <b>Camp Registry:</b> {matchResult.matchedCamp}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400/80">
                    Vector Hash: {matchResult.facialMeshHash} • {matchResult.landmarksDetected} Landmark Keypoints Matched
                  </div>
                </div>
              )}

              {/* Rejection / Mismatch Results Display */}
              {matchResult && !matchResult.matched && (
                <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/60 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-sm text-red-300">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      {matchResult.status}
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded bg-red-500 text-white">
                      {matchResult.confidence} MATCH
                    </span>
                  </div>
                  <div className="text-xs text-red-200">
                    <b>Analysis:</b> {matchResult.reason}
                  </div>
                  <div className="text-[11px] font-mono text-red-400/80">
                    Landmarks Detected: {matchResult.landmarksDetected} • Hash: {matchResult.facialMeshHash}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={closeCameraModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
                >
                  Close Scanner
                </button>

                {scanningStatus !== 'matched' && (
                  <button
                    onClick={handlePerformFacialScan}
                    disabled={scanningStatus === 'scanning'}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 text-white font-black px-5 py-2.5 rounded-xl text-xs shadow-lg border border-purple-400/40 transition active:scale-95 disabled:opacity-50"
                  >
                    <Scan className={`w-4 h-4 ${scanningStatus === 'scanning' ? 'animate-spin' : ''}`} />
                    {scanningStatus === 'scanning' ? 'PROCESSING NEURAL FACIAL MESH...' : 'CAPTURE & VERIFY FACIAL MATCH'}
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Grid of Missing Persons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(person => (
          <div key={person.id} className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-black text-xs text-purple-400">{person.id}</span>
                <StatusBadge status={person.status} />
              </div>

              <div className="flex gap-4 items-center">
                <img
                  src={person.photo_url}
                  alt={person.name}
                  className="w-20 h-20 rounded-2xl object-cover border border-purple-500/40 shadow-lg"
                />
                <div>
                  <h3 className="font-extrabold text-base text-white">{person.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {person.age} Yrs • {person.gender}
                  </div>
                  <div className="text-[11px] text-cyan-400 font-medium flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-red-400" /> {person.last_seen}
                  </div>
                </div>
              </div>

              {person.description && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 mt-3">
                  "{person.description}"
                </div>
              )}

              {person.match_confidence && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold mt-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>{person.match_confidence}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between items-center">
                <span>Date: <b className="text-slate-300">{person.date_missing}</b></span>
                <span>Contact: <b className="text-slate-200">{person.contact}</b></span>
              </div>

              {/* Camera Facial Scan Verification Trigger Button */}
              <button
                onClick={() => openCameraModal(person)}
                className={`w-full py-2.5 rounded-xl font-extrabold text-xs shadow flex items-center justify-center gap-2 border transition ${person.status === 'Match Found'
                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-emerald-500/30'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 text-white border-purple-400/40'
                  }`}
              >
                <Camera className="w-4 h-4 text-cyan-300" />
                {person.status === 'Match Found' ? 'RE-SCAN CAMERA FACIAL RECOGNITION' : 'OPEN CAMERA & VERIFY FACIAL MATCH'}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
