// AppContext.tsx - Global State Context for OceanEyes
import React, { createContext, useContext } from 'react';
import { useNavigation } from '../hooks/useNavigation';
import { useTheme } from '../hooks/useTheme';
import { useTank } from '../hooks/useTank';
import { useFish } from '../hooks/useFish';
import { useAlerts } from '../hooks/useAlerts';
import { useReadings } from '../hooks/useReadings';
import { useLiveState } from '../hooks/useLiveState';
import { useSimulation } from '../hooks/useSimulation';
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
  const nav = useNavigation();
  const theme = useTheme();
  const tank = useTank();
  const fish = useFish(tank.tankId);
  const alerts = useAlerts();
  const readings = useReadings();
  const live = useLiveState(tank.tankId);
  const simulation = useSimulation(tank.tankId, fish.fishList, tank.activeTank);

  const unlinkTank = () => {
    tank.unlinkTank();
    nav.setActiveTab('home');
  };

  return (
    <AppContext.Provider
      value={{
        activeMode: nav.activeMode,
        setActiveMode: nav.setActiveMode,
        activeTab: nav.activeTab,
        setActiveTab: nav.setActiveTab,
        tankId: tank.tankId,
        linkedTanks: tank.linkedTanks,
        tanks: tank.tanks,
        activeTank: tank.activeTank,
        fishList: fish.fishList,
        readings: readings.readings,
        alerts: alerts.alerts,
        liveState: live.liveState,
        selectTank: tank.selectTank,
        linkTank: tank.linkTank,
        unlinkTank,
        createAndLinkTank: tank.createAndLinkTank,
        addFish: fish.addFish,
        updateFishCount: fish.updateFishCount,
        updateFishSpecies: fish.updateFishSpecies,
        removeFish: fish.removeFish,
        resolveAlert: alerts.resolveAlert,
        updateThresholds: tank.updateThresholds,
        updateCalibration: live.updateCalibration,
        updateTankName: tank.updateTankName,
        simulationActive: simulation.simulationActive,
        setSimulationActive: simulation.setSimulationActive,
        triggerManualReading: simulation.triggerManualReading,
        selectedAlertId: nav.selectedAlertId,
        setSelectedAlertId: nav.setSelectedAlertId,
        isDarkMode: theme.isDarkMode,
        setIsDarkMode: theme.setIsDarkMode,
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
