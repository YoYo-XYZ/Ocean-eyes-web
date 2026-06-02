// AppContext.tsx - Global State Context for OceanEyes
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MockFirestore, subscribeToDb } from '../services/mock_service';
import type { TankBrief, FishEntry, ReadingItem, AlertItem, LiveState } from '../services/mock_service';

export type AppMode = 'viewer' | 'monitor' | 'both';
export type ViewerTab = 'home' | 'live' | 'settings' | 'alerts' | 'history' | 'my_fish' | 'monitor';

interface AppContextProps {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  activeTab: ViewerTab;
  setActiveTab: (tab: ViewerTab) => void;
  tankId: string | null;
  linkedTanks: string[];
  tanks: TankBrief[];
  activeTank: TankBrief | undefined;
  fishList: FishEntry[];
  readings: ReadingItem[];
  alerts: AlertItem[];
  liveState: LiveState | null;
  linkTank: (tankId: string) => Promise<boolean>;
  unlinkTank: () => void;
  createAndLinkTank: (name: string) => Promise<string>;
  addFish: (name: string, emoji: string, count: number) => void;
  updateFishCount: (docId: string, count: number) => void;
  removeFish: (docId: string) => void;
  resolveAlert: (alertId: string) => void;
  updateThresholds: (clarityMin: number, fishPct: number) => void;
  updateCalibration: (waterLineY: number) => void;
  updateTankName: (name: string) => void;
  simulationActive: boolean;
  setSimulationActive: (active: boolean) => void;
  triggerManualReading: () => void;
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & View Modes
  const [activeMode, setActiveMode] = useState<AppMode>('both'); // Default to side-by-side split screen
  const [activeTab, setActiveTab] = useState<ViewerTab>('home');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // Active Linked Tank ID
  const [tankId, setTankId] = useState<string | null>(() => {
    const list = MockFirestore.getLinkedTanks();
    return list.length > 0 ? list[0] : null;
  });

  // DB Sync State
  const [linkedTanks, setLinkedTanks] = useState<string[]>(() => MockFirestore.getLinkedTanks());
  const [tanks, setTanks] = useState<TankBrief[]>(() => MockFirestore.getTanks());
  const [fishList, setFishList] = useState<FishEntry[]>(() => MockFirestore.getFish());
  const [readings, setReadings] = useState<ReadingItem[]>(() => MockFirestore.getReadings());
  const [alerts, setAlerts] = useState<AlertItem[]>(() => MockFirestore.getAlerts());
  const [liveState, setLiveState] = useState<LiveState | null>(null);

  // Background Simulator Toggles
  const [simulationActive, setSimulationActive] = useState<boolean>(true);

  // Compute Active Tank
  const activeTank = tanks.find(t => t.id === tankId);

  // Read database state
  const syncWithDb = () => {
    setTanks(MockFirestore.getTanks());
    setLinkedTanks(MockFirestore.getLinkedTanks());
    setFishList(MockFirestore.getFish());
    setReadings(MockFirestore.getReadings());
    setAlerts(MockFirestore.getAlerts());
    if (tankId) {
      setLiveState(MockFirestore.getLiveState(tankId));
    }
  };

  // Re-sync whenever local storage changes or a write happens
  useEffect(() => {
    syncWithDb();
    return subscribeToDb(syncWithDb);
  }, [tankId]);

  // Synchronize initial live state for active tank
  useEffect(() => {
    if (tankId) {
      setLiveState(MockFirestore.getLiveState(tankId));
    } else {
      setLiveState(null);
    }
  }, [tankId]);

  // Operations
  const linkTank = async (targetId: string): Promise<boolean> => {
    const success = await MockFirestore.joinTank(targetId);
    if (success) {
      setTankId(targetId);
    }
    return success;
  };

  const unlinkTank = () => {
    if (tankId) {
      MockFirestore.unlinkTank(tankId);
      const remaining = MockFirestore.getLinkedTanks();
      setTankId(remaining.length > 0 ? remaining[0] : null);
      setActiveTab('home');
    }
  };

  const createAndLinkTank = async (name: string): Promise<string> => {
    const newId = await MockFirestore.createTank(name);
    await MockFirestore.joinTank(newId);
    setTankId(newId);
    return newId;
  };

  const addFish = (name: string, emoji: string, count: number) => {
    if (tankId) {
      MockFirestore.addFish(tankId, name, emoji, count);
    }
  };

  const updateFishCount = (docId: string, count: number) => {
    MockFirestore.updateFishCount(docId, count);
  };

  const removeFish = (docId: string) => {
    MockFirestore.removeFish(docId);
  };

  const resolveAlert = (alertId: string) => {
    MockFirestore.resolveAlert(alertId);
  };

  const updateThresholds = (clarityMin: number, fishPct: number) => {
    if (tankId) {
      MockFirestore.updateThresholds(tankId, clarityMin, fishPct);
    }
  };

  const updateCalibration = (waterLineY: number) => {
    if (tankId) {
      MockFirestore.updateCalibration(tankId, waterLineY);
    }
  };

  const updateTankName = (name: string) => {
    if (tankId) {
      MockFirestore.updateTankName(tankId, name);
    }
  };

