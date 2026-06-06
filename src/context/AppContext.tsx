/* eslint-disable react-hooks/set-state-in-effect */
// AppContext.tsx - Global State Context for OceanEyes
import React, { createContext, useContext, useState, useEffect } from 'react';
import { MockFirestore, subscribeToDb } from '../services/mock_service';
import type { TankBrief, FishEntry, ReadingItem, AlertItem, LiveState } from '../types/aquarium';

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
  selectTank: (tankId: string) => void;
  unlinkTank: () => void;
  createAndLinkTank: (name: string) => Promise<string>;
  addFish: (name: string, imageUrl: string, count: number) => void;
  updateFishCount: (docId: string, count: number) => void;
  updateFishSpecies: (docId: string, name: string, imageUrl: string) => void;
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
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & View Modes
  const [activeMode, setActiveMode] = useState<AppMode>('both'); // Default to side-by-side split screen
  const [activeTab, setActiveTab] = useState<ViewerTab>('home');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // App Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('oceaneyes_darkmode');
    return saved ? saved === 'true' : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('oceaneyes_darkmode', isDarkMode ? 'true' : 'false');
  }, [isDarkMode]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tankId]);

  // Synchronize initial live state for active tank
  useEffect(() => {
    if (tankId) {
      setLiveState(MockFirestore.getLiveState(tankId));
    } else {
      setLiveState(null);
    }
  }, [tankId]);

  const selectTank = (id: string) => {
    setTankId(id);
  };

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

  const addFish = (name: string, imageUrl: string, count: number) => {
    if (tankId) {
      MockFirestore.addFish(tankId, name, imageUrl, count);
    }
  };

  const updateFishCount = (docId: string, count: number) => {
    MockFirestore.updateFishCount(docId, count);
  };

  const updateFishSpecies = (docId: string, name: string, imageUrl: string) => {
    MockFirestore.updateFishSpecies(docId, name, imageUrl);
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
      const activeFeedId = liveState?.selected_feed_id || '';
      MockFirestore.updateCalibration(tankId, activeFeedId, waterLineY);
      setLiveState(MockFirestore.getLiveState(tankId));
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
    const currentClarity = parseFloat((0.5 + Math.random() * 4.5).toFixed(2));
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
      const maxFnu = activeTank.thresholds.clarity_min;
      if (currentClarity > maxFnu) {
        // Clarity Alert
        const activeAlerts = MockFirestore.getAlerts();
        const existing = activeAlerts.find(a => !a.resolved && a.title.includes('clarity'));
        if (!existing) {
          const newAlerts = [...activeAlerts];
          newAlerts.unshift({
            id: `alert-c-${Date.now()}`,
            title: 'Water clarity dropped',
            message: `Water turbidity rose to ${currentClarity} FNU (Threshold: ${maxFnu}). Check your filter unit.`,
            tip: 'Your filters might require a quick scrub. Consider running a partial water cycle swap or verifying the intake system.',
            severity: 'warning',
            timeAgo: 'Just now',
            clarityBefore: '2.5',
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
        // Modulate live stats for the single camera feed
        const feed = currentStreamState.feeds[0];

        const totalExpectedFish = fishList.reduce((sum, f) => sum + f.count, 0);
        const randomFishOffset = Math.random() > 0.85 ? -1 : (Math.random() > 0.9 ? 1 : 0);
        const simulatedDetected = Math.max(0, totalExpectedFish + randomFishOffset);

        const updatedFeed = {
          ...feed,
          is_live: true,
          started_at: feed.started_at || new Date().toISOString(),
          current_fish_count: simulatedDetected
        };

        MockFirestore.saveLiveState(tankId, {
          is_live: true,
          stream_url: updatedFeed.stream_url,
          started_at: updatedFeed.started_at,
          last_ping_at: new Date().toISOString(),
          current_clarity: updatedFeed.current_clarity,
          current_fish_count: updatedFeed.current_fish_count,
          selected_feed_id: currentStreamState.selected_feed_id,
          feeds: [updatedFeed]
        });
      }

      // Add a database log reading once in a while (e.g. 20% chance every tick)
      if (Math.random() > 0.8) {
        triggerManualReading();
      }
    }, 4000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        selectTank,
        linkTank,
        unlinkTank,
        createAndLinkTank,
        addFish,
        updateFishCount,
        updateFishSpecies,
        removeFish,
        resolveAlert,
        updateThresholds,
        updateCalibration,
        updateTankName,
        simulationActive,
        setSimulationActive,
        triggerManualReading,
        selectedAlertId,
        setSelectedAlertId,
        isDarkMode,
        setIsDarkMode
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
