/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { MockFirestore } from '../../services/mock_service';
import type { CameraFilters, FilterPreset } from '../../types/aquarium';
import {
  Video,
  LayoutGrid,
  Plus,
  ZoomIn,
  ZoomOut,
  Camera,
  Square,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Ruler,
  Maximize,
  Minimize,
  Fish,
  Eye
} from 'lucide-react';
import { getSpeciesById, getSpeciesColor, getSpeciesInitials } from '../../data/speciesCatalog';

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'normal',
    name: 'Normal',
    isCustom: false,
    filters: { contrast: 100, brightness: 100, saturation: 100, temperature: 0, tint: 0 }
  },
  {
    id: 'vivid',
    name: 'Vivid Reef',
    isCustom: false,
    filters: { contrast: 125, brightness: 100, saturation: 140, temperature: 10, tint: 0 }
  },
  {
    id: 'deep-blue',
    name: 'Deep Blue',
    isCustom: false,
    filters: { contrast: 110, brightness: 95, saturation: 120, temperature: -40, tint: 10 }
  },
  {
    id: 'cctv-retro',
    name: 'CCTV Retro',
    isCustom: false,
    filters: { contrast: 85, brightness: 105, saturation: 0, temperature: 0, tint: 0 }
  }
];

const FishThumbnail: React.FC<{ imagePath?: string; initials: string; color: string }> = ({ imagePath, initials, color }) => {
  const [hasError, setHasError] = useState(false);
  if (!imagePath || hasError) {
    return (
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 700,
          color: '#fff',
          flexShrink: 0,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }}
      >
        {initials}
      </div>
    );
  }
  return (
    <img
      src={imagePath}
      alt={initials}
      style={{
        width: '36px',
        height: '36px',
        objectFit: 'contain',
        flexShrink: 0
      }}
      onError={() => setHasError(true)}
    />
  );
};

