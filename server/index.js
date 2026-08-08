import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'rakshai-disaster-emergency-key-2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

// /signup
app.post('/api/signup', (req, res) => {
  const { name, email, password, role, phone, location, organization, department, id_proof } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required' });
  }

  const existing = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  // Determine Verification Status according to role rules
  let verification_status = 'Approved';
  if (role === 'Rescue Team') {
    verification_status = 'Pending';
  } else if (role === 'Government Admin') {
    if (email.toLowerCase().endsWith('@gov.in')) {
      verification_status = 'Approved';
    } else {
      verification_status = 'Pending';
    }
  } else if (role === 'NGO / Volunteer') {
    verification_status = 'Approved';
  } else {
    verification_status = 'Approved';
  }

  const newUser = {
    id: `u-${Date.now()}`,
    name,
    email,
    password,
    role,
    phone: phone || '+91 98765 00000',
    location: location || 'India',
    organization: organization || null,
    department: department || null,
    id_proof: id_proof || null,
    verification_status,
    created_at: new Date().toISOString()
  };

  db.insert('users', newUser);

  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, verification_status: newUser.verification_status },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPass } = newUser;
  res.status(201).json({ token, user: userWithoutPass, message: 'Registration successful' });
});

// /login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, verification_status: user.verification_status },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password: _, ...userWithoutPass } = user;
  res.json({ token, user: userWithoutPass, message: 'Login successful' });
});

// /api/me
app.get('/api/me', authenticateToken, (req, res) => {
  const user = db.findOne('users', u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass });
});

// /api/users (Admin View All Registered Users)
app.get('/api/users', (req, res) => {
  const users = db.getCollection('users').map(u => {
    const { password: _, ...userWithoutPass } = u;
    return userWithoutPass;
  });
  res.json(users);
});

// /api/users/verify (Admin Approve/Reject User)
app.patch('/api/users/verify', (req, res) => {
  const { id, verification_status } = req.body;
  if (!id || !verification_status) {
    return res.status(400).json({ error: 'User ID and verification_status are required' });
  }

  const validStatuses = ['Pending', 'Approved', 'Rejected'];
  if (!validStatuses.includes(verification_status)) {
    return res.status(400).json({ error: 'Invalid verification status' });
  }

  const updated = db.update('users', id, { verification_status });
  if (!updated) return res.status(404).json({ error: 'User not found' });

  const { password: _, ...updatedWithoutPass } = updated;
  res.json({ user: updatedWithoutPass, message: `User status updated to ${verification_status}` });
});


// ----------------------------------------------------
// MODULE 3 & 4: SOS EMERGENCY APIS
// ----------------------------------------------------

// Get all SOS requests
app.get('/api/sos', (req, res) => {
  const { disaster_type, status, priority } = req.query;
  let requests = db.getCollection('sos_requests');

  if (disaster_type && disaster_type !== 'All') {
    requests = requests.filter(r => r.disaster_type === disaster_type);
  }
  if (status && status !== 'All') {
    requests = requests.filter(r => r.status === status);
  }
  if (priority && priority !== 'All') {
    requests = requests.filter(r => r.priority === priority);
  }

  res.json(requests);
});

// /sos/create
app.post('/api/sos/create', (req, res) => {
  const { user_id, user_name, phone, location, lat, lng, disaster_type, priority, message, people_count, image_url } = req.body;

  if (!location || !disaster_type || !message) {
    return res.status(400).json({ error: 'Location, disaster type, and message are required' });
  }

  const newSOS = {
    id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
    user_id: user_id || 'u-guest',
    user_name: user_name || 'Emergency Beacon Citizen',
    phone: phone || '+91 99999 88888',
    location,
    lat: parseFloat(lat) || 20.5937,
    lng: parseFloat(lng) || 78.9629,
    disaster_type,
    priority: priority || 'High',
    message,
    people_count: Number(people_count) || 1,
    image_url: image_url || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    status: 'Pending', // Pending -> Accepted -> On The Way -> Rescued
    assigned_to: null,
    created_at: new Date().toISOString()
  };

  db.insert('sos_requests', newSOS);
  res.status(201).json({ sos: newSOS, message: 'SOS emergency broadcast dispatched successfully!' });
});

