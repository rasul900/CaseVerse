'use client';

import { motion } from 'framer-motion';

type Props = {
  chance: number;
  spinning: boolean;
  stopAngle: number | null;
};

export function UpgradeWheel({ chance, spinning, stopAngle }: Props) {
  const successDeg = Math.max(8, Math.min(352, chance * 360));
  const needle = stopAngle == null ? 0 : 360 * 6 + stopAngle;

  return (
    <div className="upgrade-dial">
      <svg className="wheel" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="92" fill="#10141c" stroke="#2a3140" strokeWidth="6" />
        <path d={describeArc(100, 100, 84, 0, successDeg)} fill="#2ee6a6" />
        <path d={describeArc(100, 100, 84, successDeg, 360)} fill="#ff5c7a" />
        <circle cx="100" cy="100" r="52" fill="#0b0d12" stroke="#2a3140" strokeWidth="2" />
        <text x="100" y="108" textAnchor="middle" fill="#eef1f6" fontSize="22" fontWeight="800" fontFamily="Inter, sans-serif">
          {Math.round(chance * 100)}%
        </text>
        <motion.g
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: spinning || stopAngle != null ? needle : 0 }}
          transition={{ duration: spinning ? 3.8 : 0, ease: [0.12, 0.82, 0.08, 1] }}
        >
          <polygon points="100,18 93,58 107,58" fill="#fff" />
          <circle cx="100" cy="100" r="8" fill="#fff" />
        </motion.g>
      </svg>
    </div>
  );
}

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const large = end - start <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${e.x} ${e.y} A ${r} ${r} 0 ${large} 1 ${s.x} ${s.y} Z`;
}
