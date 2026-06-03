// mock_service.ts - Simulated Firestore Service for OceanEyes

export interface SpeciesCount {
  name: string;
  emoji: string;
  color: string;
  count: number;
  expectedCount: number;
  weeklyHistory: number[];
}

export interface FishEntry {
  id: string;
  speciesId: string;
  name: string;
  emoji: string;
  count: number;
  detected: number;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  tip: string;
  severity: 'info' | 'warning' | 'critical' | 'good';
  timeAgo: string;
  clarityBefore: string;
  clarityAfter: string;
  fishBefore: string;
  fishAfter: string;
  resolved: boolean;
  timestamp: string;
}

export interface ReadingItem {
  id: string;
  tank_id: string;
  timestamp: string;
  clarity: number;
  fish_count: number;
  fish_count_confidence: number;
  frame_url: string;
  ph: number;
  temp: number;
  ammonia: number;
  nitrite: number;
}

export interface CameraFeed {
  id: string;
  name: string;
  stream_url: string;
  is_live: boolean;
  started_at: string | null;
  current_clarity: number;
  current_fish_count: number;
  mock_image?: string;
}

export interface LiveState {
  is_live: boolean;
  stream_url: string;
  started_at: string | null;
  last_ping_at: string | null;
  current_clarity: number;
  current_fish_count: number;
  selected_feed_id: string;
  feeds: CameraFeed[];
}

export interface TankBrief {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  thresholds: {
    clarity_min: number;
    fish_change_pct: number;
  };
  calibration?: {
    water_line_y: number;
  };
}

// Custom event to simulate real-time Firestore sync
const DB_UPDATE_EVENT = 'oceaneyes_db_update';
const notifyUpdate = () => {
  window.dispatchEvent(new CustomEvent(DB_UPDATE_EVENT));
};

export const subscribeToDb = (callback: () => void) => {
  window.addEventListener(DB_UPDATE_EVENT, callback);
  return () => window.removeEventListener(DB_UPDATE_EVENT, callback);
};

// Initial Seed Data (if localStorage is empty)
const SEED_TANKS: TankBrief[] = [
  {
    id: 'living-room-tank-77',
    name: 'Living Room Reef',
    owner_id: 'anon-user-123',
    created_at: new Date().toISOString(),
    thresholds: { clarity_min: 6.0, fish_change_pct: 50.0 },
    calibration: { water_line_y: 120 }
  }
];

const SEED_FISH: FishEntry[] = [
  { id: 'f1', speciesId: 'neon-tetra', name: 'Neon Tetra', emoji: '🐟', count: 6, detected: 5 },
  { id: 'f2', speciesId: 'guppy', name: 'Guppy', emoji: '🐠', count: 3, detected: 3 },
  { id: 'f3', speciesId: 'corydoras', name: 'Corydoras', emoji: '🐡', count: 2, detected: 2 }
];

const SEED_READINGS: ReadingItem[] = [
  { id: 'r7', tank_id: 'living-room-tank-77', timestamp: new Date(Date.now() - 60000 * 2).toISOString(), clarity: 7.8, fish_count: 10, fish_count_confidence: 0.95, frame_url: '', ph: 7.2, temp: 26.1, ammonia: 0.0, nitrite: 0.1 },
  { id: 'r6', tank_id: 'living-room-tank-77', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), clarity: 8.0, fish_count: 10, fish_count_confidence: 0.98, frame_url: '', ph: 7.2, temp: 26.0, ammonia: 0.0, nitrite: 0.1 },
  { id: 'r5', tank_id: 'living-room-tank-77', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), clarity: 7.5, fish_count: 9, fish_count_confidence: 0.88, frame_url: '', ph: 7.3, temp: 25.9, ammonia: 0.01, nitrite: 0.1 },
  { id: 'r4', tank_id: 'living-room-tank-77', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), clarity: 8.2, fish_count: 11, fish_count_confidence: 0.92, frame_url: '', ph: 7.1, temp: 26.2, ammonia: 0.0, nitrite: 0.08 },
  { id: 'r3', tank_id: 'living-room-tank-77', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), clarity: 8.5, fish_count: 11, fish_count_confidence: 0.95, frame_url: '', ph: 7.2, temp: 26.1, ammonia: 0.0, nitrite: 0.07 },
  { id: 'r2', tank_id: 'living-room-tank-77', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), clarity: 8.6, fish_count: 11, fish_count_confidence: 0.97, frame_url: '', ph: 7.2, temp: 26.1, ammonia: 0.0, nitrite: 0.05 },
  { id: 'r1', tank_id: 'living-room-tank-77', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), clarity: 8.8, fish_count: 11, fish_count_confidence: 0.96, frame_url: '', ph: 7.2, temp: 25.8, ammonia: 0.0, nitrite: 0.05 }
];

