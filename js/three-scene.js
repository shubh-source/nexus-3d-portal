/**
 * NEXUS 3D // Three.js Spatial Background & Dynamic Lighting
 * Features: Interactive starfield, floating crystalline polyhedra,
 * cursor-tracked point light, smooth camera parallax, and theme transitions.
 */

class ThreeBackgroundScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    // Check if Three.js is loaded
    if (typeof THREE === 'undefined') {
      console.warn('Three.js CDN unavailable. Falling back to native 2D/3D Canvas engine.');
      if (window.initFallback3D) {
        window.initFallback3D();
      }
      return;
    }

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.polyhedra = [];
    this.clock = new THREE.Clock();

    // Theme configurations
    this.themes = {
      cosmic: {
        bg: 0x070312,
        light1: 0x7928ca,
        light2: 0x00dfd8,
        particles: 0x00f2fe,
        poly: 0x8a2be2,
        fogDensity: 0.0018
      },
      cyber: {
        bg: 0x020d09,
        light1: 0x059669,
        light2: 0x34d399,
        particles: 0x6ee7b7,
        poly: 0x10b981,
        fogDensity: 0.002
      },
      sunset: {
        bg: 0x13040e,
        light1: 0xe11d48,
        light2: 0xf97316,
        particles: 0xfacc15,
        poly: 0xf43f5e,
        fogDensity: 0.0019
      },
      dark: {
        bg: 0x0a0e17,
        light1: 0x2563eb,
        light2: 0x60a5fa,
        particles: 0x93c5fd,
        poly: 0x3b82f6,
        fogDensity: 0.0022
      }
    };

    this.currentThemeKey = 'cosmic';

    this.init();
    this.createLights();
    this.createStarfield();
    this.createFloatingShapes();
    this.initListeners();
    this.animate();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.currentTheme = this.themes[this.currentThemeKey];
    this.scene.fog = new THREE.FogExp2(this.currentTheme.bg, this.currentTheme.fogDensity);

    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 85;

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  createLights() {
    // Soft Ambient
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    // Dynamic Cursor Tracking Point Light
    this.cursorLight = new THREE.PointLight(this.currentTheme.light2, 3.5, 120);
    this.cursorLight.position.set(0, 0, 40);
    this.scene.add(this.cursorLight);

    // Secondary Accent Light
    this.accentLight = new THREE.DirectionalLight(this.currentTheme.light1, 2.0);
    this.accentLight.position.set(-40, 50, 30);
    this.scene.add(this.accentLight);
  }

  createStarfield() {
    const particleCount = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 280;
      positions[i + 1] = (Math.random() - 0.5) * 200;
      positions[i + 2] = (Math.random() - 0.5) * 220;

      scales[i / 3] = Math.random() * 2.2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Particle Shader Material
    const material = new THREE.PointsMaterial({
      color: this.currentTheme.particles,
      size: 1.8,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  createFloatingShapes() {
    this.shapesGroup = new THREE.Group();

    // Material for crystalline geometric shapes
    const polyMaterial = new THREE.MeshStandardMaterial({
      color: this.currentTheme.poly,
      metalness: 0.6,
      roughness: 0.2,
      wireframe: false,
      transparent: true,
      opacity: 0.85
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });

    // 1. Left Hero Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(11, 0);
    const icoMesh = new THREE.Mesh(icoGeo, polyMaterial.clone());
    const icoWire = new THREE.Mesh(icoGeo, wireMaterial);
    icoMesh.add(icoWire);
    icoMesh.position.set(-52, 12, -10);
    this.polyhedra.push({
      mesh: icoMesh,
      rotSpeed: { x: 0.005, y: 0.008, z: 0.003 },
      basePos: { x: -52, y: 12, z: -10 },
      floatFreq: 1.2
    });
    this.shapesGroup.add(icoMesh);

    // 2. Right Hero Torus Knot
    const torusGeo = new THREE.TorusKnotGeometry(8, 2.5, 80, 16);
    const torusMesh = new THREE.Mesh(torusGeo, polyMaterial.clone());
    torusMesh.position.set(52, -8, -15);
    this.polyhedra.push({
      mesh: torusMesh,
      rotSpeed: { x: 0.004, y: 0.006, z: 0.002 },
      basePos: { x: 52, y: -8, z: -15 },
      floatFreq: 0.9
    });
    this.shapesGroup.add(torusMesh);

    // 3. Top Floating Octahedron
    const octGeo = new THREE.OctahedronGeometry(6, 0);
    const octMesh = new THREE.Mesh(octGeo, polyMaterial.clone());
    octMesh.add(new THREE.Mesh(octGeo, wireMaterial));
    octMesh.position.set(38, 28, -25);
    this.polyhedra.push({
      mesh: octMesh,
      rotSpeed: { x: -0.007, y: 0.005, z: 0.004 },
      basePos: { x: 38, y: 28, z: -25 },
      floatFreq: 1.5
    });
    this.shapesGroup.add(octMesh);

    // 4. Background Concentric Cyber Rings
    const ringGeo = new THREE.TorusGeometry(18, 0.4, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: this.currentTheme.light2,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(-36, -30, -35);
    ringMesh.rotation.x = Math.PI / 3;
    this.polyhedra.push({
      mesh: ringMesh,
      rotSpeed: { x: 0.002, y: 0.003, z: 0.008 },
      basePos: { x: -36, y: -30, z: -35 },
      floatFreq: 0.7
    });
    this.shapesGroup.add(ringMesh);

    this.scene.add(this.shapesGroup);
  }

  setTheme(themeName) {
    const t = this.themes[themeName];
    if (!t) return;
    this.currentThemeKey = themeName;
    this.currentTheme = t;

    // Update lights
    if (this.cursorLight) this.cursorLight.color.setHex(t.light2);
    if (this.accentLight) this.accentLight.color.setHex(t.light1);
    if (this.scene.fog) {
      this.scene.fog.color.setHex(t.bg);
      this.scene.fog.density = t.fogDensity;
    }

    // Update starfield
    if (this.starfield) {
      this.starfield.material.color.setHex(t.particles);
    }

    // Update shapes
    this.polyhedra.forEach((item) => {
      if (item.mesh.material && item.mesh.material.color) {
        item.mesh.material.color.setHex(t.poly);
      }
    });
  }

  initListeners() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Touch support for mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        this.mouse.targetY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    }, { passive: true });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Lerp mouse coordinates
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Cursor light tracking in 3D world
    if (this.cursorLight) {
      this.cursorLight.position.x = this.mouse.x * 45;
      this.cursorLight.position.y = this.mouse.y * 35;
    }

    // Camera Parallax
    this.camera.position.x = this.mouse.x * 7;
    this.camera.position.y = this.mouse.y * 5;
    this.camera.lookAt(0, 0, 0);

    // Slowly rotate starfield
    if (this.starfield) {
      this.starfield.rotation.y = elapsedTime * 0.02;
      this.starfield.rotation.x = Math.sin(elapsedTime * 0.015) * 0.05;
    }

    // Animate Polyhedra
    this.polyhedra.forEach((item) => {
      const { mesh, rotSpeed, basePos, floatFreq } = item;
      mesh.rotation.x += rotSpeed.x;
      mesh.rotation.y += rotSpeed.y;
      mesh.rotation.z += rotSpeed.z;

      // Gentle floating sine wave
      mesh.position.y = basePos.y + Math.sin(elapsedTime * floatFreq) * 3;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

// Global scene instantiator
window.addEventListener('DOMContentLoaded', () => {
  window.nexus3DScene = new ThreeBackgroundScene('bg-canvas');
});
