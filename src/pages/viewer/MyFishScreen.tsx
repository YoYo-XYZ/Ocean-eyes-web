import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { SpeciesSelector } from '../../components/SpeciesSelector';
import { getSpeciesById, getSpeciesColor, getSpeciesInitials, type SpeciesInfo } from '../../data/speciesCatalog';

export const MyFishScreen: React.FC = () => {
  const { fishList, addFish, removeFish, updateFishCount, updateFishSpecies, setActiveTab } = useApp();
  const [name, setName] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFishId, setEditingFishId] = useState<string | null>(null);
  const [fishToDelete, setFishToDelete] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const species = selectedSpeciesId ? getSpeciesById(selectedSpeciesId) : null;
    const imageUrl = species ? species.imageClass : 'species-unknown';
    
    addFish(name.trim(), imageUrl, 1);
    setName('');
    setSelectedSpeciesId(null);
    setShowAddForm(false);
  };

  const handleSpeciesSelect = (species: SpeciesInfo | null, customName?: string) => {
    if (species) {
      setSelectedSpeciesId(species.id);
      setName(species.name);
    } else if (customName) {
      setSelectedSpeciesId(null);
      setName(customName);
    }
  };

  const handleEditSpecies = (fishId: string, species: SpeciesInfo | null, customName?: string) => {
    if (species) {
      updateFishSpecies(fishId, species.name, species.imageClass);
    } else if (customName) {
      updateFishSpecies(fishId, customName, 'species-unknown');
    }
    setEditingFishId(null);
  };

  const getSpeciesDisplay = (fish: typeof fishList[0]) => {
    const species = getSpeciesById(fish.speciesId);
    if (species) {
      return {
        initials: species.initials,
        color: species.color,
        name: species.displayName
      };
    }
    return {
      initials: getSpeciesInitials(fish.speciesId),
      color: getSpeciesColor(fish.speciesId),
      name: fish.name
    };
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
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>SPECIES</label>
            <SpeciesSelector
              selectedSpeciesId={selectedSpeciesId}
              onSelect={handleSpeciesSelect}
              placeholder="Search or select a species..."
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button className="primary-button" style={{ flex: 1, padding: '10px', fontSize: '13px' }} type="submit">
              Add Species
            </button>
            <button 
              className="secondary-button" 
              style={{ padding: '10px 14px', fontSize: '13px', borderRadius: '24px' }} 
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setName('');
                setSelectedSpeciesId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Fish List details with controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fishList.map(fish => {
          const display = getSpeciesDisplay(fish);
          const isEditing = editingFishId === fish.id;

          return (
            <div key={fish.id} className="card-decoration" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: display.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#fff',
                    flexShrink: 0,
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {display.initials}
                </div>
                <div style={{ flex: 1 }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <SpeciesSelector
                        selectedSpeciesId={fish.speciesId}
                        onSelect={(species, customName) => handleEditSpecies(fish.id, species, customName)}
                        placeholder="Change species..."
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => setEditingFishId(null)}
                          style={{
                            padding: '4px 8px',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-secondary)',
                            fontSize: '12px'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <strong style={{ fontSize: '16px', color: 'var(--color-text-primary)' }}>{display.name}</strong>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Current Visibility: {fish.detected} / {fish.count}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {!isEditing && (
                  <>
                    {/* Edit species button */}
                    <button 
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', padding: '4px' }}
                      onClick={() => setEditingFishId(fish.id)}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                    >
                      <Pencil size={16} />
                    </button>

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
                      onClick={() => setFishToDelete(fish.id)}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-critical)')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#94A3B8')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {fishToDelete && (
        <div className="modal-overlay" onClick={() => setFishToDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Delete Fish Entry</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
              Are you sure you want to delete this fish entry? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                className="secondary-button"
                style={{ padding: '10px 20px', fontSize: '14px' }}
                onClick={() => setFishToDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="primary-button"
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '14px', 
                  backgroundColor: 'var(--color-critical)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
                }}
                onClick={() => {
                  if (fishToDelete) {
                    removeFish(fishToDelete);
                    setFishToDelete(null);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
