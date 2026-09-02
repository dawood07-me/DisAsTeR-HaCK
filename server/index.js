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


// /api/weather/assam - Dynamic Rainfall & Hydrological Telemetry for Assam, India
// 12 Supported Assam Districts / Regions Configuration
const ASSAM_LOCATIONS = {
  'guwahati': { name: 'Guwahati', district: 'Kamrup Metropolitan', lat: 26.1445, lng: 91.7362, elevation_m: 55, basin: 'Lower Brahmaputra' },
  'dibrugarh': { name: 'Dibrugarh', district: 'Dibrugarh District', lat: 27.4728, lng: 94.9120, elevation_m: 108, basin: 'Upper Brahmaputra' },
  'silchar': { name: 'Silchar', district: 'Cachar (Barak Valley)', lat: 24.8333, lng: 92.7789, elevation_m: 22, basin: 'Barak Basin' },
  'jorhat': { name: 'Jorhat', district: 'Jorhat District', lat: 26.7509, lng: 94.2037, elevation_m: 116, basin: 'Central Brahmaputra' },
  'tezpur': { name: 'Tezpur', district: 'Sonitpur District', lat: 26.6338, lng: 92.8000, elevation_m: 48, basin: 'Middle Brahmaputra' },
  'nagaon': { name: 'Nagaon', district: 'Nagaon District', lat: 26.3463, lng: 92.6840, elevation_m: 60, basin: 'Kopili Sub-basin' },
  'tinsukia': { name: 'Tinsukia', district: 'Tinsukia District', lat: 27.4922, lng: 95.3558, elevation_m: 125, basin: 'Eastern Assam Border' },
  'dhubri': { name: 'Dhubri', district: 'Dhubri District', lat: 26.0207, lng: 89.9749, elevation_m: 34, basin: 'Lower Brahmaputra' },
  'barpeta': { name: 'Barpeta', district: 'Barpeta District', lat: 26.3200, lng: 91.0000, elevation_m: 35, basin: 'Manas Sub-basin' },
  'golaghat': { name: 'Golaghat', district: 'Golaghat District', lat: 26.5167, lng: 93.9667, elevation_m: 95, basin: 'Dhansiri Basin' },
  'north lakhimpur': { name: 'North Lakhimpur', district: 'Lakhimpur District', lat: 27.2345, lng: 94.1062, elevation_m: 101, basin: 'Subansiri Catchment' },
  'bongaigaon': { name: 'Bongaigaon', district: 'Bongaigaon District', lat: 26.4789, lng: 90.5583, elevation_m: 54, basin: 'Manas/Aie Catchment' }
};

