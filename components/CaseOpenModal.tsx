'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ItemDef, OpenCaseResult, Rarity } from '@/lib/types';
import { rarityColor } from '@/lib/format';
import { formatUsd } from '@/lib/steam';

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
    background: `linear-gradient(180deg, ${c}33 0%, #0c0e12 70%)`,
    boxShadow: `0 0 18px ${c}44, inset 0 0 0 1px ${c}88`,
    borderColor: c,
  };
}

export function CaseOpenModal({ caseName, pool, result, spinning, onClose }: Props) {
  const strip = useMemo(() => {
    const base = [...pool, ...pool, ...pool, ...pool, ...pool, ...pool];
    if (!result) return base;
    const mid = Math.floor(base.length * 0.72);
    base[mid] = result.item;
    return base;
  }, [pool, result]);

  const cellW = 112;
  const offset = result ? -(Math.floor(strip.length * 0.72) * (cellW + 8) - 140) : 0;
  const isSpecial = result?.item.rarity === 'legendary' || result?.item.rarity === 'mythic';

  return (
    <div className={`overlay ${isSpecial && result && !spinning ? 'flash' : ''}`}>
      {isSpecial && result && !spinning && <Confetti />}
      <div className="modal">
        <h2>{caseName}</h2>
        <p className="muted" style={{ fontSize: 12, margin: '0 0 8px' }}>
          Opening case…
        </p>
        <div className="roulette-wrap">
          <div className="roulette-pointer" />
          <motion.div
            className="roulette-track"
            initial={{ x: 0 }}
            animate={{ x: spinning || result ? offset : 0 }}
            transition={{ duration: spinning ? 4.6 : 0, ease: [0.12, 0.75, 0.12, 1] }}
          >
            {strip.map((item, i) => (
              <div key={`${item.id}-${i}`} className="roulette-cell" style={cellStyle(item.rarity)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="skin-img" loading="lazy" />
                <span className="roulette-name">{item.name}</span>
                <span className="roulette-price">{formatUsd(item.basePrice)}</span>
              </div>
            ))}
          </motion.div>
        </div>
        {result && !spinning && (
          <div className="result-drop" style={{ borderColor: rarityColor(result.item.rarity) }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.item.image} alt={result.item.name} />
            <div>
              <strong style={{ color: rarityColor(result.item.rarity) }}>{result.item.name}</strong>
              <p>{formatUsd(result.item.basePrice)}</p>
            </div>
          </div>
        )}
        <button className="btn ghost" onClick={onClose} disabled={spinning} style={{ width: '100%', marginTop: 14 }}>
          Yopish
        </button>
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
            background: i % 2 ? '#39ff14' : '#f5c542',
            animationDelay: `${(i % 8) * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
