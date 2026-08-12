import { RARITY_COLORS, RARITY_LABELS, type Rarity } from '@caseverse/shared';

export function rarityColor(r: Rarity): string {
  return RARITY_COLORS[r];
}

export function rarityLabel(r: Rarity): string {
  return RARITY_LABELS[r];
}

export function formatCoins(n: number): string {
  return new Intl.NumberFormat('uz-UZ').format(n);
}
