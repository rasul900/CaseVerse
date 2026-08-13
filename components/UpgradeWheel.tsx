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
      <div className="wheel-ring" aria-hidden />
      <svg className="wheel" viewBox="0 0 200 200">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="metalRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a3a48" />
            <stop offset="50%" stopColor="#1a1a22" />
            <stop offset="100%" stopColor="#4a4a58" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="96" fill="none" stroke="url(#metalRim)" strokeWidth="4" />
        <motion.g
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: spinning || stopAngle != null ? rotation : 0 }}
          transition={{ duration: spinning ? 3.6 : 0, ease: [0.12, 0.8, 0.1, 1] }}
        >
          <circle cx="100" cy="100" r="90" fill="#0a0a0e" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          <path d={describeArc(100, 100, 90, 0, successDeg)} fill="#3ddc97" opacity="0.95" filter="url(#glow)" />
          <path d={describeArc(100, 100, 90, successDeg, 360)} fill="#ff3b5c" opacity="0.9" />
          <circle cx="100" cy="100" r="46" fill="#101014" stroke="rgba(255,255,255,0.08)" />
          <circle cx="100" cy="100" r="40" fill="#0a0a0c" />
          <text
            x="100"
            y="106"
            textAnchor="middle"
            fill="#00e8d0"
            fontSize="20"
            fontFamily="Orbitron, sans-serif"
            fontWeight="700"
          >
            {Math.round(chance * 100)}%
          </text>
        </motion.g>
        <polygon points="100,6 91,24 109,24" fill="#00e8d0" filter="url(#glow)" />
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
