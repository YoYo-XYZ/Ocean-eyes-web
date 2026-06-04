// src/data/speciesCatalog.ts - Known fish species catalog with placeholder image classes

export interface SpeciesInfo {
  id: string;
  name: string;
  displayName: string;
  imageClass: string;
  initials: string;
  color: string;
}

export const SPECIES_CATALOG: SpeciesInfo[] = [
  { id: 'angelfish', name: 'Angelfish', displayName: 'Angelfish', imageClass: 'species-angelfish', initials: 'AF', color: '#E8D5B7' },
  { id: 'betta', name: 'Betta', displayName: 'Betta', imageClass: 'species-betta', initials: 'BT', color: '#FFB6C1' },
  { id: 'black_skirt_tetra', name: 'Black Skirt Tetra', displayName: 'Black Skirt Tetra', imageClass: 'species-black-skirt-tetra', initials: 'BST', color: '#708090' },
  { id: 'cardinal_tetra', name: 'Cardinal Tetra', displayName: 'Cardinal Tetra', imageClass: 'species-cardinal-tetra', initials: 'CT', color: '#4169E1' },
  { id: 'cherry_barb', name: 'Cherry Barb', displayName: 'Cherry Barb', imageClass: 'species-cherry-barb', initials: 'CB', color: '#DC143C' },
  { id: 'clown_loach', name: 'Clown Loach', displayName: 'Clown Loach', imageClass: 'species-clown-loach', initials: 'CL', color: '#FF8C00' },
  { id: 'corydoras', name: 'Corydoras', displayName: 'Corydoras', imageClass: 'species-corydoras', initials: 'CR', color: '#DAA520' },
  { id: 'discus', name: 'Discus', displayName: 'Discus', imageClass: 'species-discus', initials: 'DS', color: '#9370DB' },
  { id: 'dwarf_gourami', name: 'Dwarf Gourami', displayName: 'Dwarf Gourami', imageClass: 'species-dwarf-gourami', initials: 'DG', color: '#20B2AA' },
  { id: 'german_blue_ram', name: 'German Blue Ram', displayName: 'German Blue Ram', imageClass: 'species-german-blue-ram', initials: 'GBR', color: '#1E90FF' },
  { id: 'goldfish', name: 'Goldfish', displayName: 'Goldfish', imageClass: 'species-goldfish', initials: 'GF', color: '#FFD700' },
  { id: 'guppy', name: 'Guppy', displayName: 'Guppy', imageClass: 'species-guppy', initials: 'GP', color: '#FF69B4' },
  { id: 'harlequin_rasbora', name: 'Harlequin Rasbora', displayName: 'Harlequin Rasbora', imageClass: 'species-harlequin-rasbora', initials: 'HR', color: '#FF6347' },
  { id: 'molly', name: 'Molly', displayName: 'Molly', imageClass: 'species-molly', initials: 'ML', color: '#B0C4DE' },
  { id: 'neon_tetra', name: 'Neon Tetra', displayName: 'Neon Tetra', imageClass: 'species-neon-tetra', initials: 'NT', color: '#00CED1' },
  { id: 'oscar', name: 'Oscar', displayName: 'Oscar', imageClass: 'species-oscar', initials: 'OS', color: '#8B4513' },
  { id: 'otocinclus', name: 'Otocinclus', displayName: 'Otocinclus', imageClass: 'species-otocinclus', initials: 'OT', color: '#A9A9A9' },
  { id: 'platy', name: 'Platy', displayName: 'Platy', imageClass: 'species-platy', initials: 'PL', color: '#FF4500' },
  { id: 'plecostomus', name: 'Plecostomus', displayName: 'Plecostomus', imageClass: 'species-plecostomus', initials: 'PC', color: '#556B2F' },
  { id: 'rummy_nose_tetra', name: 'Rummy Nose Tetra', displayName: 'Rummy Nose Tetra', imageClass: 'species-rummy-nose-tetra', initials: 'RNT', color: '#FF0000' },
  { id: 'siamese_algae_eater', name: 'Siamese Algae Eater', displayName: 'Siamese Algae Eater', imageClass: 'species-siamese-algae-eater', initials: 'SAE', color: '#C0C0C0' },
  { id: 'swordtail', name: 'Swordtail', displayName: 'Swordtail', imageClass: 'species-swordtail', initials: 'SW', color: '#FF8C00' },
  { id: 'tiger_barb', name: 'Tiger Barb', displayName: 'Tiger Barb', imageClass: 'species-tiger-barb', initials: 'TB', color: '#FF6347' },
  { id: 'zebra_danio', name: 'Zebra Danio', displayName: 'Zebra Danio', imageClass: 'species-zebra-danio', initials: 'ZD', color: '#4169E1' },
  { id: 'dwarf_rasbora', name: 'Dwarf Rasbora', displayName: 'Dwarf Rasbora', imageClass: 'species-dwarf-rasbora', initials: 'DR', color: '#FF69B4' }
];

export const getSpeciesById = (id: string): SpeciesInfo | undefined => {
  return SPECIES_CATALOG.find(s => s.id === id);
};

export const getSpeciesByName = (name: string): SpeciesInfo | undefined => {
  const normalized = name.toLowerCase().trim();
  return SPECIES_CATALOG.find(s => 
    s.name.toLowerCase() === normalized || 
    s.id === normalized
  );
};

export const searchSpecies = (query: string): SpeciesInfo[] => {
  if (!query.trim()) return SPECIES_CATALOG;
  const normalized = query.toLowerCase().trim();
  return SPECIES_CATALOG.filter(s => 
    s.name.toLowerCase().includes(normalized) ||
    s.displayName.toLowerCase().includes(normalized)
  );
};

export const DEFAULT_SPECIES_IMAGE = '/species-placeholder.png';

export const getSpeciesImageClass = (speciesId: string): string => {
  const species = getSpeciesById(speciesId);
  return species ? species.imageClass : 'species-unknown';
};

export const getSpeciesColor = (speciesId: string): string => {
  const species = getSpeciesById(speciesId);
  return species ? species.color : '#94A3B8';
};

export const getSpeciesInitials = (speciesId: string): string => {
  const species = getSpeciesById(speciesId);
  return species ? species.initials : '??';
};
