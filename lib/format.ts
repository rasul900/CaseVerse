import { RARITY_COLORS, RARITY_LABELS, type Rarity } from '@/lib/types';

export function rarityColor(r: Rarity) {
  return RARITY_COLORS[r];
}

export function rarityLabel(r: Rarity) {
  return RARITY_LABELS[r];
}

export function formatCoins(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n);
}
