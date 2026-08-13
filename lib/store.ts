import { DEMO_CASES, allItems, getCaseById, getItemById } from './catalog';
import { upgradeSuccessChance } from './rng';
import type { InventoryItem, ItemDef, ItemKind, MarketListing, Rarity, UserState } from './types';
import { MARKET_FEE_RATE } from './types';
import { newId, newServerSeed, rollCaseItem, secureUnit, sha256 } from './crypto';

/** Bot seller so Market is always stocked with buyable catalog skins. */
export const SHOP_SELLER_ID = 'cv-shop';
const SHOP_STOCK_TARGET = 34;

function makeUser(id = 'demo-user', username = 'explorer'): UserState {
  const telegramId = id.startsWith('tg:') ? Number(id.slice(3)) : undefined;
  return {
    id,
    telegramId: Number.isFinite(telegramId) ? telegramId : undefined,
    username,
    coins: 25,
    inventory: [],
    pityCounter: 0,
    clientSeed: newId(),
  };
}

const g = globalThis as typeof globalThis & {
  __cvUsers?: Map<string, UserState>;
  __cvListings?: Map<string, MarketListing>;
  __cvNonces?: Map<string, number>;
};

const users = (g.__cvUsers ??= new Map([
  ['demo-user', makeUser()],
  [SHOP_SELLER_ID, makeUser(SHOP_SELLER_ID, 'CaseVerse Shop')],
]));
const listings = (g.__cvListings ??= new Map());
const nonces = (g.__cvNonces ??= new Map());

function shopPrice(basePrice: number, itemId: string): number {
  const n = itemId.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const markup = 1.05 + (n % 8) / 100;
  return Math.max(0.01, Math.round(basePrice * markup * 100) / 100);
}

function listingFromCatalogItem(item: ItemDef): MarketListing {
  const instance: InventoryItem = {
    instanceId: newId(),
    itemId: item.id,
    name: item.name,
    rarity: item.rarity,
    basePrice: item.basePrice,
    image: item.image,
    float: Math.round(secureUnit() * 10000) / 10000,
    acquiredAt: new Date().toISOString(),
    source: 'market',
  };
  return {
    id: newId(),
    sellerId: SHOP_SELLER_ID,
    instance,
    price: shopPrice(item.basePrice, item.id),
    createdAt: new Date().toISOString(),
  };
}

function shopListingCount() {
  let n = 0;
  for (const l of listings.values()) {
    if (l.sellerId === SHOP_SELLER_ID) n++;
  }
  return n;
}

/** Curated mix: ~5 per rarity plus knives, gloves, and stickers. */
function shopPool(): ItemDef[] {
  const items = allItems();
  const picked = new Map<string, ItemDef>();
  const add = (item?: ItemDef) => {
    if (item) picked.set(item.id, item);
  };

  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  for (const r of rarities) {
    const group = items.filter((i) => i.rarity === r);
    const seenCases = new Set<string>();
    const ordered: ItemDef[] = [];
    for (const item of group) {
      const caseKey = item.caseId ?? '';
      if (!seenCases.has(caseKey)) {
        ordered.push(item);
        seenCases.add(caseKey);
      }
    }
    for (const item of group) {
      if (!ordered.includes(item)) ordered.push(item);
    }
    for (const item of ordered.slice(0, 5)) add(item);
  }

  const extras: Array<[ItemKind, number]> = [
    ['knife', 4],
    ['glove', 3],
    ['sticker', 5],
  ];
  for (const [kind, cap] of extras) {
    for (const item of items.filter((i) => i.kind === kind).slice(0, cap)) add(item);
  }

  for (const item of items) {
    if (picked.size >= SHOP_STOCK_TARGET) break;
    add(item);
  }
  return [...picked.values()];
}

/** Keep a pool of shop listings so Market never stays empty. */
export function ensureShopStock() {
  if (!users.has(SHOP_SELLER_ID)) {
    users.set(SHOP_SELLER_ID, makeUser(SHOP_SELLER_ID, 'CaseVerse Shop'));
  }
  const pool = shopPool();
  if (!pool.length) return;

  let missing = SHOP_STOCK_TARGET - shopListingCount();
  if (missing <= 0) return;

  const listed = new Set<string>();
  for (const l of listings.values()) {
    if (l.sellerId === SHOP_SELLER_ID) listed.add(l.instance.itemId);
  }

  const queue = [...pool.filter((i) => !listed.has(i.id)), ...pool.filter((i) => listed.has(i.id))];
  let i = 0;
  while (missing > 0) {
    const item = queue[i % queue.length]!;
    const listing = listingFromCatalogItem(item);
    listings.set(listing.id, listing);
    missing--;
    i++;
  }
}

ensureShopStock();

export function getOrCreateUser(userId = 'demo-user', username?: string): UserState {
  let user = users.get(userId);
  if (!user) {
    user = makeUser(userId, username ?? (userId.startsWith('tg:') ? `user_${userId.slice(3)}` : 'explorer'));
    users.set(userId, user);
  } else if (username) {
    user.username = username;
  }
  return user;
}

export function listCases() {
  return DEMO_CASES.map((c) => ({
    id: c.id,
    name: c.name,
    price: c.price,
    description: c.description,
    image: c.image,
    limited: !!c.limited,
    itemCount: c.items.length,
    items: c.items,
  }));
}

