import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
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

// Coarse land mask (rectangles) — gives a recognizable continent silhouette
const LAND: Array<[number, number, number, number]> = [
  [-10, 40,  35, 71],   // Europe
  [40, 180, 40, 75],    // N Asia / Siberia
  [25, 60,  12, 42],    // Middle East
  [60, 145, 5,  50],    // S/E Asia
  [-18, 52, -35, 35],   // Africa
  [-170, -52, 8, 72],   // N America
  [-82, -34, -56, 12],  // S America
  [112, 154, -39, -10], // Australia
  [-10, 5,   49, 60],   // UK
  [95, 141,  -10, 6],   // Indonesia
  [-10, 30,  35, 47],   // Mediterranean fill
];
const isLand = (lon: number, lat: number) =>
  LAND.some(([a, b, c, d]) => lon >= a && lon <= b && lat >= c && lat <= d);

// lat/lon (deg) → vec3 on sphere radius r
function latLonToVec3(lat: number, lon: number, r = 1) {
  const φ = (90 - lat) * (Math.PI / 180);
  const λ = (lon + 180) * (Math.PI / 180);
  const x = -r * Math.sin(φ) * Math.cos(λ);
  const z =  r * Math.sin(φ) * Math.sin(λ);
  const y =  r * Math.cos(φ);
  return new THREE.Vector3(x, y, z);
}

// ─────────────────────────────────────────────────────────────
// Earth — dark base sphere + instanced gold land dots
// ─────────────────────────────────────────────────────────────
const GOLD = new THREE.Color('#c9a84c');
const GOLD_BRIGHT = new THREE.Color('#ffe39a');

function DottedLand({ radius = 1.01 }: { radius?: number }) {
  const { positions, count } = useMemo(() => {
    const pts: number[] = [];
    const latStep = 1.6;
    for (let lat = -78; lat <= 82; lat += latStep) {
      const circ = Math.cos((lat * Math.PI) / 180);
      const n = Math.max(24, Math.round(360 / latStep * circ));
      for (let i = 0; i < n; i++) {
        const lon = -180 + (360 * i) / n;
        if (!isLand(lon, lat)) continue;
        const v = latLonToVec3(lat, lon, radius);
        pts.push(v.x, v.y, v.z);
      }
    }
    return { positions: new Float32Array(pts), count: pts.length / 3 };
  }, [radius]);

  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3], y = positions[i * 3 + 1], z = positions[i * 3 + 2];
      dummy.position.set(x, y, z);
      // orient flat against sphere surface
      const n = new THREE.Vector3(x, y, z).normalize();
      dummy.quaternion.setFromUnitVectors(up, n);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, [positions, count]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <circleGeometry args={[0.006, 6]} />
      <meshBasicMaterial color={GOLD} toneMapped={false} />
    </instancedMesh>
  );
}

