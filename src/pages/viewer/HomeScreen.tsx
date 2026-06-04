import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MockFirestore } from '../../services/mock_service';
import { 
  AlertTriangle, 
  Droplet, 
  Thermometer, 
  Shield, 
  Activity, 
  Plus, 
  Video, 
  ChevronRight 
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const { 
    activeTank, 
    readings, 
    fishList, 
    alerts, 
    setActiveTab, 
    setSelectedAlertId, 
    liveState, 
    tanks, 
    linkedTanks, 
    tankId, 
    selectTank, 
    createAndLinkTank, 
    linkTank 
  } = useApp();

  const [showAddTankModal, setShowAddTankModal] = useState(false);
  const [newTankName, setNewTankName] = useState('');
  const [linkTankCode, setLinkTankCode] = useState('');
  const [addMode, setAddMode] = useState<'create' | 'link'>('create');
  const [addError, setAddError] = useState('');

  const handleAddTankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (addMode === 'create') {
      if (!newTankName.trim()) return;
      try {
        await createAndLinkTank(newTankName.trim());
        setNewTankName('');
        setShowAddTankModal(false);
      } catch {
        setAddError('Failed to create tank.');
      }
    } else {
      if (!linkTankCode.trim()) return;
      const success = await linkTank(linkTankCode.trim());
      if (success) {
        setLinkTankCode('');
        setShowAddTankModal(false);
      } else {
        setAddError('Invalid reference code or tank already linked.');
      }
    }
  };

  const latestReading = readings[0] || {
    clarity: 7.8,
    fish_count: 10,
    ph: 7.2,
    temp: 26.1,
    ammonia: 0,
    nitrite: 0.1
  };

  const feeds = liveState?.feeds || [];
  const activeFeed = feeds.find(f => f.id === liveState?.selected_feed_id) || feeds[0] || {
    id: 'feed-main',
    name: 'Main View',
    stream_url: 'rtsp://oceaneyes.iot/live-stream-09',
    is_live: false,
    started_at: null,
    current_clarity: 7.8,
    current_fish_count: 10,
    mock_image: '/mock_camera_main.png'
  };

  const displayClarity = liveState?.is_live ? activeFeed.current_clarity : latestReading.clarity;
  const displayFishCount = liveState?.is_live ? activeFeed.current_fish_count : latestReading.fish_count;

  // Start stream helper
  const startStream = () => {
    if (activeTank && liveState) {
      const updatedFeeds = liveState.feeds.map(f => ({
        ...f,
        is_live: true,
        started_at: f.started_at || new Date().toISOString()
      }));
      const active = updatedFeeds.find(f => f.id === liveState.selected_feed_id) || updatedFeeds[0];
      MockFirestore.saveLiveState(activeTank.id, {
        ...liveState,
        is_live: true,
        stream_url: active.stream_url,
        started_at: active.started_at || new Date().toISOString(),
        last_ping_at: new Date().toISOString(),
        current_clarity: active.current_clarity,
        current_fish_count: active.current_fish_count,
        feeds: updatedFeeds
      });
    }
  };

  // Stop stream helper
  const stopStream = () => {
    if (activeTank && liveState) {
      const updatedFeeds = liveState.feeds.map(f => ({
        ...f,
        is_live: false,
        started_at: null
      }));
      MockFirestore.saveLiveState(activeTank.id, {
        ...liveState,
        is_live: false,
        stream_url: '',
        started_at: null,
        last_ping_at: null,
        current_clarity: 0,
        current_fish_count: 0,
        feeds: updatedFeeds
      });
    }
  };

  // Health calculation representing Dart logic: pH, clarity, ammonia, nitrite weighting
  const healthScore = parseFloat((
    Math.max(1, 10 - (Math.abs(7.2 - latestReading.ph) * 4) - (10 - displayClarity) * 0.4 - (latestReading.ammonia * 20) - (latestReading.nitrite * 3))
  ).toFixed(1));

  // Determine health color rating
  const getHealthColor = (score: number) => {
    if (score >= 8) return 'var(--color-good)';
    if (score >= 6) return 'var(--color-warning)';
    return 'var(--color-critical)';
  };

  const activeAlertCount = alerts.filter(a => !a.resolved).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ─── Header ─── */}
      <div className="canvas-header">
        <div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>My Aquarium</span>
          {linkedTanks.length > 1 ? (
            <select
              value={tankId || ''}
              onChange={(e) => {
                if (e.target.value === 'add-new-tank-action') {
                  setShowAddTankModal(true);
                  e.target.value = tankId || '';
                } else {
                  selectTank(e.target.value);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-main)',
                fontSize: '28px',
                fontWeight: 800,
                outline: 'none',
                cursor: 'pointer',
                padding: 0,
                marginTop: '2px',
                maxWidth: '100%',
                display: 'block'
              }}
            >
              {tanks.filter(t => linkedTanks.includes(t.id)).map(t => (
                <option key={t.id} value={t.id} style={{ fontSize: '14px', fontWeight: 600, backgroundColor: 'var(--color-surface)' }}>
                  {t.name}
                </option>
              ))}
              <option value="add-new-tank-action" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)', backgroundColor: 'var(--color-surface)' }}>
                + Add Tank...
              </option>
            </select>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 className="canvas-title" style={{ marginTop: '2px', display: 'inline-block' }}>{activeTank?.name || 'Living Room Reef'}</h1>
              <button 
                className="secondary-button" 
                style={{ padding: '4px 8px', fontSize: '11px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', borderColor: 'var(--color-primary)' }}
                onClick={() => setShowAddTankModal(true)}
              >
                <Plus size={10} style={{ color: 'var(--color-primary)' }} />
                <span style={{ color: 'var(--color-primary-dark)' }}>Add Tank</span>
              </button>
            </div>
          )}
        </div>
        
        {activeAlertCount > 0 && (
          <button 
            onClick={() => setActiveTab('alerts')}
            style={{
              background: 'none',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              color: 'var(--color-warning)',
              display: 'flex',
              padding: '6px'
            }}
          >
            <AlertTriangle size={24} />
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-critical)',
              border: '2px solid var(--color-surface)'
            }} />
          </button>
        )}
      </div>

      {/* ─── Main Desktop Grid Split ─── */}
      <div className="dashboard-grid">
        {/* Left Column (Main Diagnostics) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Health Card */}
          <div className="card-decoration" style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '24px' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
              <svg style={{ position: 'absolute', transform: 'rotate(-90deg)', width: '90px', height: '90px' }}>
                <circle cx="45" cy="45" r="38" stroke="var(--color-background)" strokeWidth="8" fill="none" />
                <circle 
                  cx="45" 
                  cy="45" 
                  r="38" 
                  stroke={getHealthColor(healthScore)} 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={(2 * Math.PI * 38) * (1 - healthScore / 10)}
                  strokeLinecap="round"
                  style={{ transition: 'var(--transition-smooth)' }}
                />
              </svg>
              <div style={{ textAlign: 'center', zIndex: 5 }}>
                <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{healthScore}</span>
                <span style={{ fontSize: '11px', display: 'block', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '-4px' }}>Score</span>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Aquarium Health Index</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: '145%' }}>
                {healthScore >= 8 
                  ? 'All core parameters (clarity, temperature, pH, ammonia, nitrite) are in excellent safe bands. System is functioning optimally.' 
                  : healthScore >= 6 
                    ? 'Mild parameter fluctuations detected. Observe filters and run water test diagnostics closely.' 
                    : 'Critical metric violation! Immediate action required to check filter sponge and adjust tank chemistry.'}
              </p>
            </div>
          </div>

          {/* Water Chemistry Grid */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>Water Chemistry Parameters</h3>
            <div className="chemistry-grid">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.015)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EFF6FF', color: 'var(--color-info)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <Droplet size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', fontWeight: 600 }}>pH Value</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{latestReading.ph} pH</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.015)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FFF7ED', color: 'var(--color-warning)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <Thermometer size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', fontWeight: 600 }}>Temperature</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{latestReading.temp}°C</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.015)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#F0FDF4', color: 'var(--color-good)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <Shield size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', fontWeight: 600 }}>Ammonia (NH₃)</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: latestReading.ammonia > 0 ? 'var(--color-critical)' : 'var(--color-text-primary)' }}>
                    {latestReading.ammonia} ppm
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--color-surface)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.015)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FAF5FF', color: '#8B5CF6', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                  <Activity size={18} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', fontWeight: 600 }}>Nitrite (NO₂⁻)</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: latestReading.nitrite > 0.2 ? 'var(--color-critical)' : 'var(--color-text-primary)' }}>
                    {latestReading.nitrite} ppm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fish Inventory list */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Fish Inventory Summary</span>
              <button 
                onClick={() => setActiveTab('my_fish')}
                style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)' }}
              >
                Manage list
              </button>
            </h3>
            
            <div className="card-decoration" style={{ padding: '4px 20px' }}>
              {fishList.map((fish, idx) => (
                <div 
                  key={fish.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '14px 0',
                    borderBottom: idx === fishList.length - 1 ? 'none' : '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{fish.emoji}</span>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{fish.name}</span>
                      <span style={{ fontSize: '11px', display: 'block', color: 'var(--color-text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                        Expected: {fish.count} species limit
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '11px',
                      backgroundColor: fish.detected === fish.count ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: fish.detected === fish.count ? 'var(--color-good)' : 'var(--color-critical)',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontWeight: 600
                    }}>
                      {fish.detected === fish.count ? 'All Visible' : `${fish.detected} / ${fish.count} detected`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Side Stats & Alerts) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Key Metrics Dashboard cards */}
          <div className="metrics-row" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Water Clarity Metric Card */}
            <div className="card-decoration" style={{ display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer', flex: 1 }} onClick={() => setActiveTab('history')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Water Clarity</span>
                <Droplet size={18} style={{ color: 'var(--color-info)' }} />
              </div>
              <div>
                <span style={{ fontSize: '24px', fontWeight: 800 }}>{displayClarity.toFixed(1)}</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginLeft: '4px' }}>/10 score</span>
              </div>
              {/* Mini Sparkline Chart representing historical clarity */}
              <div style={{ height: '24px', marginTop: '6px' }}>
                <svg width="100%" height="24" style={{ overflow: 'visible' }}>
                  <polyline
                    fill="none"
                    stroke="var(--color-info)"
                    strokeWidth="2"
                    points="0,20 30,18 60,22 90,15 120,17 150,10 180,8 210,12"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Fish Count Metric Card */}
            <div className="card-decoration" style={{ display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer', flex: 1 }} onClick={() => setActiveTab('my_fish')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Camera Visualizer</span>
                <span style={{ fontSize: '18px' }}>🐟</span>
              </div>
              <div>
                <span style={{ fontSize: '24px', fontWeight: 800 }}>{displayFishCount}</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginLeft: '4px' }}>fish visible</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '8px' }}>
                Expected Target: {fishList.reduce((sum, f) => sum + f.count, 0)} species count
              </span>
            </div>
          </div>

          {/* Live Monitor Viewport Card */}
          <div className="card-decoration" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Video size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Live Feed Monitor</span>
              </h3>
              
              {feeds.length > 0 && (
                <select
                  value={activeFeed.id}
                  onChange={(e) => {
                    if (activeTank) {
                      MockFirestore.switchActiveFeed(activeTank.id, e.target.value);
                    }
                  }}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-main)',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {feeds.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Viewport Frame */}
            <div 
              className="live-camera-feed"
              style={{
                aspectRatio: '16 / 9',
                position: 'relative',
                width: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)'
              }}
            >
              {liveState?.is_live ? (
                <>
                  {/* Grid Lines */}
                  <div className="camera-grid" />

                  {/* Aquatic Render */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: activeFeed.mock_image ? `url(${activeFeed.mock_image})` : 'linear-gradient(180deg, #0F766E 0%, #115E59 50%, #134E4A 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'absolute',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '24px', opacity: 0.2 }}>🌿</div>
                    <div style={{ position: 'absolute', bottom: '15%', right: '12%', fontSize: '32px', opacity: 0.25 }}>🍀</div>
                  </div>

                  {/* Overlays */}
                  <div className="live-overlay-pill" style={{ left: '8px', top: '8px', padding: '3px 6px', fontSize: '9px' }}>
                    <div className="live-badge" />
                    <span>{activeFeed.name}</span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    display: 'flex',
                    gap: '6px',
                    zIndex: 10
                  }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '3px 6px', borderRadius: '6px', fontSize: '9px', color: '#FFF' }}>
                      <strong>{displayFishCount} fish</strong>
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.85)', padding: '3px 6px', borderRadius: '6px', fontSize: '9px', color: '#FFF' }}>
                      <strong style={{ color: 'var(--color-info)' }}>{displayClarity.toFixed(1)} score</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px' }}>
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>🎥</span>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', margin: '0 0 10px 0' }}>
                    Feed is idle. Connect stream to monitor.
                  </p>
                  <button 
                    className="primary-button" 
                    style={{ padding: '6px 12px', fontSize: '12px', margin: '0 auto' }} 
                    onClick={startStream}
                  >
                    Connect Stream
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {liveState?.is_live && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                <button 
                  className="secondary-button" 
                  style={{ flex: 1, padding: '8px', fontSize: '12px', borderRadius: '8px', color: 'var(--color-critical)' }}
                  onClick={stopStream}
                >
                  Disconnect Stream
                </button>
                <button 
                  className="primary-button" 
                  style={{ flex: 1, padding: '8px', fontSize: '12px', borderRadius: '8px' }}
                  onClick={() => setActiveTab('live')}
                >
                  Advanced Controls
                </button>
              </div>
            )}
          </div>

          {/* Active Alerts section */}
          {alerts.filter(a => !a.resolved).length > 0 ? (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                Active Safety Alerts
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.filter(a => !a.resolved).map(alert => (
                  <div 
                    key={alert.id} 
                    className="card-decoration" 
                    style={{ 
                      padding: '16px', 
                      borderLeft: `4px solid ${alert.severity === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)'}`,
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setSelectedAlertId(alert.id);
                      setActiveTab('settings'); // Settings contains full details
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{alert.title}</h4>
                      <ChevronRight size={16} style={{ color: 'var(--color-text-secondary)' }} />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '135%' }}>
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card-decoration" style={{ textAlign: 'center', padding: '32px 16px', border: '1px dashed var(--color-border)' }}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>✓</span>
              <strong style={{ fontSize: '14px', color: 'var(--color-good)' }}>System Operating Safely</strong>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>No active safety alarms triggered.</p>
            </div>
          )}

          {/* Connected Camera Feeds widget */}
          {liveState && liveState.feeds && (
            <div style={{ marginTop: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Connected Feeds ({liveState.feeds.length})</span>
                <button 
                  onClick={() => setActiveTab('live')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)' }}
                >
                  Configure
                </button>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {liveState.feeds.map(feed => (
                  <div 
                    key={feed.id} 
                    className="card-decoration" 
                    style={{ 
                      padding: '12px 16px', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderLeft: feed.id === liveState.selected_feed_id ? '4px solid var(--color-primary)' : '1px solid var(--color-border)',
                      boxShadow: 'var(--shadow-card)'
                    }}
                    onClick={() => {
                      if (activeTank) {
                        MockFirestore.switchActiveFeed(activeTank.id, feed.id);
                        setActiveTab('live');
                      }
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{feed.name}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {feed.stream_url}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {liveState.is_live ? (
                        <>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                            🐟 {feed.current_fish_count} · 💧 {feed.current_clarity}
                          </span>
                          <span className="live-badge" style={{ animation: 'pulse 1.5s infinite', margin: 0 }} />
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>Offline</span>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-text-secondary)' }} />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Tank Modal */}
      {showAddTankModal && (
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
            onSubmit={handleAddTankSubmit}
            className="card-decoration" 
            style={{ 
              padding: '24px', 
              width: '380px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>Add Aquarium Tank</h3>
            
            {/* Toggle between Create & Link */}
            <div style={{ display: 'flex', background: 'var(--color-border)', padding: '2px', borderRadius: '10px', gap: '2px' }}>
              <button
                type="button"
                onClick={() => { setAddMode('create'); setAddError(''); }}
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: addMode === 'create' ? 'var(--color-surface)' : 'transparent',
                  color: addMode === 'create' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Create New Tank
              </button>
              <button
                type="button"
                onClick={() => { setAddMode('link'); setAddError(''); }}
                style={{
                  flex: 1,
                  padding: '6px',
                  fontSize: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  background: addMode === 'link' ? 'var(--color-surface)' : 'transparent',
                  color: addMode === 'link' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Link Existing Tank
              </button>
            </div>

            {addError && (
              <div style={{ color: 'var(--color-critical)', fontSize: '12px', fontWeight: 500 }}>
                ⚠️ {addError}
              </div>
            )}

            {addMode === 'create' ? (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>AQUARIUM NAME</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bedroom Reef" 
                  value={newTankName}
                  onChange={e => setNewTankName(e.target.value)}
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
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>TANK REFERENCE ID / CODE</label>
                <input 
                  type="text" 
                  placeholder="e.g. tank-123456" 
                  value={linkTankCode}
                  onChange={e => setLinkTankCode(e.target.value)}
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
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button 
                type="button"
                className="secondary-button" 
                style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '10px' }}
                onClick={() => {
                  setShowAddTankModal(false);
                  setNewTankName('');
                  setLinkTankCode('');
                  setAddError('');
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="primary-button" 
                style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '10px' }}
              >
                {addMode === 'create' ? 'Create Tank' : 'Link Tank'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
