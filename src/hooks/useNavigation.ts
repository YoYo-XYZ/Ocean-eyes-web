import { useState } from 'react';

type AppMode = 'viewer' | 'monitor' | 'both';
type ViewerTab = 'home' | 'live' | 'settings' | 'alerts' | 'history' | 'my_fish' | 'monitor';

export const useNavigation = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('both');
  const [activeTab, setActiveTab] = useState<ViewerTab>('home');
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  return {
    activeMode,
    setActiveMode,
    activeTab,
    setActiveTab,
    selectedAlertId,
    setSelectedAlertId,
  };
};
