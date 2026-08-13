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
      skin('kv-1', 'Five-SeveN | Orange Peel (Field-Tested)', 'common', 0.08, 'knife-vault'),
      skin('kv-2', 'Glock-18 | Night (Field-Tested)', 'common', 0.1, 'knife-vault'),
      skin('kv-3', 'Nova | Candy Apple (Field-Tested)', 'common', 0.12, 'knife-vault'),
      skin('kv-4', 'Galil AR | Sage Spray (Field-Tested)', 'uncommon', 0.35, 'knife-vault'),
      skin('kv-5', 'UMP-45 | Carbon Fiber (Field-Tested)', 'uncommon', 0.45, 'knife-vault'),
      skin('kv-6', 'FAMAS | Cyanospatter (Field-Tested)', 'rare', 1.8, 'knife-vault'),
      skin('kv-7', 'AWP | Worm God (Field-Tested)', 'epic', 4.5, 'knife-vault'),
      skin('kv-8', '★ Gut Knife | Blue Steel (Field-Tested)', 'legendary', 95, 'knife-vault', 'knife'),
      skin('kv-9', '★ Karambit | Doppler (Factory New)', 'mythic', 850, 'knife-vault', 'knife'),
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
      skin('gw-1', 'Glock-18 | Candy Apple (Field-Tested)', 'common', 0.06, 'glove-war'),
      skin('gw-2', 'Five-SeveN | Forest Night (Field-Tested)', 'common', 0.08, 'glove-war'),
      skin('gw-3', 'P250 | Metallic DDPAT (Factory New)', 'common', 0.1, 'glove-war'),
      skin('gw-4', 'MP7 | Army Recon (Field-Tested)', 'uncommon', 0.28, 'glove-war'),
      skin('gw-5', 'Galil AR | VariCamo (Field-Tested)', 'uncommon', 0.32, 'glove-war'),
      skin('gw-6', 'XM1014 | Blue Steel (Field-Tested)', 'rare', 1.1, 'glove-war'),
      skin('gw-7', 'Desert Eagle | Cobalt Disruption (Field-Tested)', 'epic', 6.5, 'glove-war'),
      skin('gw-8', 'AK-47 | Blue Laminate (Field-Tested)', 'legendary', 18, 'glove-war'),
      skin('gw-9', '★ Sport Gloves | Superconductor (Field-Tested)', 'mythic', 280, 'glove-war', 'glove'),
      skin('gw-10', '★ Specialist Gloves | Crimson Kimono (Field-Tested)', 'mythic', 1200, 'glove-war', 'glove'),
    ],
  },
  {
    id: 'fracture-pack',
    name: 'Fracture Case',
    price: 0.45,
    description: 'Printstream, Desert-Strike era rifles.',
    image: steamImg('Fracture Case'),
    items: [
      skin('fr-1', 'P90 | Freight (Field-Tested)', 'common', 0.05, 'fracture-pack'),
      skin('fr-2', 'Negev | Prototype (Field-Tested)', 'common', 0.06, 'fracture-pack'),
      skin('fr-3', 'P250 | Cassette (Field-Tested)', 'uncommon', 0.18, 'fracture-pack'),
      skin('fr-4', 'Glock-18 | Vogue (Field-Tested)', 'rare', 1.4, 'fracture-pack'),
      skin('fr-5', 'M4A4 | Tooth Fairy (Field-Tested)', 'epic', 4.2, 'fracture-pack'),
      skin('fr-6', 'Desert Eagle | Printstream (Field-Tested)', 'legendary', 42, 'fracture-pack'),
      skin('fr-7', 'AK-47 | Legion of Anubis (Field-Tested)', 'mythic', 28, 'fracture-pack'),
    ],
  },
  {
    id: 'prisma-pack',
    name: 'Prisma Case',
    price: 0.7,
    description: 'The Emperor, Atheris, and more.',
    image: steamImg('Prisma Case'),
    items: [
      skin('pr-1', 'FAMAS | Crypsis (Field-Tested)', 'common', 0.08, 'prisma-pack'),
      skin('pr-2', 'P90 | Off World (Field-Tested)', 'uncommon', 0.22, 'prisma-pack'),
      skin('pr-3', 'Galil AR | Akoben (Field-Tested)', 'rare', 0.9, 'prisma-pack'),
      skin('pr-4', 'AWP | Atheris (Field-Tested)', 'epic', 3.8, 'prisma-pack'),
      skin('pr-5', 'M4A1-S | Player Two (Field-Tested)', 'legendary', 12, 'prisma-pack'),
      skin('pr-6', 'AK-47 | The Empress (Field-Tested)', 'mythic', 48, 'prisma-pack'),
    ],
  },
  {
    id: 'snakebite-pack',
    name: 'Snakebite Case',
    price: 0.35,
    description: 'Food Fight capsule energy — cheap opens.',
    image: steamImg('Snakebite Case'),
    items: [
      skin('sb-1', 'CZ75-Auto | Circaetus (Field-Tested)', 'common', 0.04, 'snakebite-pack'),
      skin('sb-2', 'M249 | O.S.I.P.R. (Field-Tested)', 'uncommon', 0.15, 'snakebite-pack'),
      skin('sb-3', 'USP-S | The Traitor (Field-Tested)', 'rare', 2.1, 'snakebite-pack'),
      skin('sb-4', 'M4A4 | In Living Color (Field-Tested)', 'epic', 8.5, 'snakebite-pack'),
      skin('sb-5', 'AK-47 | Slate (Field-Tested)', 'legendary', 6.5, 'snakebite-pack'),
      skin('sb-6', '★ Sport Gloves | Slingshot (Field-Tested)', 'mythic', 320, 'snakebite-pack', 'glove'),
    ],
  },
  {
    id: 'clutch-pack',
    name: 'Clutch Case',
    price: 0.55,
    description: 'Glock Moonrise, MP9 Hydra, gloves chance.',
    image: steamImg('Clutch Case'),
    items: [
      skin('cl-1', 'PP-Bizon | Night Riot (Field-Tested)', 'common', 0.06, 'clutch-pack'),
      skin('cl-2', 'Five-SeveN | Flame Test (Field-Tested)', 'uncommon', 0.2, 'clutch-pack'),
      skin('cl-3', 'UMP-45 | Arctic Wolf (Field-Tested)', 'rare', 0.85, 'clutch-pack'),
      skin('cl-4', 'Glock-18 | Moonrise (Field-Tested)', 'epic', 1.6, 'clutch-pack'),
      skin('cl-5', 'M4A4 | Neo-Noir (Field-Tested)', 'legendary', 14, 'clutch-pack'),
      skin('cl-6', '★ Butterfly Knife | Ultraviolet (Field-Tested)', 'mythic', 620, 'clutch-pack', 'knife'),
    ],
  },
  {
    id: 'spectrum-pack',
    name: 'Spectrum 2 Case',
    price: 1.1,
    description: 'AK The Empress cousins and Crimson Web.',
    image: steamImg('Spectrum 2 Case'),
    items: [
      skin('sp-1', 'SCAR-20 | Jungle Slipstream (Field-Tested)', 'common', 0.07, 'spectrum-pack'),
      skin('sp-2', 'MAC-10 | Oceanic (Field-Tested)', 'uncommon', 0.25, 'spectrum-pack'),
      skin('sp-3', 'UMP-45 | Exposure (Field-Tested)', 'rare', 1.1, 'spectrum-pack'),
      skin('sp-4', 'M4A1-S | Leaded Glass (Field-Tested)', 'epic', 4.8, 'spectrum-pack'),
      skin('sp-5', 'AK-47 | Bloodsport (Field-Tested)', 'legendary', 38, 'spectrum-pack'),
      skin('sp-6', '★ Huntsman Knife | Fade (Factory New)', 'mythic', 410, 'spectrum-pack', 'knife'),
    ],
  },
  {
    id: 'danger-zone',
    name: 'Danger Zone Case',
    price: 0.6,
    description: 'AWP PAW, Glock Nuclear Garden.',
    image: steamImg('Danger Zone Case'),
    items: [
      skin('dz-1', 'MP9 | Modest Threat (Field-Tested)', 'common', 0.05, 'danger-zone'),
      skin('dz-2', 'Glock-18 | Oxide Blaze (Field-Tested)', 'uncommon', 0.35, 'danger-zone'),
      skin('dz-3', 'USP-S | Flashback (Field-Tested)', 'rare', 1.3, 'danger-zone'),
      skin('dz-4', 'AWP | PAW (Field-Tested)', 'epic', 2.4, 'danger-zone'),
      skin('dz-5', 'AK-47 | Asiimov (Field-Tested)', 'legendary', 32, 'danger-zone'),
      skin('dz-6', 'Desert Eagle | Mecha Industries (Field-Tested)', 'mythic', 9.5, 'danger-zone'),
    ],
  },
  {
    id: 'cs20-pack',
    name: 'CS20 Case',
    price: 0.8,
    description: 'Classic redux skins for CS20.',
    image: steamImg('CS20 Case'),
    items: [
      skin('c2-1', 'Dual Berettas | Elite 1.6 (Field-Tested)', 'common', 0.08, 'cs20-pack'),
      skin('c2-2', 'FAMAS | Commemoration (Field-Tested)', 'uncommon', 0.4, 'cs20-pack'),
      skin('c2-3', 'AWP | Wildfire (Field-Tested)', 'rare', 12, 'cs20-pack'),
      skin('c2-4', 'M4A4 | Magnesium (Field-Tested)', 'epic', 1.8, 'cs20-pack'),
      skin('c2-5', 'AK-47 | Wild Lotus (Field-Tested)', 'legendary', 95, 'cs20-pack'),
      skin('c2-6', 'Sticker | Titan (Holo) | Katowice 2014', 'mythic', 180, 'cs20-pack', 'sticker'),
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
