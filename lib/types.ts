export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic';

/** CS2-like rarity colors */
export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#b0c3d9',
  uncommon: '#5e98d9',
  rare: '#4b69ff',
  epic: '#8847ff',
  legendary: '#d32ce6',
  mythic: '#eb4b4b',
};

export const RARITY_LABELS: Record<Rarity, string> = {
  common: 'Consumer',
  uncommon: 'Mil-Spec',
  rare: 'Restricted',
  epic: 'Classified',
  legendary: 'Covert',
  mythic: 'Extraordinary',
};

export const HOUSE_EDGE_TARGET = 0.88;
export const MARKET_FEE_RATE = 0.05;
export const PITY_THRESHOLD = 20;
export const PITY_BONUS = 0.015;

export type ItemKind = 'skin' | 'knife' | 'glove' | 'sticker' | 'case';

export interface ItemDef {
  id: string;
  name: string;
  rarity: Rarity;
  /** Approximate Steam market USD */
  basePrice: number;
  image: string;
  kind?: ItemKind;
  caseId?: string;
}

export interface CaseDef {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  limited?: boolean;
  items: ItemDef[];
}

export interface InventoryItem {
  instanceId: string;
  itemId: string;
  name: string;
  rarity: Rarity;
  basePrice: number;
  image: string;
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

export interface MarketListing {
  id: string;
  sellerId: string;
  instance: InventoryItem;
  price: number;
  createdAt: string;
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

export interface UpgradeResult {
  success: boolean;
  successChance: number;
  roll: number;
  stopAngle: number;
  wonItem?: InventoryItem;
  lostInstanceIds: string[];
  coinsLeft: number;
}
