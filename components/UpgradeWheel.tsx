'use client';

import { motion } from 'framer-motion';

type Props = {
  chance: number;
  spinning: boolean;
  stopAngle: number | null;
};

export function UpgradeWheel({ chance, spinning, stopAngle }: Props) {
  const successDeg = Math.max(4, Math.min(356, chance * 360));
  const rotation = stopAngle == null ? 0 : 360 * 5 + (360 - stopAngle);

  return (
    <div className="wheel-stage">
      <svg className="wheel" viewBox="0 0 200 200">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.g
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: spinning || stopAngle != null ? rotation : 0 }}
          transition={{ duration: spinning ? 3.6 : 0, ease: [0.12, 0.8, 0.1, 1] }}
        >
          <circle cx="100" cy="100" r="90" fill="#0a1520" stroke="rgba(255,255,255,0.08)" />
          <path d={describeArc(100, 100, 90, 0, successDeg)} fill="#3ddc97" opacity="0.9" filter="url(#glow)" />
          <path d={describeArc(100, 100, 90, successDeg, 360)} fill="#ff4d6d" opacity="0.85" />
          <circle cx="100" cy="100" r="48" fill="#071018" />
          <text
            x="100"
            y="104"
            textAnchor="middle"
            fill="#e8f2f8"
            fontSize="18"
            fontFamily="Orbitron, sans-serif"
            fontWeight="700"
          >
            {Math.round(chance * 100)}%
          </text>
        </motion.g>
        <polygon points="100,8 92,24 108,24" fill="#00e5c8" />
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