const SEED_ALERTS: AlertItem[] = [
  {
    id: 'a1',
    title: 'Water clarity dropped',
    message: 'Clarity dropped from 8.5 to 7.5 in 2 hours. Possible filter issue.',
    tip: 'Check your filter intake for debris. A sudden clarity drop often indicates a clogged filter sponge or disturbed substrate. Consider a 20–30% water change if it persists after cleaning.',
    severity: 'warning',
    timeAgo: '3 hours ago',
    clarityBefore: '8.5',
    clarityAfter: '7.5',
    fishBefore: '10',
    fishAfter: '10',
    resolved: false,
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'a2',
    title: 'Only 4 of 6 Neon Tetras visible',
    message: 'Neon Tetra count below 50% of expected for 35 minutes.',
    tip: 'Fish may be hiding behind plants or decor. Check if lights are on and the filter is running. Tetras sometimes school tightly in one corner when stressed. Test water parameters if hiding persists.',
    severity: 'warning',
    timeAgo: 'Yesterday',
    clarityBefore: '8.1',
    clarityAfter: '8.1',
    fishBefore: '6',
    fishAfter: '4',
    resolved: true,
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'a3',
    title: 'Daily report',
    message: 'Clarity 8/10 · 10 fish visible · All healthy',
    tip: 'Your tank looks great! No action needed. Continue your regular maintenance schedule.',
    severity: 'info',
    timeAgo: 'Yesterday 8:00 AM',
    clarityBefore: '',
    clarityAfter: '',
    fishBefore: '',
    fishAfter: '',
    resolved: true,
    timestamp: new Date(Date.now() - 86400000 - 3600000 * 4).toISOString()
  }
];

const getOrSet = <T>(key: string, seed: T): T => {
  const data = localStorage.getItem(key);
  if (data === null) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(data);
};

export class MockFirestore {
  // Local storage lists
  static getTanks = (): TankBrief[] => getOrSet('tanks', SEED_TANKS);
  static saveTanks = (tanks: TankBrief[]) => {
    localStorage.setItem('tanks', JSON.stringify(tanks));
    notifyUpdate();
  };

  static getFish = (): FishEntry[] => getOrSet('tank_fish', SEED_FISH);
  static saveFish = (fish: FishEntry[]) => {
    localStorage.setItem('tank_fish', JSON.stringify(fish));
    notifyUpdate();
  };

  static getReadings = (): ReadingItem[] => getOrSet('readings', SEED_READINGS);
  static saveReadings = (readings: ReadingItem[]) => {
    localStorage.setItem('readings', JSON.stringify(readings));
    notifyUpdate();
  };

  static getAlerts = (): AlertItem[] => getOrSet('alerts', SEED_ALERTS);
  static saveAlerts = (alerts: AlertItem[]) => {
    localStorage.setItem('alerts', JSON.stringify(alerts));
    notifyUpdate();
  };

