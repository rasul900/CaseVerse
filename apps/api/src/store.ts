import { nanoid } from 'nanoid';
import {
  DEMO_CASES,
  MARKET_FEE_RATE,
  allItems,
  getCaseById,
  getItemById,
  upgradeSuccessChance,
} from '@caseverse/shared';
import type {
  InventoryItem,
  MarketListing,
  UserState,
} from '@caseverse/shared';
import { newServerSeed, rollCaseItem, secureUnit, sha256 } from './crypto.js';

function randomFloat(): number {
  return Math.round(secureUnit() * 10000) / 10000;
}

function makeUser(id = 'demo-user', username = 'explorer'): UserState {
  const telegramId = id.startsWith('tg:') ? Number(id.slice(3)) : undefined;
  return {
    id,
    telegramId: Number.isFinite(telegramId) ? telegramId : undefined,
    username,
    coins: 5000,
    inventory: [],
    pityCounter: 0,
    clientSeed: nanoid(16),
  };
}

const g = globalThis as typeof globalThis & {
  __caseverseUsers?: Map<string, UserState>;
  __caseverseListings?: Map<string, MarketListing>;
  __caseverseNonces?: Map<string, number>;
};

const users = (g.__caseverseUsers ??= new Map<string, UserState>([['demo-user', makeUser()]]));
const listings = (g.__caseverseListings ??= new Map<string, MarketListing>());
const nonces = (g.__caseverseNonces ??= new Map<string, number>());

export function getOrCreateUser(userId = 'demo-user', username?: string): UserState {
  let user = users.get(userId);
  if (!user) {
    user = makeUser(userId, username ?? (userId.startsWith('tg:') ? `user_${userId.slice(3)}` : 'explorer'));
    users.set(userId, user);
  } else if (username && user.username !== username) {
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
    limited: !!c.limited,
    itemCount: c.items.length,
    items: c.items,
  }));
}

export function openCase(userId: string, caseId: string) {
  const user = getOrCreateUser(userId);
  const caseDef = getCaseById(caseId);
  if (!caseDef) throw new Error('Case not found');
  if (user.coins < caseDef.price) throw new Error('Insufficient coins');

  const serverSeed = newServerSeed();
  const serverSeedHash = sha256(serverSeed);
  const nonce = (nonces.get(userId) ?? 0) + 1;
  nonces.set(userId, nonce);

  const { item, roll } = rollCaseItem(
    caseDef,
    user.pityCounter,
    serverSeed,
    user.clientSeed,
    nonce,
  );

  user.coins -= caseDef.price;

  const isHigh =
    item.rarity === 'epic' ||
    item.rarity === 'legendary' ||
    item.rarity === 'mythic';
  user.pityCounter = isHigh ? 0 : user.pityCounter + 1;

  const instance: InventoryItem = {
    instanceId: nanoid(),
    itemId: item.id,
    name: item.name,
    rarity: item.rarity,
    basePrice: item.basePrice,
    float: randomFloat(),
    acquiredAt: new Date().toISOString(),
    source: 'case',
  };
  user.inventory.unshift(instance);

  return {
    success: true as const,
    instance,
    item,
    serverSeedHash,
    serverSeed,
    clientSeed: user.clientSeed,
    nonce,
    roll,
    coinsLeft: user.coins,
    pityCounter: user.pityCounter,
  };
}

export function quoteUpgrade(
  userId: string,
  instanceIds: string[],
  targetItemId: string,
) {
  const user = getOrCreateUser(userId);
  const instances = instanceIds.map((id) => {
    const found = user.inventory.find((i) => i.instanceId === id);
    if (!found) throw new Error(`Item ${id} not in inventory`);
    return found;
  });
  const target = getItemById(targetItemId);
  if (!target) throw new Error('Target item not found');

  const inputValue = instances.reduce((s, i) => s + i.basePrice, 0);
  const chance = upgradeSuccessChance(inputValue, target.basePrice);

  return {
    successChance: chance,
    inputValue,
    targetValue: target.basePrice,
    multiplier: target.basePrice / Math.max(1, inputValue),
    houseEdgeApplied: true,
    target,
    instances,
  };
}

export function performUpgrade(
  userId: string,
  instanceIds: string[],
  targetItemId: string,
) {
  const quote = quoteUpgrade(userId, instanceIds, targetItemId);
  const user = getOrCreateUser(userId);
  const roll = secureUnit();
  const success = roll < quote.successChance;
  const stopAngle = roll * 360;

  for (const id of instanceIds) {
    user.inventory = user.inventory.filter((i) => i.instanceId !== id);
  }

  let wonItem: InventoryItem | undefined;
  if (success) {
    wonItem = {
      instanceId: nanoid(),
      itemId: quote.target.id,
      name: quote.target.name,
      rarity: quote.target.rarity,
      basePrice: quote.target.basePrice,
      float: randomFloat(),
      acquiredAt: new Date().toISOString(),
      source: 'upgrade',
    };
    user.inventory.unshift(wonItem);
  }

  return {
    success,
    successChance: quote.successChance,
    roll,
    stopAngle,
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
    id: nanoid(),
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
  let rows = [...listings.values()];
  if (filters?.rarity) rows = rows.filter((l) => l.instance.rarity === filters.rarity);
  if (filters?.minPrice != null) rows = rows.filter((l) => l.price >= filters.minPrice!);
  if (filters?.maxPrice != null) rows = rows.filter((l) => l.price <= filters.maxPrice!);
  if (filters?.caseId) {
    rows = rows.filter((l) => {
      const def = getItemById(l.instance.itemId);
      return def?.caseId === filters.caseId;
    });
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
  const sellerNet = listing.price - fee;
  const seller = getOrCreateUser(listing.sellerId);

  buyer.coins -= listing.price;
  seller.coins += sellerNet;

  const bought: InventoryItem = {
    ...listing.instance,
    instanceId: nanoid(),
    acquiredAt: new Date().toISOString(),
    source: 'market',
  };
  buyer.inventory.unshift(bought);
  listings.delete(listingId);

  return {
    item: bought,
    paid: listing.price,
    fee,
    coinsLeft: buyer.coins,
  };
}

export function catalogTargets() {
  return allItems().filter(
    (i) => i.rarity === 'rare' || i.rarity === 'epic' || i.rarity === 'legendary' || i.rarity === 'mythic',
  );
}

export { MARKET_FEE_RATE };
