import { createHash, randomBytes } from 'node:crypto';
import type { CaseDef, ItemDef } from './types';
import { pickFromPool } from './rng';

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function newServerSeed(): string {
  return randomBytes(32).toString('hex');
}

export function secureUnit(): number {
  const buf = randomBytes(6);
  return buf.readUIntBE(0, 6) / 0x1000000000000;
}

export function newId(): string {
  return randomBytes(12).toString('hex');
}

export function provablyFairRoll(serverSeed: string, clientSeed: string, nonce: number): number {
  const hex = sha256(`${serverSeed}:${clientSeed}:${nonce}`);
  return parseInt(hex.slice(0, 13), 16) / 0x1fffffffffffff;
}

export function rollCaseItem(
  caseDef: CaseDef,
  pityCounter: number,
  serverSeed: string,
  clientSeed: string,
  nonce: number,
): { item: ItemDef; roll: number } {
  const roll = provablyFairRoll(serverSeed, clientSeed, nonce);
  return { item: pickFromPool(caseDef, roll, pityCounter), roll };
}
