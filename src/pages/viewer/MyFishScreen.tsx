import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';

export const MyFishScreen: React.FC = () => {
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

      {/* Add New Fish Species Form */}
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
