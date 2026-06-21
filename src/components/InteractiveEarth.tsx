import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import earthMap from '@/assets/earth/earth_atmos_2048.jpg';
import earthSpecular from '@/assets/earth/earth_specular_2048.jpg';
import earthClouds from '@/assets/earth/earth_clouds_1024.png';

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

const EARTH_RADIUS = 1.38;
const GOLD = '#c9a84c';
const GOLD_BRIGHT = '#ffe39a';

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
  { code: 'DE', name: 'Germany', lat: 51.1, lon: 10.4, industry: 'Textile Manufacturing', partnership: 'Strategic Export', sector: 'Industrial', status: 'Active Market' },
  { code: 'FR', name: 'France', lat: 48.8, lon: 2.3, industry: 'Premium Goods', partnership: 'Boutique Network', sector: 'Retail', status: 'Active Market' },
  { code: 'PL', name: 'Poland', lat: 52.2, lon: 21.0, industry: 'Logistics & Transit', partnership: 'EU Gateway', sector: 'Logistics', status: 'Expanding' },
  { code: 'TR', name: 'Turkey', lat: 39.0, lon: 35.2, industry: 'Construction Materials', partnership: 'Wholesale Hub', sector: 'Manufacturing', status: 'Active Market' },
  { code: 'RU', name: 'Russia', lat: 55.7, lon: 37.6, industry: 'Consumer Goods', partnership: 'Distribution', sector: 'Trade', status: 'Active Market' },
  { code: 'KZ', name: 'Kazakhstan', lat: 48.0, lon: 68.0, industry: 'Agricultural Products', partnership: 'Trade Network', sector: 'Agriculture', status: 'Active Market' },
  { code: 'AE', name: 'UAE', lat: 24.5, lon: 54.4, industry: 'Industrial Products', partnership: 'Strategic Distributor', sector: 'Industrial', status: 'Active Market' },
  { code: 'SA', name: 'Saudi Arabia', lat: 24.7, lon: 46.7, industry: 'Food Export', partnership: 'GCC Supply', sector: 'Agriculture', status: 'Expanding' },
  { code: 'CN', name: 'China', lat: 39.9, lon: 116.4, industry: 'Trade & Manufacturing', partnership: 'Belt & Road', sector: 'Manufacturing', status: 'Strategic' },
];

type GeoJsonFeature = {
  geometry?: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
};

function latLonToVector3(lat: number, lon: number, radius = EARTH_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function createRoutePoints(start: Market, end: Market) {
  const a = latLonToVector3(start.lat, start.lon, 1).normalize();
  const b = latLonToVector3(end.lat, end.lon, 1).normalize();
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= 72; i += 1) {
    const t = i / 72;
    const p = a.clone().lerp(b, t).normalize();
    const arcLift = Math.sin(Math.PI * t) * 0.32;
    points.push(p.multiplyScalar(EARTH_RADIUS + 0.035 + arcLift));
  }

  return points;
}

function flattenCountryBorders(features: GeoJsonFeature[]) {
  const vertices: number[] = [];

  features.forEach((feature) => {
    if (!feature.geometry) return;
    const polygons = feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates as number[][][]]
      : feature.geometry.coordinates as number[][][][];

    polygons.forEach((polygon) => {
      polygon.forEach((ring) => {
        for (let i = 0; i < ring.length - 1; i += 1) {
          const [lonA, latA] = ring[i];
          const [lonB, latB] = ring[i + 1];
          const a = latLonToVector3(latA, lonA, EARTH_RADIUS + 0.009);
          const b = latLonToVector3(latB, lonB, EARTH_RADIUS + 0.009);
          vertices.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      });
    });
  });

  return new Float32Array(vertices);
}

function EarthSphere() {
  const [map, specularMap, cloudMap] = useLoader(THREE.TextureLoader, [earthMap, earthSpecular, earthClouds]);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useMemo(() => {
    [map, specularMap, cloudMap].forEach((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
    });
    map.wrapS = THREE.RepeatWrapping;
    specularMap.wrapS = THREE.RepeatWrapping;
    cloudMap.wrapS = THREE.RepeatWrapping;
  }, [map, specularMap, cloudMap]);

  useFrame((_, delta) => {
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.012;
  });

  return (
    <>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshStandardMaterial
          map={map}
          roughness={0.72}
          metalness={0.04}
          emissive={new THREE.Color('#050505')}
          emissiveIntensity={0.08}
        />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[EARTH_RADIUS + 0.018, 96, 96]} />
        <meshStandardMaterial map={cloudMap} transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.07, 96, 96]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.09} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}

function CountryBorders() {
  const [vertices, setVertices] = useState<Float32Array | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/geo/countries-110m.geojson')
      .then((response) => response.json())
      .then((geo) => {
        if (mounted) setVertices(flattenCountryBorders(geo.features ?? []));
      })
      .catch(() => setVertices(null));

    return () => {
      mounted = false;
    };
  }, []);

  const geometry = useMemo(() => {
    if (!vertices) return null;
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return buffer;
  }, [vertices]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (!geometry) return null;

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={GOLD} transparent opacity={0.34} depthWrite={false} />
    </lineSegments>
  );
}

