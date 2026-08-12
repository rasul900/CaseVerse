import type { CaseDef, ItemDef, Rarity } from './types';
import { HOUSE_EDGE_TARGET, PITY_BONUS, PITY_THRESHOLD } from './types';

const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 0.65,
  uncommon: 0.22,
  rare: 0.085,
  epic: 0.03,
  legendary: 0.012,
  mythic: 0.003,
};

export function caseExpectedValue(caseDef: CaseDef): number {
  return caseDef.items.reduce((sum, item) => sum + itemWeight(item, caseDef) * item.basePrice, 0);
}

export function caseEvRatio(caseDef: CaseDef): number {
  if (caseDef.price <= 0) return 0;
  return caseExpectedValue(caseDef) / caseDef.price;
}

function itemWeight(item: ItemDef, caseDef: CaseDef): number {
  const count = caseDef.items.filter((i) => i.rarity === item.rarity).length || 1;
  return RARITY_WEIGHTS[item.rarity] / count;
}

export function buildWeightedPool(caseDef: CaseDef, pityCounter: number) {
  const pityActive = pityCounter >= PITY_THRESHOLD;
  const entries = caseDef.items.map((item) => {
    let weight = itemWeight(item, caseDef);
    if (pityActive && ['epic', 'legendary', 'mythic'].includes(item.rarity)) {
      weight += PITY_BONUS / 3;
    }
    return { item, weight, cumulative: 0 };
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

export function pickFromPool(caseDef: CaseDef, roll: number, pityCounter: number): ItemDef {
  const pool = buildWeightedPool(caseDef, pityCounter);
  for (const entry of pool) {
    if (roll < entry.cumulative) return entry.item;
  }
  return pool[pool.length - 1]!.item;
}

export function upgradeSuccessChance(inputValue: number, targetValue: number): number {
  if (inputValue <= 0 || targetValue <= 0) return 0;
  const fair = Math.min(0.95, inputValue / targetValue);
  return Math.max(0.01, Math.min(0.9, fair * 0.85));
}

export function assertCaseEvHealthy(caseDef: CaseDef, tolerance = 0.08): void {
  const ratio = caseEvRatio(caseDef);
  if (Math.abs(ratio - HOUSE_EDGE_TARGET) > tolerance) {
    console.warn(`[EV] ${caseDef.id} ratio=${ratio.toFixed(3)} target=${HOUSE_EDGE_TARGET}`);
  }
}
