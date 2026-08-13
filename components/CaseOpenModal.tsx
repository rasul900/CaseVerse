'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ItemDef, OpenCaseResult, Rarity } from '@/lib/types';
import { rarityColor } from '@/lib/format';

type Props = {
  caseName: string;
  pool: ItemDef[];
  result: OpenCaseResult | null;
  spinning: boolean;
  onClose: () => void;
};

function cellStyle(rarity: Rarity) {
  const c = rarityColor(rarity);
  return {
    background: `linear-gradient(165deg, ${c}44 0%, #0a0a0e 55%, #060608 100%)`,
    boxShadow: `0 0 14px ${c}33, inset 0 0 0 1px ${c}66`,
    borderColor: c,
    color: c,
  };
}

export function CaseOpenModal({ caseName, pool, result, spinning, onClose }: Props) {
  const strip = useMemo(() => {
    const base = [...pool, ...pool, ...pool, ...pool, ...pool];
    if (!result) return base;
    const mid = Math.floor(base.length * 0.72);
    base[mid] = result.item;
    return base;
  }, [pool, result]);

  const offset = result ? -(Math.floor(strip.length * 0.72) * 106 - 160) : 0;
  const isMythic = result?.item.rarity === 'legendary' || result?.item.rarity === 'mythic';

  return (
    <div className={`overlay ${isMythic && result && !spinning ? 'flash' : ''}`}>
      {isMythic && result && !spinning && <Confetti />}
      <div className="modal">
        <h2>{caseName}</h2>
        <p className="muted" style={{ fontSize: 12, margin: '0 0 4px' }}>
          Opening…
        </p>
        <div className="roulette-wrap">
          <div className="roulette-pointer" />
          <motion.div
            className="roulette-track"
            initial={{ x: 0 }}
            animate={{ x: spinning || result ? offset : 0 }}
            transition={{ duration: spinning ? 4.2 : 0, ease: [0.12, 0.75, 0.12, 1] }}
          >
            {strip.map((item, i) => (
              <div key={`${item.id}-${i}`} className="roulette-cell" style={cellStyle(item.rarity)}>
                {item.name}
              </div>
            ))}
          </motion.div>
        </div>
        {result && !spinning && (
          <div className="result-banner win" style={{ color: rarityColor(result.item.rarity) }}>
            {result.item.name} · {result.item.rarity.toUpperCase()} · {result.item.basePrice}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="btn ghost" onClick={onClose} disabled={spinning} style={{ flex: 1 }}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  return (
    <div className="confetti">
      {Array.from({ length: 28 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 17) % 100}%`,
            background: i % 2 ? '#00e8d0' : '#f5c542',
            animationDelay: `${(i % 8) * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