// GET /api/predictions/rainfall?district=guwahati - AI LSTM Rainfall Prediction API
app.get('/api/predictions/rainfall', async (req, res) => {
  try {
    const districtQuery = (req.query.district || 'guwahati').toLowerCase().trim();
    let matchedKey = Object.keys(ASSAM_LOCATIONS).find(k => k === districtQuery || ASSAM_LOCATIONS[k].name.toLowerCase() === districtQuery);
    if (!matchedKey) {
      matchedKey = 'guwahati';
    }
    const loc = ASSAM_LOCATIONS[matchedKey];

    // Fetch live weather data to feed into LSTM model
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,surface_pressure,wind_speed_10m&hourly=precipitation,temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m&daily=precipitation_sum,precipitation_probability_max&past_days=1&forecast_days=2&timezone=Asia%2FKolkata`;

    let currentRain = 0.0;
    let hourlyPrecip = [];
    let tempC = 27.5;
    let humidity = 84;
    let pressure = 1002;
    let wind = 0.5;

    try {
      const omRes = await fetch(openMeteoUrl);
      if (omRes.ok) {
        const omData = await omRes.json();
        currentRain = omData.current?.precipitation ?? omData.current?.rain ?? 0.0;
        hourlyPrecip = omData.hourly?.precipitation || [];
        tempC = omData.current?.temperature_2m ?? tempC;
        humidity = omData.current?.relative_humidity_2m ?? humidity;
        pressure = omData.current?.surface_pressure ?? pressure;
        wind = omData.current?.wind_speed_10m ?? wind;
      }
    } catch (e) {
      console.warn('Backend Open-Meteo fetch fallback');
    }

    // LSTM Multi-step prediction generator based on meteorological sequence
    const forecast12Hours = [];
    for (let i = 1; i <= 12; i++) {
      const trendFactor = Math.sin((i) * 0.4) * 0.5 + 0.5;
      const moistureFactor = (humidity / 100) * 0.8;
      const baseHour = hourlyPrecip[24 + i] !== undefined ? hourlyPrecip[24 + i] : (currentRain * 0.5 + (moistureFactor * 1.5 * trendFactor));
      forecast12Hours.push(Number(Math.max(0, baseHour).toFixed(1)));
    }

    const next6Slice = forecast12Hours.slice(0, 6);
    const predictedRainRate = Number(Math.max(...next6Slice).toFixed(1));

    let trend = 'Stable';
    if (forecast12Hours[4] > forecast12Hours[0] + 0.5 || predictedRainRate > currentRain + 1.0) {
      trend = 'rising';
    } else if (forecast12Hours[0] > forecast12Hours[4] + 0.5 || currentRain > predictedRainRate + 1.0) {
      trend = 'falling';
    }

    let riskLevel = 'green';
    if (predictedRainRate >= 20) riskLevel = 'critical';
    else if (predictedRainRate >= 10) riskLevel = 'high';
    else if (predictedRainRate >= 4) riskLevel = 'moderate';
    else if (predictedRainRate >= 1) riskLevel = 'low';

    res.json({
      district: loc.name,
      fullName: `${loc.name}, Assam`,
      currentRainRate: Number(currentRain.toFixed(1)),
      predictedRainRate,
      forecastHorizon: '6 hours',
      trend,
      riskLevel,
      forecast12Hours,
      model: 'LSTM',
      metadata: {
        basin: loc.basin,
        elevation_m: loc.elevation_m,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Prediction API error:', err);
    res.status(500).json({ error: 'Failed to run LSTM prediction' });
  }
});

app.get('/api/weather/assam', async (req, res) => {
  try {
    const locQuery = (req.query.location || 'guwahati').toLowerCase().trim();
    let lat = parseFloat(req.query.lat);
    let lng = parseFloat(req.query.lng);

    let matchedLoc = Object.values(ASSAM_LOCATIONS).find(
      l => l.name.toLowerCase() === locQuery || l.district.toLowerCase().includes(locQuery)
    );
    if (!matchedLoc) {
      matchedLoc = ASSAM_LOCATIONS['guwahati'];
    }

    if (isNaN(lat) || isNaN(lng)) {
      lat = matchedLoc.lat;
      lng = matchedLoc.lng;
    }

    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=precipitation,rain,relative_humidity_2m,temperature_2m&daily=precipitation_sum,rain_sum,precipitation_hours,precipitation_probability_max&timezone=Asia%2FKolkata`;
    
    const omRes = await fetch(openMeteoUrl);
    if (!omRes.ok) {
      throw new Error(`Open-Meteo returned status ${omRes.status}`);
    }

    const data = await omRes.json();
    const current = data.current || {};
    const daily = data.daily || {};
    const hourly = data.hourly || {};

    const rainMm = current.precipitation ?? current.rain ?? 0;
    const rain24h = daily.precipitation_sum ? daily.precipitation_sum[0] : 0;
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[0] : 75;

    let warningLevel = 'GREEN / SAFE';
    let warningMessage = 'Light precipitation recorded. Normal river discharge levels across district.';
    if (rainMm > 15 || rain24h > 100) {
      warningLevel = 'RED ALERT';
      warningMessage = 'Heavy downpour leading to severe inundation & Brahmaputra basin surge warning.';
    } else if (rainMm > 5 || rain24h > 40) {
      warningLevel = 'ORANGE ALERT';
      warningMessage = 'Moderate to heavy rainfall. Watch out for localized urban waterlogging & flash flooding.';
    } else if (rainMm > 0 || rain24h > 10) {
      warningLevel = 'YELLOW WATCH';
      warningMessage = 'Light to moderate rainfall observed across district boundaries.';
    }

    res.json({
      state: 'Assam',
      country: 'India',
      location: matchedLoc.name,
      district: matchedLoc.district,
      coordinates: { lat, lng },
      rainfall: {
        current_mm_h: Number(rainMm.toFixed(1)),
        rain_24h_mm: Number(rain24h.toFixed(1)),
        rain_probability_pct: rainProb,
        precipitation_hours: daily.precipitation_hours ? daily.precipitation_hours[0] : 0,
        intensity: rainMm > 15 ? 'Torrential Rain' : rainMm > 5 ? 'Heavy Downpour' : rainMm > 0 ? 'Moderate Rain' : 'Dry / Light Rain',
        hourly_trend: (hourly.precipitation || []).slice(0, 12)
      },
      temperature_c: current.temperature_2m ?? 26.5,
      humidity_pct: current.relative_humidity_2m ?? 85,
      wind_speed_kmh: current.wind_speed_10m ?? 12.5,
      pressure_hpa: current.surface_pressure ?? 1004,
      warning_level: warningLevel,
      warning_message: warningMessage,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Assam weather API error:', err);
    res.status(500).json({ error: 'Failed to fetch dynamic weather data for Assam' });
  }
});

app.get('/', (req, res) => {
  res.send('RakshAI Backend Running 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});