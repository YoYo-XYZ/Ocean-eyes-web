// ViewerApp.tsx - Recreating Flutter UI screens for the Mobile Viewer Portal
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MockFirestore } from '../services/mock_service';
import { 
  AlertTriangle, 
  Activity, 
  Plus, 
  Check, 
  Trash2, 
  ChevronRight, 
  RefreshCw,
  QrCode,
  Droplet,
  Thermometer,
  Shield,
  Clock
} from 'lucide-react'; // Elegant modern icons representing Material equivalents

export const ViewerApp: React.FC = () => {
  const { tankId } = useApp();

  return (
    <div className="scaffold">
      {tankId === null ? <RootGateOnboarding /> : <ViewerShell />}
    </div>
  );
};

// ─── Onboarding Page (_RootGate & QrScanScreen equivalent) ───
const RootGateOnboarding: React.FC = () => {
  const { linkTank, createAndLinkTank } = useApp();
  const [qrInput, setQrInput] = useState('');
  const [tankName, setTankName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;
    const success = await linkTank(qrInput.trim());
    if (success) {
      setError('');
    } else {
      setError('Tank ID not found. Verify the ID or create a new one.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tankName.trim()) return;
    await createAndLinkTank(tankName.trim());
    setTankName('');
  };

  return (
    <div style={{ padding: '60px 24px 24px 24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }} className="anim-float-1">
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '24px',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: '0 auto 16px auto',
          boxShadow: '0 8px 24px rgba(13, 148, 136, 0.15)'
        }}>
          <QrCode size={36} />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Link Your Aquarium</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '145%' }}>
          Scan the QR code displayed on your OceanEyes smart monitoring hardware unit or enter the code manually.
        </p>
      </div>

      {!showCreate ? (
        <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Enter Tank ID (e.g. living-room-tank-77)" 
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-main)',
                fontSize: '15px',
                outline: 'none',
                transition: 'var(--transition-smooth)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          {error && <p style={{ color: 'var(--color-critical)', fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>{error}</p>}

          <button type="submit" className="primary-button" style={{ width: '100%' }}>
            Link Tank
          </button>

          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>or</span>
          </div>

          <button 
            type="button" 
            className="secondary-button" 
            style={{ width: '100%', borderRadius: '24px' }}
            onClick={() => {
              // Quick mock link
              linkTank('living-room-tank-77');
            }}
          >
            Link Demo Tank (Living Room Reef)
          </button>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            No hardware?{' '}
            <button 
              type="button" 
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)' }}
              onClick={() => setShowCreate(true)}
            >
              Create virtual tank
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="Virtual Tank Name (e.g. My Bedroom Reef)" 
            value={tankName}
            onChange={(e) => setTankName(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              fontFamily: 'var(--font-main)',
              fontSize: '15px',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
          />

          <button type="submit" className="primary-button" style={{ width: '100%' }}>
            Create Virtual Tank
          </button>

          <button 
            type="button" 
            className="secondary-button" 
            style={{ width: '100%', borderRadius: '24px' }}
            onClick={() => setShowCreate(false)}
          >
            Back to Linking
          </button>
        </form>
      )}
    </div>
  );
};

// ─── Main Shell Component (ViewerShell equivalent) ───
const ViewerShell: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'live':
        return <LiveScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'alerts':
        return <AlertsScreen />;
      case 'history':
        return <HistoryDetailScreen />;
      case 'my_fish':
        return <MyFishScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {renderActiveScreen()}
    </div>
  );
};

// ─── HomeScreen Component ───
const HomeScreen: React.FC = () => {
  const { activeTank, readings, fishList, alerts, setActiveTab, setSelectedAlertId } = useApp();

  const latestReading = readings[0] || {
    clarity: 7.8,
    fish_count: 10,
    ph: 7.2,
    temp: 26.1,
    ammonia: 0,
    nitrite: 0.1
  };

  // Health calculation representing Dart logic: pH, clarity, ammonia, nitrite weighting
  const healthScore = parseFloat((
    Math.max(1, 10 - (Math.abs(7.2 - latestReading.ph) * 4) - (10 - latestReading.clarity) * 0.4 - (latestReading.ammonia * 20) - (latestReading.nitrite * 3))
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
          <h1 className="canvas-title" style={{ marginTop: '2px' }}>{activeTank?.name || 'Living Room Reef'}</h1>
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
                <span style={{ fontSize: '24px', fontWeight: 800 }}>{latestReading.clarity}</span>
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
                <span style={{ fontSize: '24px', fontWeight: 800 }}>{latestReading.fish_count}</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginLeft: '4px' }}>fish visible</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '8px' }}>
                Expected Target: {fishList.reduce((sum, f) => sum + f.count, 0)} species count
              </span>
            </div>
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
        </div>
      </div>
    </div>
  );
};

