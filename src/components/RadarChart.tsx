"use client";

import { motion } from "framer-motion";

export interface RadarAxis {
  label: string;
  value: number; // 0–100, higher = better
}

export function RadarChart({
  axes,
  color = "#22d3ee",
  size = 260,
}: {
  axes: RadarAxis[];
  color?: string;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.32;
  const n = axes.length;

  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const point = (i: number, r: number) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  const rings = [0.25, 0.5, 0.75, 1];
  const valuePoints = axes.map((a, i) => point(i, (Math.max(0, Math.min(100, a.value)) / 100) * R));
  const polygon = valuePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" className="overflow-visible">
      <defs>
        <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0.08" />
        </radialGradient>
      </defs>

      {/* grid rings */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={axes
            .map((_, i) => {
              const p = point(i, ring * R);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}

      {/* axes */}
      {axes.map((_, i) => {
        const p = point(i, R);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {/* value polygon */}
      <motion.polygon
        points={polygon}
        fill="url(#radar-fill)"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        initial={{ opacity: 0, scale: 0.35 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {/* vertices */}
      {valuePoints.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={color}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
        />
      ))}

      {/* labels */}
      {axes.map((a, i) => {
        const p = point(i, R + size * 0.085);
        const anchor = Math.abs(p.x - cx) < 8 ? "middle" : p.x > cx ? "start" : "end";
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={size * 0.044}
            fill="rgba(255,255,255,0.65)"
            fontWeight={500}
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
