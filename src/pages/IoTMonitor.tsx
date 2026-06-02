// IoTMonitor.tsx - Recreating Flutter UI screens for the Smart Tank Monitor unit
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Cpu } from 'lucide-react';
import { MockFirestore } from '../services/mock_service';
import type { AlertItem } from '../services/mock_service';

export const IoTMonitor: React.FC = () => {
  const { tankId } = useApp();
  const [monitorScreen, setMonitorScreen] = useState<'welcome' | 'qr' | 'calibration' | 'active'>('welcome');

  const renderScreen = () => {
    switch (monitorScreen) {
      case 'welcome':
        return <MonitorWelcomeScreen onNavigate={setMonitorScreen} />;
      case 'qr':
        return <MonitorQrDisplayScreen onNavigate={setMonitorScreen} />;
      case 'calibration':
        return <MonitorCalibrationScreen onNavigate={setMonitorScreen} />;
      case 'active':
        return <ActiveMonitoringScreen onNavigate={setMonitorScreen} />;
      default:
        return <MonitorWelcomeScreen onNavigate={setMonitorScreen} />;
    }
  };

  return (
    <div className="monitor-screen">
      {/* Device Header Bar */}
      <div style={{
        height: '42px',
        backgroundColor: '#090D11',
        borderBottom: '1px solid #1E293B',
        padding: '0 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#94A3B8',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.05em'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Cpu size={12} className="anim-float-2" style={{ color: 'var(--color-primary)' }} />
          <span>OCEANEYES MONITOR v1.0.4</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: tankId ? 'var(--color-good)' : 'var(--color-warning)'
          }} />
          <span>{tankId ? 'LINKED' : 'UNPAIRED'}</span>
        </div>
      </div>

      {/* Screen Body */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderScreen()}
      </div>
    </div>
  );
};

// ─── Welcome Screen (welcome_screen.dart equivalent) ───
interface ScreenProps {
  onNavigate: (screen: 'welcome' | 'qr' | 'calibration' | 'active') => void;
}

const MonitorWelcomeScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { tankId, activeTank } = useApp();

  return (
    <div style={{
      padding: '40px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: '#FFFFFF',
      textAlign: 'center',
      background: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #115E59 0%, #0F766E 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '24px',
        border: '3px solid #0D9488',
        boxShadow: '0 0 20px rgba(13, 148, 136, 0.4)'
      }} className="anim-float-1">
        <Camera size={36} style={{ color: '#2DD4BF' }} />
      </div>

      <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', color: '#F1F5F9' }}>Smart Tank Unit</h2>
      <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '320px', lineHeight: '145%', marginBottom: '32px' }}>
        Position the camera unit against the aquarium glass, complete calibration, and pair with your mobile app.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '280px' }}>
        {tankId ? (
          <button 
            className="primary-button" 
            style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
            onClick={() => onNavigate('active')}
          >
            Open Live Camera Monitor
          </button>
        ) : (
          <button 
            className="primary-button" 
            style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
            onClick={() => onNavigate('qr')}
          >
            Pair with Mobile App
          </button>
        )}

        <button 
          className="secondary-button" 
          style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'transparent', borderColor: '#334155', color: '#E2E8F0' }}
          onClick={() => onNavigate('calibration')}
        >
          Calibrate Water Level
        </button>
      </div>

      {activeTank && (
        <div style={{ marginTop: '40px', fontSize: '12px', color: '#64748B' }}>
          Linked to: <strong>{activeTank.name}</strong>
        </div>
      )}
    </div>
  );
};

