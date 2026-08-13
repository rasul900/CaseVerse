import type { CaseDef, ItemDef, ItemKind, Rarity } from './types';
import { assertCaseEvHealthy } from './rng';
import { steamImg } from './steam';

function skin(
  id: string,
  name: string,
  rarity: Rarity,
  usd: number,
  caseId: string,
  kind: ItemKind = 'skin',
): ItemDef {
  return {
    id,
    name,
    rarity,
    basePrice: usd,
    image: steamImg(name),
    kind,
    caseId,
  };
}

/**
 * Prices ≈ Steam Market USD (Field-Tested / typical wear where noted).
 * EV tuned ~88% of case price (house edge).
 */
export const DEMO_CASES: CaseDef[] = [
  {
    id: 'dust2-essentials',
    name: 'Dust II Essentials',
    price: 0.25,
    description: 'Budget rifles & pistols from the Dust map pool.',
    image: steamImg('Revolution Case'),
    items: [
      skin('d2-1', 'P250 | Sand Dune (Field-Tested)', 'common', 0.03, 'dust2-essentials'),
      skin('d2-2', 'MP7 | Groundwater (Field-Tested)', 'common', 0.04, 'dust2-essentials'),
      skin('d2-3', 'Nova | Sand Dune (Field-Tested)', 'common', 0.05, 'dust2-essentials'),
      skin('d2-4', 'UMP-45 | Urban DDPAT (Field-Tested)', 'uncommon', 0.12, 'dust2-essentials'),
      skin('d2-5', 'MAG-7 | Sand Dune (Field-Tested)', 'uncommon', 0.15, 'dust2-essentials'),
      skin('d2-6', 'Glock-18 | Groundwater (Field-Tested)', 'rare', 0.35, 'dust2-essentials'),
      skin('d2-7', 'AK-47 | Safari Mesh (Field-Tested)', 'epic', 0.9, 'dust2-essentials'),
      skin('d2-8', 'AWP | Safari Mesh (Field-Tested)', 'legendary', 2.8, 'dust2-essentials'),
      skin('d2-9', 'Desert Eagle | Mudder (Field-Tested)', 'mythic', 8.5, 'dust2-essentials'),
    ],
  },
  {
    id: 'redline-armory',
    name: 'Redline Armory',
    price: 2.75,
    description: 'Popular mid-tier skins — Redline, Asiimov vibes.',
    image: steamImg('Recoil Case'),
    items: [
      skin('ra-1', 'Tec-9 | Blue Titanium (Factory New)', 'common', 0.45, 'redline-armory'),
      skin('ra-2', 'Five-SeveN | Forest Night (Field-Tested)', 'common', 0.55, 'redline-armory'),
      skin('ra-3', 'P90 | Module (Field-Tested)', 'uncommon', 1.2, 'redline-armory'),
      skin('ra-4', 'M4A4 | Faded Zebra (Field-Tested)', 'uncommon', 1.6, 'redline-armory'),
      skin('ra-5', 'USP-S | Blood Tiger (Field-Tested)', 'rare', 3.2, 'redline-armory'),
      skin('ra-6', 'AK-47 | Redline (Field-Tested)', 'epic', 18.5, 'redline-armory'),
      skin('ra-7', 'M4A4 | Asiimov (Field-Tested)', 'legendary', 55, 'redline-armory'),
      skin('ra-8', 'AWP | Asiimov (Field-Tested)', 'mythic', 95, 'redline-armory'),
    ],
  },
  {
    id: 'sticker-capsule',
    name: 'Sticker Capsule',
    price: 0.55,
    description: 'Tournament & paper stickers — collect & craft.',
    image: steamImg('Sticker Capsule'),
    items: [
      skin('st-1', 'Sticker | Longevity', 'common', 0.08, 'sticker-capsule', 'sticker'),
      skin('st-2', 'Sticker | Quiet', 'common', 0.1, 'sticker-capsule', 'sticker'),
      skin('st-3', 'Sticker | Flipside', 'uncommon', 0.25, 'sticker-capsule', 'sticker'),
      skin('st-4', 'Sticker | Bomb Code', 'uncommon', 0.35, 'sticker-capsule', 'sticker'),
      skin('st-5', 'Sticker | Welcome to the Clutch', 'rare', 0.85, 'sticker-capsule', 'sticker'),
      skin('st-6', 'Sticker | Nest Egg', 'epic', 2.4, 'sticker-capsule', 'sticker'),
      skin('st-7', 'Sticker | Don\'t Worry, I\'m Pro', 'legendary', 6.5, 'sticker-capsule', 'sticker'),
      skin('st-8', 'Sticker | Howling Dawn', 'mythic', 45, 'sticker-capsule', 'sticker'),
    ],
  },
  {
    id: 'knife-vault',
    name: 'Knife Vault',
    price: 4.75,
    limited: true,
    description: 'High risk — knives & gloves in the pool.',
    image: steamImg('Dreams & Nightmares Case'),
    items: [
      skin('kv-1', 'MP9 | Storm (Field-Tested)', 'common', 0.08, 'knife-vault'),
      skin('kv-2', 'P90 | Storm (Field-Tested)', 'common', 0.1, 'knife-vault'),
      skin('kv-3', 'Galil AR | Sage Spray (Field-Tested)', 'uncommon', 0.35, 'knife-vault'),
      skin('kv-4', 'MAC-10 | Tornado (Field-Tested)', 'uncommon', 0.45, 'knife-vault'),
      skin('kv-5', 'FAMAS | Cyanospatter (Field-Tested)', 'rare', 1.8, 'knife-vault'),
      skin('kv-6', 'AWP | Worm God (Field-Tested)', 'epic', 4.5, 'knife-vault'),
      skin('kv-7', '★ Gut Knife | Blue Steel (Field-Tested)', 'legendary', 95, 'knife-vault', 'knife'),
      skin('kv-8', '★ Karambit | Doppler (Factory New)', 'mythic', 850, 'knife-vault', 'knife'),
    ],
  },
  {
    id: 'glove-war',
    name: 'Glove War Case',
    price: 3.25,
    limited: true,
    description: 'Gloves drop chance — Specialist & Sport gloves.',
    image: steamImg('Kilowatt Case'),
    items: [
      skin('gw-1', 'Dual Berettas | Contractor (Field-Tested)', 'common', 0.06, 'glove-war'),
      skin('gw-2', 'SCAR-20 | Contractor (Field-Tested)', 'common', 0.07, 'glove-war'),
      skin('gw-3', 'MP7 | Army Recon (Field-Tested)', 'uncommon', 0.28, 'glove-war'),
      skin('gw-4', 'XM1014 | Blue Steel (Field-Tested)', 'rare', 1.1, 'glove-war'),
      skin('gw-5', 'Desert Eagle | Cobalt Disruption (Field-Tested)', 'epic', 6.5, 'glove-war'),
      skin('gw-6', '★ Sport Gloves | Superconductor (Field-Tested)', 'legendary', 280, 'glove-war', 'glove'),
      skin('gw-7', '★ Specialist Gloves | Crimson Kimono (Field-Tested)', 'mythic', 1200, 'glove-war', 'glove'),
    ],
  },
];

for (const c of DEMO_CASES) assertCaseEvHealthy(c, 0.25);

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
