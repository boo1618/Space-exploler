import * as THREE from 'three';

// ─── Public types ────────────────────────────────────────────────────────────
export interface PlanetClickInfo { name: string; index: number; }
export interface LabelInfo { name: string; x: number; y: number; visible: boolean; distance: number; behindSun: boolean; }

export interface SolarSystemController {
  setSpeed: (v: number) => void;
  setPaused: (v: boolean) => void;
  focusPlanet: (name: string) => void;
  resetCamera: () => void;
  onPlanetClick: (cb: (info: PlanetClickInfo | null) => void) => void;
  setWeather: (planetName: string, intensity: number) => void;
  triggerSolarFlare: () => void;
  onFrame: (cb: (labels: LabelInfo[]) => void) => void;
  cleanup: () => void;
}

// ─── Planet definitions ──────────────────────────────────────────────────────
const PLANETS = [
  { name: 'Mercury', radius: 0.30, distance: 7,   speed: 4.15,  tilt: 0.03,  selfSpin: 0.003 },
  { name: 'Venus',   radius: 0.55, distance: 11,  speed: 1.62,  tilt: 177.4, selfSpin: -0.001 },
  { name: 'Earth',   radius: 0.58, distance: 15,  speed: 1.0,   tilt: 23.5,  selfSpin: 0.007 },
  { name: 'Mars',    radius: 0.40, distance: 20,  speed: 0.53,  tilt: 25.2,  selfSpin: 0.006 },
  { name: 'Jupiter', radius: 1.40, distance: 29,  speed: 0.084, tilt: 3.1,   selfSpin: 0.018 },
  { name: 'Saturn',  radius: 1.20, distance: 39,  speed: 0.034, tilt: 26.7,  selfSpin: 0.015, rings: true,  ringsColor: '#c8a850' },
  { name: 'Uranus',  radius: 0.85, distance: 50,  speed: 0.012, tilt: 97.8,  selfSpin: 0.01,  rings: true,  ringsColor: '#5ab8d4', ringsTilted: true },
  { name: 'Neptune', radius: 0.80, distance: 62,  speed: 0.006, tilt: 28.3,  selfSpin: 0.008 },
];

// Per-planet weather configs
const WEATHER = {
  Mercury: { label: 'Solar Wind',       color: new THREE.Color('#ffd080'), count: 200, radius: 1.8, speed: 4.0, size: 1.2 },
  Venus:   { label: 'Acid Clouds',      color: new THREE.Color('#ffaa44'), count: 600, radius: 1.1, speed: 0.3, size: 2.5 },
  Earth:   { label: 'Thunderstorm',     color: new THREE.Color('#88ccff'), count: 500, radius: 1.15,speed: 0.9, size: 2.0 },
  Mars:    { label: 'Dust Storm',       color: new THREE.Color('#ff7744'), count: 700, radius: 1.2, speed: 1.8, size: 2.0 },
  Jupiter: { label: 'Lightning Storm',  color: new THREE.Color('#d4a042'), count: 900, radius: 1.12,speed: 3.0, size: 1.4 },
  Saturn:  { label: 'Polar Vortex',     color: new THREE.Color('#ffe090'), count: 500, radius: 1.18,speed: 1.5, size: 1.8 },
  Uranus:  { label: 'Methane Haze',     color: new THREE.Color('#80ffee'), count: 350, radius: 1.25,speed: 0.5, size: 3.0 },
  Neptune: { label: 'Supersonic Winds', color: new THREE.Color('#4477ff'), count: 800, radius: 1.15,speed: 5.0, size: 1.3 },
} as Record<string, { label: string; color: THREE.Color; count: number; radius: number; speed: number; size: number }>;

// ─── GLSL helpers shared across shaders ─────────────────────────────────────
const GLSL_NOISE = /* glsl */`
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.07; a*=0.5; }
  return v;
}
`;

