import type { CaseDef, ItemDef, Rarity } from './types.js';
import { HOUSE_EDGE_TARGET, PITY_BONUS, PITY_THRESHOLD } from './types.js';

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 0.65,
  uncommon: 0.22,
  rare: 0.085,
  epic: 0.03,
  legendary: 0.012,
  mythic: 0.003,
};

export function caseExpectedValue(caseDef: CaseDef): number {
  return caseDef.items.reduce((sum, item) => {
    const weight = itemWeight(item, caseDef);
    return sum + weight * item.basePrice;
  }, 0);
}

export function caseEvRatio(caseDef: CaseDef): number {
  if (caseDef.price <= 0) return 0;
  return caseExpectedValue(caseDef) / caseDef.price;
}

function itemWeight(item: ItemDef, caseDef: CaseDef): number {
  const byRarity = groupByRarity(caseDef.items);
  const rarityTotal = RARITY_WEIGHTS[item.rarity];
  const count = byRarity[item.rarity]?.length ?? 1;
  return rarityTotal / count;
}

export function buildWeightedPool(
  caseDef: CaseDef,
  pityCounter: number,
): { item: ItemDef; weight: number; cumulative: number }[] {
  const pityActive = pityCounter >= PITY_THRESHOLD;
  const entries = caseDef.items.map((item) => {
    let w = itemWeight(item, caseDef);
    if (
      pityActive &&
      (item.rarity === 'epic' || item.rarity === 'legendary' || item.rarity === 'mythic')
    ) {
      w += PITY_BONUS / 3;
    }
    return { item, weight: w, cumulative: 0 };
  });

  const total = entries.reduce((s, e) => s + e.weight, 0);
  let acc = 0;
  for (const e of entries) {
    e.weight /= total;
    acc += e.weight;
    e.cumulative = acc;
  }
  return entries;
}

export function pickFromPool(
  caseDef: CaseDef,
  roll: number,
  pityCounter: number,
): ItemDef {
  const pool = buildWeightedPool(caseDef, pityCounter);
  for (const entry of pool) {
    if (roll < entry.cumulative) return entry.item;
  }
  return pool[pool.length - 1]!.item;
}

/**
 * Upgrade success chance from value ratio.
 * Tuned so EV stays house-favorable (~85% of fair odds).
 * 2x ≈ 42.5%, 5x ≈ 17%, 10x ≈ 8.5%
 */
export function upgradeSuccessChance(inputValue: number, targetValue: number): number {
  if (inputValue <= 0 || targetValue <= 0) return 0;
  const fair = Math.min(0.95, inputValue / targetValue);
  const edged = fair * 0.85;
  return Math.max(0.01, Math.min(0.9, edged));
}

export function assertCaseEvHealthy(caseDef: CaseDef, tolerance = 0.04): void {
  const ratio = caseEvRatio(caseDef);
  if (Math.abs(ratio - HOUSE_EDGE_TARGET) > tolerance) {
    console.warn(
      `[EV] Case "${caseDef.id}" EV ratio=${ratio.toFixed(3)} (target ${HOUSE_EDGE_TARGET})`,
    );
  }
}

function groupByRarity(items: ItemDef[]): Partial<Record<Rarity, ItemDef[]>> {
  return items.reduce<Partial<Record<Rarity, ItemDef[]>>>((acc, item) => {
    (acc[item.rarity] ??= []).push(item);
    return acc;
  }, {});
}

/** Lightweight hex digest for client-side verify demos (not crypto-grade). */
export function simpleHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
