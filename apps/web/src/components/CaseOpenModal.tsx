import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ItemDef, OpenCaseResult, Rarity } from '@caseverse/shared';
import { rarityColor } from '../lib';

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
    background: `linear-gradient(160deg, ${c}33, #0a1520)`,
    boxShadow: `inset 0 0 0 1px ${c}55`,
    color: c,
  };
}

export function CaseOpenModal({ caseName, pool, result, spinning, onClose }: Props) {
  const strip = useMemo(() => {
    const base = [...pool, ...pool, ...pool, ...pool, ...pool];
    if (!result) return base;
    // Ensure winning item lands near the center stop.
    const mid = Math.floor(base.length * 0.72);
    base[mid] = result.item;
    return base;
  }, [pool, result]);

  const offset = result ? -(Math.floor(strip.length * 0.72) * 100 - 160) : 0;
  const isMythic =
    result?.item.rarity === 'legendary' || result?.item.rarity === 'mythic';

  return (
    <div className={`overlay ${isMythic && result && !spinning ? 'flash' : ''}`}>
      {isMythic && result && !spinning && <Confetti />}
      <div className="modal">
        <h2>{caseName}</h2>
        <p className="muted">Server RNG natijasi — animatsiya faqat vizual.</p>

        <div className="roulette-wrap">
          <div className="roulette-pointer" />
          <motion.div
            className="roulette-track"
            initial={{ x: 0 }}
            animate={{ x: spinning || result ? offset : 0 }}
            transition={{
              duration: spinning ? 4.2 : 0,
              ease: [0.12, 0.75, 0.12, 1],
            }}
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
            {result.item.name} · {result.item.rarity.toUpperCase()} · {result.item.basePrice} coin
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
  const bits = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="confetti">
      {bits.map((i) => (
        <i
          key={i}
          style={{
            left: `${(i * 17) % 100}%`,
            background: i % 2 ? '#00e5c8' : '#f5c542',
            animationDelay: `${(i % 8) * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}
