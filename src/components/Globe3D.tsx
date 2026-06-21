import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type GlobeCountry = {
  code: string;
  name: string;
  lat: number;
  lon: number;
  industry: string;
  direction: string;
  partnership: string;
};

const ORIGIN = { code: 'UZ', name: 'Uzbekistan', lat: 41.3, lon: 69.3 };

const DEFAULT_COUNTRIES: GlobeCountry[] = [
  { code: 'DE', name: 'Germany',      lat: 51.1, lon: 10.4, industry: 'Textile Manufacturing', direction: 'Tashkent → Hamburg',  partnership: 'Long-term Supply' },
  { code: 'PL', name: 'Poland',       lat: 52.2, lon: 21.0, industry: 'Logistics & Transit',   direction: 'Tashkent → Warsaw',   partnership: 'EU Gateway' },
  { code: 'FR', name: 'France',       lat: 48.8, lon: 2.3,  industry: 'Premium Goods',         direction: 'Tashkent → Paris',    partnership: 'Boutique Network' },
  { code: 'TR', name: 'Turkey',       lat: 39.0, lon: 35.2, industry: 'Construction Materials',direction: 'Tashkent → Istanbul', partnership: 'Wholesale Hub' },
  { code: 'RU', name: 'Russia',       lat: 55.7, lon: 37.6, industry: 'Consumer Goods',        direction: 'Tashkent → Moscow',   partnership: 'Distribution Partner' },
  { code: 'KZ', name: 'Kazakhstan',   lat: 48.0, lon: 68.0, industry: 'Agricultural Products', direction: 'Tashkent → Almaty',   partnership: 'Trade Network' },
  { code: 'AE', name: 'UAE',          lat: 24.5, lon: 54.4, industry: 'Industrial Products',   direction: 'Tashkent → Dubai',    partnership: 'Strategic Distributor' },
  { code: 'SA', name: 'Saudi Arabia', lat: 24.7, lon: 46.7, industry: 'Food Export',           direction: 'Tashkent → Riyadh',   partnership: 'GCC Supply' },
  { code: 'CN', name: 'China',        lat: 39.9, lon: 116.4,industry: 'Trade & Manufacturing', direction: 'Tashkent → Beijing',  partnership: 'Belt & Road Corridor' },
];

// Coarse land mask (lon, lat rectangles) — enough to give a recognizable continent silhouette
const LAND: Array<[number, number, number, number]> = [
  // [lonMin, lonMax, latMin, latMax]
  // Eurasia
  [-10, 60, 35, 72],   // Europe + W Russia
  [60, 180, 40, 75],   // N Asia / Siberia
  [25, 60, 12, 42],    // Middle East
  [60, 140, 5, 50],    // S/E Asia
  // Africa
  [-18, 52, -35, 35],
  // Americas
  [-170, -50, 8, 72],  // N America
  [-82, -34, -56, 12], // S America
  // Oceania
  [112, 154, -39, -10],
  // UK / Scandinavia extras
  [-10, 5, 49, 60],
  // Indonesia
  [95, 141, -10, 6],
];

function isLand(lon: number, lat: number) {
  for (const [a, b, c, d] of LAND) {
    if (lon >= a && lon <= b && lat >= c && lat <= d) return true;
  }
  return false;
}

// Convert lat/lon (deg) to 3D unit vector, then rotate by Y axis (yaw) and tilt X (pitch)
function project(lat: number, lon: number, yaw: number, pitch: number) {
  const φ = (lat * Math.PI) / 180;
  const λ = (lon * Math.PI) / 180;
  // base sphere coords (z toward viewer)
  let x = Math.cos(φ) * Math.sin(λ);
  let y = Math.sin(φ);
  let z = Math.cos(φ) * Math.cos(λ);
  // yaw around Y
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  x = x1; z = z1;
  // pitch around X
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const y2 = y * cp - z * sp;
  const z2 = y * sp + z * cp;
  y = y2; z = z2;
  return { x, y, z };
}

