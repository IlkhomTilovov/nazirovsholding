import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { motion, AnimatePresence } from 'framer-motion';

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
export type Market = {
  code: string;
  name: string;
  lat: number;
  lon: number;
  industry: string;
  partnership: string;
  sector: string;
  status: string;
};

const ORIGIN: Market = {
  code: 'UZ',
  name: 'Uzbekistan',
  lat: 41.3,
  lon: 69.3,
  industry: 'Export Hub',
  partnership: 'Bosh Markaz',
  sector: 'Strategic Origin',
  status: 'Faol Markaz',
};

export const MARKETS: Market[] = [
  { code: 'DE', name: 'Germany',      lat: 51.1, lon: 10.4, industry: 'Textile Manufacturing', partnership: 'Strategic Export',  sector: 'Industrial',  status: 'Active Market' },
  { code: 'FR', name: 'France',       lat: 48.8, lon: 2.3,  industry: 'Premium Goods',         partnership: 'Boutique Network',  sector: 'Retail',      status: 'Active Market' },
  { code: 'PL', name: 'Poland',       lat: 52.2, lon: 21.0, industry: 'Logistics & Transit',   partnership: 'EU Gateway',        sector: 'Logistics',   status: 'Expanding' },
  { code: 'TR', name: 'Turkey',       lat: 39.0, lon: 35.2, industry: 'Construction Materials',partnership: 'Wholesale Hub',     sector: 'Manufacturing',status: 'Active Market' },
  { code: 'RU', name: 'Russia',       lat: 55.7, lon: 37.6, industry: 'Consumer Goods',        partnership: 'Distribution',      sector: 'Trade',       status: 'Active Market' },
  { code: 'KZ', name: 'Kazakhstan',   lat: 48.0, lon: 68.0, industry: 'Agricultural Products', partnership: 'Trade Network',     sector: 'Agriculture', status: 'Active Market' },
  { code: 'AE', name: 'UAE',          lat: 24.5, lon: 54.4, industry: 'Industrial Products',   partnership: 'Strategic Distributor', sector: 'Industrial', status: 'Active Market' },
  { code: 'SA', name: 'Saudi Arabia', lat: 24.7, lon: 46.7, industry: 'Food Export',           partnership: 'GCC Supply',        sector: 'Agriculture', status: 'Expanding' },
  { code: 'CN', name: 'China',        lat: 39.9, lon: 116.4,industry: 'Trade & Manufacturing', partnership: 'Belt & Road',       sector: 'Manufacturing',status: 'Strategic' },
];

const COUNTRIES_GEOJSON_URL =
  'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/country-polygons/ne_110m_admin_0_countries.geojson';

const GLOBE_RADIUS = 100; // three-globe default
const GOLD = '#c9a84c';
const GOLD_BRIGHT = '#ffe39a';

// lat/lon → vector on sphere (three-globe coord system)
function latLonToVec3(lat: number, lon: number, altitude = 0) {
  const r = GLOBE_RADIUS * (1 + altitude);
  const φ = (90 - lat) * (Math.PI / 180);
  const λ = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(φ) * Math.cos(λ),
     r * Math.cos(φ),
     r * Math.sin(φ) * Math.sin(λ),
  );
}