// ─── LiveScreen Component ───
const LiveScreen: React.FC = () => {
  const { liveState, activeTank, triggerManualReading } = useApp();
  const [isStreaming, setIsStreaming] = useState(false);

  const startStream = () => {
    setIsStreaming(true);
    // Notify live state change
    if (activeTank) {
      const key = `live_state_${activeTank.id}`;
      localStorage.setItem(key, JSON.stringify({
        is_live: true,
        stream_url: 'rtsp://oceaneyes.iot/live-stream-09',
        started_at: new Date().toISOString(),
        last_ping_at: new Date().toISOString(),
        current_clarity: 7.8,
        current_fish_count: 10
      }));
      window.dispatchEvent(new CustomEvent('oceaneyes_db_update'));
    }
  };

  const stopStream = () => {
    setIsStreaming(false);
    if (activeTank) {
      const key = `live_state_${activeTank.id}`;
      localStorage.setItem(key, JSON.stringify({
        is_live: false,
        stream_url: '',
        started_at: null,
        last_ping_at: null,
        current_clarity: 0,
        current_fish_count: 0
      }));
      window.dispatchEvent(new CustomEvent('oceaneyes_db_update'));
    }
  };

  // Re-read from active context live state
  const stateClarity = isStreaming && liveState?.is_live ? liveState.current_clarity : 0;
  const stateFish = isStreaming && liveState?.is_live ? liveState.current_fish_count : 0;

  return (
    <div style={{ padding: '0 20px 30px 20px' }}>
      <div className="canvas-header" style={{ marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Camera Monitor</span>
          <h1 className="canvas-title" style={{ marginTop: '2px' }}>Live Video Stream</h1>
        </div>
      </div>

      {/* Simulated Video Frame */}
      <div className="live-camera-feed" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {isStreaming ? (
          <>
            {/* Live Camera Grid Lines */}
            <div className="camera-grid" />
            <div className="camera-scanline" />

            {/* Simulated Live Stream Feed - Aquatic Render */}
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #0F766E 0%, #115E59 50%, #134E4A 100%)',
              position: 'absolute',
              overflow: 'hidden'
            }}>
              {/* Aquatic Floating Plants */}
              <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '48px', opacity: 0.15 }} className="anim-float-1">🌿</div>
              <div style={{ position: 'absolute', bottom: '15%', right: '12%', fontSize: '64px', opacity: 0.2 }} className="anim-float-2">🍀</div>

              {/* Animated Floating Fish Representing Detected Species */}
              <div style={{ position: 'absolute', top: '35%', left: '30%', fontSize: '32px' }} className="anim-float-1">🐟</div>
              <div style={{ position: 'absolute', top: '55%', right: '25%', fontSize: '28px' }} className="anim-float-2">🐠</div>
              <div style={{ position: 'absolute', bottom: '30%', left: '40%', fontSize: '36px' }} className="anim-float-2">🐡</div>

              {/* Water Wave Line Overlay representing Calibration */}
              {activeTank?.calibration && (
                <div style={{
                  position: 'absolute',
                  top: `${Math.min(95, Math.max(5, (activeTank.calibration.water_line_y / 240) * 100))}%`,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  borderTop: '2px dashed rgba(255,255,255,0.4)',
                  zIndex: 10
                }}>
                  <span style={{
                    position: 'absolute',
                    right: '10px',
                    top: '-18px',
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.6)',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>
                    CALIBRATED LINE
                  </span>
                </div>
              )}
            </div>

            {/* Badges overlay */}
            <div className="live-overlay-pill" style={{ left: '12px' }}>
              <div className="live-badge" />
              <span>LIVE CAM</span>
            </div>

            <div className="live-overlay-pill" style={{ right: '12px' }}>
              <span>FPS: 30</span>
            </div>

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

      {isStreaming && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button className="secondary-button" style={{ color: 'var(--color-critical)', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={stopStream}>
            Close Camera Connection
          </button>

          <div className="card-decoration" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} />
              <span>Simulated Stream Diagnostics</span>
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '140%' }}>
              This simulates an active stream connection. In the background, the IoT Monitor reads the water levels and syncs data to Firestore in real time.
            </p>
            <button 
              className="primary-button" 
              style={{ padding: '8px 12px', fontSize: '12px', marginTop: '4px', borderRadius: '16px' }}
              onClick={triggerManualReading}
            >
              <RefreshCw size={12} /> Force New Metric Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SettingsScreen Component ───
const SettingsScreen: React.FC = () => {
  const { activeTank, unlinkTank, updateTankName, setActiveTab } = useApp();
  const [name, setName] = useState(activeTank?.name || 'Living Room Reef');
  const [editing, setEditing] = useState(false);

  const handleNameChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateTankName(name.trim());
    setEditing(false);
  };

  return (
    <div style={{ padding: '0 20px 30px 20px' }}>
      <div className="canvas-header" style={{ marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Control Panel</span>
          <h1 className="canvas-title" style={{ marginTop: '2px' }}>Tank Settings</h1>
        </div>
      </div>

      {/* Tank Identity */}
      <div className="card-decoration" style={{ padding: '20px', marginBottom: '20px' }}>
        {editing ? (
          <form onSubmit={handleNameChange} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                outline: 'none',
                fontFamily: 'var(--font-main)'
              }}
            />
            <button className="primary-button" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px' }} type="submit">
              Save
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Tank Name</span>
              <strong style={{ fontSize: '18px', display: 'block', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {activeTank?.name}
              </strong>
            </div>
            <button 
              className="secondary-button" 
              style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '12px' }}
              onClick={() => setEditing(true)}
            >
              Rename
            </button>
          </div>
        )}

        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <span>Tank Reference Code: </span>
          <code style={{ fontSize: '11px', padding: '2px 6px', display: 'inline-block', verticalAlign: 'middle', marginLeft: '4px' }}>
            {activeTank?.id}
          </code>
        </div>
      </div>

      {/* Menu Options */}
      <div className="card-decoration" style={{ padding: '4px 16px', marginBottom: '20px' }}>
        <div 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
          onClick={() => setActiveTab('my_fish')}
        >
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Manage Fish Inventory</span>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </div>

        <div 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}
          onClick={() => setActiveTab('history')}
        >
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Water Clarity Reports</span>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </div>

        <div 
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', cursor: 'pointer' }}
          onClick={() => setActiveTab('alerts')}
        >
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Safety Alert Logs</span>
          <ChevronRight size={18} style={{ color: 'var(--color-text-secondary)' }} />
        </div>
      </div>

      {/* Safety Threshold Settings Slider equivalent */}
      <div className="card-decoration" style={{ padding: '20px', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>Safety Boundaries & Notification Thresholds</h4>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Minimum Water Clarity</span>
            <strong style={{ color: 'var(--color-primary)' }}>{activeTank?.thresholds.clarity_min || 6.0} / 10</strong>
          </div>
          <input 
            type="range" 
            min="4.0" 
            max="8.0" 
            step="0.5" 
            value={activeTank?.thresholds.clarity_min || 6.0} 
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              const fishPct = activeTank?.thresholds.fish_change_pct || 50.0;
              MockFirestore.updateThresholds(activeTank!.id, val, fishPct);
              window.dispatchEvent(new CustomEvent('oceaneyes_db_update'));
            }}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Discrepancy Alarm Trigger</span>
            <strong style={{ color: 'var(--color-primary)' }}>{activeTank?.thresholds.fish_change_pct || 50.0}% visibility</strong>
          </div>
          <input 
            type="range" 
            min="20" 
            max="80" 
            step="10" 
            value={activeTank?.thresholds.fish_change_pct || 50.0} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              const clar = activeTank?.thresholds.clarity_min || 6.0;
              MockFirestore.updateThresholds(activeTank!.id, clar, val);
              window.dispatchEvent(new CustomEvent('oceaneyes_db_update'));
            }}
            style={{ width: '100%', accentColor: 'var(--color-primary)' }}
          />
        </div>
      </div>

      {/* Disconnect button */}
      <button 
        className="secondary-button" 
        style={{ width: '100%', color: 'var(--color-critical)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '14px' }}
        onClick={unlinkTank}
      >
        Disconnect from Tank
      </button>
    </div>
  );
};

// ─── AlertsScreen Component ───
const AlertsScreen: React.FC = () => {
  const { alerts, resolveAlert, setActiveTab, selectedAlertId, setSelectedAlertId } = useApp();

  const handleBack = () => {
    setSelectedAlertId(null);
    setActiveTab('home');
  };

  const selectedAlert = alerts.find(a => a.id === selectedAlertId);

  // If an alert is selected, render alert details (representing alert_detail_screen.dart)
  if (selectedAlert) {
    return (
      <div style={{ padding: '0 20px 30px 20px' }}>
        <div className="canvas-header" style={{ marginBottom: '24px' }}>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)' }}
            onClick={() => setSelectedAlertId(null)}
          >
            ← Back
          </button>
          <h1 className="canvas-title" style={{ fontSize: '20px' }}>Alert Diagnostics</h1>
          <div style={{ width: '40px' }} />
        </div>

        <div className="card-decoration" style={{ padding: '24px', marginBottom: '20px', borderLeft: `6px solid ${selectedAlert.severity === 'critical' ? 'var(--color-critical)' : 'var(--color-warning)'}` }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{selectedAlert.title}</h2>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>{selectedAlert.timeAgo}</p>
          
          <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginTop: '16px', lineHeight: '150%' }}>
            {selectedAlert.message}
          </p>
        </div>

        {/* Diagnostic parameters before/after */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {selectedAlert.clarityBefore && (
            <div className="card-decoration" style={{ padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block' }}>Clarity Shift</span>
              <strong style={{ fontSize: '20px', display: 'block', marginTop: '6px' }}>
                {selectedAlert.clarityBefore} → {selectedAlert.clarityAfter}
              </strong>
            </div>
          )}

          {selectedAlert.fishBefore && (
            <div className="card-decoration" style={{ padding: '16px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'block' }}>Fish Discrepancy</span>
              <strong style={{ fontSize: '20px', display: 'block', marginTop: '6px' }}>
                {selectedAlert.fishBefore} → {selectedAlert.fishAfter}
              </strong>
            </div>
          )}
        </div>

        {/* Correction tip card */}
        <div className="card-decoration" style={{ padding: '20px', marginBottom: '24px', backgroundColor: '#F8FAFC' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Action Plan & Tips</h4>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '145%' }}>
            {selectedAlert.tip}
          </p>
        </div>

        {!selectedAlert.resolved ? (
          <button 
            className="primary-button" 
            style={{ width: '100%', padding: '14px' }}
            onClick={() => {
              resolveAlert(selectedAlert.id);
              setSelectedAlertId(null);
            }}
          >
            <Check size={18} /> Mark Alert as Resolved
          </button>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-good)', borderRadius: '16px', fontWeight: 600 }}>
            ✓ Resolved Alert
          </div>
        )}
      </div>
    );
  }

  // Alerts Log List
  return (
    <div style={{ padding: '0 20px 30px 20px' }}>
      <div className="canvas-header" style={{ marginBottom: '24px' }}>
        <button 
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)' }}
          onClick={handleBack}
        >
          ← Back
        </button>
        <h1 className="canvas-title" style={{ fontSize: '24px' }}>Safety Alerts</h1>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            className="card-decoration" 
            style={{ 
              padding: '16px', 
              borderLeft: `5px solid ${
                alert.resolved 
                  ? 'var(--color-good)' 
                  : alert.severity === 'critical' 
                    ? 'var(--color-critical)' 
                    : 'var(--color-warning)'
              }`,
              opacity: alert.resolved ? 0.6 : 1,
              cursor: 'pointer'
            }}
            onClick={() => setSelectedAlertId(alert.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{alert.title}</h4>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{alert.timeAgo}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {alert.message}
            </p>
            {alert.resolved && (
              <span style={{ fontSize: '10px', color: 'var(--color-good)', fontWeight: 600, marginTop: '8px', display: 'block' }}>
                ✓ RESOLVED
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── HistoryDetailScreen Component ───
const HistoryDetailScreen: React.FC = () => {
  const { readings, setActiveTab } = useApp();

  // Draw a beautiful custom SVG area chart representing historical clarity values
  const drawClarityChart = () => {
    if (readings.length === 0) return null;
    const history = [...readings].reverse().slice(-7); // Reverse so oldest is left, last 7 entries
    const width = 310;
    const height = 120;
    const maxVal = 10;
    const minVal = 0;
    const padding = 15;
    
    const points = history.map((r, idx) => {
      const x = padding + (idx * (width - 2 * padding) / (history.length - 1));
      const y = height - padding - ((r.clarity - minVal) * (height - 2 * padding) / (maxVal - minVal));
      return { x, y, clarity: r.clarity, time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    });

    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
    
    // Fill area below chart
    const areaPoints = `${points[0].x},${height - padding} ${polylinePoints} ${points[points.length - 1].x},${height - padding}`;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {/* Horizontal grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--color-border)" strokeWidth="1" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
        
        {/* Filled Area */}
        <polygon points={areaPoints} fill="url(#chartGrad)" />

        {/* Main Line */}
        <polyline fill="none" stroke="var(--color-info)" strokeWidth="3" points={polylinePoints} strokeLinecap="round" />

        {/* Data points dots */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--color-info)" stroke="#FFFFFF" strokeWidth="2" />
            <text x={p.x} y={p.y - 8} fontSize="8" fontWeight="600" textAnchor="middle" fill="var(--color-text-primary)">
              {p.clarity}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div style={{ padding: '0 20px 30px 20px' }}>
      <div className="canvas-header" style={{ marginBottom: '24px' }}>
        <button 
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)' }}
          onClick={() => setActiveTab('home')}
        >
          ← Back
        </button>
        <h1 className="canvas-title" style={{ fontSize: '24px' }}>Clarity Analytics</h1>
        <div style={{ width: '40px' }} />
      </div>

      {/* Main Clarity Area Chart */}
      <div className="card-decoration" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Water Clarity Trend</span>
          <span style={{ fontSize: '11px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
            Live Sync
          </span>
        </h3>
        
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          {drawClarityChart()}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '9px', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: '8px' }}>
          <span>OLDER</span>
          <span>RECENT SCANS</span>
          <span>TODAY</span>
        </div>
      </div>

      {/* Diagnostic Logs */}
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>Database Reading Log Entries</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {readings.slice(0, 8).map(reading => {
          const date = new Date(reading.timestamp);
          const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const day = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          
          return (
            <div key={reading.id} className="card-decoration" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>Clarity: {reading.clarity}/10</strong>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {day} · {time} · {reading.fish_count} fish visible
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                <span>pH {reading.ph}</span>
                <span>{reading.temp}°C</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MyFishScreen Component ───
const MyFishScreen: React.FC = () => {
  const { fishList, addFish, removeFish, updateFishCount, setActiveTab } = useApp();
  const [name, setName] = useState('');
  const [count, setCount] = useState(3);
  const [emoji, setEmoji] = useState('🐟');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addFish(name.trim(), emoji, count);
    setName('');
    setShowAddForm(false);
  };

  const EMOJI_OPTIONS = ['🐟', '🐠', '🐡', '🦐', '🦀', '🐌'];

  return (
    <div style={{ padding: '0 20px 30px 20px' }}>
      <div className="canvas-header" style={{ marginBottom: '24px' }}>
        <button 
          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)' }}
          onClick={() => setActiveTab('home')}
        >
          ← Back
        </button>
        <h1 className="canvas-title" style={{ fontSize: '24px' }}>Fish Inventory</h1>
        <button 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            padding: '6px',
            cursor: 'pointer'
          }}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Add New Fish Species widget Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="card-decoration" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Add New Species Entry</h4>
          
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>SPECIES NAME</label>
            <input 
              type="text" 
              placeholder="e.g. Neon Tetra" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                fontFamily: 'var(--font-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>EXPECTED QUANTITY</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={count} 
                onChange={e => setCount(parseInt(e.target.value))} 
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>REPRESENTATIVE EMOJI</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {EMOJI_OPTIONS.map(em => (
                  <button 
                    key={em}
                    type="button" 
                    style={{
                      fontSize: '18px',
                      padding: '4px 6px',
                      borderRadius: '6px',
                      border: emoji === em ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: emoji === em ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      cursor: 'pointer'
                    }}
                    onClick={() => setEmoji(em)}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button className="primary-button" style={{ flex: 1, padding: '10px', fontSize: '13px' }} type="submit">
              Add Species
            </button>
            <button 
              className="secondary-button" 
              style={{ padding: '10px 14px', fontSize: '13px', borderRadius: '24px' }} 
              type="button"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Fish List details with controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fishList.map(fish => (
          <div key={fish.id} className="card-decoration" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '26px' }}>{fish.emoji}</span>
              <div>
                <strong style={{ fontSize: '16px', color: 'var(--color-text-primary)' }}>{fish.name}</strong>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Current Visibility: {fish.detected} / {fish.count}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Incrementor/Decrementor */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: '10px', padding: '2px' }}>
                <button 
                  style={{ width: '26px', height: '26px', border: 'none', background: 'none', fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}
                  onClick={() => updateFishCount(fish.id, Math.max(1, fish.count - 1))}
                >
                  -
                </button>
                <span style={{ width: '24px', textAlign: 'center', fontSize: '13px', fontWeight: 700 }}>{fish.count}</span>
                <button 
                  style={{ width: '26px', height: '26px', border: 'none', background: 'none', fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}
                  onClick={() => updateFishCount(fish.id, fish.count + 1)}
                >
                  +
                </button>
              </div>

              {/* Trash delete */}
              <button 
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', padding: '4px' }}
                onClick={() => removeFish(fish.id)}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-critical)')}
                onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