export function openCase(userId: string, caseId: string) {
  const user = getOrCreateUser(userId);
  const caseDef = getCaseById(caseId);
  if (!caseDef) throw new Error('Case not found');
  if (user.coins < caseDef.price) throw new Error('Yetarli balans yo‘q');

  const serverSeed = newServerSeed();
  const nonce = (nonces.get(userId) ?? 0) + 1;
  nonces.set(userId, nonce);
  const { item, roll } = rollCaseItem(caseDef, user.pityCounter, serverSeed, user.clientSeed, nonce);

  user.coins -= caseDef.price;
  const isHigh = ['epic', 'legendary', 'mythic'].includes(item.rarity);
  user.pityCounter = isHigh ? 0 : user.pityCounter + 1;

  const instance: InventoryItem = {
    instanceId: newId(),
    itemId: item.id,
    name: item.name,
    rarity: item.rarity,
    basePrice: item.basePrice,
    image: item.image,
    float: Math.round(secureUnit() * 10000) / 10000,
    acquiredAt: new Date().toISOString(),
    source: 'case',
  };
  user.inventory.unshift(instance);

  return {
    success: true as const,
    instance,
    item,
    serverSeedHash: sha256(serverSeed),
    serverSeed,
    clientSeed: user.clientSeed,
    nonce,
    roll,
    coinsLeft: user.coins,
    pityCounter: user.pityCounter,
  };
}

export function quoteUpgrade(userId: string, instanceIds: string[], targetItemId: string) {
  const user = getOrCreateUser(userId);
  const instances = instanceIds.map((id) => {
    const found = user.inventory.find((i) => i.instanceId === id);
    if (!found) throw new Error(`Item ${id} not in inventory`);
    return found;
  });
  const target = getItemById(targetItemId);
  if (!target) throw new Error('Target item not found');
  const inputValue = instances.reduce((s, i) => s + i.basePrice, 0);
  return {
    successChance: upgradeSuccessChance(inputValue, target.basePrice),
    inputValue,
    targetValue: target.basePrice,
    multiplier: target.basePrice / Math.max(1, inputValue),
    houseEdgeApplied: true,
    target,
    instances,
  };
}

export function performUpgrade(userId: string, instanceIds: string[], targetItemId: string) {
  const quote = quoteUpgrade(userId, instanceIds, targetItemId);
  const user = getOrCreateUser(userId);
  const roll = secureUnit();
  const success = roll < quote.successChance;
  for (const id of instanceIds) {
    user.inventory = user.inventory.filter((i) => i.instanceId !== id);
  }
  let wonItem: InventoryItem | undefined;
  if (success) {
    wonItem = {
      instanceId: newId(),
      itemId: quote.target.id,
      name: quote.target.name,
      rarity: quote.target.rarity,
      basePrice: quote.target.basePrice,
      image: quote.target.image,
      float: Math.round(secureUnit() * 10000) / 10000,
      acquiredAt: new Date().toISOString(),
      source: 'upgrade',
    };
    user.inventory.unshift(wonItem);
  }
  return {
    success,
    successChance: quote.successChance,
    roll,
    stopAngle: roll * 360,
    wonItem,
    lostInstanceIds: instanceIds,
    coinsLeft: user.coins,
  };
}

export function createListing(userId: string, instanceId: string, price: number) {
  const user = getOrCreateUser(userId);
  const idx = user.inventory.findIndex((i) => i.instanceId === instanceId);
  if (idx < 0) throw new Error('Item not in inventory');
  if (price <= 0) throw new Error('Invalid price');
  const [instance] = user.inventory.splice(idx, 1);
  const listing: MarketListing = {
    id: newId(),
    sellerId: userId,
    instance: instance!,
    price,
    createdAt: new Date().toISOString(),
  };
  listings.set(listing.id, listing);
  return listing;
}

export function listMarket(filters?: {
  rarity?: string;
  minPrice?: number;
  maxPrice?: number;
  caseId?: string;
}) {
  ensureShopStock();
  let rows = [...listings.values()];
  if (filters?.rarity) rows = rows.filter((l) => l.instance.rarity === filters.rarity);
  if (filters?.minPrice != null) rows = rows.filter((l) => l.price >= filters.minPrice!);
  if (filters?.maxPrice != null) rows = rows.filter((l) => l.price <= filters.maxPrice!);
  if (filters?.caseId) {
    rows = rows.filter((l) => getItemById(l.instance.itemId)?.caseId === filters.caseId);
  }
  return rows.sort((a, b) => a.price - b.price);
}

export function buyListing(buyerId: string, listingId: string) {
  const buyer = getOrCreateUser(buyerId);
  const listing = listings.get(listingId);
  if (!listing) throw new Error('Listing not found');
  if (listing.sellerId === buyerId) throw new Error('Cannot buy own listing');
  if (buyer.coins < listing.price) throw new Error('Insufficient coins');

  const fee = Math.floor(listing.price * MARKET_FEE_RATE);
  const seller = getOrCreateUser(listing.sellerId);
  buyer.coins -= listing.price;
  seller.coins += listing.price - fee;

  const bought: InventoryItem = {
    ...listing.instance,
    instanceId: newId(),
    acquiredAt: new Date().toISOString(),
    source: 'market',
  };
  buyer.inventory.unshift(bought);
  listings.delete(listingId);
  if (listing.sellerId === SHOP_SELLER_ID) ensureShopStock();
  return { item: bought, paid: listing.price, fee, coinsLeft: buyer.coins };
}

export function catalogTargets() {
  return allItems().filter((i) =>
    ['rare', 'epic', 'legendary', 'mythic'].includes(i.rarity),
  );
}