export function Globe3D({
  size = 720,
  countries = DEFAULT_COUNTRIES,
  onSelect,
}: {
  size?: number;
  countries?: GlobeCountry[];
  onSelect?: (c: GlobeCountry | null) => void;
}) {
  const [yaw, setYaw] = useState(-1.2); // start facing Eurasia
  const pitch = -0.35;
  const rafRef = useRef<number>();
  const lastT = useRef<number>(0);
  const paused = useRef(false);
  const [hover, setHover] = useState<string | null>(null);

  // Build dotted sphere points (lat/lon grid)
  const dots = useMemo(() => {
    const out: Array<{ lat: number; lon: number; land: boolean }> = [];
    const latStep = 3;
    for (let lat = -78; lat <= 78; lat += latStep) {
      // Number of dots per latitude scales with cos(lat) so spacing stays even on sphere
      const circ = Math.cos((lat * Math.PI) / 180);
      const count = Math.max(12, Math.round(140 * circ));
      for (let i = 0; i < count; i++) {
        const lon = -180 + (360 * i) / count;
        out.push({ lat, lon, land: isLand(lon, lat) });
      }
    }
    return out;
  }, []);

  useEffect(() => {
    const tick = (t: number) => {
      if (lastT.current === 0) lastT.current = t;
      const dt = (t - lastT.current) / 1000;
      lastT.current = t;
      if (!paused.current) setYaw((y) => y + dt * 0.08);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const R = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;

  const proj = (lat: number, lon: number) => {
    const p = project(lat, lon, yaw, pitch);
    return { x: cx + p.x * R, y: cy - p.y * R, z: p.z };
  };

  // Greatcircle-ish arc from a→b that bulges outward in 3D (uses midpoint lifted off sphere)
  function arcPath(a: GlobeCountry | typeof ORIGIN, b: GlobeCountry) {
    const pa = project(a.lat, a.lon, yaw, pitch);
    const pb = project(b.lat, b.lon, yaw, pitch);
    // midpoint on sphere
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const mz = (pa.z + pb.z) / 2;
    const len = Math.hypot(mx, my, mz) || 1;
    // lift midpoint above sphere to create arching ray
    const lift = 1.55;
    const cx3 = (mx / len) * lift;
    const cy3 = (my / len) * lift;
    const cz3 = (mz / len) * lift;
    const ax = cx + pa.x * R, ay = cy - pa.y * R;
    const bx = cx + pb.x * R, by = cy - pb.y * R;
    const ctlX = cx + cx3 * R, ctlY = cy - cy3 * R;
    const visible = pa.z > -0.05 || pb.z > -0.05 || cz3 > -0.05;
    return { d: `M ${ax} ${ay} Q ${ctlX} ${ctlY} ${bx} ${by}`, visible, midZ: cz3 };
  }

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => { paused.current = false; setHover(null); onSelect?.(null); }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.06" />
            <stop offset="60%" stopColor="#c9a84c" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="atmos" cx="50%" cy="50%">
            <stop offset="85%" stopColor="#c9a84c" stopOpacity="0" />
            <stop offset="96%" stopColor="#c9a84c" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rayGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#f6d27a" stopOpacity="0" />
            <stop offset="35%" stopColor="#f6d27a" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#ffe8a8" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="markerGlow">
            <stop offset="0%" stopColor="#ffe8a8" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#c9a84c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        {/* outer glow halo */}
        <circle cx={cx} cy={cy} r={R + 6} fill="url(#atmos)" />
        <circle cx={cx} cy={cy} r={R} fill="url(#globeGlow)" />

        {/* sphere outline (very faint) */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#c9a84c" strokeOpacity="0.08" />

        {/* dotted globe */}
        <g>
          {dots.map((d, i) => {
            const p = project(d.lat, d.lon, yaw, pitch);
            if (p.z < -0.02) return null; // back face
            const x = cx + p.x * R;
            const y = cy - p.y * R;
            // depth fade
            const depth = 0.4 + 0.6 * Math.max(0, p.z);
            if (d.land) {
              return <circle key={i} cx={x} cy={y} r={1.25} fill="#c9a84c" opacity={0.55 * depth} />;
            }
            // ocean dot — faint
            return <circle key={i} cx={x} cy={y} r={0.7} fill="#8a8a8a" opacity={0.18 * depth} />;
          })}
        </g>

        {/* arcs from Uzbekistan */}
        <g>
          {countries.map((c, i) => {
            const arc = arcPath(ORIGIN, c);
            if (!arc.visible) return null;
            const isHover = hover === c.code;
            return (
              <g key={`arc-${c.code}`}>
                {/* soft glow underlay */}
                <path
                  d={arc.d}
                  fill="none"
                  stroke="url(#rayGrad)"
                  strokeWidth={isHover ? 4 : 2.5}
                  strokeLinecap="round"
                  opacity={isHover ? 0.9 : 0.55}
                  filter="url(#softGlow)"
                />
                <path
                  d={arc.d}
                  fill="none"
                  stroke="url(#rayGrad)"
                  strokeWidth={isHover ? 1.6 : 1.1}
                  strokeLinecap="round"
                  opacity={isHover ? 1 : 0.85}
                />
                {/* moving particle */}
                <circle r={isHover ? 3 : 2} fill="#ffe8a8">
                  <animateMotion dur={`${3 + (i % 4) * 0.6}s`} repeatCount="indefinite" path={arc.d} />
                </circle>
              </g>
            );
          })}
        </g>

        {/* country markers */}
        <g>
          {countries.map((c) => {
            const p = proj(c.lat, c.lon);
            if (p.z < -0.02) return null;
            const isHover = hover === c.code;
            return (
              <g
                key={`mk-${c.code}`}
                onMouseEnter={() => { setHover(c.code); onSelect?.(c); }}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={p.x} cy={p.y} r={isHover ? 18 : 12} fill="url(#markerGlow)" />
                <circle cx={p.x} cy={p.y} r={isHover ? 3.5 : 2.8} fill="#ffe8a8" />
                <circle cx={p.x} cy={p.y} r={6} fill="none" stroke="#c9a84c" strokeOpacity="0.4" />
                <text
                  x={p.x + 10}
                  y={p.y - 8}
                  fontSize="10.5"
                  fill="#fff"
                  opacity={isHover ? 1 : 0.7}
                  fontFamily="sans-serif"
                  style={{ pointerEvents: 'none' }}
                >
                  {c.name}
                </text>
              </g>
            );
          })}

          {/* Uzbekistan origin */}
          {(() => {
            const p = proj(ORIGIN.lat, ORIGIN.lon);
            if (p.z < -0.02) return null;
            return (
              <g>
                <circle cx={p.x} cy={p.y} r={22} fill="url(#markerGlow)" opacity={0.9}>
                  <animate attributeName="r" values="18;28;18" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={p.x} cy={p.y} r={5} fill="#ffe8a8" />
                <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="#c9a84c" strokeWidth="1.2" />
                <text x={p.x + 12} y={p.y + 4} fontSize="12" fill="#c9a84c" fontWeight="700" fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>
                  Uzbekistan
                </text>
              </g>
            );
          })()}
        </g>
      </svg>

      {/* subtle ambient sparkles outside the globe */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * Math.PI * 2;
          const rad = R + 18 + ((i * 13) % 60);
          const x = cx + Math.cos(angle) * rad;
          const y = cy + Math.sin(angle) * rad;
          return (
            <span
              key={i}
              className="absolute block rounded-full bg-[#c9a84c]/40"
              style={{ left: x, top: y, width: 2, height: 2, opacity: 0.3 + ((i % 5) / 10) }}
            />
          );
        })}
      </div>
    </div>
  );
}

export const GLOBE_COUNTRIES = DEFAULT_COUNTRIES;