function TradeRoute({ market, active }: { market: Market; active: boolean }) {
  const lineRef = useRef<THREE.Line>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const points = useMemo(() => createRoutePoints(ORIGIN, market), [market]);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * (active ? 0.18 : 0.11)) % 1;
    const index = Math.min(points.length - 1, Math.floor(t * (points.length - 1)));
    if (pulseRef.current) pulseRef.current.position.copy(points[index]);
  });

  return (
    <group>
      <primitive
        ref={lineRef}
        object={new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points),
          new THREE.LineBasicMaterial({ color: active ? GOLD_BRIGHT : GOLD, transparent: true, opacity: active ? 0.96 : 0.55 }),
        )}
      />
      <mesh ref={pulseRef}>
        <sphereGeometry args={[active ? 0.032 : 0.022, 16, 16]} />
        <meshBasicMaterial color={active ? GOLD_BRIGHT : GOLD} transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

function MarketMarker({ market, active, isOrigin, onHover, onSelect }: {
  market: Market;
  active: boolean;
  isOrigin?: boolean;
  onHover: (code: string | null) => void;
  onSelect: (code: string) => void;
}) {
  const position = useMemo(() => latLonToVector3(market.lat, market.lon, EARTH_RADIUS + 0.065), [market.lat, market.lon]);

  return (
    <group position={position}>
      <mesh
        onPointerEnter={(event) => {
          event.stopPropagation();
          onHover(market.code);
        }}
        onPointerLeave={(event) => {
          event.stopPropagation();
          onHover(null);
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(market.code);
        }}
      >
        <sphereGeometry args={[isOrigin ? 0.052 : active ? 0.045 : 0.034, 24, 24]} />
        <meshStandardMaterial color={active || isOrigin ? GOLD_BRIGHT : GOLD} emissive={active || isOrigin ? GOLD_BRIGHT : GOLD} emissiveIntensity={0.85} />
      </mesh>
      <mesh>
        <sphereGeometry args={[isOrigin ? 0.12 : 0.085, 32, 32]} />
        <meshBasicMaterial color={GOLD} transparent opacity={active || isOrigin ? 0.18 : 0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {(active || isOrigin) && (
        <Html center distanceFactor={7.5} position={[0, isOrigin ? 0.18 : 0.14, 0]} occlude>
          <span className="pointer-events-none whitespace-nowrap border border-[#c9a84c]/35 bg-[#070707]/80 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-[#ffe39a] shadow-[0_0_24px_rgba(201,168,76,0.22)] backdrop-blur-sm">
            {market.name}
          </span>
        </Html>
      )}
    </group>
  );
}

function EarthNetwork({ highlightedCode, setHighlighted, setSelected }: {
  highlightedCode: string | null;
  setHighlighted: (code: string | null) => void;
  setSelected: (code: string) => void;
}) {
  return (
    <group rotation={[0.04, 3.5, 0.03]}>
      <EarthSphere />
      <CountryBorders />
      {MARKETS.map((market) => (
        <TradeRoute key={market.code} market={market} active={highlightedCode === market.code} />
      ))}
      <MarketMarker market={ORIGIN} active={highlightedCode === ORIGIN.code} isOrigin onHover={setHighlighted} onSelect={setSelected} />
      {MARKETS.map((market) => (
        <MarketMarker
          key={market.code}
          market={market}
          active={highlightedCode === market.code}
          onHover={setHighlighted}
          onSelect={setSelected}
        />
      ))}
    </group>
  );
}

function Scene({ highlightedCode, setHighlighted, setSelected }: {
  highlightedCode: string | null;
  setHighlighted: (code: string | null) => void;
  setSelected: (code: string) => void;
}) {
  const controlsRef = useRef<any>(null);
  const resumeTimer = useRef<number | null>(null);

  const pauseRotation = useCallback(() => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    if (controlsRef.current) controlsRef.current.autoRotate = false;
  }, []);

  const resumeRotation = useCallback(() => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      if (controlsRef.current) controlsRef.current.autoRotate = true;
    }, 2200);
  }, []);

  useEffect(() => () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  }, []);

  return (
    <>
      
      <ambientLight intensity={0.28} />
      <directionalLight position={[4, 2.4, 4.8]} intensity={2.6} color="#fff0c6" />
      <directionalLight position={[-3.8, -1.4, -4]} intensity={0.55} color="#c9a84c" />
      <hemisphereLight args={['#2a210f', '#020202', 0.32]} />

      <Suspense fallback={null}>
        <EarthNetwork highlightedCode={highlightedCode} setHighlighted={setHighlighted} setSelected={setSelected} />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableDamping
        dampingFactor={0.065}
        minDistance={3.15}
        maxDistance={7.4}
        rotateSpeed={0.55}
        zoomSpeed={0.65}
        autoRotate
        autoRotateSpeed={0.35}
        onStart={pauseRotation}
        onEnd={resumeRotation}
      />
    </>
  );
}

