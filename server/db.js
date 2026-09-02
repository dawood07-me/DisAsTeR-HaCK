import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db_store.json');

// Pre-seeded Initial Data
const initialData = {
  users: [
    {
      id: "u-demo-cit",
      name: "Citizen Demo User",
      email: "citizen@demo.com",
      password: "123456",
      role: "Citizen",
      phone: "+91 98765 00001",
      location: "Guwahati, Assam",
      verification_status: "Approved"
    },
    {
      id: "u-demo-res",
      name: "NDRF Rescue Demo Commander",
      email: "rescue@demo.com",
      password: "123456",
      role: "Rescue Team",
      phone: "+91 91234 00002",
      location: "Bhubaneswar, Odisha",
      organization: "NDRF Battalion 4",
      id_proof: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80",
      verification_status: "Approved"
    },
    {
      id: "u-demo-adm",
      name: "NDMA Admin Director",
      email: "admin@gov.in",
      password: "123456",
      role: "Government Admin",
      phone: "+91 94444 00003",
      location: "New Delhi",
      department: "National Disaster Management Authority",
      id_proof: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80",
      verification_status: "Approved"
    },
    {
      id: "u-demo-ngo",
      name: "Seva India Volunteer Leader",
      email: "ngo@demo.com",
      password: "123456",
      role: "NGO / Volunteer",
      phone: "+91 97777 00004",
      location: "Kochi, Kerala",
      organization: "Seva India Relief Foundation",
      verification_status: "Approved"
    },
    {
      id: "u-cit-1",
      name: "Aarav Sharma",
      email: "citizen@rakshai.gov.in",
      password: "password123",
      role: "Citizen",
      phone: "+91 98765 43210",
      location: "Guwahati, Assam",
      verification_status: "Approved"
    },
    {
      id: "u-res-1",
      name: "Commander Vikram Singh (NDRF Battalion 4)",
      email: "rescue@rakshai.gov.in",
      password: "password123",
      role: "Rescue Team",
      phone: "+91 91234 56789",
      location: "Bhubaneswar, Odisha",
      organization: "NDRF Battalion 4",
      id_proof: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80",
      verification_status: "Approved"
    },
    {
      id: "u-adm-1",
      name: "Dr. Ananya Roy (NDMA Director)",
      email: "admin@rakshai.gov.in",
      password: "password123",
      role: "Government Admin",
      phone: "+91 94444 33333",
      location: "New Delhi",
      department: "Ministry of Home Affairs - NDMA",
      id_proof: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80",
      verification_status: "Approved"
    },
    {
      id: "u-ngo-1",
      name: "Seva India Foundation (NGO)",
      email: "volunteer@rakshai.gov.in",
      password: "password123",
      role: "NGO / Volunteer",
      phone: "+91 97777 88888",
      location: "Kochi, Kerala",
      organization: "Seva India Foundation",
      verification_status: "Approved"
    }
  ],
  sos_requests: [
    {
      id: "SOS-101",
      user_id: "u-cit-1",
      user_name: "Rajesh Kumar",
      phone: "+91 98450 11223",
      location: "Wayanad Valley Sector 3, Kerala",
      lat: 11.6854,
      lng: 76.1320,
      disaster_type: "Landslides",
      priority: "Critical",
      message: "Mudslide trapped 6 family members inside house. Road blocked, electricity down!",
      people_count: 6,
      image_url: "/images/landslide.jpg",
      status: "Pending",
      assigned_to: null,
      created_at: new Date(Date.now() - 35 * 60000).toISOString()
    },
    {
      id: "SOS-102",
      user_id: "u-cit-2",
      user_name: "Priya Das",
      phone: "+91 97654 32109",
      location: "Puri Coastal Zone, Odisha",
      lat: 19.8135,
      lng: 85.8312,
      disaster_type: "Cyclones",
      priority: "High",
      message: "Severe storm surge destroyed roof. 4 adults and 2 elderly stranded on top floor.",
      people_count: 6,
      image_url: "/images/cyclone.jpg",
      status: "Accepted",
      assigned_to: "NDRF Unit 7 Odisha",
      created_at: new Date(Date.now() - 90 * 60000).toISOString()
    },
    {
      id: "SOS-103",
      user_id: "u-cit-3",
      user_name: "Biren Gogoi",
      phone: "+91 94350 99887",
      location: "Kaziranga River Basin, Assam",
      lat: 26.5775,
      lng: 93.1711,
      disaster_type: "Floods",
      priority: "Critical",
      message: "Brahmaputra overflowed embankment. Water rising fast (5 feet depth). Need boat evacuation urgently.",
      people_count: 12,
      image_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
      status: "On The Way",
      assigned_to: "Assam State Disaster Response Force (SDRF Team B)",
      created_at: new Date(Date.now() - 150 * 60000).toISOString()
    },
    {
      id: "SOS-104",
      user_id: "u-cit-4",
      user_name: "Meenakshi Sundaram",
      phone: "+91 94431 22334",
      location: "Nagapattinam Coast, Tamil Nadu",
      lat: 10.7672,
      lng: 79.8449,
      disaster_type: "Tsunami",
      priority: "High",
      message: "High sea level anomaly alert. Fishermen colony evacuated to elevated hill, need medical team.",
      people_count: 25,
      image_url: "/images/tsunami.jpg",
      status: "Rescued",
      assigned_to: "Indian Coast Guard Emergency Unit",
      created_at: new Date(Date.now() - 300 * 60000).toISOString()
    }
  ],
  relief_requests: [
    {
      id: "REL-201",
      user_id: "u-cit-1",
      user_name: "Sunil Verma",
      items: ["Food", "Water", "Medicines"],
      quantity: "50 packages",
      location: "Relief Camp 4, Silchar, Assam",
      contact: "+91 99887 76655",
      notes: "Infants require milk powder & ORS packets urgently.",
      status: "Request",
      assigned_ngo: null,
      created_at: new Date(Date.now() - 40 * 60000).toISOString()
    },
    {
      id: "REL-202",
      user_id: "u-cit-2",
      user_name: "Kavitha Menon",
      items: ["Baby care", "Medicines", "Essentials"],
      quantity: "30 packages",
      location: "Alappuzha Community Hall, Kerala",
      contact: "+91 94471 88990",
      notes: "First aid kits, insulins, dry food items.",
      status: "Accepted",
      assigned_ngo: "Seva India Foundation",
      created_at: new Date(Date.now() - 110 * 60000).toISOString()
    },
    {
      id: "REL-203",
      user_id: "u-cit-3",
      user_name: "Amitabh Mohanty",
      items: ["Food", "Water"],
      quantity: "120 packages",
      location: "Balasore Primary School Shelter, Odisha",
      contact: "+91 93380 12345",
      notes: "Drinking water cans and packaged meals for 100 flood victims.",
      status: "Delivering",
      assigned_ngo: "Red Cross India Odisha Chapter",
      created_at: new Date(Date.now() - 200 * 60000).toISOString()
    }
  ],
  missing_persons: [
    {
      id: "MIS-301",
      user_id: "u-cit-1",
      name: "Ramesh Chandra Paul",
      age: 62,
      gender: "Male",
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      last_seen: "Near Cachar District Bridge, Silchar",
      date_missing: "2026-08-06",
      contact: "+91 98301 44556 (Son: Rahul)",
      description: "Wearing blue kurta and glasses. Speaks Bengali and Hindi. Was separated during flash flood evacuation.",
      status: "Missing",
      match_confidence: null
    },
    {
      id: "MIS-302",
      user_id: "u-cit-2",
      name: "Sneha Nair",
      age: 19,
      gender: "Female",
      photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      last_seen: "Meppadi Village Bus Stand, Wayanad",
      date_missing: "2026-08-07",
      contact: "+91 94470 33445 (Father: Mohan)",
      description: "Height 5'4\", yellow top, black jeans. Carrying red backpack.",
      status: "Match Found",
      match_confidence: "94.8% AI Match (Registered at Calicut Central Camp #2)"
    }
  ],
  damage_reports: [
    {
      id: "DMG-401",
      user_id: "u-cit-1",
      disaster_type: "Landslides",
      location: "Chamoli Highway KM 42, Uttarakhand",
      damage_level: "High",
      structural_risk: "Critical Road & Bridge Collapse",
      image_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80",
      summary: "Simulated AI Analysis: Severe slope failure destroyed 120m stretch of National Highway. Immediate heavy machinery clearing needed.",
      created_at: new Date(Date.now() - 120 * 60000).toISOString()
    },
    {
      id: "DMG-402",
      user_id: "u-cit-2",
      disaster_type: "Cyclones",
      location: "Paradeep Port Grid 5, Odisha",
      damage_level: "Medium",
      structural_risk: "Roof Collapse & Electrical Substation Damage",
      image_url: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=600&q=80",
      summary: "Simulated AI Analysis: High wind shear blew off tin roof structures of 4 warehouses. Power grid disrupted.",
      created_at: new Date(Date.now() - 240 * 60000).toISOString()
    }
  ],
  shelters: [
    {
      id: "SHL-501",
      name: "NDRF Multi-Purpose Cyclone Shelter Puri",
      district: "Puri",
      state: "Odisha",
      lat: 19.8135,
      lng: 85.8312,
      capacity: 800,
      current_occupancy: 540,
      contact_person: "Inspector S. Patnaik",
      phone: "+91 94370 11223",
      facilities: ["Food Counter", "24/7 Medical Clinic", "Water Purifiers", "Diesel Generator", "Helipad Access"],
      status: "Active"
    },
    {
      id: "SHL-502",
      name: "St. Joseph Flood Relief Hub Guwahati",
      district: "Kamrup Metropolitan",
      state: "Assam",
      lat: 26.1445,
      lng: 91.7362,
      capacity: 1200,
      current_occupancy: 980,
      contact_person: "Fr. Thomas Baruah",
      phone: "+91 94350 33445",
      facilities: ["Community Kitchen", "Childcare Care Zone", "Purified Drinking Water", "Sanitation Vans"],
      status: "Active"
    },
    {
      id: "SHL-503",
      name: "Wayanad SDRF High Altitude Shelter",
      district: "Wayanad",
      state: "Kerala",
      lat: 11.6854,
      lng: 76.1320,
      capacity: 500,
      current_occupancy: 310,
      contact_person: "Capt. Rajesh Varma",
      phone: "+91 94471 99001",
      facilities: ["Trauma Care", "Warm Blankets", "Satellite Phone Station", "Emergency Rations"],
      status: "Active"
    },
    {
      id: "SHL-504",
      name: "Dehradun Landslide Evacuation Camp",
      district: "Dehradun",
      state: "Uttarakhand",
      lat: 30.3165,
      lng: 78.0322,
      capacity: 600,
      current_occupancy: 220,
      contact_person: "Officer Neha Bisht",
      phone: "+91 98370 44556",
      facilities: ["Dry Food Depot", "Mobile Hospital Unit", "Solar Power System"],
      status: "Active"
    }
  ],
  predictions: [
    {
      id: "PRED-1",
      disaster_type: "Cyclones",
      title: "Severe Cyclonic Storm 'RAKSHA-04'",
      risk_percentage: 89,
      severity: "Critical",
      affected_regions: ["Odisha Coastal Districts (Puri, Kendrapara)", "North Andhra Pradesh Coast"],
      predicted_time: "Next 18 - 24 Hours",
      confidence: 96.4,
      wind_speed_forecast: "145 - 165 km/h",
      ai_summary: "Satellite imagery indicates rapid intensification over Bay of Bengal. High probability of landfall near Paradeep."
    },
    {
      id: "PRED-2",
      disaster_type: "Floods",
      title: "Brahmaputra River Valley Surge Alert",
      risk_percentage: 94,
      severity: "Critical",
      affected_regions: ["Kaziranga", "Barpeta", "Dhubri", "Kamrup (Assam)"],
      predicted_time: "Next 12 Hours",
      confidence: 98.1,
      water_level_forecast: "+3.2m above danger mark",
      ai_summary: "Upstream cloudburst in Arunachal combined with tidal surge expected to submerge low-lying riverbanks."
    },
    {
      id: "PRED-3",
      disaster_type: "Landslides",
      title: "Western Ghats Slope Failure Danger Zone",
      risk_percentage: 78,
      severity: "High",
      affected_regions: ["Wayanad & Idukki (Kerala)", "Nilgiris (Tamil Nadu)"],
      predicted_time: "Next 36 Hours",
      confidence: 91.2,
      soil_saturation: "92% Hydro-Saturation Limit",
      ai_summary: "Continuous heavy precipitation has triggered soil liquefaction alerts on steep hill corridors."
    },
    {
      id: "PRED-4",
      disaster_type: "Heavy Rainfall",
      title: "Monsoon Deep Depression Alert",
      risk_percentage: 82,
      severity: "High",
      affected_regions: ["Mumbai Metropolitan Region", "Konkan Coastal Belt"],
      predicted_time: "Next 6 - 12 Hours",
      confidence: 93.5,
      rainfall_rate: "180 - 220 mm in 24 hrs",
      ai_summary: "Doppler Radar network confirms dense convective cloud clusters moving inland across North Konkan."
    },
    {
      id: "PRED-5",
      disaster_type: "Forest Fires",
      title: "Simlipal & Garhwal Dry Forest Fire Hazard",
      risk_percentage: 65,
      severity: "Medium",
      affected_regions: ["Chamoli Dry Pine Zone (Uttarakhand)", "Simlipal Tiger Reserve (Odisha)"],
      predicted_time: "Next 48 Hours",
      confidence: 87.0,
      dry_index: "Thermal Anomaly Index High",
      ai_summary: "MODIS thermal sensors detect elevated surface heat with dry wind velocities exceeding 35 km/h."
    },
    {
      id: "PRED-6",
      disaster_type: "Tsunami",
      title: "Andaman Sea Seismic Wave Watch",
      risk_percentage: 24,
      severity: "Low",
      affected_regions: ["Andaman & Nicobar Islands", "Eastern Seaboard (Watch Status)"],
      predicted_time: "Monitoring Status",
      confidence: 99.0,
      seismic_magnitude: "M 6.1 Submarine Strike-Slip (Low Vertical Displacement)",
      ai_summary: "INCOIS buoy sensors record normal sea level fluctuations post-seismic event. No destructive wave formation detected."
    }
  ],
  weather_alerts: [
    {
      id: "WX-1",
      region: "Puri & Coastal Odisha",
      disaster_type: "Cyclones",
      temp: "27.4°C",
      rain_mm: "45 mm/h",
      wind_kmh: "88 km/h",
      humidity: "94%",
      pressure: "982 hPa",
      warning_level: "RED ALERT",
      warning_message: "Severe Cyclonic Storm warning. Fishermen advised not to venture into deep sea."
    },
    {
      region: "Guwahati & Central Assam",
      disaster_type: "Floods",
      temp: "25.1°C",
      rain_mm: "62 mm/h",
      wind_kmh: "32 km/h",
      humidity: "98%",
      pressure: "998 hPa",
      warning_level: "RED ALERT",
      warning_message: "Extremely Heavy Rainfall causing urban flooding & river overtop."
    },
    {
      region: "Wayanad High Ranges",
      disaster_type: "Landslides",
      temp: "21.8°C",
      rain_mm: "50 mm/h",
      wind_kmh: "40 km/h",
      humidity: "96%",
      pressure: "1004 hPa",
      warning_level: "ORANGE ALERT",
      warning_message: "Potential landslide hazard on vulnerable mountain inclines."
    }
  ]
};

class DB {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.save(initialData);
    }
  }

  read() {
    try {
      if (!fs.existsSync(DB_FILE)) {
        this.save(initialData);
      }
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading database file, resetting to initial:", e);
      this.save(initialData);
      return initialData;
    }
  }

  save(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  }

  getCollection(key) {
    const data = this.read();
    return data[key] || [];
  }

  insert(key, item) {
    const data = this.read();
    if (!data[key]) data[key] = [];
    data[key].unshift(item);
    this.save(data);
    return item;
  }

  update(key, id, updates) {
    const data = this.read();
    if (!data[key]) return null;
    const idx = data[key].findIndex(x => x.id === id);
    if (idx !== -1) {
      data[key][idx] = { ...data[key][idx], ...updates, updated_at: new Date().toISOString() };
      this.save(data);
      return data[key][idx];
    }
    return null;
  }

  find(key, predicate) {
    const collection = this.getCollection(key);
    return collection.filter(predicate);
  }

  findOne(key, predicate) {
    const collection = this.getCollection(key);
    return collection.find(predicate);
  }
}

export const db = new DB();