// ─────────────────────────────────────────────────────────────
// Globe — real Earth via three-globe + GeoJSON country polygons
// ─────────────────────────────────────────────────────────────
function Globe({
  highlightedCode,
  onCountryHover,
  onCountryClick,
}: {
  highlightedCode: string | null;
  onCountryHover: (iso: string | null) => void;
  onCountryClick: (iso: string | null) => void;
}) {
  const [polygons, setPolygons] = useState<any[]>([]);
  const globe = useMemo(() => {
    const g = new ThreeGlobe({ animateIn: true })
      .showAtmosphere(true)
      .atmosphereColor(GOLD)
      .atmosphereAltitude(0.22)
      .showGlobe(true)
      .globeMaterial(
        new THREE.MeshPhongMaterial({
          color: new THREE.Color('#1a1a1a'),
          emissive: new THREE.Color('#0a0a0a'),
          specular: new THREE.Color('#3a2a08'),
          shininess: 22,
        }),
      );
    return g;
  }, []);

  // Load real-world GeoJSON
  useEffect(() => {
    let cancelled = false;
    fetch(COUNTRIES_GEOJSON_URL)
      .then((r) => r.json())
      .then((geo) => {
        if (cancelled) return;
        const feats = geo.features.filter(
          (f: any) => f.properties.ISO_A2 !== 'AQ',
        );
        setPolygons(feats);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Polygon (country) layer
  useEffect(() => {
    if (!polygons.length) return;
    const isHi = (d: any) =>
      d.properties.ISO_A2 === highlightedCode ||
      d.properties.ISO_A2 === ORIGIN.code;

    (globe as any)
      .polygonsData(polygons)
      .polygonAltitude((d: any) => (isHi(d) ? 0.014 : 0.006))
      .polygonCapColor((d: any) =>
        isHi(d) ? 'rgba(201,168,76,0.55)' : 'rgba(46,38,18,0.55)',
      )
      .polygonSideColor(() => 'rgba(201,168,76,0.06)')
      .polygonStrokeColor(() => 'rgba(201,168,76,0.55)')
      .polygonsTransitionDuration(450);
  }, [polygons, highlightedCode, globe, onCountryHover, onCountryClick]);

  // Arcs (Uzbekistan → markets)
  useEffect(() => {
    const arcs = MARKETS.map((m) => ({
      startLat: ORIGIN.lat,
      startLng: ORIGIN.lon,
      endLat: m.lat,
      endLng: m.lon,
      code: m.code,
      color: highlightedCode === m.code ? GOLD_BRIGHT : GOLD,
    }));
    globe
      .arcsData(arcs)
      .arcColor((d: any) => [`rgba(255,217,106,0.05)`, d.color, `rgba(255,217,106,0.05)`])
      .arcAltitudeAutoScale(0.45)
      .arcStroke(0.45)
      .arcDashLength(0.55)
      .arcDashGap(0.35)
      .arcDashAnimateTime(3200)
      .arcsTransitionDuration(400);
  }, [globe, highlightedCode]);

  // Origin + market points
  useEffect(() => {
    const points = [
      { lat: ORIGIN.lat, lng: ORIGIN.lon, size: 0.55, color: GOLD_BRIGHT, isOrigin: true },
      ...MARKETS.map((m) => ({
        lat: m.lat,
        lng: m.lon,
        size: 0.35,
        color: highlightedCode === m.code ? GOLD_BRIGHT : GOLD,
        isOrigin: false,
      })),
    ];
    globe
      .pointsData(points)
      .pointColor((d: any) => d.color)
      .pointAltitude(0.012)
      .pointRadius((d: any) => d.size)
      .pointsMerge(false);

    // Ring rings — animated pulse around markers
    globe
      .ringsData([
        { lat: ORIGIN.lat, lng: ORIGIN.lon },
        ...MARKETS.map((m) => ({ lat: m.lat, lng: m.lon })),
      ])
      .ringColor(() => (t: number) => `rgba(201,168,76,${1 - t})`)
      .ringMaxRadius(2.8)
      .ringPropagationSpeed(1.4)
      .ringRepeatPeriod(2200);
  }, [globe, highlightedCode]);

  // Scale into R3F unit-ish space
  return <primitive object={globe} scale={0.012} />;
}

// ─────────────────────────────────────────────────────────────
// Floating labels above markers (HTML overlay)
// ─────────────────────────────────────────────────────────────
function MarketLabels({
  highlightedCode,
  setHighlighted,
}: {
  highlightedCode: string | null;
  setHighlighted: (v: string | null) => void;
}) {
  const SCALE = 0.012;
  const all = useMemo(
    () => [{ ...ORIGIN, isOrigin: true as const }, ...MARKETS.map((m) => ({ ...m, isOrigin: false as const }))],
    [],
  );
  return (
    <>
      {all.map((m) => {
        const v = latLonToVec3(m.lat, m.lon, 0.04).multiplyScalar(SCALE);
        const active = highlightedCode === m.code || m.isOrigin;
        return (
          <Html
            key={m.code}
            position={[v.x, v.y, v.z]}
            center
            distanceFactor={3.5}
            occlude
            style={{ pointerEvents: 'auto' }}
          >
            <button
              onMouseEnter={() => setHighlighted(m.code)}
              onMouseLeave={() => setHighlighted(null)}
              onClick={() => setHighlighted(m.code)}
              className="select-none whitespace-nowrap font-medium tracking-[0.18em] uppercase"
              style={{
                fontSize: m.isOrigin ? 11 : 9.5,
                color: m.isOrigin ? '#ffe39a' : active ? '#ffe39a' : '#c9a84c',
                background: 'rgba(8,8,8,0.78)',
                border: `1px solid rgba(201,168,76,${active ? 0.55 : 0.22})`,
                padding: '3px 8px',
                borderRadius: 2,
                textShadow: '0 1px 6px rgba(0,0,0,0.9)',
                transition: 'all .2s',
                cursor: 'pointer',
              }}
            >
              {m.name}
            </button>
          </Html>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Controls
// ─────────────────────────────────────────────────────────────
function SmartControls() {
  const ref = useRef<any>(null);
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.3, 4.2);
  }, [camera]);
  return (
    <OrbitControls
      ref={ref}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={2.4}
      maxDistance={6.5}
      rotateSpeed={0.7}
      zoomSpeed={0.7}
      autoRotate
      autoRotateSpeed={0.32}
      onStart={() => {
        if (ref.current) ref.current.autoRotate = false;
      }}
      onEnd={() => {
        window.setTimeout(() => {
          if (ref.current) ref.current.autoRotate = true;
        }, 2500);
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Scene
// ─────────────────────────────────────────────────────────────
function Scene({
  highlightedCode,
  setHighlighted,
  onSelect,
}: {
  highlightedCode: string | null;
  setHighlighted: (v: string | null) => void;
  onSelect: (iso: string | null) => void;
}) {
  return (
    <>
      <color attach="background" args={['#0d0d0d']} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color={'#ffd58a'} />
      <directionalLight position={[-5, -2, -3]} intensity={0.3} color={'#5a3f10'} />
      <hemisphereLight args={['#3a2c10', '#000', 0.25]} />

      <Suspense fallback={null}>
        <Globe
          highlightedCode={highlightedCode}
          onCountryHover={setHighlighted}
          onCountryClick={onSelect}
        />
        <MarketLabels
          highlightedCode={highlightedCode}
          setHighlighted={setHighlighted}
        />
      </Suspense>

      <SmartControls />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Public Section
// ─────────────────────────────────────────────────────────────
export function InteractiveEarthSection() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const active = useMemo(() => {
    const code = selected ?? hovered;
    return MARKETS.find((m) => m.code === code) ?? null;
  }, [hovered, selected]);

  return (
    <section className="relative bg-[#0d0d0d] text-white py-24 md:py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(201,168,76,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.4)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 md:mb-20 max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-12 bg-[#c9a84c]" />
            <span className="text-[#c9a84c] text-[11px] tracking-[0.45em] uppercase font-medium">Global Presence</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white">
            Real World Map. <span className="italic text-[#c9a84c]">Real Connections.</span>
          </h2>
          <p className="mt-6 text-white/65 max-w-2xl leading-relaxed">
            Interaktiv 3D Yer shari — haqiqiy davlat chegaralari, kontinent shakllari va NazirovSholding
            xalqaro bozorlari bilan jonli savdo yo'nalishlari.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-stretch">
          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 relative rounded-sm border border-[#c9a84c]/15 bg-gradient-to-b from-[#101010] to-[#070707] overflow-hidden flex"
            style={{ minHeight: 'min(85vh, 760px)' }}
          >
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#c9a84c]/70">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
              Live Network
            </div>
            <div className="absolute top-4 right-4 z-10 text-right">
              <div className="text-[9px] tracking-[0.35em] uppercase text-[#c9a84c]/60">Center Origin</div>
              <div className="text-xs tracking-[0.25em] uppercase text-white/90 mt-1">Uzbekistan · Tashkent</div>
            </div>
            <div className="absolute bottom-4 right-4 z-10 text-[10px] tracking-[0.3em] uppercase text-white/35">
              Drag · Scroll · Click
            </div>

            <div className="flex-1 w-full min-h-[560px] md:min-h-[640px]">
              <Canvas
                gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
                camera={{ position: [0, 0.3, 4.2], fov: 42 }}
                style={{ width: '100%', height: '100%' }}
              >
                <Scene
                  highlightedCode={selected ?? hovered}
                  setHighlighted={setHovered}
                  onSelect={setSelected}
                />
              </Canvas>
            </div>
          </motion.div>

          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col gap-4"
          >
            <div className="rounded-sm border border-[#c9a84c]/20 bg-[#0e0e0e]/80 backdrop-blur p-6">
              <div className="text-[10px] tracking-[0.4em] uppercase text-[#c9a84c]/70 mb-2">Markets Network</div>
              <div className="flex items-end justify-between">
                <div className="font-serif text-4xl text-white">{MARKETS.length}+</div>
                <div className="text-xs text-white/50">Strategic Markets</div>
              </div>
              <div className="mt-4 h-px bg-[#c9a84c]/15" />
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[
                  { k: '3', l: 'Continents' },
                  { k: '15+', l: 'Years' },
                  { k: '500+', l: 'Shipments' },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="font-serif text-xl text-[#c9a84c]">{s.k}</div>
                    <div className="text-[9px] tracking-[0.3em] uppercase text-white/40 mt-1">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-sm border border-[#c9a84c]/25 bg-gradient-to-b from-[#141414]/90 to-[#0a0a0a]/90 backdrop-blur-xl p-6 min-h-[280px] overflow-hidden">
              <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[#c9a84c]/50 to-transparent" />
              <AnimatePresence mode="wait">
                {active ? (
                  <motion.div
                    key={active.code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="text-[10px] tracking-[0.4em] uppercase text-[#c9a84c]/70 mb-2">Market Profile</div>
                        <div className="font-serif text-3xl text-white leading-tight">{active.name}</div>
                      </div>
                      <span className="text-[10px] tracking-[0.3em] uppercase px-2.5 py-1 border border-[#c9a84c]/30 text-[#c9a84c]">
                        {active.code}
                      </span>
                    </div>

                    <div className="space-y-3.5 text-sm">
                      <Row label="Industry" value={active.industry} />
                      <Row label="Partnership" value={active.partnership} />
                      <Row label="Sector" value={active.sector} />
                      <Row label="Status" value={active.status} accent />
                    </div>

                    <div className="mt-6 flex items-center gap-3 text-[11px] tracking-[0.3em] uppercase text-[#c9a84c]/80">
                      <span className="inline-block h-px w-6 bg-[#c9a84c]/60" />
                      Tashkent → {active.name}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-start justify-center h-full"
                  >
                    <div className="text-[10px] tracking-[0.4em] uppercase text-[#c9a84c]/60 mb-3">Interactive Globe</div>
                    <div className="font-serif text-2xl text-white/90 leading-snug max-w-xs">
                      Davlat ustiga bosing yoki globusni aylantiring.
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-2 w-full">
                      {MARKETS.slice(0, 6).map((m) => (
                        <button
                          key={m.code}
                          onClick={() => setSelected(m.code)}
                          className="text-left text-[11px] tracking-[0.2em] uppercase text-white/55 hover:text-[#c9a84c] border border-[#c9a84c]/10 hover:border-[#c9a84c]/40 transition px-3 py-2"
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-white/5 pb-3 last:border-0">
      <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 pt-0.5">{label}</span>
      <span className={`text-right ${accent ? 'text-[#c9a84c]' : 'text-white/90'}`}>{value}</span>
    </div>
  );
}