// /sos/update
app.patch('/api/sos/update', (req, res) => {
  const { id, status, assigned_to } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: 'SOS ID and status are required' });
  }

  const validStatuses = ['Pending', 'Accepted', 'On The Way', 'Rescued'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of ${validStatuses.join(', ')}` });
  }

  const updated = db.update('sos_requests', id, { status, assigned_to: assigned_to || 'NDRF Rapid Action Team' });
  if (!updated) return res.status(404).json({ error: 'SOS request not found' });

  res.json({ sos: updated, message: `SOS #${id} status updated to ${status}` });
});


// ----------------------------------------------------
// MODULE 5: RELIEF SUPPLY DELIVERY APIS
// ----------------------------------------------------

app.get('/api/relief', (req, res) => {
  const requests = db.getCollection('relief_requests');
  res.json(requests);
});

// /relief/request
app.post('/api/relief/request', (req, res) => {
  const { user_id, user_name, items, quantity, location, contact, notes } = req.body;

  if (!items || !items.length || !location) {
    return res.status(400).json({ error: 'Supply items and location are required' });
  }

  const newRelief = {
    id: `REL-${Math.floor(200 + Math.random() * 900)}`,
    user_id: user_id || 'u-guest',
    user_name: user_name || 'Relief Applicant',
    items,
    quantity: quantity || 'Standard Emergency Pack',
    location,
    contact: contact || '+91 98000 11111',
    notes: notes || 'Essential flood/disaster relief supplies needed',
    status: 'Request', // Request -> Accepted -> Delivering -> Delivered
    assigned_ngo: null,
    created_at: new Date().toISOString()
  };

  db.insert('relief_requests', newRelief);
  res.status(201).json({ relief: newRelief, message: 'Relief supply request created successfully' });
});

// /relief/update (Status transition)
app.patch('/api/relief/update', (req, res) => {
  const { id, status, assigned_ngo } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: 'ID and status are required' });
  }

  const valid = ['Request', 'Accepted', 'Delivering', 'Delivered'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const updated = db.update('relief_requests', id, { status, assigned_ngo: assigned_ngo || 'Seva Volunteers India' });
  if (!updated) return res.status(404).json({ error: 'Relief request not found' });

  res.json({ relief: updated, message: `Relief Request ${id} updated to ${status}` });
});


// ----------------------------------------------------
// MODULE 6: MISSING PERSON MODULE APIS
// ----------------------------------------------------

app.get('/api/missing', (req, res) => {
  const persons = db.getCollection('missing_persons');
  res.json(persons);
});

// /missing/report
app.post('/api/missing/report', (req, res) => {
  const { user_id, name, age, gender, photo_url, last_seen, date_missing, contact, description } = req.body;

  if (!name || !last_seen) {
    return res.status(400).json({ error: 'Name and last seen location are required' });
  }

  const newMissing = {
    id: `MIS-${Math.floor(300 + Math.random() * 900)}`,
    user_id: user_id || 'u-guest',
    name,
    age: Number(age) || 25,
    gender: gender || 'Unspecified',
    photo_url: photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    last_seen,
    date_missing: date_missing || new Date().toISOString().split('T')[0],
    contact: contact || '+91 98000 22222',
    description: description || 'No description provided.',
    status: 'Missing',
    match_confidence: null
  };

  db.insert('missing_persons', newMissing);
  res.status(201).json({ person: newMissing, message: 'Missing person report registered' });
});

// /missing/update (Simulate AI Match trigger)
app.patch('/api/missing/update', (req, res) => {
  const { id, status, match_confidence } = req.body;
  const updated = db.update('missing_persons', id, {
    status: status || 'Match Found',
    match_confidence: match_confidence || `${(88 + Math.random() * 10).toFixed(1)}% AI Facial Match (Relief Camp #3)`
  });

  if (!updated) return res.status(404).json({ error: 'Missing person record not found' });
  res.json({ person: updated, message: 'AI match status updated successfully' });
});