  // Trigger manual simulated IoT state write
  const triggerManualReading = () => {
    if (!tankId) return;

    // Generate simulated stats
    const currentClarity = parseFloat((7.0 + Math.random() * 2.0).toFixed(1));
    const randomFishOffset = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
    
    // Sum standard counts
    const totalExpectedFish = fishList.reduce((sum, f) => sum + f.count, 0);
    const simulatedDetected = Math.max(0, totalExpectedFish + randomFishOffset);

    // Update detected array per fish list
    let remainingDetected = simulatedDetected;
    fishList.forEach(fish => {
      const detectedCount = Math.min(fish.count, remainingDetected);
      MockFirestore.updateDetected(fish.id, detectedCount);
      remainingDetected -= detectedCount;
    });

    const simulatedPH = parseFloat((7.1 + Math.random() * 0.3).toFixed(1));
    const simulatedTemp = parseFloat((25.5 + Math.random() * 1.2).toFixed(1));
    const simulatedAmmonia = Math.random() > 0.9 ? 0.02 : 0.0;
    const simulatedNitrite = parseFloat((0.05 + Math.random() * 0.1).toFixed(2));

    MockFirestore.writeReading({
      tankId,
      clarity: currentClarity,
      fishCount: simulatedDetected,
      ph: simulatedPH,
      temp: simulatedTemp,
      ammonia: simulatedAmmonia,
      nitrite: simulatedNitrite
    });

    // Check thresholds to generate alerts
    if (activeTank) {
      const minClarity = activeTank.thresholds.clarity_min;
      if (currentClarity < minClarity) {
        // Clarity Alert
        const activeAlerts = MockFirestore.getAlerts();
        const existing = activeAlerts.find(a => !a.resolved && a.title.includes('clarity'));
        if (!existing) {
          const newAlerts = [...activeAlerts];
          newAlerts.unshift({
            id: `alert-c-${Date.now()}`,
            title: 'Water clarity dropped',
            message: `Water clarity fell to ${currentClarity} (Threshold: ${minClarity}). Check your filter unit.`,
            tip: 'Your filters might require a quick scrub. Consider running a partial water cycle swap or verifying the intake system.',
            severity: 'warning',
            timeAgo: 'Just now',
            clarityBefore: '8.2',
            clarityAfter: currentClarity.toString(),
            fishBefore: totalExpectedFish.toString(),
            fishAfter: simulatedDetected.toString(),
            resolved: false,
            timestamp: new Date().toISOString()
          });
          MockFirestore.saveAlerts(newAlerts);
        }
      }

      // Check fish discrepancy
      const discrepancyRatio = totalExpectedFish > 0 ? (simulatedDetected / totalExpectedFish) : 1;
      const discrepancyPct = activeTank.thresholds.fish_change_pct;
      if (discrepancyRatio * 100 < discrepancyPct) {
        // Discrepancy Alert
        const activeAlerts = MockFirestore.getAlerts();
        const existing = activeAlerts.find(a => !a.resolved && a.title.includes('visible'));
        if (!existing) {
          const newAlerts = [...activeAlerts];
          newAlerts.unshift({
            id: `alert-f-${Date.now()}`,
            title: `Only ${simulatedDetected} of ${totalExpectedFish} fish visible`,
            message: `Fish visibility falls under ${discrepancyPct}% threshold. Check for distress or obstructions.`,
            tip: 'Inspect if they are nesting or sleeping in the corner, or hidden behind plant stalks. Run water parameter metrics checks.',
            severity: 'critical',
            timeAgo: 'Just now',
            clarityBefore: currentClarity.toString(),
            clarityAfter: currentClarity.toString(),
            fishBefore: totalExpectedFish.toString(),
            fishAfter: simulatedDetected.toString(),
            resolved: false,
            timestamp: new Date().toISOString()
          });
          MockFirestore.saveAlerts(newAlerts);
        }
      }
    }
  };

  // Background Simulator Engine
  useEffect(() => {
    if (!simulationActive || !tankId) return;

    const interval = setInterval(() => {
      // Simulate live streaming ping
      const currentStreamState = MockFirestore.getLiveState(tankId);
      if (currentStreamState.is_live) {
        // Modulate live stats
        const currentClarity = parseFloat((7.2 + Math.random() * 1.5).toFixed(1));
        const totalExpectedFish = fishList.reduce((sum, f) => sum + f.count, 0);
        const randomFishOffset = Math.random() > 0.85 ? -1 : (Math.random() > 0.9 ? 1 : 0);
        const simulatedDetected = Math.max(0, totalExpectedFish + randomFishOffset);

        MockFirestore.saveLiveState(tankId, {
          is_live: true,
          stream_url: currentStreamState.stream_url,
          started_at: currentStreamState.started_at,
          last_ping_at: new Date().toISOString(),
          current_clarity: currentClarity,
          current_fish_count: simulatedDetected
        });
      }

      // Add a database log reading once in a while (e.g. 20% chance every tick)
      if (Math.random() > 0.8) {
        triggerManualReading();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [simulationActive, tankId, fishList, activeTank]);

  return (
    <AppContext.Provider
      value={{
        activeMode,
        setActiveMode,
        activeTab,
        setActiveTab,
        tankId,
        linkedTanks,
        tanks,
        activeTank,
        fishList,
        readings,
        alerts,
        liveState,
        linkTank,
        unlinkTank,
        createAndLinkTank,
        addFish,
        updateFishCount,
        removeFish,
        resolveAlert,
        updateThresholds,
        updateCalibration,
        updateTankName,
        simulationActive,
        setSimulationActive,
        triggerManualReading,
        selectedAlertId,
        setSelectedAlertId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
