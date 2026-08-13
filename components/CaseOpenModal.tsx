'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ItemDef, OpenCaseResult, Rarity } from '@/lib/types';
import { rarityColor } from '@/lib/format';
import { formatUsd } from '@/lib/steam';

type Props = {
  caseName: string;
  caseImage?: string;
  pool: ItemDef[];
  result: OpenCaseResult | null;
  spinning: boolean;
  onClose: () => void;
};

function cellStyle(rarity: Rarity) {
  const c = rarityColor(rarity);
  return {
    background: `linear-gradient(180deg, ${c}40 0%, #0c0e14 72%)`,
    borderColor: c,
    boxShadow: `inset 0 0 0 1px ${c}77`,
  };
}

export function CaseOpenModal({ caseName, caseImage, pool, result, spinning, onClose }: Props) {
  const strip = useMemo(() => {
    const base = [...pool, ...pool, ...pool, ...pool, ...pool, ...pool, ...pool];
    if (!result) return base;
    const mid = Math.floor(base.length * 0.72);
    base[mid] = result.item;
    return base;
  }, [pool, result]);

  const cellW = 128;
  const offset = result ? -(Math.floor(strip.length * 0.72) * (cellW + 8) - 160) : 0;
  const done = Boolean(result && !spinning);

  return (
    <motion.div
      className="open-screen"
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.32, 1] }}
    >
      <header className="open-top">
        <button type="button" className="open-back" onClick={onClose} disabled={spinning}>
          ←
        </button>
        <div>
          <p>Opening</p>
          <h2>{caseName}</h2>
        </div>
        {caseImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={caseImage} alt="" className="open-case-img" />
        ) : (
          <span />
        )}
      </header>

      <div className="open-stage">
        <div className="roulette-wrap full">
          <div className="roulette-pointer" />
          <motion.div
            className="roulette-track"
            initial={{ x: 0 }}
            animate={{ x: spinning || result ? offset : 0 }}
            transition={{ duration: spinning ? 4.8 : 0, ease: [0.12, 0.75, 0.12, 1] }}
          >
            {strip.map((item, i) => (
              <div key={`${item.id}-${i}`} className="roulette-cell" style={cellStyle(item.rarity)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="skin-img" />
                <span className="roulette-name">{item.name}</span>
                <span className="roulette-price">{formatUsd(item.basePrice)}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {done && result && (
        <div className="open-win" style={{ borderColor: rarityColor(result.item.rarity) }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.item.image} alt="" />
          <div>
            <strong style={{ color: rarityColor(result.item.rarity) }}>{result.item.name}</strong>
            <p>{formatUsd(result.item.basePrice)}</p>
          </div>
          <button type="button" className="btn" onClick={onClose}>
            Take
          </button>
        </div>
      )}
    </motion.div>
  );
}