export const LiveScreen: React.FC = () => {
  const { liveState, activeTank, updateCalibration, fishList } = useApp();
  const [isStreaming, setIsStreaming] = useState(liveState?.is_live || false);

  useEffect(() => {
    if (liveState) {
      setIsStreaming(liveState.is_live);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveState?.is_live]);
  // Fullscreen state and handlers
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFsInventory, setShowFsInventory] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) {
        setShowFsInventory(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!viewportRef.current) return;
    if (!document.fullscreenElement) {
      viewportRef.current.requestFullscreen().catch(err => {
        console.error(`Error entering fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [flashActive, setFlashActive] = useState(false);

  // Water level calibration state
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [isCalibDragging, setIsCalibDragging] = useState(false);

  // Camera filter states
  const [filters, setFilters] = useState<CameraFilters>({
    contrast: 100,
    brightness: 100,
    saturation: 100,
    temperature: 0,
    tint: 0
  });

  const [customPresets, setCustomPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem('oceaneyes_camera_presets');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>('normal');
  const [isAdjustmentsExpanded, setIsAdjustmentsExpanded] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePresetInput, setShowSavePresetInput] = useState(false);

  const applyPreset = (preset: FilterPreset) => {
    setSelectedPresetId(preset.id);
    setFilters({ ...preset.filters });
  };

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const presetId = `preset-${Date.now()}`;
    const newPreset: FilterPreset = {
      id: presetId,
      name: newPresetName.trim(),
      isCustom: true,
      filters: { ...filters }
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem('oceaneyes_camera_presets', JSON.stringify(updated));
    setSelectedPresetId(presetId);
    setNewPresetName('');
    setShowSavePresetInput(false);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('oceaneyes_camera_presets', JSON.stringify(updated));
    if (selectedPresetId === id) {
      applyPreset(DEFAULT_PRESETS[0]);
    }
  };

  const handleFilterChange = (key: keyof CameraFilters, val: number) => {
    const updatedFilters = { ...filters, [key]: val };
    setFilters(updatedFilters);

    // Check if it matches any preset
    const allPresets = [...DEFAULT_PRESETS, ...customPresets];
    const matchingPreset = allPresets.find(p =>
      p.filters.contrast === updatedFilters.contrast &&
      p.filters.brightness === updatedFilters.brightness &&
      p.filters.saturation === updatedFilters.saturation &&
      p.filters.temperature === updatedFilters.temperature &&
      p.filters.tint === updatedFilters.tint
    );

    if (matchingPreset) {
      setSelectedPresetId(matchingPreset.id);
    } else {
      setSelectedPresetId('custom');
    }
  };

  // Multi-camera feeds view states
  const [isGridView, setIsGridView] = useState(false);
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [newCameraName, setNewCameraName] = useState('');
  const [newCameraUrl, setNewCameraUrl] = useState('');

  // Drag and pan states for zoom
  const [isDragging, setIsDragging] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset panOffset when zoom level changes back to 1.0
  useEffect(() => {
    if (zoomLevel === 1.0) {
      setPanOffset({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  // Persistence galleries in LocalStorage
  const [snapshots, setSnapshots] = useState<{
    id: string;
    timestamp: string;
    imageUrl: string;
    fishCount: number;
    clarity: number;
  }[]>(() => {
    const saved = localStorage.getItem('oceaneyes_snapshots');
    return saved ? JSON.parse(saved) : [];
  });

  const [recordings, setRecordings] = useState<{
    id: string;
    timestamp: string;
    duration: number;
    fishCount: number;
    clarity: number;
  }[]>(() => {
    const saved = localStorage.getItem('oceaneyes_recordings');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('oceaneyes_snapshots', JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    localStorage.setItem('oceaneyes_recordings', JSON.stringify(recordings));
  }, [recordings]);

  // Recording timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startStream = () => {
    setIsStreaming(true);
    if (activeTank) {
      const currentLive = MockFirestore.getLiveState(activeTank.id);
      const updatedFeeds = currentLive.feeds.map(f => ({
        ...f,
        is_live: true,
        started_at: f.started_at || new Date().toISOString()
      }));
      const active = updatedFeeds.find(f => f.id === currentLive.selected_feed_id) || updatedFeeds[0];
      MockFirestore.saveLiveState(activeTank.id, {
        is_live: true,
        stream_url: active.stream_url,
        started_at: active.started_at || new Date().toISOString(),
        last_ping_at: new Date().toISOString(),
        current_clarity: active.current_clarity,
        current_fish_count: active.current_fish_count,
        selected_feed_id: currentLive.selected_feed_id,
        feeds: updatedFeeds
      });
    }
  };

  const stopStream = () => {
    setIsStreaming(false);
    setIsRecording(false);
    setZoomLevel(1.0);
    if (activeTank) {
      const currentLive = MockFirestore.getLiveState(activeTank.id);
      const updatedFeeds = currentLive.feeds.map(f => ({
        ...f,
        is_live: false,
        started_at: null
      }));
      MockFirestore.saveLiveState(activeTank.id, {
        is_live: false,
        stream_url: '',
        started_at: null,
        last_ping_at: null,
        current_clarity: 0,
        current_fish_count: 0,
        selected_feed_id: currentLive.selected_feed_id,
        feeds: updatedFeeds
      });
    }
  };

  // Re-read from active context live state
  const feeds = liveState?.feeds || [];
  const activeFeed = feeds.find(f => f.id === liveState?.selected_feed_id) || feeds[0] || {
    id: 'feed-main',
    name: 'Main View',
    stream_url: 'rtsp://oceaneyes.iot/live-stream-09',
    is_live: false,
    started_at: null,
    current_clarity: 7.8,
    current_fish_count: 10
  };

  // Water level calibration helpers (resolving per-camera calibration first)
  const activeFeedCalibration = activeFeed?.calibration || activeTank?.calibration;
  const currentWaterLineY = activeFeedCalibration?.water_line_y ?? 120;
  const currentPercentage = Math.round((1 - currentWaterLineY / 240) * 100);

  const handleCalibrationChange = (pct: number) => {
    const newY = Math.round((1 - pct / 100) * 240);
    updateCalibration(newY);
  };

  const getSpeciesDisplay = (fish: typeof fishList[0]) => {
    const species = getSpeciesById(fish.speciesId);
    if (species) {
      return {
        initials: species.initials,
        color: species.color,
        name: species.displayName,
        imagePath: species.imagePath
      };
    }
    return {
      initials: getSpeciesInitials(fish.speciesId),
      color: getSpeciesColor(fish.speciesId),
      name: fish.name,
      imagePath: undefined as string | undefined
    };
  };

  const stateClarity = isStreaming && liveState?.is_live ? activeFeed.current_clarity : 0;
  const stateFish = isStreaming && liveState?.is_live ? activeFeed.current_fish_count : 0;

  const handleAddCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCameraName.trim() || !newCameraUrl.trim()) return;
    if (activeTank) {
      MockFirestore.addCameraFeed(activeTank.id, newCameraName.trim(), newCameraUrl.trim());
      setNewCameraName('');
      setNewCameraUrl('');
      setShowAddCameraModal(false);
    }
  };

  const handleDeleteCamera = (feedId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTank) {
      MockFirestore.deleteCameraFeed(activeTank.id, feedId);
    }
  };

  const handleSwitchFeed = (feedId: string) => {
    if (activeTank) {
      MockFirestore.switchActiveFeed(activeTank.id, feedId);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCalibrating) {
      setIsCalibDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const yPixel = Math.min(360, Math.max(0, e.clientY - rect.top));
      const newY = Math.round((yPixel / 360) * 240);
      updateCalibration(newY);
      return;
    }
    if (zoomLevel <= 1.0) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCalibrating) {
      if (isCalibDragging || e.buttons === 1) {
        const rect = e.currentTarget.getBoundingClientRect();
        const yPixel = Math.min(360, Math.max(0, e.clientY - rect.top));
        const newY = Math.round((yPixel / 360) * 240);
        updateCalibration(newY);
      }
      return;
    }
    if (!isDragging || zoomLevel <= 1.0) return;

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    const container = e.currentTarget.getBoundingClientRect();
    const limitX = (container.width * (zoomLevel - 1)) / 2;
    const limitY = (container.height * (zoomLevel - 1)) / 2;

    newX = Math.max(-limitX, Math.min(limitX, newX));
    newY = Math.max(-limitY, Math.min(limitY, newY));

    setPanOffset({ x: newX, y: newY });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isCalibrating) {
      setIsCalibDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      const clientY = e.touches[0].clientY;
      const yPixel = Math.min(360, Math.max(0, clientY - rect.top));
      const newY = Math.round((yPixel / 360) * 240);
      updateCalibration(newY);
      return;
    }
    if (zoomLevel <= 1.0 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - panOffset.x,
      y: touch.clientY - panOffset.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isCalibrating) {
      if (isCalibDragging) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clientY = e.touches[0].clientY;
        const yPixel = Math.min(360, Math.max(0, clientY - rect.top));
        const newY = Math.round((yPixel / 360) * 240);
        updateCalibration(newY);
      }
      return;
    }
    if (!isDragging || zoomLevel <= 1.0 || e.touches.length !== 1) return;
    const touch = e.touches[0];

    let newX = touch.clientX - dragStart.x;
    let newY = touch.clientY - dragStart.y;

    const container = e.currentTarget.getBoundingClientRect();
    const limitX = (container.width * (zoomLevel - 1)) / 2;
    const limitY = (container.height * (zoomLevel - 1)) / 2;

    newX = Math.max(-limitX, Math.min(limitX, newX));
    newY = Math.max(-limitY, Math.min(limitY, newY));

    setPanOffset({ x: newX, y: newY });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setIsCalibDragging(false);
  };

  const takeSnapshot = () => {
    if (!isStreaming) return;
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 400);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderAllToCanvas = (bgImg?: HTMLImageElement) => {
      // 1. Draw Background (mock image or gradient)
      ctx.filter = `contrast(${filters.contrast}%) brightness(${filters.brightness}%) saturate(${filters.saturation}%)`;
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, 640, 360);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, 360);
        const isDark = document.body.classList.contains('dark');
        if (isDark) {
          grad.addColorStop(0, '#050827');
          grad.addColorStop(0.5, '#004f95');
          grad.addColorStop(1, '#0074d9');
        } else {
          grad.addColorStop(0, '#0F766E');
          grad.addColorStop(0.5, '#115E59');
          grad.addColorStop(1, '#134E4A');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 360);
      }
      ctx.filter = 'none'; // reset filter for overlays

      // Apply Temperature Overlay on Canvas
      if (filters.temperature !== 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = filters.temperature > 0
          ? `rgba(255, 176, 0, ${Math.abs(filters.temperature) / 300})`
          : `rgba(0, 160, 255, ${Math.abs(filters.temperature) / 300})`;
        ctx.fillRect(0, 0, 640, 360);
        ctx.restore();
      }

      // Apply Tint Overlay on Canvas
      if (filters.tint !== 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = filters.tint > 0
          ? `rgba(255, 0, 187, ${Math.abs(filters.tint) / 400})`
          : `rgba(0, 255, 68, ${Math.abs(filters.tint) / 400})`;
        ctx.fillRect(0, 0, 640, 360);
        ctx.restore();
      }

      // 2. Camera Grid Overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 640; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 360);
        ctx.stroke();
      }
      for (let y = 0; y < 360; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      // 3. Zoom-scaled items
      ctx.save();
      ctx.translate(panOffset.x, panOffset.y);
      ctx.translate(320, 180);
      ctx.scale(zoomLevel, zoomLevel);
      ctx.translate(-320, -180);

      // Aquatic Emoji Elements
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌿', 80, 60);
      ctx.fillText('🍀', 560, 280);

      // Calibrated water line
      if (activeTank?.calibration) {
        const yPercent = activeTank.calibration.water_line_y / 240;
        const canvasY = yPercent * 360;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(640, canvasY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('CALIBRATED WATER LINE', 520, canvasY - 10);
      }
      ctx.restore();

      // 4. Overlays (Static HUD)
      if (isRecording) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.beginPath();
        ctx.arc(30, 25, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`REC ${formatTime(recordingSeconds)}`, 42, 25);
      }

      // Live Cam Pill
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fillRect(520, 15, 100, 22);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`LIVE CAM (FPS:30)`, 570, 26);

      // 5. Diagnostics Overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(0, 310, 640, 50);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Outfit, Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`OCEANEYES AI DIAGNOSTICS`, 20, 335);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText(`FISH: ${stateFish} DETECTED  |  CLARITY: ${stateClarity}/10  |  ZOOM: ${zoomLevel.toFixed(1)}x`, 620, 335);

      const imgUrl = canvas.toDataURL('image/png');
      const newSnapshot = {
        id: `snap_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        imageUrl: imgUrl,
        fishCount: stateFish,
        clarity: stateClarity
      };
      setSnapshots(prev => [newSnapshot, ...prev]);
    };

    if (activeFeed.mock_image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        renderAllToCanvas(img);
      };
      img.onerror = () => {
        renderAllToCanvas();
      };
      img.src = activeFeed.mock_image;
    } else {
      renderAllToCanvas();
    }
  };

  const downloadSnapshot = (snap: { id: string; imageUrl: string }) => {
    const link = document.createElement('a');
    link.download = `OceanEyes_Snapshot_${snap.id}.png`;
    link.href = snap.imageUrl;
    link.click();
  };

  const deleteSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      const newRecording = {
        id: `rec_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        duration: recordingSeconds,
        fishCount: stateFish,
        clarity: stateClarity
      };
      setRecordings(prev => [newRecording, ...prev]);
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
    }
  };

  const downloadRecording = (rec: { id: string; timestamp: string; duration: number; fishCount: number; clarity: number }) => {
    const logContent = `OCEANEYES AI SMART AQUARIUM RECORDING LOG
================================================
Recording ID: ${rec.id}
Timestamp: ${rec.timestamp}
Duration: ${rec.duration} seconds
Species Count: ${rec.fishCount} detected
Clarity Rating: ${rec.clarity} / 10
Diagnostics:
  - RTSP Stream link verified.
  - Video stream encoded at 30 FPS.
  - AI computer vision scan: Completed with no discrepancies.
================================================`;

    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `OceanEyes_Recording_${rec.id}.log`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={{ padding: '0 20px 30px 20px' }}>
      <div className="canvas-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Camera Monitor</span>
          <h1 className="canvas-title" style={{ marginTop: '2px' }}>Live Video Stream</h1>
        </div>

        {/* View Mode Toggle */}
        {isStreaming && (
          <div style={{
            display: 'flex',
            background: 'var(--color-border)',
            padding: '2px',
            borderRadius: '10px',
            gap: '2px'
          }}>
            <button
              onClick={() => setIsGridView(false)}
              className="secondary-button"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '8px',
                background: !isGridView ? 'var(--color-surface)' : 'transparent',
                color: !isGridView ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                boxShadow: !isGridView ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Video size={14} /> Single View
            </button>
            <button
              onClick={() => setIsGridView(true)}
              className="secondary-button"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '8px',
                background: isGridView ? 'var(--color-surface)' : 'transparent',
                color: isGridView ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: 600,
                boxShadow: isGridView ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <LayoutGrid size={14} /> Grid View
            </button>
          </div>
        )}
      </div>

      {/* Camera Selector Tabs Bar */}
      {isStreaming && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {feeds.map(feed => (
              <div
                key={feed.id}
                onClick={() => !isGridView && handleSwitchFeed(feed.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid var(--color-border)',
                  background: isGridView
                    ? 'rgba(0, 0, 0, 0.02)'
                    : (feed.id === activeFeed.id ? 'var(--color-primary-light)' : 'var(--color-surface)'),
                  color: isGridView
                    ? 'var(--color-text-secondary)'
                    : (feed.id === activeFeed.id ? 'var(--color-primary-dark)' : 'var(--color-text-primary)'),
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isGridView ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: feed.is_live ? 'var(--color-good)' : 'var(--color-text-secondary)'
                }} />
                <span>{feed.name}</span>
                {feeds.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteCamera(feed.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Delete camera feed"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => setShowAddCameraModal(true)}
              className="secondary-button"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                borderColor: 'var(--color-primary)'
              }}
            >
              <Plus size={14} style={{ color: 'var(--color-primary)' }} />
              <span style={{ color: 'var(--color-primary-dark)' }}>Add Camera</span>
            </button>
          </div>

          {isGridView && (
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              💡 Click any camera in grid to view fullscreen
            </span>
          )}
        </div>
      )}

      {/* Viewport Grid vs Single */}
      {isGridView && isStreaming ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {feeds.map(feed => (
            <div
              key={feed.id}
              onClick={() => {
                handleSwitchFeed(feed.id);
                setIsGridView(false);
              }}
              className="live-camera-feed"
              style={{
                aspectRatio: '16 / 9',
                cursor: 'pointer',
                border: feed.id === activeFeed.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                transition: 'var(--transition-smooth)',
                position: 'relative',
                width: '100%'
              }}
            >
              {/* Shutter flash overlay */}
              <div className={`camera-flash-overlay ${flashActive && feed.id === activeFeed.id ? 'flash-active' : ''}`} />

              {/* Live Camera Grid Lines */}
              <div className="camera-grid" />

              {/* Aquatic Render */}
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: feed.mock_image ? `url(${feed.mock_image})` : 'var(--camera-placeholder)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'absolute',
                overflow: 'hidden',
                filter: feed.id === activeFeed.id ? `contrast(${filters.contrast}%) brightness(${filters.brightness}%) saturate(${filters.saturation}%)` : 'none'
              }}>
                {/* Temperature Overlay in Grid View */}
                {feed.id === activeFeed.id && filters.temperature !== 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: filters.temperature > 0 ? '#ffb000' : '#00a0ff',
                    opacity: Math.abs(filters.temperature) / 300,
                    mixBlendMode: 'color',
                    pointerEvents: 'none',
                    zIndex: 4
                  }} />
                )}

                {/* Tint Overlay in Grid View */}
                {feed.id === activeFeed.id && filters.tint !== 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: filters.tint > 0 ? '#ff00bb' : '#00ff44',
                    opacity: Math.abs(filters.tint) / 400,
                    mixBlendMode: 'color',
                    pointerEvents: 'none',
                    zIndex: 5
                  }} />
                )}
                <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '32px', opacity: 0.2 }}>🌿</div>
                <div style={{ position: 'absolute', bottom: '15%', right: '12%', fontSize: '42px', opacity: 0.25 }}>🍀</div>

                {/* Water Calibration Line in Grid View */}
                {(feed.calibration || activeTank?.calibration) && (
                  <div style={{
                    position: 'absolute',
                    top: `${Math.min(100, Math.max(0, ((feed.calibration?.water_line_y || activeTank?.calibration?.water_line_y || 120) / 240) * 100))}%`,
                    left: 0,
                    width: '100%',
                    height: '1px',
                    borderTop: '1px dashed rgba(255,255,255,0.35)',
                    zIndex: 10
                  }} />
                )}
              </div>

              {/* Badge Overlays */}
              <div className="live-overlay-pill" style={{ left: '8px', top: '8px', padding: '4px 8px', fontSize: '10px' }}>
                <div className="live-badge" />
                <span>{feed.name}</span>
              </div>

              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                display: 'flex',
                gap: '8px',
                zIndex: 10
              }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', color: '#FFF' }}>
                  <strong>{feed.current_fish_count} fish</strong>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', color: '#FFF' }}>
                  <strong style={{ color: 'var(--color-info)' }}>{feed.current_clarity} score</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Simulated Video Frame */
        <div
          ref={viewportRef}
          className="live-camera-feed"
          style={{
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isCalibrating ? 'ns-resize' : (zoomLevel > 1.0 ? (isDragging ? 'grabbing' : 'grab') : 'default'),
            userSelect: 'none',
            touchAction: isCalibrating || zoomLevel > 1.0 ? 'none' : 'auto'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
        >
          {isStreaming ? (
            <>
              {/* Shutter flash overlay */}
              <div className={`camera-flash-overlay ${flashActive ? 'flash-active' : ''}`} />

              {/* Live Camera Grid Lines */}
              <div className="camera-grid" />

              {/* Simulated Live Stream Feed - Aquatic Render */}
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: activeFeed.mock_image ? `url(${activeFeed.mock_image})` : 'var(--camera-placeholder)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'absolute',
                overflow: 'hidden',
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: 'center',
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: `contrast(${filters.contrast}%) brightness(${filters.brightness}%) saturate(${filters.saturation}%)`
              }}>
                {/* Temperature Overlay */}
                {filters.temperature !== 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: filters.temperature > 0 ? '#ffb000' : '#00a0ff',
                    opacity: Math.abs(filters.temperature) / 300,
                    mixBlendMode: 'color',
                    pointerEvents: 'none',
                    zIndex: 4
                  }} />
                )}

                {/* Tint Overlay */}
                {filters.tint !== 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: filters.tint > 0 ? '#ff00bb' : '#00ff44',
                    opacity: Math.abs(filters.tint) / 400,
                    mixBlendMode: 'color',
                    pointerEvents: 'none',
                    zIndex: 5
                  }} />
                )}
                {/* Aquatic Floating Plants */}
                <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '48px', opacity: 0.2 }} className="anim-float-1">🌿</div>
                <div style={{ position: 'absolute', bottom: '15%', right: '12%', fontSize: '64px', opacity: 0.25 }} className="anim-float-2">🍀</div>

                {/* Water Wave Line Overlay representing Calibration */}
                {activeFeedCalibration && (
                  <div style={{
                    position: 'absolute',
                    top: `${Math.min(100, Math.max(0, (activeFeedCalibration.water_line_y / 240) * 100))}%`,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    borderTop: isCalibrating ? '2px dashed var(--color-critical)' : '2px dashed rgba(255,255,255,0.4)',
                    zIndex: 10,
                    transition: isCalibDragging ? 'none' : 'top 0.1s ease-out'
                  }}>
                    <span style={{
                      position: 'absolute',
                      right: '10px',
                      top: '-18px',
                      fontSize: '9px',
                      color: '#FFF',
                      background: isCalibrating ? 'var(--color-critical)' : 'rgba(0,0,0,0.4)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      boxShadow: isCalibrating ? '0 0 8px rgba(239, 68, 68, 0.5)' : 'none'
                    }}>
                      {isCalibrating ? 'DRAG TO CALIBRATE' : 'CALIBRATED LINE'}
                    </span>
                  </div>
                )}
              </div>

              {/* Badges overlay */}
              <div className="live-overlay-pill" style={{ left: '12px' }}>
                <div className="live-badge" />
                <span>{activeFeed.name} (LIVE)</span>
              </div>

              <div className="live-overlay-pill" style={{ right: isFullscreen && showFsInventory ? '332px' : '12px', transition: 'right 0.3s ease' }}>
                <span>FPS: 30</span>
              </div>

              {/* Recording HUD indicator */}
              {isRecording && (
                <div className="live-overlay-pill" style={{ left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(239, 68, 68, 0.85)' }}>
                  <div className="recording-dot" />
                  <span>REC {formatTime(recordingSeconds)}</span>
                </div>
              )}

              {/* Live Camera Controls Overlay */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: isFullscreen && showFsInventory ? '332px' : '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 20,
                transition: 'right 0.3s ease'
              }}>
                {/* Zoom Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '2px 8px',
                  gap: '6px',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: 600,
                  height: '40px'
                }}>
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.5))}
                    disabled={zoomLevel <= 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: zoomLevel <= 1 ? 'rgba(255,255,255,0.3)' : '#FFF',
                      cursor: zoomLevel <= 1 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Zoom Out"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center' }}>{zoomLevel.toFixed(1)}x</span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.5))}
                    disabled={zoomLevel >= 3}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: zoomLevel >= 3 ? 'rgba(255,255,255,0.3)' : '#FFF',
                      cursor: zoomLevel >= 3 ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Zoom In"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>

                {/* Capture Button */}
                <button
                  className="camera-control-btn"
                  onClick={takeSnapshot}
                  title="Capture Snapshot"
                >
                  <Camera size={16} />
                </button>

                {/* Record Button */}
                <button
                  className={`camera-control-btn ${isRecording ? 'recording-active' : ''}`}
                  onClick={toggleRecording}
                  title={isRecording ? "Stop Recording" : "Start Recording"}
                >
                  {isRecording ? <Square size={14} /> : <Video size={16} />}
                </button>

                {/* Fullscreen Inventory Toggle (Only visible in Fullscreen) */}
                {isFullscreen && (
                  <button
                    className="camera-control-btn"
                    onClick={() => setShowFsInventory(!showFsInventory)}
                    title={showFsInventory ? "Hide Fish Inventory" : "Show Fish Inventory"}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: showFsInventory ? 'var(--color-primary)' : undefined,
                      borderColor: showFsInventory ? 'var(--color-primary-light)' : undefined,
                      color: showFsInventory ? '#FFF' : undefined
                    }}
                  >
                    <Fish size={16} />
                  </button>
                )}

                {/* Fullscreen Button */}
                <button
                  className="camera-control-btn"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
              </div>

              {/* Fullscreen right inventory overlay */}
              {isFullscreen && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '320px',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  // backdropFilter: 'blur(16px)',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                  zIndex: 30,
                  display: 'flex',
                  flexDirection: 'column',
                  transform: showFsInventory ? 'translateX(0)' : 'translateX(100%)',
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: '#FFFFFF',
                  textAlign: 'left'
                }}>
                  {/* Header */}
                  <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Fish size={18} color="var(--color-primary)" />
                      <span>Fish Inventory</span>
                    </h3>
                    <button
                      onClick={() => setShowFsInventory(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.6)',
                        cursor: 'pointer',
                        fontSize: '20px',
                        padding: '4px',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Overview Stats */}
                  {(() => {
                    const totalFish = fishList.reduce((sum, f) => sum + f.count, 0);
                    const totalDetected = fishList.reduce((sum, f) => sum + f.detected, 0);
                    const uniqueSpecies = new Set(fishList.map(f => f.speciesId)).size;
                    const detectionRate = totalFish > 0 ? Math.round((totalDetected / totalFish) * 100) : 0;
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px 12px' }}>
                          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontWeight: 600 }}>TOTAL FISH</span>
                          <strong style={{ fontSize: '15px', color: '#FFF' }}>{totalFish}</strong>
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px 12px' }}>
                          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontWeight: 600 }}>SPECIES</span>
                          <strong style={{ fontSize: '15px', color: '#FFF' }}>{uniqueSpecies}</strong>
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px 12px' }}>
                          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontWeight: 600 }}>DETECTED</span>
                          <strong style={{ fontSize: '15px', color: 'var(--color-good)' }}>{totalDetected}</strong>
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '8px 12px' }}>
                          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontWeight: 600 }}>DETECTION</span>
                          <strong style={{ fontSize: '15px', color: 'var(--color-warning)' }}>{detectionRate}%</strong>
                        </div>
                      </div>
                    );
                  })()}

                  {/* List of Fish */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {fishList.map(fish => {
                      const display = getSpeciesDisplay(fish);
                      const visibilityPercent = fish.count > 0 ? Math.round((fish.detected / fish.count) * 100) : 0;
                      const barColor = visibilityPercent >= 80 ? '#16A34A' : visibilityPercent >= 50 ? '#D97706' : '#DC2626';
                      const radius = 12;
                      const circumference = 2 * Math.PI * radius;
                      const dashLength = (circumference * visibilityPercent) / 100;
                      const gapLength = circumference - dashLength;

                      return (
                        <div
                          key={fish.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '10px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                            <FishThumbnail imagePath={display.imagePath} initials={display.initials} color={display.color} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '13px', color: '#FFF', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {display.name}
                              </strong>
                              <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>
                                Seen: {fish.detected} / {fish.count}
                              </span>
                            </div>
                          </div>

                          {/* Small donut chart like in inventory */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
                            <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                              <svg width="28" height="28" viewBox="0 0 28 28" style={{ overflow: 'visible' }}>
                                <circle
                                  cx="14"
                                  cy="14"
                                  r={radius}
                                  fill="none"
                                  stroke="rgba(255, 255, 255, 0.1)"
                                  strokeWidth="3"
                                />
                                <circle
                                  cx="14"
                                  cy="14"
                                  r={radius}
                                  fill="none"
                                  stroke={barColor}
                                  strokeWidth="3"
                                  strokeDasharray={`${dashLength} ${gapLength}`}
                                  strokeLinecap="round"
                                  transform="rotate(-90 14 14)"
                                />
                              </svg>
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Eye size={10} color={barColor} />
                              </div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: barColor, minWidth: '30px', textAlign: 'right' }}>
                              {visibilityPercent}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom-left telemetry badges */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                display: 'flex',
                gap: '12px',
                zIndex: 10
              }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', color: '#FFF' }}>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>FISH COUNT</span>
                  <strong style={{ fontSize: '14px' }}>{stateFish} detected</strong>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '6px 12px', borderRadius: '12px', fontSize: '11px', color: '#FFF' }}>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block' }}>CLARITY</span>
                  <strong style={{ fontSize: '14px', color: 'var(--color-info)' }}>{stateClarity} / 10</strong>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>🎥</span>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
                Camera monitoring feed is idle. Tap start to connect to local RTSP stream.
              </p>
              <button className="primary-button" style={{ margin: '0 auto', padding: '10px 20px', fontSize: '14px' }} onClick={startStream}>
                Connect Stream
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stream Image Adjustments Card */}
      {isStreaming && !isGridView && (
        <div className="card-decoration" style={{
          padding: isAdjustmentsExpanded ? '24px' : '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: isAdjustmentsExpanded ? '20px' : '0px'
        }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              userSelect: 'none'
            }}
            onClick={() => setIsAdjustmentsExpanded(!isAdjustmentsExpanded)}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎨 Stream Image Adjustments</span>
              {!isAdjustmentsExpanded && selectedPresetId !== 'normal' && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary-dark)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  marginLeft: '8px'
                }}>
                  Active: {
                    [...DEFAULT_PRESETS, ...customPresets].find(p => p.id === selectedPresetId)?.name || 'Custom'
                  }
                </span>
              )}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
              {isAdjustmentsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {isAdjustmentsExpanded && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {/* Left Column - Adjustment Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0, borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                  TUNING SLIDERS
                </h4>

                {/* Contrast */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Contrast</span>
                    <span style={{ color: 'var(--color-primary)' }}>{filters.contrast}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="range" min="50" max="150" step="5"
                      value={filters.contrast}
                      onChange={(e) => handleFilterChange('contrast', parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                    />
                    <button
                      onClick={() => handleFilterChange('contrast', 100)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Brightness */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Brightness</span>
                    <span style={{ color: 'var(--color-primary)' }}>{filters.brightness}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="range" min="70" max="130" step="5"
                      value={filters.brightness}
                      onChange={(e) => handleFilterChange('brightness', parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                    />
                    <button
                      onClick={() => handleFilterChange('brightness', 100)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Saturation */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Saturation</span>
                    <span style={{ color: 'var(--color-primary)' }}>{filters.saturation}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="range" min="50" max="150" step="5"
                      value={filters.saturation}
                      onChange={(e) => handleFilterChange('saturation', parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                    />
                    <button
                      onClick={() => handleFilterChange('saturation', 100)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Temperature (Cool / Warm)</span>
                    <span style={{ color: 'var(--color-primary)' }}>
                      {filters.temperature > 0 ? `Warm (+${filters.temperature})` : filters.temperature < 0 ? `Cool (${filters.temperature})` : 'Neutral'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="range" min="-80" max="80" step="5"
                      value={filters.temperature}
                      onChange={(e) => handleFilterChange('temperature', parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                    />
                    <button
                      onClick={() => handleFilterChange('temperature', 0)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* Tint */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Tint (Green / Magenta)</span>
                    <span style={{ color: 'var(--color-primary)' }}>
                      {filters.tint > 0 ? `Magenta (+${filters.tint})` : filters.tint < 0 ? `Green (${filters.tint})` : 'Neutral'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="range" min="-80" max="80" step="5"
                      value={filters.tint}
                      onChange={(e) => handleFilterChange('tint', parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                    />
                    <button
                      onClick={() => handleFilterChange('tint', 0)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '10px' }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Presets Manager */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0, borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                  FILTER PRESETS
                </h4>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {DEFAULT_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className="secondary-button"
                      style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        borderRadius: '8px',
                        background: selectedPresetId === preset.id ? 'var(--color-primary-light)' : 'var(--color-surface)',
                        color: selectedPresetId === preset.id ? 'var(--color-primary-dark)' : 'var(--color-text-primary)',
                        borderColor: selectedPresetId === preset.id ? 'var(--color-primary)' : 'var(--color-border)',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}

                  {customPresets.map(preset => (
                    <div
                      key={preset.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}
                    >
                      <button
                        onClick={() => applyPreset(preset)}
                        className="secondary-button"
                        style={{
                          padding: '8px 24px 8px 12px',
                          fontSize: '12px',
                          borderRadius: '8px',
                          background: selectedPresetId === preset.id ? 'var(--color-primary-light)' : 'var(--color-surface)',
                          color: selectedPresetId === preset.id ? 'var(--color-primary-dark)' : 'var(--color-text-primary)',
                          borderColor: selectedPresetId === preset.id ? 'var(--color-primary)' : 'var(--color-border)',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={(e) => handleDeletePreset(preset.id, e)}
                        style={{
                          position: 'absolute',
                          right: '6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-critical)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '14px',
                          height: '14px',
                          padding: 0
                        }}
                        title="Delete Preset"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Save Preset Form */}
                {showSavePresetInput ? (
                  <form onSubmit={handleSavePreset} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <input
                      type="text"
                      placeholder="Preset Name..."
                      value={newPresetName}
                      onChange={e => setNewPresetName(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-main)',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                      maxLength={20}
                      required
                    />
                    <button
                      type="submit"
                      className="primary-button"
                      style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px' }}
                      onClick={() => { setShowSavePresetInput(false); setNewPresetName(''); }}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button
                    className="secondary-button"
                    style={{
                      alignSelf: 'flex-start',
                      padding: '8px 12px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowSavePresetInput(true)}
                  >
                    <Plus size={12} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ color: 'var(--color-primary-dark)' }}>Save Current as Preset</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Camera Modal Dialog */}
      {showAddCameraModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <form
            onSubmit={handleAddCamera}
            className="card-decoration"
            style={{
              padding: '24px',
              width: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>Add New Camera Feed</h3>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>CAMERA NAME</label>
              <input
                type="text"
                placeholder="e.g. Filter View"
                value={newCameraName}
                onChange={e => setNewCameraName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontFamily: 'var(--font-main)',
                  fontSize: '13px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>RTSP STREAM URL</label>
              <input
                type="text"
                placeholder="rtsp://oceaneyes.iot/..."
                value={newCameraUrl}
                onChange={e => setNewCameraUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontFamily: 'var(--font-main)',
                  fontSize: '13px',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="secondary-button"
                style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '10px' }}
                onClick={() => {
                  setShowAddCameraModal(false);
                  setNewCameraName('');
                  setNewCameraUrl('');
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button"
                style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '10px' }}
              >
                Add Camera
              </button>
            </div>
          </form>
        </div>
      )}

      {isStreaming && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button className="secondary-button" style={{ color: 'var(--color-critical)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={stopStream}>
            Close Camera Connection
          </button>

          <div className="card-decoration" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', margin: 0, color: 'var(--color-text-primary)' }}>
                <Ruler size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Water Calibration Level</span>
              </h4>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                padding: '2px 8px',
                borderRadius: '12px'
              }}>
                {currentPercentage}% Calibrated
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '140%', margin: 0 }}>
              {isCalibrating
                ? "Calibration Mode Active: Click and drag the dashed line directly in the camera viewport above to adjust the reference water line level."
                : "Enable drag calibration to align the camera's reference water line overlay with the physical water level inside this camera's feed."
              }
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                className={isCalibrating ? "primary-button" : "secondary-button"}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: isCalibrating ? 'var(--color-critical)' : undefined,
                  color: isCalibrating ? '#FFF' : undefined,
                  borderColor: isCalibrating ? 'var(--color-critical)' : undefined
                }}
                onClick={() => setIsCalibrating(!isCalibrating)}
              >
                {isCalibrating ? 'Done Calibrating' : 'Enable Drag Calibration'}
              </button>
              <button
                className="secondary-button"
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  borderRadius: '8px',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer'
                }}
                onClick={() => handleCalibrationChange(50)}
              >
                Reset to 50%
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Galleries Section */}
      {isStreaming && (snapshots.length > 0 || recordings.length > 0) && (
        <div className="camera-gallery-grid">
          {/* Snapshots Gallery */}
          <div className="gallery-section">
            <h3 className="gallery-title">
              <Camera size={18} />
              <span>Recent Snapshots ({snapshots.length})</span>
            </h3>
            <div className="gallery-list">
              {snapshots.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', padding: '12px' }}>
                  No snapshots captured.
                </p>
              ) : (
                snapshots.map(snap => (
                  <div key={snap.id} className="snapshot-card">
                    <div className="snapshot-thumb-container">
                      <img src={snap.imageUrl} alt="Snapshot" className="snapshot-thumb" />
                    </div>
                    <div className="snapshot-info">
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>
                          Captured at {snap.timestamp}
                        </span>
                        <strong style={{ fontSize: '13px', display: 'block', marginTop: '2px', color: 'var(--color-text-primary)' }}>
                          {snap.fishCount} Fish Detected
                        </strong>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>
                          Clarity score: {snap.clarity}/10
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button
                          className="secondary-button"
                          style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => downloadSnapshot(snap)}
                        >
                          <Download size={12} /> Download
                        </button>
                        <button
                          className="secondary-button"
                          style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '8px', color: 'var(--color-critical)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
                          onClick={() => deleteSnapshot(snap.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recordings List */}
          <div className="gallery-section">
            <h3 className="gallery-title">
              <Video size={18} />
              <span>Recent Recordings ({recordings.length})</span>
            </h3>
            <div className="gallery-list">
              {recordings.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', padding: '12px' }}>
                  No video recordings saved.
                </p>
              ) : (
                recordings.map(rec => (
                  <div key={rec.id} className="recording-card">
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block' }}>
                        Recorded at {rec.timestamp}
                      </span>
                      <strong style={{ fontSize: '13px', display: 'block', marginTop: '2px', color: 'var(--color-text-primary)' }}>
                        Duration: {formatTime(rec.duration)}
                      </strong>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        {rec.fishCount} fish | Clarity: {rec.clarity}/10
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="secondary-button"
                        style={{ padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => downloadRecording(rec)}
                        title="Download Telemetry Log"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        className="secondary-button"
                        style={{ padding: '6px', borderRadius: '8px', color: 'var(--color-critical)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
                        onClick={() => deleteRecording(rec.id)}
                        title="Delete Recording"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