// ─── QR Code Pairing Screen (qr_display_screen.dart equivalent) ───
const MonitorQrDisplayScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { tankId, tanks } = useApp();
  const [copied, setCopied] = useState(false);

  const activeTankId = tankId || (tanks.length > 0 ? tanks[0].id : 'living-room-tank-77');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeTankId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      padding: '30px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#FFFFFF',
      background: '#090D11'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: '#E2E8F0' }}>Pairing QR Code</h3>
      
      {/* Visual Scannable QR mock */}
      <div className="qr-container" style={{ marginBottom: '20px' }}>
        <div className="qr-code-canvas" />
        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '12px' }}>
          SCAN ME IN APP
        </span>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Manual Pairing ID</span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#0F172A',
          padding: '10px 16px',
          borderRadius: '10px',
          border: '1px solid #1E293B',
          marginTop: '6px'
        }}>
          <code style={{ fontSize: '13px', color: '#38BDF8' }}>{activeTankId}</code>
          <button 
            onClick={copyToClipboard}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <button 
        className="primary-button" 
        style={{ width: '100%', maxWidth: '240px', padding: '12px', borderRadius: '12px' }}
        onClick={() => onNavigate('welcome')}
      >
        Done pairing
      </button>
    </div>
  );
};

// ─── Calibration Screen (calibration_screen.dart equivalent) ───
const MonitorCalibrationScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { activeTank, updateCalibration } = useApp();
  const [lineY, setLineY] = useState(activeTank?.calibration?.water_line_y || 120);
  const [saved, setSaved] = useState(false);

  const handleDrag = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let clientY = 0;
    
    if ('touches' in e) {
      clientY = e.touches[0].clientY;
    } else {
      clientY = e.clientY;
    }
    
    const y = Math.min(240, Math.max(0, clientY - rect.top));
    setLineY(y);
  };

  const handleSave = () => {
    updateCalibration(lineY);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onNavigate('welcome');
    }, 1500);
  };

  return (
    <div style={{
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: '#FFFFFF',
      background: '#090D11'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#E2E8F0', textAlign: 'center' }}>
        Water Line Calibration
      </h3>
      <p style={{ fontSize: '11px', color: '#64748B', textAlign: 'center', marginBottom: '16px', lineHeight: '135%' }}>
        Drag the dotted red line visually to match the physical water surface level in your tank.
      </p>

      {/* Interactive Calibration Canvas */}
      <div 
        onMouseMove={(e) => {
          if (e.buttons === 1) handleDrag(e);
        }}
        onMouseDown={handleDrag}
        onTouchMove={handleDrag}
        style={{
          flex: 1,
          background: 'linear-gradient(180deg, #111827 0%, #115E59 100%)',
          borderRadius: '12px',
          border: '2px solid #1E293B',
          position: 'relative',
          cursor: 'ns-resize',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div className="camera-grid" />
        
        {/* Floating elements inside canvas */}
        <span style={{ fontSize: '48px', opacity: 0.1, position: 'absolute', top: '10%' }}>🐟</span>
        <span style={{ fontSize: '32px', opacity: 0.1, position: 'absolute', bottom: '15%' }}>🐠</span>

        {/* Dynamic Water Level Line Indicator */}
        <div style={{
          position: 'absolute',
          top: `${lineY}px`,
          left: 0,
          width: '100%',
          height: '2px',
          borderTop: '2px dashed var(--color-critical)',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <span style={{
            position: 'absolute',
            top: '-18px',
            fontSize: '9px',
            color: '#FFFFFF',
            background: 'var(--color-critical)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
          }}>
            SET: {Math.round(lineY)}px
          </span>
        </div>

        <span style={{ fontSize: '12px', color: '#334155', fontWeight: 600, pointerEvents: 'none' }}>
          DRAG TO MATCH WATER LEVEL
        </span>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button 
          className="primary-button" 
          style={{ flex: 1, padding: '12px', borderRadius: '12px' }}
          onClick={handleSave}
        >
          {saved ? '✓ Calibration Saved' : 'Confirm Level'}
        </button>
        <button 
          className="secondary-button" 
          style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'transparent', borderColor: '#334155', color: '#94A3B8' }}
          onClick={() => onNavigate('welcome')}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ─── Active Monitoring Screen (monitoring_screen.dart equivalent) ───
const ActiveMonitoringScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const { activeTank, readings, fishList } = useApp();
  const [simClarityIssue, setSimClarityIssue] = useState(false);
  const [simFishHiding, setSimFishHiding] = useState(false);

  const latestReading = readings[0] || {
    clarity: 7.8,
    fish_count: 10,
    ph: 7.2,
    temp: 26.1
  };

  // Modulate local metrics scan trigger with simulations
  const displayClarity = simClarityIssue ? 5.2 : latestReading.clarity;
  const totalFish = fishList.reduce((sum, f) => sum + f.count, 0);
  const displayFish = simFishHiding ? Math.round(totalFish * 0.4) : latestReading.fish_count;

  // Background mock state write
  const triggerSimulationMetrics = () => {
    if (!activeTank) return;
    
    // Simulate drop or restore
    MockFirestore.writeReading({
      tankId: activeTank.id,
      clarity: displayClarity,
      fishCount: displayFish,
      ph: 7.2,
      temp: 26.1,
      ammonia: simClarityIssue ? 0.05 : 0.0,
      nitrite: simClarityIssue ? 0.25 : 0.08
    });

    if (simClarityIssue) {
      const activeAlerts = MockFirestore.getAlerts();
      const existing = activeAlerts.find((a: AlertItem) => !a.resolved && a.title.includes('clarity'));
      if (!existing) {
        const newAlerts = [...activeAlerts];
        newAlerts.unshift({
          id: `alert-c-${Date.now()}`,
          title: 'Water clarity dropped',
          message: `Water clarity fell to ${displayClarity} (Threshold: ${activeTank.thresholds.clarity_min}). Check filter unit.`,
          tip: 'A sudden clarity drop indicates a clogged filter sponge or disturbed substrate. Wash the filter media or perform a 20% water change.',
          severity: 'warning',
          timeAgo: 'Just now',
          clarityBefore: '8.2',
          clarityAfter: displayClarity.toString(),
          fishBefore: totalFish.toString(),
          fishAfter: displayFish.toString(),
          resolved: false,
          timestamp: new Date().toISOString()
        });
        MockFirestore.saveAlerts(newAlerts);
      }
    }

    if (simFishHiding) {
      const activeAlerts = MockFirestore.getAlerts();
      const existing = activeAlerts.find((a: AlertItem) => !a.resolved && a.title.includes('visible'));
      if (!existing) {
        const newAlerts = [...activeAlerts];
        newAlerts.unshift({
          id: `alert-f-${Date.now()}`,
          title: `Only ${displayFish} of ${totalFish} fish visible`,
          message: `Fish visibility falls under ${activeTank.thresholds.fish_change_pct}% threshold. Check for distress.`,
          tip: 'Fish may be hiding behind plants or decor due to light changes or stressors. Confirm filter is running and test water chemistry.',
          severity: 'critical',
          timeAgo: 'Just now',
          clarityBefore: displayClarity.toString(),
          clarityAfter: displayClarity.toString(),
          fishBefore: totalFish.toString(),
          fishAfter: displayFish.toString(),
          resolved: false,
          timestamp: new Date().toISOString()
        });
        MockFirestore.saveAlerts(newAlerts);
      }
    }
  };

  return (
    <div style={{
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: '#FFFFFF',
      background: '#090D11'
    }}>
      {/* Live aquatic scanner simulation */}
      <div style={{
        flex: 1,
        borderRadius: '8px',
        border: '1px solid #1E293B',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #115E59 0%, #134E4A 100%)',
        marginBottom: '16px'
      }}>
        <div className="camera-grid" />
        <div className="camera-scanline" />

        {/* Live scanner target graphics */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#34D399',
          lineHeight: '130%',
          textShadow: '0 0 4px rgba(52, 211, 153, 0.4)'
        }}>
          <span>CAM FEED: OK</span><br />
          <span>RESOLUTION: 1080P</span><br />
          <span>FPS: 30.00</span>
        </div>

        {/* Bounding box graphics simulating AI detection */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '25%',
          width: '80px',
          height: '60px',
          border: '1.5px solid #34D399',
          boxShadow: '0 0 6px rgba(52, 211, 153, 0.3)'
        }}>
          <span style={{ position: 'absolute', top: '-14px', left: 0, fontSize: '8px', color: '#FFF', background: '#34D399', padding: '1px 3px', fontWeight: 700 }}>
            NEON TETRA 98%
          </span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '25%',
          right: '25%',
          width: '70px',
          height: '50px',
          border: '1.5px solid #34D399',
          boxShadow: '0 0 6px rgba(52, 211, 153, 0.3)'
        }}>
          <span style={{ position: 'absolute', top: '-14px', left: 0, fontSize: '8px', color: '#FFF', background: '#34D399', padding: '1px 3px', fontWeight: 700 }}>
            GUPPY 94%
          </span>
        </div>

        {/* Swimming fish inside canvas */}
        {!simFishHiding ? (
          <>
            <span style={{ fontSize: '32px', position: 'absolute', top: '35%', left: '30%' }} className="anim-float-1">🐟</span>
            <span style={{ fontSize: '28px', position: 'absolute', top: '55%', right: '25%' }} className="anim-float-2">🐠</span>
            <span style={{ fontSize: '36px', position: 'absolute', bottom: '30%', left: '40%' }} className="anim-float-2">🐡</span>
          </>
        ) : (
          <span style={{ fontSize: '28px', position: 'absolute', top: '55%', right: '25%' }} className="anim-float-2">🐠</span>
        )}

        {/* Dynamic Water Line Calibration Overlay */}
        {activeTank?.calibration && (
          <div style={{
            position: 'absolute',
            top: `${Math.min(95, Math.max(5, (activeTank.calibration.water_line_y / 240) * 100))}%`,
            left: 0,
            width: '100%',
            height: '2px',
            borderTop: '2px dashed rgba(255,255,255,0.3)',
            zIndex: 10
          }} />
        )}
      </div>

      {/* Grid of monitored stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: '#0F172A', padding: '10px', borderRadius: '8px', border: '1px solid #1E293B' }}>
          <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>VISIBILITY COUNT</span>
          <strong style={{ fontSize: '16px', color: '#38BDF8' }}>{displayFish} fish detected</strong>
        </div>

        <div style={{ background: '#0F172A', padding: '10px', borderRadius: '8px', border: '1px solid #1E293B' }}>
          <span style={{ fontSize: '10px', color: '#64748B', display: 'block' }}>WATER CLARITY</span>
          <strong style={{ fontSize: '16px', color: '#38BDF8' }}>{displayClarity}/10 score</strong>
        </div>
      </div>

      {/* Simulator triggers */}
      <div className="card-decoration" style={{ padding: '12px', border: '1px dashed #1E293B', backgroundColor: 'transparent', marginBottom: '16px' }}>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', textTransform: 'uppercase', marginBottom: '8px' }}>
          Aquarium Simulator Controls
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button 
            style={{
              padding: '8px 10px',
              fontSize: '11px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: simClarityIssue ? 'var(--color-critical)' : '#1E293B',
              color: '#FFF'
            }}
            onClick={() => {
              setSimClarityIssue(prev => !prev);
              setTimeout(triggerSimulationMetrics, 50);
            }}
          >
            {simClarityIssue ? 'Restore Clarity' : 'Trigger Clog Filter'}
          </button>

          <button 
            style={{
              padding: '8px 10px',
              fontSize: '11px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: simFishHiding ? 'var(--color-critical)' : '#1E293B',
              color: '#FFF'
            }}
            onClick={() => {
              setSimFishHiding(prev => !prev);
              setTimeout(triggerSimulationMetrics, 50);
            }}
          >
            {simFishHiding ? 'Restore Fish' : 'Trigger Fish Hiding'}
          </button>
        </div>
      </div>

      <button 
        className="secondary-button" 
        style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '10px', backgroundColor: 'transparent', borderColor: '#334155', color: '#94A3B8' }}
        onClick={() => onNavigate('welcome')}
      >
        Exit Active Monitoring
      </button>
    </div>
  );
};
