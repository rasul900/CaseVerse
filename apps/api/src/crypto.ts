import { createHash, randomBytes } from 'node:crypto';
import { pickFromPool } from '@caseverse/shared';
import type { CaseDef, ItemDef } from '@caseverse/shared';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function newServerSeed(): string {
  return randomBytes(32).toString('hex');
}

export function secureUnit(): number {
  const buf = randomBytes(6);
  const int = buf.readUIntBE(0, 6);
  return int / 0x1000000000000;
}

export function provablyFairRoll(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
): number {
  const hex = sha256(`${serverSeed}:${clientSeed}:${nonce}`);
  const slice = hex.slice(0, 13);
  const int = parseInt(slice, 16);
  return int / 0x1fffffffffffff;
}

export function rollCaseItem(
  caseDef: CaseDef,
  pityCounter: number,
  serverSeed: string,
  clientSeed: string,
  nonce: number,
): { item: ItemDef; roll: number } {
  const roll = provablyFairRoll(serverSeed, clientSeed, nonce);
  const item = pickFromPool(caseDef, roll, pityCounter);
  return { item, roll };
}