  static getLiveState = (tankId: string): LiveState => {
    const key = `live_state_${tankId}`;
    const defaultState: LiveState = {
      is_live: false,
      stream_url: 'rtsp://oceaneyes.iot/live-stream-09',
      started_at: null,
      last_ping_at: null,
      current_clarity: 7.8,
      current_fish_count: 10,
      selected_feed_id: 'feed-main',
      feeds: [
        {
          id: 'feed-main',
          name: 'Main View',
          stream_url: 'rtsp://oceaneyes.iot/live-stream-09',
          is_live: false,
          started_at: null,
          current_clarity: 7.8,
          current_fish_count: 10,
          mock_image: '/mock_camera_main.png'
        },
        {
          id: 'feed-angle',
          name: 'Angle View',
          stream_url: 'rtsp://oceaneyes.iot/angle-stream-02',
          is_live: false,
          started_at: null,
          current_clarity: 8.2,
          current_fish_count: 8,
          mock_image: '/mock_camera_angle.png'
        },
        {
          id: 'feed-mobile',
          name: 'Mobile Feed',
          stream_url: 'rtsp://oceaneyes.iot/mobile-stream-05',
          is_live: false,
          started_at: null,
          current_clarity: 7.5,
          current_fish_count: 9,
          mock_image: '/mock_camera_mobile.png'
        }
      ]
    };
    return getOrSet(key, defaultState);
  };

  static saveLiveState = (tankId: string, state: LiveState) => {
    localStorage.setItem(`live_state_${tankId}`, JSON.stringify(state));
    notifyUpdate();
  };

  static addCameraFeed = (tankId: string, name: string, streamUrl: string) => {
    const liveState = this.getLiveState(tankId);
    const newFeed: CameraFeed = {
      id: `feed-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      stream_url: streamUrl,
      is_live: liveState.is_live,
      started_at: liveState.is_live ? new Date().toISOString() : null,
      current_clarity: parseFloat((7.0 + Math.random() * 2.0).toFixed(1)),
      current_fish_count: Math.floor(Math.random() * 5) + 5,
      mock_image: '/mock_camera_custom.png'
    };
    liveState.feeds.push(newFeed);
    this.saveLiveState(tankId, liveState);
  };

  static deleteCameraFeed = (tankId: string, feedId: string) => {
    const liveState = this.getLiveState(tankId);
    if (liveState.feeds.length <= 1) return; // Must have at least one feed
    
    liveState.feeds = liveState.feeds.filter(f => f.id !== feedId);
    if (liveState.selected_feed_id === feedId) {
      liveState.selected_feed_id = liveState.feeds[0].id;
      const activeFeed = liveState.feeds[0];
      liveState.stream_url = activeFeed.stream_url;
      liveState.current_clarity = activeFeed.current_clarity;
      liveState.current_fish_count = activeFeed.current_fish_count;
      liveState.started_at = activeFeed.started_at;
    }
    this.saveLiveState(tankId, liveState);
  };

  static switchActiveFeed = (tankId: string, feedId: string) => {
    const liveState = this.getLiveState(tankId);
    const activeFeed = liveState.feeds.find(f => f.id === feedId);
    if (activeFeed) {
      liveState.selected_feed_id = feedId;
      liveState.stream_url = activeFeed.stream_url;
      liveState.current_clarity = activeFeed.current_clarity;
      liveState.current_fish_count = activeFeed.current_fish_count;
      liveState.started_at = activeFeed.started_at;
      this.saveLiveState(tankId, liveState);
    }
  };

  // ─── Tank Operations ─────────────────────────────────────────────────────────

  static async createTank(name: string): Promise<string> {
    const id = `tank-${Math.floor(Math.random() * 900000) + 100000}`;
    const tanks = this.getTanks();
    const newTank: TankBrief = {
      id,
      name,
      owner_id: 'anon-user-123',
      created_at: new Date().toISOString(),
      thresholds: { clarity_min: 6.0, fish_change_pct: 50.0 },
      calibration: { water_line_y: 120 }
    };
    tanks.push(newTank);
    this.saveTanks(tanks);

    // Initial reading
    await this.writeReading({
      tankId: id,
      clarity: 8.0,
      fishCount: 0,
      ph: 7.2,
      temp: 26.0,
      ammonia: 0,
      nitrite: 0
    });

    return id;
  }

  static async joinTank(tankId: string): Promise<boolean> {
    const tanks = this.getTanks();
    const found = tanks.find(t => t.id === tankId);
    if (!found) return false;

    // Save in user linked tanks
    const userTanks = getOrSet<string[]>('user_tanks', ['living-room-tank-77']);
    if (!userTanks.includes(tankId)) {
      userTanks.push(tankId);
      localStorage.setItem('user_tanks', JSON.stringify(userTanks));
    }
    notifyUpdate();
    return true;
  }

  static getLinkedTanks(): string[] {
    return getOrSet<string[]>('user_tanks', ['living-room-tank-77']);
  }

  static unlinkTank(tankId: string) {
    const userTanks = this.getLinkedTanks();
    const updated = userTanks.filter(id => id !== tankId);
    localStorage.setItem('user_tanks', JSON.stringify(updated));
    notifyUpdate();
  }

  static updateTankName(tankId: string, name: string) {
    const tanks = this.getTanks();
    const index = tanks.findIndex(t => t.id === tankId);
    if (index !== -1) {
      tanks[index].name = name;
      this.saveTanks(tanks);
    }
  }

  static updateThresholds(tankId: string, clarityMin: number, fishPct: number) {
    const tanks = this.getTanks();
    const index = tanks.findIndex(t => t.id === tankId);
    if (index !== -1) {
      tanks[index].thresholds = {
        clarity_min: clarityMin,
        fish_change_pct: fishPct
      };
      this.saveTanks(tanks);
    }
  }

  static updateCalibration(tankId: string, waterLineY: number) {
    const tanks = this.getTanks();
    const index = tanks.findIndex(t => t.id === tankId);
    if (index !== -1) {
      tanks[index].calibration = { water_line_y: waterLineY };
      this.saveTanks(tanks);
    }
  }

  // ─── Readings Operations ─────────────────────────────────────────────────────

  static async writeReading(data: {
    tankId: string;
    clarity: number;
    fishCount: number;
    ph?: number;
    temp?: number;
    ammonia?: number;
    nitrite?: number;
  }) {
    const readings = this.getReadings();
    const newReading: ReadingItem = {
      id: `r-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tank_id: data.tankId,
      timestamp: new Date().toISOString(),
      clarity: data.clarity,
      fish_count: data.fishCount,
      fish_count_confidence: 0.95,
      frame_url: '',
      ph: data.ph ?? 7.2,
      temp: data.temp ?? 26.0,
      ammonia: data.ammonia ?? 0.0,
      nitrite: data.nitrite ?? 0.05
    };
    readings.unshift(newReading); // Newest first
    this.saveReadings(readings.slice(0, 50)); // Cap at 50 readings
  }

