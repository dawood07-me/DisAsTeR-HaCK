// Configuration for 12 Assam Districts / Regions
export const ASSAM_DISTRICTS = [
  {
    id: 'guwahati',
    name: 'Guwahati',
    fullName: 'Guwahati, Assam',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    country: 'India',
    lat: 26.1445,
    lng: 91.7362,
    elevation_m: 55,
    key_river: 'Brahmaputra River',
    basin: 'Lower Brahmaputra'
  },
  {
    id: 'dibrugarh',
    name: 'Dibrugarh',
    fullName: 'Dibrugarh, Assam',
    district: 'Dibrugarh District',
    state: 'Assam',
    country: 'India',
    lat: 27.4728,
    lng: 94.9120,
    elevation_m: 108,
    key_river: 'Upper Brahmaputra',
    basin: 'Upper Brahmaputra'
  },
  {
    id: 'silchar',
    name: 'Silchar',
    fullName: 'Silchar, Assam',
    district: 'Cachar (Barak Valley)',
    state: 'Assam',
    country: 'India',
    lat: 24.8333,
    lng: 92.7789,
    elevation_m: 22,
    key_river: 'Barak River',
    basin: 'Barak Basin'
  },
  {
    id: 'jorhat',
    name: 'Jorhat',
    fullName: 'Jorhat, Assam',
    district: 'Jorhat District',
    state: 'Assam',
    country: 'India',
    lat: 26.7509,
    lng: 94.2037,
    elevation_m: 116,
    key_river: 'Bhogdoi & Brahmaputra',
    basin: 'Central Brahmaputra'
  },
  {
    id: 'tezpur',
    name: 'Tezpur',
    fullName: 'Tezpur, Assam',
    district: 'Sonitpur District',
    state: 'Assam',
    country: 'India',
    lat: 26.6338,
    lng: 92.8000,
    elevation_m: 48,
    key_river: 'Jia Bharali & Brahmaputra',
    basin: 'Middle Brahmaputra'
  },
  {
    id: 'nagaon',
    name: 'Nagaon',
    fullName: 'Nagaon, Assam',
    district: 'Nagaon District',
    state: 'Assam',
    country: 'India',
    lat: 26.3463,
    lng: 92.6840,
    elevation_m: 60,
    key_river: 'Kopili & Kolong River',
    basin: 'Kopili Sub-basin'
  },
  {
    id: 'tinsukia',
    name: 'Tinsukia',
    fullName: 'Tinsukia, Assam',
    district: 'Tinsukia District',
    state: 'Assam',
    country: 'India',
    lat: 27.4922,
    lng: 95.3558,
    elevation_m: 125,
    key_river: 'Dibru & Lohit',
    basin: 'Eastern Assam Border'
  },
  {
    id: 'dhubri',
    name: 'Dhubri',
    fullName: 'Dhubri, Assam',
    district: 'Dhubri District',
    state: 'Assam',
    country: 'India',
    lat: 26.0207,
    lng: 89.9749,
    elevation_m: 34,
    key_river: 'Lower Brahmaputra & Gangadhar',
    basin: 'Lower Brahmaputra'
  },
  {
    id: 'barpeta',
    name: 'Barpeta',
    fullName: 'Barpeta, Assam',
    district: 'Barpeta District',
    state: 'Assam',
    country: 'India',
    lat: 26.3200,
    lng: 91.0000,
    elevation_m: 35,
    key_river: 'Manas & Beki River',
    basin: 'Manas Sub-basin'
  },
  {
    id: 'golaghat',
    name: 'Golaghat',
    fullName: 'Golaghat, Assam',
    district: 'Golaghat District',
    state: 'Assam',
    country: 'India',
    lat: 26.5167,
    lng: 93.9667,
    elevation_m: 95,
    key_river: 'Dhansiri River',
    basin: 'Dhansiri Basin'
  },
  {
    id: 'north_lakhimpur',
    name: 'North Lakhimpur',
    fullName: 'North Lakhimpur, Assam',
    district: 'Lakhimpur District',
    state: 'Assam',
    country: 'India',
    lat: 27.2345,
    lng: 94.1062,
    elevation_m: 101,
    key_river: 'Subansiri River',
    basin: 'Subansiri Catchment'
  },
  {
    id: 'bongaigaon',
    name: 'Bongaigaon',
    fullName: 'Bongaigaon, Assam',
    district: 'Bongaigaon District',
    state: 'Assam',
    country: 'India',
    lat: 26.4789,
    lng: 90.5583,
    elevation_m: 54,
    key_river: 'Aie River Basin',
    basin: 'Manas/Aie Catchment'
  }
];

// Configurable Risk Level Thresholds
export const RISK_THRESHOLDS = {
  // in mm/h (predicted or peak)
  GREEN_SAFE: { max: 1.0, label: 'GREEN / SAFE', color: 'emerald', message: 'Precipitation within normal range for Brahmaputra/Barak basin.', action: 'Normal Conditions' },
  LOW: { max: 4.0, label: 'LOW', color: 'blue', message: 'Light precipitation detected across district catchment.', action: 'Routine Monitoring' },
  MODERATE: { max: 10.0, label: 'MODERATE', color: 'amber', message: 'Moderate rainfall expected. Inundation risk in low-lying riverine sectors.', action: 'Advisory Active' },
  HIGH: { max: 20.0, label: 'HIGH', color: 'rose', message: 'Heavy downpour expected. Elevated river discharge & localized flooding risk.', action: 'Stay Alert' },
  CRITICAL: { max: Infinity, label: 'CRITICAL', color: 'red', message: 'Extreme torrential rainfall. Flash flood and embankment breach warning.', action: 'Evacuate Low Areas' }
};

export const evaluateRiskLevel = (predictedRate, cumulative24h = 0) => {
  if (predictedRate >= 20 || cumulative24h >= 100) return RISK_THRESHOLDS.CRITICAL;
  if (predictedRate >= 10 || cumulative24h >= 50) return RISK_THRESHOLDS.HIGH;
  if (predictedRate >= 4 || cumulative24h >= 25) return RISK_THRESHOLDS.MODERATE;
  if (predictedRate >= 1 || cumulative24h >= 10) return RISK_THRESHOLDS.LOW;
  return RISK_THRESHOLDS.GREEN_SAFE;
};
