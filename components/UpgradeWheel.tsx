'use client';

import { useEffect } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';

type Props = {
  chance: number;
  spinning: boolean;
  stopAngle: number | null;
};

const R = 78;
const CIRC = 2 * Math.PI * R;

export function UpgradeWheel({ chance, spinning, stopAngle }: Props) {
  const rotate = useMotionValue(0);
  const p = Math.max(0, Math.min(1, chance));
  const greenLen = p * CIRC;

  useEffect(() => {
    if (!spinning || stopAngle != null) return;
    const from = rotate.get();
    const ctrl = animate(rotate, from + 360 * 40, { duration: 16, ease: 'linear' });
    return () => ctrl.stop();
  }, [spinning, stopAngle, rotate]);

  useEffect(() => {
    if (stopAngle == null) return;
    const from = rotate.get();
    const mod = ((from % 360) + 360) % 360;
    let delta = stopAngle - mod;
    if (delta < 0) delta += 360;
    const ctrl = animate(rotate, from + delta + 360 * 5, {
      duration: 3.9,
      ease: [0.12, 0.84, 0.06, 1],
    });
    return () => ctrl.stop();
  }, [stopAngle, rotate]);

  useEffect(() => {
    if (spinning || stopAngle != null) return;
    rotate.set(0);
  }, [spinning, stopAngle, rotate]);

  return (
    <div className="upgrade-dial">
      <svg className="wheel" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="98" fill="#0c1018" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i * 15 * Math.PI) / 180;
          const inner = i % 2 === 0 ? 91 : 93;
          const outer = 97;
          return (
            <line
              key={i}
              x1={100 + Math.sin(a) * inner}
              y1={100 - Math.cos(a) * inner}
              x2={100 + Math.sin(a) * outer}
              y2={100 - Math.cos(a) * outer}
              stroke="#4a5568"
              strokeWidth={i % 2 === 0 ? 1.8 : 1}
            />
          );
        })}
        <circle cx="100" cy="100" r={R} fill="none" stroke="#e44562" strokeWidth="16" />
        <circle
          cx="100"
          cy="100"
          r={R}
          fill="none"
          stroke="#2ee6a6"
          strokeWidth="16"
          strokeDasharray={`${greenLen} ${CIRC}`}
          transform="rotate(-90 100 100)"
          strokeLinecap="butt"
        />
        <circle cx="100" cy="100" r="66" fill="#0b0d12" stroke="#1e2533" strokeWidth="2" />
      </svg>

      <div className="upgrade-pct">{Math.round(chance * 100)}%</div>

      <motion.div className="upgrade-needle" style={{ rotate }}>
        <span className="needle-arm" />
        <span className="needle-tail" />
        <span className="needle-hub" />
      </motion.div>
    </div>
  );
}
