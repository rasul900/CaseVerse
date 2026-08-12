import type { CaseDef, ItemDef } from './types';
import { assertCaseEvHealthy } from './rng';

function item(
  id: string,
  name: string,
  rarity: ItemDef['rarity'],
  basePrice: number,
  caseId: string,
): ItemDef {
  return { id, name, rarity, basePrice, caseId };
}

export const DEMO_CASES: CaseDef[] = [
  {
    id: 'neon-breach',
    name: 'Neon Breach',
    price: 100,
    description: 'Cyber-grid skins — entry case for new explorers.',
    items: [
      item('nb-common-1', 'Grid Hoodie', 'common', 32, 'neon-breach'),
      item('nb-common-2', 'Static Cap', 'common', 36, 'neon-breach'),
      item('nb-common-3', 'Pulse Gloves', 'common', 40, 'neon-breach'),
      item('nb-uncommon-1', 'Teal Runner', 'uncommon', 70, 'neon-breach'),
      item('nb-uncommon-2', 'Circuit Blade', 'uncommon', 80, 'neon-breach'),
      item('nb-rare-1', 'Aurora SMG', 'rare', 160, 'neon-breach'),
      item('nb-epic-1', 'Void Phantom', 'epic', 380, 'neon-breach'),
      item('nb-legendary-1', 'CaseVerse Crown', 'legendary', 1100, 'neon-breach'),
      item('nb-mythic-1', 'Genesis Core', 'mythic', 4500, 'neon-breach'),
    ],
  },
  {
    id: 'obsidian-rift',
    name: 'Obsidian Rift',
    price: 250,
    description: 'Dark-matter pool with higher epic ceiling.',
    limited: true,
    items: [
      item('or-common-1', 'Ash Cloak', 'common', 80, 'obsidian-rift'),
      item('or-common-2', 'Rift Boots', 'common', 95, 'obsidian-rift'),
      item('or-uncommon-1', 'Night Scope', 'uncommon', 175, 'obsidian-rift'),
      item('or-uncommon-2', 'Eclipse Knife', 'uncommon', 200, 'obsidian-rift'),
      item('or-rare-1', 'Black Nova AR', 'rare', 400, 'obsidian-rift'),
      item('or-epic-1', 'Singularity Coat', 'epic', 950, 'obsidian-rift'),
      item('or-legendary-1', 'Obsidian Relic', 'legendary', 2800, 'obsidian-rift'),
      item('or-mythic-1', 'Rift Sovereign', 'mythic', 11000, 'obsidian-rift'),
    ],
  },
  {
    id: 'solar-forge',
    name: 'Solar Forge',
    price: 500,
    description: 'Limited forge drop — FOMO premium case.',
    limited: true,
    items: [
      item('sf-common-1', 'Ember Wrap', 'common', 160, 'solar-forge'),
      item('sf-common-2', 'Cinder Band', 'common', 185, 'solar-forge'),
      item('sf-uncommon-1', 'Solar Gauntlet', 'uncommon', 360, 'solar-forge'),
      item('sf-rare-1', 'Flare Cannon', 'rare', 800, 'solar-forge'),
      item('sf-epic-1', 'Helios Armor', 'epic', 1900, 'solar-forge'),
      item('sf-legendary-1', 'Starforge Blade', 'legendary', 5500, 'solar-forge'),
      item('sf-mythic-1', 'CaseVerse Sun', 'mythic', 22000, 'solar-forge'),
    ],
  },
];

for (const c of DEMO_CASES) assertCaseEvHealthy(c);

export function getCaseById(id: string) {
  return DEMO_CASES.find((c) => c.id === id);
}

export function getItemById(id: string) {
  for (const c of DEMO_CASES) {
    const found = c.items.find((i) => i.id === id);
    if (found) return found;
  }
}

export function allItems() {
  return DEMO_CASES.flatMap((c) => c.items);
}