function EarthCore() {
  return (
    <>
      {/* dark base sphere */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial color="#0a0a0a" shininess={6} specular={'#3a2e10'} />
      </mesh>
      <DottedLand radius={1.005} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Atmosphere — fresnel backside shader
// ─────────────────────────────────────────────────────────────
function Atmosphere() {
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color('#c9a84c') },
    },
    vertexShader: /* glsl */`
      varying vec3 vN;
      void main() {
        vN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: /* glsl */`
      varying vec3 vN;
      uniform vec3 uColor;
      void main() {
        float i = pow(0.72 - dot(vN, vec3(0.0, 0.0, 1.0)), 3.2);
        gl_FragColor = vec4(uColor, 1.0) * i;
      }
    `,
  }), []);
  return (
    <mesh scale={1.18} material={material}>
      <sphereGeometry args={[1, 48, 48]} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────
// Arc between two lat/lon points (great-circle-ish, lifted)
// ─────────────────────────────────────────────────────────────
function arcCurve(a: Market | typeof ORIGIN, b: Market) {
  const start = latLonToVec3(a.lat, a.lon, 1.01);
  const end = latLonToVec3(b.lat, b.lon, 1.01);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  const lift = 1 + Math.min(0.55, dist * 0.45);
  mid.normalize().multiplyScalar(lift);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

function Arc({ market, delay = 0, highlighted }: { market: Market; delay?: number; highlighted?: boolean }) {
  const curve = useMemo(() => arcCurve(ORIGIN, market), [market]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 64, 0.0045, 8, false), [curve]);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#ffd96a') },
      uOpacity: { value: 0.0 },
    },
    vertexShader: /* glsl */`
      varying float vT;
      void main() {
        vT = uv.x;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `,
    fragmentShader: /* glsl */`
      varying float vT;
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      void main() {
        // soft full glow + travelling bright bead
        float base = 0.45;
        float bead = smoothstep(0.06, 0.0, abs(fract(uTime * 0.18) - vT));
        float a = (base + bead * 1.4) * uOpacity;
        gl_FragColor = vec4(uColor, a);
      }
    `,
  }), []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const start = performance.now();
      const animate = () => {
        const p = Math.min(1, (performance.now() - start) / 900);
        if (matRef.current) matRef.current.uniforms.uOpacity.value = p * (highlighted ? 1 : 0.85);
        if (p < 1) requestAnimationFrame(animate);
      };
      animate();
    }, delay);
    return () => window.clearTimeout(t);
  }, [delay, highlighted]);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return <mesh geometry={tube} material={material} ref={(m: any) => { if (m) matRef.current = m.material; }} />;
}

// ─────────────────────────────────────────────────────────────
// Marker — small sphere + pulse ring + label
// ─────────────────────────────────────────────────────────────
function Marker({
  market,
  origin = false,
  selected,
  hovered,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  market: Market;
  origin?: boolean;
  selected: boolean;
  hovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}) {
  const pos = useMemo(() => latLonToVec3(market.lat, market.lon, 1.012), [market]);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const q = useMemo(() => new THREE.Quaternion().setFromUnitVectors(up, pos.clone().normalize()), [pos, up]);

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const pulse = origin ? (1 + Math.sin(t * 2.2) * 0.35) : (1 + Math.sin(t * 1.8) * 0.22);
    if (ringRef.current) {
      ringRef.current.scale.setScalar(pulse * (selected || hovered ? 1.3 : 1));
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 1.8) * 0.2;
    }
    if (glowRef.current) {
      const s2 = (origin ? 1.6 : 1) * (selected || hovered ? 1.4 : 1);
      glowRef.current.scale.setScalar(s2);
    }
  });

  const dotSize = origin ? 0.024 : 0.015;
  const ringSize = origin ? 0.05 : 0.035;
  const color = origin ? GOLD_BRIGHT : GOLD;

  return (
    <group position={pos} quaternion={q}>
      {/* glow disc */}
      <mesh ref={glowRef} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[ringSize * 1.8, 24]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* pulse ring */}
      <mesh ref={ringRef} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[ringSize * 0.7, ringSize, 32]} />
        <meshBasicMaterial color={GOLD} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* dot */}
      <mesh
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onPointerOut(); document.body.style.cursor = ''; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <sphereGeometry args={[dotSize, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* label */}
      <Html
        center
        distanceFactor={2.4}
        position={[0, dotSize * 4, 0]}
        style={{ pointerEvents: 'none' }}
        occlude={false}
      >
        <div
          className="select-none whitespace-nowrap font-medium tracking-wide"
          style={{
            fontSize: origin ? 12 : 10,
            color: origin ? '#ffe39a' : '#c9a84c',
            opacity: selected || hovered || origin ? 1 : 0.75,
            textShadow: '0 0 10px rgba(0,0,0,0.9)',
            transition: 'opacity .2s',
          }}
        >
          {market.name}
        </div>
      </Html>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// Gold floating particles in space around globe
// ─────────────────────────────────────────────────────────────
function Particles({ count = 220 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // random points in a thick spherical shell around the globe
      const r = 1.6 + Math.random() * 1.4;
      const θ = Math.random() * Math.PI * 2;
      const φ = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(φ) * Math.cos(θ);
      arr[i * 3 + 1] = r * Math.cos(φ) * 0.6;
      arr[i * 3 + 2] = r * Math.sin(φ) * Math.sin(θ);
    }
    return arr;
  }, [count]);

  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.012} color={GOLD} transparent opacity={0.55} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────
// Controls — auto-rotate that pauses on user interaction
// ─────────────────────────────────────────────────────────────
function SmartControls({ onInteract }: { onInteract: (v: boolean) => void }) {
  const ref = useRef<any>(null);
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0.4, 3.6);
  }, [camera]);
  return (
    <OrbitControls
      ref={ref}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={2.2}
      maxDistance={5}
      rotateSpeed={0.7}
      zoomSpeed={0.6}
      autoRotate
      autoRotateSpeed={0.35}
      onStart={() => { if (ref.current) ref.current.autoRotate = false; onInteract(true); }}
      onEnd={() => {
        onInteract(false);
        // resume after 2.5s of inactivity
        window.setTimeout(() => { if (ref.current) ref.current.autoRotate = true; }, 2500);
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Scene
// ─────────────────────────────────────────────────────────────
function Scene({
  hovered, setHovered, selected, setSelected, onInteract,
}: {
  hovered: string | null;
  setHovered: (v: string | null) => void;
  selected: string | null;
  setSelected: (v: string | null) => void;
  onInteract: (v: boolean) => void;
}) {
  return (
    <>
      <color attach="background" args={['#0d0d0d']} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 3, 5]} intensity={1.1} color={'#ffd58a'} />
      <directionalLight position={[-5, -2, -3]} intensity={0.25} color={'#6b4a14'} />

      <Suspense fallback={null}>
        <group rotation={[0, 0, 0]}>
          <EarthCore />
          <Atmosphere />

          {/* Arcs */}
          {MARKETS.map((m, i) => (
            <Arc key={`arc-${m.code}`} market={m} delay={150 + i * 110} highlighted={hovered === m.code || selected === m.code} />
          ))}

          {/* Origin */}
          <Marker
            market={ORIGIN}
            origin
            selected={false}
            hovered={false}
            onPointerOver={() => {}}
            onPointerOut={() => {}}
            onClick={() => setSelected(null)}
          />

          {/* Markets */}
          {MARKETS.map((m) => (
            <Marker
              key={`mk-${m.code}`}
              market={m}
              selected={selected === m.code}
              hovered={hovered === m.code}
              onPointerOver={() => setHovered(m.code)}
              onPointerOut={() => setHovered(hovered === m.code ? null : hovered)}
              onClick={() => setSelected(m.code)}
            />
          ))}

          <Particles />
        </group>
      </Suspense>

      <SmartControls onInteract={onInteract} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Public Section
// ─────────────────────────────────────────────────────────────
export function InteractiveEarthSection() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [, setInteracting] = useState(false);

  const active = useMemo(() => {
    const code = selected ?? hovered;
    return MARKETS.find((m) => m.code === code) ?? null;
  }, [hovered, selected]);

  return (
    <section className="relative bg-[#0d0d0d] text-white py-24 md:py-32 overflow-hidden">
      {/* Ambient background sheen */}
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
            Global hamkorlik va <span className="italic text-[#c9a84c]">xalqaro bozorlar</span>
          </h2>
          <p className="mt-6 text-white/65 max-w-2xl leading-relaxed">
            NazirovSholding dunyoning turli mintaqalarida eksport, logistika va strategik hamkorlik
            faoliyatlarini amalga oshiradi.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-stretch">
          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-2 relative rounded-sm border border-[#c9a84c]/15 bg-gradient-to-b from-[#101010] to-[#070707] overflow-hidden"
            style={{ minHeight: 560 }}
          >
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-[10px] tracking-[0.35em] uppercase text-[#c9a84c]/70">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#c9a84c] animate-pulse" />
              Live Network
            </div>
            <div className="absolute bottom-4 right-4 z-10 text-[10px] tracking-[0.3em] uppercase text-white/35">
              Drag · Scroll · Click
            </div>

            <div className="h-[560px] md:h-[640px] w-full">
              <Canvas
                gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
                camera={{ position: [0, 0.4, 3.6], fov: 42 }}
              >
                <Scene
                  hovered={hovered}
                  setHovered={setHovered}
                  selected={selected}
                  setSelected={setSelected}
                  onInteract={setInteracting}
                />
              </Canvas>
            </div>
          </motion.div>

          {/* Information panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col gap-4"
          >
            {/* Header card */}
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

            {/* Selected / Hovered market */}
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
                      <Row label="Industry"     value={active.industry} />
                      <Row label="Partnership"  value={active.partnership} />
                      <Row label="Sector"       value={active.sector} />
                      <Row label="Status"       value={active.status} accent />
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
                      Bozorlardan birini tanlang yoki globusni aylantiring.
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