// ─── Per-planet fragment shaders ─────────────────────────────────────────────
function makePlanetShader(name: string) {
  const vs = /* glsl */`
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPos;
    void main(){
      vUv=uv;
      vNormal=normalize(normalMatrix*normal);
      vPos=(modelViewMatrix*vec4(position,1.0)).xyz;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }
  `;

  const fragments: Record<string, string> = {
    Mercury: /* glsl */`
      ${GLSL_NOISE}
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      void main(){
        float crater=fbm(vUv*18.0)*0.5+fbm(vUv*36.0+0.7)*0.5;
        float rock=fbm(vUv*6.0)*0.4;
        vec3 col=mix(vec3(0.25,0.23,0.22),vec3(0.55,0.52,0.48),rock);
        col=mix(col,vec3(0.12,0.11,0.10),smoothstep(0.55,0.75,crater));
        col=mix(col,vec3(0.8,0.78,0.74),smoothstep(0.74,0.78,crater));
        vec3 L=normalize(vec3(-vPos));
        float diff=max(dot(vNormal,normalize(vec3(1,0.5,1))),0.0);
        col*=diff*0.9+0.15;
        gl_FragColor=vec4(col,1.0);
      }`,
    Venus: /* glsl */`
      ${GLSL_NOISE}
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      void main(){
        float band=sin(vUv.y*12.0+fbm(vUv*4.0+time*0.04)*2.0)*0.5+0.5;
        float swirl=fbm(vUv*8.0+vec2(time*0.03,0));
        vec3 c1=vec3(0.9,0.65,0.2), c2=vec3(0.75,0.45,0.1), c3=vec3(0.95,0.8,0.35);
        vec3 col=mix(c2,c1,band);
        col=mix(col,c3,swirl*0.4);
        float diff=max(dot(vNormal,normalize(vec3(1,0.5,1))),0.0);
        col*=diff*0.85+0.25;
        gl_FragColor=vec4(col,1.0);
      }`,
    Earth: /* glsl */`
      ${GLSL_NOISE}
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      void main(){
        float ocean=smoothstep(0.42,0.46,fbm(vUv*5.0));
        float cloud=smoothstep(0.55,0.62,fbm(vUv*7.0+time*0.015));
        float polar=smoothstep(0.85,0.98,abs(vUv.y-0.5)*2.0);
        vec3 oceanCol=vec3(0.1,0.28,0.72);
        vec3 landCol=mix(vec3(0.18,0.52,0.22),vec3(0.42,0.34,0.22),fbm(vUv*9.0));
        vec3 col=mix(landCol,oceanCol,ocean);
        col=mix(col,vec3(0.95,0.97,1.0),cloud*0.85);
        col=mix(col,vec3(0.96,0.98,1.0),polar);
        float diff=max(dot(vNormal,normalize(vec3(1,0.5,1))),0.0);
        col*=diff*0.88+0.18;
        // Night city lights on dark side
        float night=max(0.0,1.0-diff*3.0);
        col+=vec3(0.8,0.6,0.2)*night*0.12*(1.0-ocean)*fbm(vUv*20.0+0.3);
        gl_FragColor=vec4(col,1.0);
      }`,
    Mars: /* glsl */`
      ${GLSL_NOISE}
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      void main(){
        float surface=fbm(vUv*8.0);
        float canyon=fbm(vUv*16.0)*0.5+fbm(vUv*32.0)*0.3;
        float polar=smoothstep(0.85,0.98,abs(vUv.y-0.5)*2.0);
        vec3 red=vec3(0.78,0.30,0.14), dark=vec3(0.45,0.18,0.08), sand=vec3(0.88,0.55,0.28);
        vec3 col=mix(dark,red,surface);
        col=mix(col,sand,canyon*0.4);
        col=mix(col,vec3(0.9,0.92,0.96),polar*0.9);
        float diff=max(dot(vNormal,normalize(vec3(1,0.5,1))),0.0);
        col*=diff*0.85+0.18;
        gl_FragColor=vec4(col,1.0);
      }`,
    Jupiter: /* glsl */`
      ${GLSL_NOISE}
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      void main(){
        float y=vUv.y;
        float band=sin(y*28.0+fbm(vec2(vUv.x*3.0,y*8.0)+time*0.08)*1.5)*0.5+0.5;
        float fine=sin(y*60.0+time*0.12)*0.25+0.75;
        vec3 c1=vec3(0.78,0.55,0.22), c2=vec3(0.55,0.30,0.12), c3=vec3(0.9,0.75,0.45), c4=vec3(0.25,0.15,0.05);
        vec3 col=mix(c2,c1,band);
        col=mix(col,c3,fine*0.3);
        // Great Red Spot
        vec2 spot=vUv-vec2(0.65,0.38);
        spot.x*=3.0;
        float grs=length(spot);
        float vortex=smoothstep(0.08,0.0,grs);
        float spiral=fbm(vUv*12.0+time*0.04)*0.5;
        col=mix(col,vec3(0.85,0.22,0.1),vortex*0.9*(spiral+0.5));
        col=mix(col,vec3(0.95,0.6,0.3),smoothstep(0.08,0.06,grs)*0.5);
        float diff=max(dot(vNormal,normalize(vec3(1,0.5,1))),0.0);
        col*=diff*0.85+0.2;
        gl_FragColor=vec4(col,1.0);
      }`,
    Saturn: /* glsl */`
      ${GLSL_NOISE}
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      void main(){
        float band=sin(vUv.y*20.0+fbm(vec2(vUv.x*2.0,vUv.y*6.0)+time*0.05)*1.2)*0.5+0.5;
        vec3 c1=vec3(0.82,0.66,0.36), c2=vec3(0.65,0.50,0.22), c3=vec3(0.92,0.8,0.55);
        vec3 col=mix(c2,c1,band);
        col=mix(col,c3,fbm(vUv*10.0+time*0.04)*0.25);
        // Hex north pole vortex hint
        float northPole=smoothstep(0.88,0.75,abs(vUv.y-0.5)*2.0-0.72);
        col=mix(col,vec3(0.5,0.38,0.18),northPole*0.6);
        float diff=max(dot(vNormal,normalize(vec3(1,0.5,1))),0.0);
        col*=diff*0.85+0.2;
        gl_FragColor=vec4(col,1.0);
      }`,
    Uranus: /* glsl */`
      ${GLSL_NOISE}
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      void main(){
        float band=sin(vUv.x*8.0+time*0.03)*0.08+0.92;
        float haze=fbm(vUv*4.0+time*0.02)*0.15;
        vec3 col=mix(vec3(0.38,0.82,0.85),vec3(0.18,0.65,0.72),band+haze);
        col=mix(col,vec3(0.55,0.9,0.88),fbm(vUv*12.0)*0.12);
        float diff=max(dot(vNormal,normalize(vec3(1,0.5,1))),0.0);
        float rim=pow(1.0-max(dot(vNormal,vec3(0,0,1)),0.0),2.5);
        col*=diff*0.8+0.28;
        col+=vec3(0.4,0.9,0.9)*rim*0.15;
        gl_FragColor=vec4(col,1.0);
      }`,
    Neptune: /* glsl */`
      ${GLSL_NOISE}
      uniform float time;
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vPos;
      void main(){
        float band=sin(vUv.y*14.0+fbm(vUv*5.0+time*0.06)*2.0)*0.25+0.75;
        float storm=fbm(vUv*10.0-time*0.05);
        vec3 c1=vec3(0.12,0.28,0.82), c2=vec3(0.06,0.15,0.58), c3=vec3(0.3,0.5,0.9);
        vec3 col=mix(c2,c1,band);
        col=mix(col,c3,storm*0.3);
        // Dark Great Spot
        vec2 ds=vUv-vec2(0.3,0.45);
        ds.x*=2.5;
        float spot=smoothstep(0.06,0.0,length(ds));
        col=mix(col,vec3(0.02,0.06,0.28),spot*0.9);
        float diff=max(dot(vNormal,normalize(vec3(1,0.5,1))),0.0);
        float rim=pow(1.0-max(dot(vNormal,vec3(0,0,1)),0.0),3.0);
        col*=diff*0.82+0.22;
        col+=vec3(0.2,0.4,0.9)*rim*0.2;
        gl_FragColor=vec4(col,1.0);
      }`,
  };

  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: vs,
    fragmentShader: fragments[name] ?? fragments.Mercury,
  });
}

