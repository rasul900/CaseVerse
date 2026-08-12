export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

export const RARITY_ORDER: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
];

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9AA3B2',
  uncommon: '#3DDC97',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F5C542',
  mythic: '#FF3B5C',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  mythic: 'Mythic',
};

/** Target drop rate bands from TZ (midpoints used for demo pools). */
export const RARITY_TARGET_RATES: Record<Rarity, number> = {
  common: 0.65,
  uncommon: 0.22,
  rare: 0.085,
  epic: 0.03,
  legendary: 0.012,
  mythic: 0.003,
};

export const HOUSE_EDGE_TARGET = 0.88; // EV / casePrice
export const MARKET_FEE_RATE = 0.05;
export const PITY_THRESHOLD = 20;
export const PITY_BONUS = 0.015;

export interface ItemDef {
  id: string;
  name: string;
  rarity: Rarity;
  basePrice: number;
  image?: string;
  float?: number;
  caseId?: string;
}

export interface CaseDef {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  limited?: boolean;
  items: ItemDef[];
}

export interface InventoryItem {
  instanceId: string;
  itemId: string;
  name: string;
  rarity: Rarity;
  basePrice: number;
  float: number;
  acquiredAt: string;
  source: 'case' | 'market' | 'upgrade';
}

export interface UserState {
  id: string;
  telegramId?: number;
  username: string;
  coins: number;
  inventory: InventoryItem[];
  pityCounter: number;
  clientSeed: string;
}

export interface OpenCaseResult {
  success: true;
  instance: InventoryItem;
  item: ItemDef;
  serverSeedHash: string;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  roll: number;
  coinsLeft: number;
  pityCounter: number;
}

export interface UpgradeQuote {
  successChance: number;
  inputValue: number;
  targetValue: number;
  multiplier: number;
  houseEdgeApplied: boolean;
}

export interface UpgradeResult {
  success: boolean;
  successChance: number;
  roll: number;
  stopAngle: number;
  wonItem?: InventoryItem;
  lostInstanceIds: string[];
  coinsLeft: number;
}

export interface MarketListing {
  id: string;
  sellerId: string;
  instance: InventoryItem;
  price: number;
  createdAt: string;
}
