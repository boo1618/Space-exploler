import * as THREE from 'three';

export function init(canvas: HTMLCanvasElement): (() => void) | null {
  // Check WebGL support before attempting to create a renderer
  try {
    const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!testCtx) return null;
  } catch {
    return null;
  }

  const scene = new THREE.Scene();

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  );
  camera.position.z = 10;
  camera.position.y = 0;
  camera.position.x = 0;

  // Renderer setup — wrapped in try/catch for environments without WebGL
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Group for parallax
  const sceneGroup = new THREE.Group();
  scene.add(sceneGroup);

  // 1. Starfield: 8000 random white/blue/cyan point particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 8000;
  const posArray = new Float32Array(particlesCount * 3);
  const colorArray = new Float32Array(particlesCount * 3);

  const colors = [
    new THREE.Color('#ffffff'),
    new THREE.Color('#38BDF8'),
    new THREE.Color('#7C3AED')
  ];

  for(let i = 0; i < particlesCount; i++) {
    // Spherical distribution
    const r = 20 + Math.random() * 80;
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    posArray[i * 3] = x;
    posArray[i * 3 + 1] = y;
    posArray[i * 3 + 2] = z;

    const color = colors[Math.floor(Math.random() * colors.length)];
    colorArray[i * 3] = color.r;
    colorArray[i * 3 + 1] = color.g;
    colorArray[i * 3 + 2] = color.b;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

  // Custom shader material for glowing stars
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  sceneGroup.add(particlesMesh);

  // 2. Nebula / Atmosphere
  const createNebula = (color: number, size: number, x: number, y: number, z: number) => {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    return mesh;
  };
  
  sceneGroup.add(createNebula(0x7C3AED, 15, -10, 5, -20)); // Purple
  sceneGroup.add(createNebula(0x38BDF8, 20, 15, -5, -30)); // Cyan
  sceneGroup.add(createNebula(0x0F172A, 25, 0, 0, -40));   // Deep blue

  // 3. Main Planet
  const planetGroup = new THREE.Group();
  planetGroup.position.set(3, 0, 0); // Off-center to the right
  sceneGroup.add(planetGroup);

  // Planet sphere with custom shader for a dramatic gas giant look
  const planetGeometry = new THREE.SphereGeometry(2.5, 64, 64);
  const planetMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color('#7C3AED') },
      color2: { value: new THREE.Color('#38BDF8') },
      color3: { value: new THREE.Color('#0F172A') }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      // Simple noise function
      float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
      vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
      vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
      float noise(vec3 p){
          vec3 a = floor(p);
          vec3 d = p - a;
          d = d * d * (3.0 - 2.0 * d);
          vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
          vec4 k1 = perm(b.xyxy);
          vec4 k2 = perm(k1.xyxy + b.zzww);
          vec4 c = k2 + a.zzzz;
          vec4 k3 = perm(c);
          vec4 k4 = perm(c + 1.0);
          vec4 o1 = fract(k3 * (1.0 / 41.0));
          vec4 o2 = fract(k4 * (1.0 / 41.0));
          vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
          vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
          return o4.y * d.y + o4.x * (1.0 - d.y);
      }

      void main() {
        float n = noise(vec3(vUv * 5.0, time * 0.1));
        float n2 = noise(vec3(vUv * 10.0 + n, time * 0.05));
        
        vec3 finalColor = mix(color3, color1, n);
        finalColor = mix(finalColor, color2, n2 * 0.5);
        
        // Add fake lighting (fresnel and directional)
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0);
        float ambient = 0.2;
        
        // Edge rim lighting
        float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
        rim = smoothstep(0.6, 1.0, rim);
        
        vec3 color = finalColor * (diff + ambient) + (color2 * rim * 0.5);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  planetGroup.add(planet);

  // Atmospheric glow halo
  const haloGeometry = new THREE.SphereGeometry(2.7, 32, 32);
  const haloMaterial = new THREE.ShaderMaterial({
    uniforms: {
      c: { value: 0.1 },
      p: { value: 4.5 },
      glowColor: { value: new THREE.Color(0x38BDF8) },
      viewVector: { value: camera.position }
    },
    vertexShader: `
      uniform vec3 viewVector;
      varying float intensity;
      void main() {
        vec3 vNormal = normalize(normalMatrix * normal);
        vec3 vNormel = normalize(normalMatrix * viewVector);
        intensity = pow(0.6 - dot(vNormal, vNormel), 2.5);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4(glow, intensity * 0.8);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  });
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  planetGroup.add(halo);

  // Orbit ring
  const ringGeometry = new THREE.TorusGeometry(3.5, 0.01, 16, 100);
  const ringMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x7C3AED, 
    transparent: true, 
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2.5;
  ring.rotation.y = Math.PI / 8;
  planetGroup.add(ring);
  
  const ring2Geometry = new THREE.TorusGeometry(3.8, 0.02, 16, 100);
  const ring2Material = new THREE.MeshBasicMaterial({ 
    color: 0x38BDF8, 
    transparent: true, 
    opacity: 0.15,
    blending: THREE.AdditiveBlending
  });
  const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
  ring2.rotation.copy(ring.rotation);
  planetGroup.add(ring2);

  // Mouse Parallax variables
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  const onDocumentMouseMove = (event: MouseEvent) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  };

  document.addEventListener('mousemove', onDocumentMouseMove);

  // Resize handler
  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Adjust planet position for mobile
    if (window.innerWidth < 768) {
      planetGroup.position.set(0, -2, 0);
      planetGroup.scale.set(0.7, 0.7, 0.7);
    } else {
      planetGroup.position.set(3, 0, 0);
      planetGroup.scale.set(1, 1, 1);
    }
  };
  
  window.addEventListener('resize', onWindowResize);
  onWindowResize(); // Initial setup

  // Animation Loop
  const clock = new THREE.Clock();
  let rafId: number;

  const animate = () => {
    rafId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Planet rotation & shader update
    planet.rotation.y += 0.002;
    planetMaterial.uniforms.time.value = time;
    
    // Starfield subtle rotation
    particlesMesh.rotation.y = time * 0.01;

    // Parallax easing
    targetX = mouseX * 0.001;
    targetY = mouseY * 0.001;
    sceneGroup.rotation.y += 0.05 * (targetX - sceneGroup.rotation.y);
    sceneGroup.rotation.x += 0.05 * (targetY - sceneGroup.rotation.x);
    
    // Camera floating
    camera.position.y = Math.sin(time * 0.5) * 0.2;

    renderer.render(scene, camera);
  };

  animate();

  // Cleanup function
  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('mousemove', onDocumentMouseMove);
    
    // Dispose resources
    particlesGeometry.dispose();
    particlesMaterial.dispose();
    planetGeometry.dispose();
    planetMaterial.dispose();
    haloGeometry.dispose();
    haloMaterial.dispose();
    ringGeometry.dispose();
    ringMaterial.dispose();
    ring2Geometry.dispose();
    ring2Material.dispose();
    
    renderer.dispose();
  };
}