// ─── Atmosphere glow shader ──────────────────────────────────────────────────
function makeAtmosphere(radius: number, glowColor: THREE.Color, opacity = 0.6) {
  const geo = new THREE.SphereGeometry(radius, 32, 32);
  const mat = new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: glowColor }, viewVector: { value: new THREE.Vector3() } },
    vertexShader: /* glsl */`
      uniform vec3 viewVector;
      varying float intensity;
      void main(){
        vec3 vN=normalize(normalMatrix*normal);
        vec3 vV=normalize(normalMatrix*viewVector);
        intensity=pow(max(0.0,0.75-dot(vN,vV)),2.2);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 glowColor;
      varying float intensity;
      void main(){ gl_FragColor=vec4(glowColor*intensity, intensity*${opacity.toFixed(2)}); }`,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
}

// ─── Weather particle system ──────────────────────────────────────────────────
function makeWeatherParticles(planetRadius: number, cfg: typeof WEATHER[string]) {
  const N = cfg.count;
  const positions = new Float32Array(N * 3);
  const angles    = new Float32Array(N);
  const phis      = new Float32Array(N);
  const speeds    = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = planetRadius * cfg.radius * (0.95 + Math.random() * 0.1);
    positions[i * 3]     = Math.sin(phi) * Math.cos(a) * r;
    positions[i * 3 + 1] = Math.cos(phi) * r;
    positions[i * 3 + 2] = Math.sin(phi) * Math.sin(a) * r;
    angles[i]  = a;
    phis[i]    = phi;
    speeds[i]  = 0.5 + Math.random() * 0.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position',      new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('pAngle',        new THREE.BufferAttribute(angles,    1));
  geo.setAttribute('pPhi',          new THREE.BufferAttribute(phis,      1));
  geo.setAttribute('pSpeed',        new THREE.BufferAttribute(speeds,    1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      time:      { value: 0 },
      intensity: { value: 0 },
      radius:    { value: planetRadius * cfg.radius },
      color:     { value: cfg.color },
      speedMul:  { value: cfg.speed },
      pSize:     { value: cfg.size },
    },
    vertexShader: /* glsl */`
      attribute float pAngle;
      attribute float pPhi;
      attribute float pSpeed;
      uniform float time, intensity, radius, speedMul, pSize;
      void main(){
        float a = pAngle + time * pSpeed * speedMul * 0.4;
        float r = radius;
        vec3 pos=vec3(sin(pPhi)*cos(a)*r, cos(pPhi)*r, sin(pPhi)*sin(a)*r);
        vec4 mv=modelViewMatrix*vec4(pos,1.0);
        gl_Position=projectionMatrix*mv;
        gl_PointSize=pSize * intensity * (300.0 / -mv.z);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 color;
      uniform float intensity;
      void main(){
        float d=length(gl_PointCoord-0.5)*2.0;
        float alpha=smoothstep(1.0,0.0,d)*intensity*0.7;
        gl_FragColor=vec4(color, alpha);
      }`,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    vertexColors: false,
  });

  return { points: new THREE.Points(geo, mat), mat };
}