export function InteractiveEarthSection() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const active = useMemo(() => MARKETS.find((market) => market.code === (selected ?? hovered)) ?? null, [hovered, selected]);

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#070707] py-16 text-white md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.12),transparent_64%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(201,168,76,0.42)_1px,transparent_1px),linear-gradient(90deg,rgba(201,168,76,0.42)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-160px)] max-w-[1480px] flex-col px-5 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-12 bg-[#c9a84c]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.45em] text-[#c9a84c]">Global Presence</span>
          </div>
          <h2 className="font-serif text-4xl leading-[1.02] text-white md:text-6xl lg:text-7xl">
            Global hamkorlik va <span className="italic text-[#c9a84c]">xalqaro bozorlar</span>
          </h2>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/68 md:text-base">
            Haqiqiy Earth texture, davlat chegaralari va Oʻzbekistondan strategik bozorlarga yoʻnaltirilgan jonli savdo yoʻnalishlari.
          </p>
        </motion.div>

        <div className="mt-9 grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-[580px] overflow-hidden md:min-h-[700px] lg:min-h-0"
          >
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-[#c9a84c]/70">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c9a84c] shadow-[0_0_16px_rgba(201,168,76,0.9)]" />
              Live Trade Routes
            </div>
            <div className="absolute right-4 top-4 z-10 text-right">
              <div className="text-[9px] uppercase tracking-[0.35em] text-[#c9a84c]/60">Center Origin</div>
              <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/90">Uzbekistan · Tashkent</div>
            </div>
            <div className="absolute bottom-4 right-4 z-10 text-[10px] uppercase tracking-[0.3em] text-white/35">Drag · Scroll · Rotate</div>

            <Canvas
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
              dpr={[1, 1.75]}
              camera={{ position: [0, 0.08, 5.35], fov: 36 }}
              shadows
              className="h-full w-full"
            >
              <Scene highlightedCode={selected ?? hovered} setHighlighted={setHovered} setSelected={setSelected} />
            </Canvas>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="border border-[#c9a84c]/20 bg-[#0d0d0d]/88 p-6 backdrop-blur">
              <div className="mb-2 text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/70">Markets Network</div>
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
                ].map((stat) => (
                  <div key={stat.l}>
                    <div className="font-serif text-xl text-[#c9a84c]">{stat.k}</div>
                    <div className="mt-1 text-[9px] uppercase tracking-[0.3em] text-white/40">{stat.l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[310px] overflow-hidden border border-[#c9a84c]/25 bg-gradient-to-b from-[#141414]/90 to-[#080808]/92 p-6 backdrop-blur-xl">
              <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[#c9a84c]/50 to-transparent" />
              <AnimatePresence mode="wait">
                {active ? (
                  <motion.div key={active.code} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32 }}>
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <div className="mb-2 text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/70">Market Profile</div>
                        <div className="font-serif text-3xl leading-tight text-white">{active.name}</div>
                      </div>
                      <span className="border border-[#c9a84c]/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.3em] text-[#c9a84c]">{active.code}</span>
                    </div>
                    <div className="space-y-3.5 text-sm">
                      <Row label="Country" value={active.name} />
                      <Row label="Business Sector" value={active.sector} />
                      <Row label="Market Status" value={active.status} accent />
                      <Row label="Partnership Type" value={active.partnership} />
                      <Row label="Export Activity" value={active.industry} />
                    </div>
                    <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-[#c9a84c]/80">
                      <span className="inline-block h-px w-6 bg-[#c9a84c]/60" />
                      Tashkent → {active.name}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col items-start justify-center">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.4em] text-[#c9a84c]/60">Interactive Globe</div>
                    <div className="max-w-xs font-serif text-2xl leading-snug text-white/90">Davlat ustiga bosing yoki globusni aylantiring.</div>
                    <div className="mt-6 grid w-full grid-cols-2 gap-2">
                      {MARKETS.slice(0, 8).map((market) => (
                        <button
                          key={market.code}
                          onClick={() => setSelected(market.code)}
                          onMouseEnter={() => setHovered(market.code)}
                          onMouseLeave={() => setHovered(null)}
                          className="border border-[#c9a84c]/10 px-3 py-2 text-left text-[11px] uppercase tracking-[0.2em] text-white/55 transition hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                        >
                          {market.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-white/5 pb-3 last:border-0">
      <span className="pt-0.5 text-[10px] uppercase tracking-[0.3em] text-white/40">{label}</span>
      <span className={`text-right ${accent ? 'text-[#c9a84c]' : 'text-white/90'}`}>{value}</span>
    </div>
  );
}