  // ─── Alerts Operations ───────────────────────────────────────────────────────

  static resolveAlert(alertId: string) {
    const alerts = this.getAlerts();
    const index = alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      alerts[index].resolved = true;
      this.saveAlerts(alerts);
    }
  }

  // ─── Fish Operations ─────────────────────────────────────────────────────────

  static addFish(_tankId: string, name: string, emoji: string, count: number) {
    const fish = this.getFish();
    const speciesId = name.toLowerCase().replace(/\s+/g, '-');
    const newEntry: FishEntry = {
      id: `fish-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      speciesId,
      name,
      emoji,
      count,
      detected: count // Start as fully detected
    };
    fish.push(newEntry);
    this.saveFish(fish);
  }

  static updateFishCount(docId: string, count: number) {
    const fish = this.getFish();
    const index = fish.findIndex(f => f.id === docId);
    if (index !== -1) {
      fish[index].count = count;
      this.saveFish(fish);
    }
  }

  static updateDetected(docId: string, detected: number) {
    const fish = this.getFish();
    const index = fish.findIndex(f => f.id === docId);
    if (index !== -1) {
      fish[index].detected = detected;
      this.saveFish(fish);
    }
  }

  static removeFish(docId: string) {
    const fish = this.getFish();
    const updated = fish.filter(f => f.id !== docId);
    this.saveFish(updated);
  }
}