// ─── Cloud overlay sphere (weather shell) ───────────────────────────────────
function makeCloudShell(radius: number, color: THREE.Color) {
  const geo = new THREE.SphereGeometry(radius * 1.025, 40, 40);
  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, intensity: { value: 0 }, cloudColor: { value: color } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying vec3 vNormal;
      void main(){ vUv=uv; vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */`
      uniform float time, intensity;
      uniform vec3 cloudColor;
      varying vec2 vUv; varying vec3 vNormal;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){v+=a*noise(p);p*=2.07;a*=0.5;} return v; }
      void main(){
        float speed=intensity*0.5;
        float cloud=fbm(vUv*6.0+vec2(time*speed*0.04,0));
        float turb=fbm(vUv*14.0+time*speed*0.08)*intensity;
        float alpha=smoothstep(0.4,0.6,cloud)*intensity*0.65+turb*0.2;
        float rim=1.0-max(dot(vNormal,vec3(0,0,1)),0.0);
        alpha+=rim*0.15*intensity;
        gl_FragColor=vec4(cloudColor, clamp(alpha,0.0,0.8));
      }`,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  return { mesh: new THREE.Mesh(geo, mat), mat };
}

// ─── Saturn ring geometry ────────────────────────────────────────────────────
function makeSaturnRings(innerR: number, outerR: number) {
  const geo = new THREE.RingGeometry(innerR, outerR, 128, 6);
  // Remap UVs so u goes 0→1 from inner to outer radius
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const uv  = geo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const r = Math.sqrt(x * x + y * y);
    uv.setXY(i, (r - innerR) / (outerR - innerR), 0);
  }
  const mat = new THREE.ShaderMaterial({
    uniforms: { innerR: { value: innerR }, outerR: { value: outerR } },
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vPos;
      void main(){ vUv=uv; vPos=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */`
      uniform float innerR, outerR;
      varying vec2 vUv; varying vec3 vPos;
      float hash(float x){ return fract(sin(x)*43758.5453); }
      void main(){
        float t=vUv.x;
        // Cassini division
        float cassini=smoothstep(0.44,0.46,t)-smoothstep(0.46,0.48,t);
        // Ring bands
        float bands=0.0;
        for(int i=0;i<8;i++){ bands+=hash(float(i))*0.5*smoothstep(0.0,0.015,abs(t-hash(float(i)*7.3))); }
        vec3 ringCol=mix(vec3(0.72,0.58,0.32),vec3(0.92,0.82,0.62),t);
        ringCol=mix(ringCol,vec3(0.5,0.38,0.18),bands*0.3);
        float alpha=(1.0-cassini)*0.75*(0.3+t*0.5)*(1.0-t*0.4);
        alpha=clamp(alpha,0.0,0.9);
        gl_FragColor=vec4(ringCol,alpha);
      }`,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });
  return new THREE.Mesh(geo, mat);
}

// ─── Asteroid belt ───────────────────────────────────────────────────────────
function makeAsteroidBelt() {
  const N = 2000;
  const positions = new Float32Array(N * 3);
  const colors    = new Float32Array(N * 3);
  const sizes     = new Float32Array(N);
  const baseCols  = [new THREE.Color('#887766'), new THREE.Color('#998877'), new THREE.Color('#665544')];

  for (let i = 0; i < N; i++) {
    const r = 23.5 + Math.random() * 4.5;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 1.2;
    positions[i * 3]     = Math.cos(a) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(a) * r;
    const c = baseCols[Math.floor(Math.random() * baseCols.length)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    sizes[i] = 0.5 + Math.random() * 2.5;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes,     1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: /* glsl */`
      attribute float size;
      varying vec3 vColor;
      void main(){
        vColor=color;
        vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_PointSize=size*(200.0/-mv.z);
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor;
      void main(){
        float d=length(gl_PointCoord-0.5)*2.0;
        if(d>1.0) discard;
        float alpha=smoothstep(1.0,0.3,d)*0.6;
        gl_FragColor=vec4(vColor,alpha);
      }`,
    transparent: true,
    vertexColors: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  return new THREE.Points(geo, mat);
}

// ─── Main init ───────────────────────────────────────────────────────────────
export function initSolarSystem(canvas: HTMLCanvasElement): SolarSystemController | null {
  try {
    const test = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!test) return null;
  } catch { return null; }

  // Scene / Camera / Renderer
  const scene = new THREE.Scene();
  const W = canvas.clientWidth || window.innerWidth;
  const H = canvas.clientHeight || window.innerHeight;
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 3000);
  camera.position.set(0, 40, 78);
  camera.lookAt(0, 0, 0);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Lighting
  scene.add(new THREE.AmbientLight(0x111133, 3));
  const sunLight = new THREE.PointLight(0xfff0dd, 4, 500, 1.1);
  scene.add(sunLight);
  // Fill light (soft blue from opposite side)
  const fillLight = new THREE.DirectionalLight(0x334488, 0.4);
  fillLight.position.set(-1, 0.5, -1);
  scene.add(fillLight);

  // Starfield
  const starCount = 12000;
  const starPos   = new Float32Array(starCount * 3);
  const starCol   = new Float32Array(starCount * 3);
  const palette   = [new THREE.Color('#ffffff'), new THREE.Color('#d0e8ff'), new THREE.Color('#38BDF8'), new THREE.Color('#aaaaff')];
  for (let i = 0; i < starCount; i++) {
    const r = 400 + Math.random() * 600;
    const t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
    starPos[i*3]=r*Math.sin(p)*Math.cos(t); starPos[i*3+1]=r*Math.sin(p)*Math.sin(t); starPos[i*3+2]=r*Math.cos(p);
    const c = palette[Math.floor(Math.random() * palette.length)];
    starCol[i*3]=c.r; starCol[i*3+1]=c.g; starCol[i*3+2]=c.b;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color',    new THREE.BufferAttribute(starCol, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })));

  // Sun
  const sunMat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, flareIntensity: { value: 0 } },
    vertexShader: /* glsl */`varying vec2 vUv; varying vec3 vN; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: /* glsl */`
      uniform float time, flareIntensity;
      varying vec2 vUv; varying vec3 vN;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){v+=a*noise(p);p*=2.07;a*=0.5;} return v; }
      void main(){
        float n=fbm(vUv*5.0+time*0.09);
        float n2=fbm(vUv*10.0-time*0.06+n);
        float n3=fbm(vUv*22.0+time*0.2);
        float plasma=(n+n2*0.6+n3*0.2)/1.8;
        vec3 col=mix(vec3(1.0,0.45,0.0),vec3(1.0,0.88,0.3),plasma);
        col=mix(col,vec3(1.0,0.2,0.0),fbm(vUv*30.0+time*0.3)*0.3);
        float rim=pow(1.0-max(dot(vN,vec3(0,0,1)),0.0),3.5);
        col+=vec3(1.0,0.6,0.1)*rim*0.5;
        // Solar flare brightening
        col+=vec3(1.0,0.9,0.6)*flareIntensity*plasma;
        gl_FragColor=vec4(col,1.0);
      }`,
    blending: THREE.AdditiveBlending,
  });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(3.2, 64, 64), sunMat);
  scene.add(sun);

  // Sun glow layers
  const makeGlow = (r: number, col: THREE.Color, op: number) => {
    const m = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: col }, viewVector: { value: camera.position }, flare: { value: 0 } },
      vertexShader: /* glsl */`uniform vec3 viewVector; varying float intensity; void main(){ vec3 vN=normalize(normalMatrix*normal); vec3 vV=normalize(normalMatrix*viewVector); intensity=pow(max(0.0,0.65-dot(vN,vV)),2.0); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: /* glsl */`uniform vec3 glowColor; uniform float flare; varying float intensity; void main(){ vec3 g=glowColor*(intensity+flare*0.5); gl_FragColor=vec4(g,intensity*${op.toFixed(2)}); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    });
    return { mesh: new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), m), mat: m };
  };
  const corona1 = makeGlow(4.2,  new THREE.Color('#ff8800'), 0.55);
  const corona2 = makeGlow(5.5,  new THREE.Color('#ff6600'), 0.25);
  const corona3 = makeGlow(8.0,  new THREE.Color('#ff4400'), 0.10);
  scene.add(corona1.mesh); scene.add(corona2.mesh); scene.add(corona3.mesh);

  // ─── Planets ────────────────────────────────────────────────────────────
  const atmoColors: Record<string, THREE.Color> = {
    Mercury: new THREE.Color('#888888'),
    Venus:   new THREE.Color('#cc8822'),
    Earth:   new THREE.Color('#4488ff'),
    Mars:    new THREE.Color('#cc4422'),
    Jupiter: new THREE.Color('#cc9944'),
    Saturn:  new THREE.Color('#ddaa55'),
    Uranus:  new THREE.Color('#44cccc'),
    Neptune: new THREE.Color('#2244cc'),
  };

  const planetMeshes:  THREE.Mesh[] = [];
  const planetGroups:  THREE.Group[] = [];   // one group per planet (contains mesh + weather)
  const orbitAngles:   number[]  = [];
  const planetShaders: THREE.ShaderMaterial[] = [];
  const atmoMeshes:    { mesh: THREE.Mesh; mat: THREE.ShaderMaterial }[] = [];
  const weatherParts:  { points: THREE.Points; mat: THREE.ShaderMaterial }[] = [];
  const cloudShells:   { mesh: THREE.Mesh; mat: THREE.ShaderMaterial }[] = [];
  const weatherIntensities: number[] = PLANETS.map(() => 0);

  // Orbit path material (shared)
  const orbitMat = new THREE.MeshBasicMaterial({ color: 0x1a2a44, transparent: true, opacity: 0.45 });

  PLANETS.forEach((pd, i) => {
    // Orbit ring
    const orbitMesh = new THREE.Mesh(new THREE.TorusGeometry(pd.distance, 0.018, 8, 240), orbitMat.clone());
    orbitMesh.rotation.x = Math.PI / 2;
    scene.add(orbitMesh);

    // Planet group (moves along orbit)
    const group = new THREE.Group();
    scene.add(group);
    planetGroups.push(group);

    // Planet mesh
    const geo = new THREE.SphereGeometry(pd.radius, 64, 64);
    const shaderMat = makePlanetShader(pd.name);
    planetShaders.push(shaderMat);
    const mesh = new THREE.Mesh(geo, shaderMat);
    mesh.rotation.z = (pd.tilt * Math.PI) / 180;
    mesh.userData = { name: pd.name, index: i };
    group.add(mesh);
    planetMeshes.push(mesh);
    orbitAngles.push(Math.random() * Math.PI * 2);

    // Atmosphere glow
    const atmoData = makeAtmosphere(pd.radius * 1.18, atmoColors[pd.name], 0.65);
    atmoData.userData = { planetIndex: i };
    mesh.add(atmoData);
    atmoMeshes.push({ mesh: atmoData, mat: atmoData.material as THREE.ShaderMaterial });

    // Cloud shell (weather overlay sphere)
    const wCfg = WEATHER[pd.name];
    const cs = makeCloudShell(pd.radius, wCfg.color);
    mesh.add(cs.mesh);
    cloudShells.push(cs);

    // Weather particles
    const wp = makeWeatherParticles(pd.radius, wCfg);
    group.add(wp.points);
    weatherParts.push(wp);

    // Saturn rings (multi-layer)
    if (pd.name === 'Saturn') {
      const ring = makeSaturnRings(pd.radius * 1.35, pd.radius * 2.5);
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);
      // faint outer ring
      const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x887755, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
      const outerRing = new THREE.Mesh(new THREE.RingGeometry(pd.radius * 2.5, pd.radius * 3.0, 64), outerRingMat);
      outerRing.rotation.x = Math.PI / 2;
      mesh.add(outerRing);
    }
    // Uranus thin rings
    if (pd.name === 'Uranus') {
      const uRingMat = new THREE.MeshBasicMaterial({ color: 0x5ab8d4, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      const uRing = new THREE.Mesh(new THREE.RingGeometry(pd.radius * 1.5, pd.radius * 2.0, 64), uRingMat);
      uRing.rotation.x = Math.PI / 2 + (pd.tilt * Math.PI) / 180;
      mesh.add(uRing);
    }
  });

  // Asteroid belt
  const belt = makeAsteroidBelt();
  scene.add(belt);

  // ─── Camera controls ─────────────────────────────────────────────────────
  let isDragging = false;
  let prevMouse  = { x: 0, y: 0 };
  const spherical = new THREE.Spherical().setFromVector3(camera.position);
  let targetSph = { phi: spherical.phi, theta: spherical.theta, radius: spherical.radius };
  let focusedPlanet: string | null = null;

  const startDrag = (x: number, y: number) => { isDragging = true; prevMouse = { x, y }; };
  const endDrag   = () => { isDragging = false; };
  const moveDrag  = (x: number, y: number) => {
    if (!isDragging) return;
    targetSph.theta -= (x - prevMouse.x) * 0.005;
    targetSph.phi   = Math.max(0.18, Math.min(Math.PI / 2.05, targetSph.phi - (y - prevMouse.y) * 0.004));
    prevMouse = { x, y };
    focusedPlanet = null;
  };

  const onMD = (e: MouseEvent) => startDrag(e.clientX, e.clientY);
  const onMU = () => endDrag();
  const onMM = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
  const onTS = (e: TouchEvent) => startDrag(e.touches[0].clientX, e.touches[0].clientY);
  const onTE = () => endDrag();
  const onTM = (e: TouchEvent) => moveDrag(e.touches[0].clientX, e.touches[0].clientY);
  const onWh = (e: WheelEvent) => { targetSph.radius = Math.max(18, Math.min(220, targetSph.radius + e.deltaY * 0.07)); focusedPlanet = null; };

  canvas.addEventListener('mousedown',  onMD);
  canvas.addEventListener('mousemove',  onMM);
  canvas.addEventListener('mouseup',    onMU);
  canvas.addEventListener('mouseleave', onMU);
  canvas.addEventListener('wheel',      onWh, { passive: true });
  canvas.addEventListener('touchstart', onTS, { passive: true });
  canvas.addEventListener('touchmove',  onTM, { passive: true });
  canvas.addEventListener('touchend',   onTE);

  // Raycaster
  const raycaster   = new THREE.Raycaster();
  const pointer     = new THREE.Vector2();
  let clickCb: ((info: PlanetClickInfo | null) => void) | null = null;
  let downPos = { x: 0, y: 0 };

  const onPD = (e: MouseEvent) => { downPos = { x: e.clientX, y: e.clientY }; };
  const onPU = (e: MouseEvent) => {
    if (Math.abs(e.clientX - downPos.x) > 6 || Math.abs(e.clientY - downPos.y) > 6) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    pointer.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(planetMeshes, false);
    if (hits.length) {
      const ud = hits[0].object.userData;
      clickCb?.({ name: ud.name, index: ud.index });
      focusPlanetByName(ud.name);
    } else {
      clickCb?.(null);
    }
  };
  canvas.addEventListener('mousedown', onPD);
  canvas.addEventListener('mouseup',   onPU);

  // Solar flare state
  let flareTimer    = 0;
  let flareDuration = 0;

  function focusPlanetByName(name: string) { focusedPlanet = name; }

  let speedMul = 1;
  let paused   = false;
  let frameCb: ((labels: LabelInfo[]) => void) | null = null;

  // Resize
  const onResize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // ─── Animation loop ──────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let rafId: number;
  const _v3 = new THREE.Vector3();

  const animate = () => {
    rafId = requestAnimationFrame(animate);
    const delta   = clock.getDelta();
    const elapsed = clock.elapsedTime;

    // Update planet positions & shaders
    PLANETS.forEach((pd, i) => {
      if (!paused) {
        orbitAngles[i] += pd.speed * 0.003 * speedMul;
        const x = Math.cos(orbitAngles[i]) * pd.distance;
        const z = Math.sin(orbitAngles[i]) * pd.distance;
        planetMeshes[i].position.set(x, 0, z);
        planetGroups[i].position.set(0, 0, 0);
        planetMeshes[i].rotation.y += pd.selfSpin * speedMul;
      }

      planetShaders[i].uniforms.time.value = elapsed;

      // Weather particle time
      weatherParts[i].mat.uniforms.time.value      = elapsed;
      weatherParts[i].mat.uniforms.intensity.value  = weatherIntensities[i];
      cloudShells[i].mat.uniforms.time.value        = elapsed;
      cloudShells[i].mat.uniforms.intensity.value   = weatherIntensities[i];

      // Atmosphere glow: viewVector
      atmoMeshes[i].mat.uniforms.viewVector?.value.copy(camera.position);
    });

    // Sun
    sunMat.uniforms.time.value = elapsed;
    sun.rotation.y += 0.001;

    // Solar flare
    if (flareDuration > 0) {
      flareTimer += delta;
      const t = flareTimer / flareDuration;
      const fIntensity = t < 0.5 ? t * 2 : (1 - t) * 2;
      const fi = Math.max(0, fIntensity);
      sunMat.uniforms.flareIntensity.value = fi;
      [corona1, corona2, corona3].forEach(c => c.mat.uniforms.flare.value = fi);
      if (flareTimer >= flareDuration) { flareDuration = 0; flareTimer = 0; sunMat.uniforms.flareIntensity.value = 0; }
    }

    // Corona view vectors
    [corona1, corona2, corona3].forEach(c => c.mat.uniforms.viewVector.value.copy(camera.position));

    // Camera movement
    if (focusedPlanet) {
      const idx = PLANETS.findIndex(p => p.name === focusedPlanet);
      if (idx !== -1) {
        const pm  = planetMeshes[idx];
        const pd  = PLANETS[idx];
        const off = pd.radius * 5.5 + 4;
        const des = pm.position.clone().add(new THREE.Vector3(off, off * 0.45, off));
        camera.position.lerp(des, 0.045);
        camera.lookAt(pm.position);
      }
    } else {
      spherical.phi    += (targetSph.phi    - spherical.phi)    * 0.08;
      spherical.theta  += (targetSph.theta  - spherical.theta)  * 0.08;
      spherical.radius += (targetSph.radius - spherical.radius) * 0.08;
      spherical.makeSafe();
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);

    // Compute 2D label positions
    if (frameCb) {
      const labels: LabelInfo[] = PLANETS.map((pd, i) => {
        const wPos = planetMeshes[i].getWorldPosition(_v3.clone());
        const dist = camera.position.distanceTo(wPos);
        const proj = wPos.clone().project(camera);
        const canW = canvas.clientWidth  || W;
        const canH = canvas.clientHeight || H;
        const x    = (proj.x + 1) / 2 * canW;
        const y    = (1 - proj.y) / 2 * canH;
        const behindSun = wPos.length() < 4;
        return { name: pd.name, x, y, visible: proj.z < 1, distance: dist, behindSun };
      });
      frameCb(labels);
    }
  };
  animate();

  // ─── Public API ──────────────────────────────────────────────────────────
  return {
    setSpeed:    (v) => { speedMul = v; },
    setPaused:   (v) => { paused   = v; },
    focusPlanet: focusPlanetByName,
    resetCamera: () => {
      focusedPlanet = null;
      targetSph = { phi: Math.PI / 4, theta: 0, radius: 78 };
    },
    onPlanetClick: (cb) => { clickCb = cb; },
    setWeather: (name, intensity) => {
      const i = PLANETS.findIndex(p => p.name === name);
      if (i !== -1) weatherIntensities[i] = intensity / 100;
    },
    triggerSolarFlare: () => {
      flareDuration = 3.5; flareTimer = 0;
      // Boost all weather briefly
      weatherIntensities.forEach((_, i) => {
        const prev = weatherIntensities[i];
        weatherIntensities[i] = Math.min(1, prev + 0.3);
        setTimeout(() => { weatherIntensities[i] = prev; }, 4000);
      });
    },
    onFrame:  (cb) => { frameCb = cb; },
    cleanup: () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      ['mousedown','mousemove','mouseup','mouseleave'].forEach(ev => canvas.removeEventListener(ev, ev === 'mousedown' ? onMD : ev === 'mousemove' ? onMM : onMU as any));
      canvas.removeEventListener('wheel',      onWh);
      canvas.removeEventListener('touchstart', onTS);
      canvas.removeEventListener('touchmove',  onTM);
      canvas.removeEventListener('touchend',   onTE);
      canvas.removeEventListener('mousedown',  onPD);
      canvas.removeEventListener('mouseup',    onPU);
      renderer.dispose();
    },
  };
}