// ----------------------------------------------------
// MODULE 7: DAMAGE REPORT MODULE APIS
// ----------------------------------------------------

app.get('/api/damage', (req, res) => {
  const reports = db.getCollection('damage_reports');
  res.json(reports);
});

// /damage/report
app.post('/api/damage/report', (req, res) => {
  const { user_id, disaster_type, location, image_url, damage_level, summary } = req.body;

  if (!location || !disaster_type) {
    return res.status(400).json({ error: 'Disaster type and location are required' });
  }

  // Simulated AI Vision damage assessment generator
  const levels = ['Low', 'Medium', 'High'];
  const calculatedLevel = damage_level || levels[Math.floor(Math.random() * levels.length)];

  const aiAnalysisSummaries = {
    High: "Simulated AI Vision: Critical structural shear detected. Foundation compromised with high landslide/flood risk. Barricade area immediately.",
    Medium: "Simulated AI Vision: Moderate structural damage. Roof elements fractured, road passage impaired. Secondary assessment required.",
    Low: "Simulated AI Vision: Minor non-structural damage. Surface debris and light water logging. Safe for low-velocity transit."
  };

  const newReport = {
    id: `DMG-${Math.floor(400 + Math.random() * 900)}`,
    user_id: user_id || 'u-guest',
    disaster_type,
    location,
    damage_level: calculatedLevel,
    structural_risk: calculatedLevel === 'High' ? 'Critical Hazard' : calculatedLevel === 'Medium' ? 'Moderate Risk' : 'Low Vulnerability',
    image_url: image_url || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    summary: summary || aiAnalysisSummaries[calculatedLevel],
    created_at: new Date().toISOString()
  };

  db.insert('damage_reports', newReport);
  res.status(201).json({ report: newReport, message: 'Damage report submitted and AI analyzed' });
});


// ----------------------------------------------------
// MODULE 8: SHELTER MANAGEMENT APIS
// ----------------------------------------------------

app.get('/api/shelters', (req, res) => {
  const shelters = db.getCollection('shelters');
  res.json(shelters);
});

app.post('/api/shelters', (req, res) => {
  const { name, district, state, lat, lng, capacity, current_occupancy, contact_person, phone, facilities } = req.body;
  if (!name || !capacity) {
    return res.status(400).json({ error: 'Shelter name and capacity required' });
  }

  const newShelter = {
    id: `SHL-${Math.floor(500 + Math.random() * 900)}`,
    name,
    district: district || 'Central District',
    state: state || 'India',
    lat: parseFloat(lat) || 20.5937,
    lng: parseFloat(lng) || 78.9629,
    capacity: Number(capacity),
    current_occupancy: Number(current_occupancy) || 0,
    contact_person: contact_person || 'Shelter Officer',
    phone: phone || '+91 90000 00000',
    facilities: facilities || ['Water', 'Food', 'Medical First Aid'],
    status: 'Active'
  };

  db.insert('shelters', newShelter);
  res.status(201).json({ shelter: newShelter, message: 'Shelter added successfully' });
});


// ----------------------------------------------------
// MODULE 1: PREDICTIONS API & MODULE 2: WEATHER API
// ----------------------------------------------------

// /prediction
app.get('/api/prediction', (req, res) => {
  const predictions = db.getCollection('predictions');
  res.json(predictions);
});

// /weather
app.get('/api/weather', (req, res) => {
  const alerts = db.getCollection('weather_alerts');
  res.json({
    summary: "IMD Severe Weather Watch (India Coastal & Hilly Belt)",
    updated_at: new Date().toISOString(),
    alerts
  });
});


// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'RakshAI Natural Disaster Backend', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🛡️ RakshAI Disaster Platform Backend running on http://localhost:${PORT}`);
});
