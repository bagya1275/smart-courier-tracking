/**
 * SMART COURIER PLATFORM - 3D ROUTE OPTIMIZATION ENGINE
 * Centerpiece Three.js 3D City & Animated Glowing Route Mesh
 * Isolated module with OrbitControls, fly-to camera interpolation & particle pulses.
 */

class RouteMap3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.animationFrameId = null;

    this.routes = [];
    this.routeCurves = new Map(); // id -> { curve, tubeMesh, particles: [], vehicleMesh, color }
    this.pins = [];
    this.pulseRings = [];
    this.buildings = [];

    this.autoRotate = true;
    this.themeMode = 'cyber'; // 'cyber' | 'day' | 'night'
    this.selectedRouteId = null;

    this.cameraTarget = { x: 0, y: 0, z: 0 };
    this.isFlyingCamera = false;
    this.flyProgress = 0;
    this.flyStartPos = null;
    this.flyEndPos = null;
    this.flyStartTarget = null;
    this.flyEndTarget = null;

    this.init();
  }

  init() {
    if (!window.THREE) {
      console.warn('Three.js is not loaded yet.');
      return;
    }

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 650;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070A10);
    this.scene.fog = new THREE.FogExp2(0x070A10, 0.0018);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    this.camera.position.set(280, 260, 340);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    if (window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.05; // Don't go below ground
      this.controls.minDistance = 60;
      this.controls.maxDistance = 800;
      this.controls.autoRotate = this.autoRotate;
      this.controls.autoRotateSpeed = 0.6;
    }

    // 5. Lighting
    this.setupLighting();

    // 6. Environment & City Grid
    this.buildCityTerrain();

    // 7. Event Listeners
    window.addEventListener('resize', () => this.onResize());

    // 8. Start Animation Loop
    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x1a2639, 1.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00F0FF, 1.5);
    dirLight.position.set(200, 400, 150);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0x8B5CF6, 2.5, 600);
    purpleLight.position.set(-150, 180, -100);
    this.scene.add(purpleLight);

    const cyanLight = new THREE.PointLight(0x00F0FF, 3.0, 700);
    cyanLight.position.set(100, 150, 120);
    this.scene.add(cyanLight);
  }

  buildCityTerrain() {
    // Holographic Grid Floor
    const gridHelper = new THREE.GridHelper(900, 45, 0x00F0FF, 0x111D30);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    // Ground Plane with subtle reflection
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x070B14,
      roughness: 0.8,
      metalness: 0.3
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Generate Stylized 3D City Buildings
    const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x0e1726,
      roughness: 0.6,
      metalness: 0.5,
      emissive: 0x050d1a,
      emissiveIntensity: 0.6
    });

    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.25 });

    const buildingCount = 75;
    const rng = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < buildingCount; i++) {
      const x = rng(-380, 380);
      const z = rng(-380, 380);

      // Keep center depot clear
      if (Math.abs(x + 150) < 40 && Math.abs(z + 100) < 40) continue;

      const w = rng(16, 36);
      const d = rng(16, 36);
      const h = rng(25, 160);

      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.scale.set(w, h, d);
      building.position.set(x, h / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);
      this.buildings.push(building);

      // Neon Wireframe Top Edge
      const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
      const line = new THREE.LineSegments(edges, edgeMat);
      line.position.copy(building.position);
      this.scene.add(line);
    }
  }

  loadRoutesData(routes) {
    this.routes = routes;
    this.clearRoutes();

    routes.forEach(route => {
      this.create3DRoute(route);
    });
  }

  clearRoutes() {
    this.routeCurves.forEach(item => {
      this.scene.remove(item.tubeMesh);
      if (item.haloMesh) this.scene.remove(item.haloMesh);
      if (item.vehicleMesh) this.scene.remove(item.vehicleMesh);
      item.particles.forEach(p => this.scene.remove(p.mesh));
    });
    this.routeCurves.clear();

    this.pins.forEach(pin => this.scene.remove(pin));
    this.pins = [];

    this.pulseRings.forEach(r => this.scene.remove(r));
    this.pulseRings = [];
  }

  create3DRoute(route) {
    const rawWaypoints = route.waypoints || [
      { name: 'Origin', x: -120, y: 0, z: -80 },
      { name: 'Waypoint', x: 0, y: 0, z: 0 },
      { name: 'Destination', x: 120, y: 0, z: 80 }
    ];

    // Build 3D points with vertical arch (Bezier arc)
    const points3D = rawWaypoints.map((wp, idx) => {
      const isDepot = idx === 0;
      const isEnd = idx === rawWaypoints.length - 1;
      const elevation = isDepot || isEnd ? 0 : 25 + Math.sin((idx / rawWaypoints.length) * Math.PI) * 40;
      return new THREE.Vector3(wp.x, elevation, wp.z);
    });

    // Create Smooth Catmull-Rom Spline Curve
    const curve = new THREE.CatmullRomCurve3(points3D, false, 'centripetal', 0.5);

    // Glowing Neon Tube
    const tubeGeo = new THREE.TubeGeometry(curve, 70, 1.8, 8, false);
    const colorHex = route.color ? parseInt(route.color.replace('#', '0x')) : 0x00F0FF;

    const tubeMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85
    });

    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(tubeMesh);

    // Outer Glow Halo Tube
    const haloGeo = new THREE.TubeGeometry(curve, 70, 3.5, 8, false);
    const haloMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.scene.add(haloMesh);

    // Animated Traveling Light Pulses along the curve
    const particles = [];
    const pulseCount = 4;
    for (let i = 0; i < pulseCount; i++) {
      const pGeo = new THREE.SphereGeometry(2.4, 12, 12);
      const pMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.95
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      this.scene.add(pMesh);
      particles.push({
        mesh: pMesh,
        progress: i / pulseCount,
        speed: 0.0035 + (i % 2) * 0.001
      });
    }

    // Moving Courier Vehicle Beacon
    const vGeo = new THREE.ConeGeometry(3.5, 9, 8);
    vGeo.rotateX(Math.PI / 2);
    const vMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      emissive: 0xF59E0B,
      emissiveIntensity: 1.2
    });
    const vehicleMesh = new THREE.Mesh(vGeo, vMat);
    this.scene.add(vehicleMesh);

    // Build Depot & Destination Pins with Pulsing Rings
    rawWaypoints.forEach((wp, idx) => {
      const isDepot = idx === 0;
      const isDestination = idx === rawWaypoints.length - 1;
      if (isDepot || isDestination) {
        this.createPin(wp.x, wp.z, isDepot ? 'DEPOT ALPHA' : wp.name, isDepot ? 0x00F0FF : 0x10B981, isDepot);
      }
    });

    this.routeCurves.set(route.id, {
      id: route.id,
      curve,
      tubeMesh,
      haloMesh,
      particles,
      vehicleMesh,
      vehicleProgress: 0.1,
      color: colorHex
    });
  }

  createPin(x, z, label, colorHex, isDepot) {
    const pinGroup = new THREE.Group();
    pinGroup.position.set(x, 0, z);

    // Floating Glowing Diamond Pin Marker
    const diamondGeo = new THREE.OctahedronGeometry(isDepot ? 6 : 4.5, 0);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 1.4,
      metalness: 0.8,
      roughness: 0.2
    });
    const diamondMesh = new THREE.Mesh(diamondGeo, diamondMat);
    diamondMesh.position.y = 35;
    pinGroup.add(diamondMesh);

    // Vertical Light Beam Needle
    const needleGeo = new THREE.CylinderGeometry(0.4, 0.4, 35, 8);
    const needleMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.75
    });
    const needle = new THREE.Mesh(needleGeo, needleMat);
    needle.position.y = 17.5;
    pinGroup.add(needle);

    // Ground Pulsing Ring
    const ringGeo = new THREE.RingGeometry(2, isDepot ? 14 : 9, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.6;
    pinGroup.add(ring);

    this.scene.add(pinGroup);
    this.pins.push({ group: pinGroup, diamondMesh, colorHex, baseY: 35 });
    this.pulseRings.push({ ring, scale: 1, maxScale: isDepot ? 2.4 : 1.8 });
  }

  selectRoute(routeId) {
    this.selectedRouteId = routeId;

    // Highlight selected route, dim others
    this.routeCurves.forEach((item, id) => {
      if (id === routeId) {
        item.tubeMesh.material.opacity = 1.0;
        item.haloMesh.material.opacity = 0.55;
        item.haloMesh.scale.set(1.3, 1.3, 1.3);
      } else {
        item.tubeMesh.material.opacity = 0.25;
        item.haloMesh.material.opacity = 0.08;
        item.haloMesh.scale.set(1.0, 1.0, 1.0);
      }
    });

    // Fly camera to target route
    const targetRoute = this.routeCurves.get(routeId);
    if (targetRoute) {
      const midPoint = targetRoute.curve.getPointAt(0.5);
      this.flyCameraTo(
        new THREE.Vector3(midPoint.x + 90, 110, midPoint.z + 120),
        new THREE.Vector3(midPoint.x, 20, midPoint.z),
        1200
      );
    }
  }

  flyCameraTo(targetPos, lookAtTarget, durationMs = 1200) {
    if (!this.controls) return;

    this.isFlyingCamera = true;
    this.flyProgress = 0;
    this.flyStartPos = this.camera.position.clone();
    this.flyEndPos = targetPos.clone();
    this.flyStartTarget = this.controls.target.clone();
    this.flyEndTarget = lookAtTarget.clone();

    if (this.controls) {
      this.controls.autoRotate = false;
    }
  }

  resetCamera() {
    this.selectedRouteId = null;
    this.routeCurves.forEach(item => {
      item.tubeMesh.material.opacity = 0.85;
      item.haloMesh.material.opacity = 0.22;
      item.haloMesh.scale.set(1, 1, 1);
    });

    this.flyCameraTo(
      new THREE.Vector3(280, 260, 340),
      new THREE.Vector3(0, 0, 0),
      1400
    );

    setTimeout(() => {
      if (this.controls) this.controls.autoRotate = this.autoRotate;
    }, 1500);
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    if (this.controls) {
      this.controls.autoRotate = this.autoRotate;
    }
    return this.autoRotate;
  }

  toggleThemeMode() {
    if (this.themeMode === 'cyber') {
      this.themeMode = 'night';
      this.scene.background = new THREE.Color(0x040609);
      this.scene.fog.color = new THREE.Color(0x040609);
    } else {
      this.themeMode = 'cyber';
      this.scene.background = new THREE.Color(0x070A10);
      this.scene.fog.color = new THREE.Color(0x070A10);
    }
    return this.themeMode;
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const time = performance.now() * 0.001;

    // 1. Camera Fly-To Interpolation
    if (this.isFlyingCamera) {
      this.flyProgress += 0.025;
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, this.flyProgress)); // Smooth cosine easing
      this.camera.position.lerpVectors(this.flyStartPos, this.flyEndPos, ease);
      this.controls.target.lerpVectors(this.flyStartTarget, this.flyEndTarget, ease);

      if (this.flyProgress >= 1) {
        this.isFlyingCamera = false;
      }
    }

    if (this.controls) {
      this.controls.update();
    }

    // 2. Animate Traveling Light Pulses & Vehicle Beacons along 3D Splines
    this.routeCurves.forEach(item => {
      // Particles
      item.particles.forEach(p => {
        p.progress = (p.progress + p.speed) % 1.0;
        const pos = item.curve.getPointAt(p.progress);
        p.mesh.position.copy(pos);
      });

      // Vehicle
      if (item.vehicleMesh) {
        item.vehicleProgress = (item.vehicleProgress + 0.0012) % 1.0;
        const vPos = item.curve.getPointAt(item.vehicleProgress);
        const vTangent = item.curve.getTangentAt(item.vehicleProgress);
        item.vehicleMesh.position.copy(vPos);
        item.vehicleMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), vTangent);
      }
    });

    // 3. Animate Floating Pins & Pulsing Rings
    this.pins.forEach(pin => {
      pin.diamondMesh.rotation.y += 0.03;
      pin.diamondMesh.position.y = pin.baseY + Math.sin(time * 3) * 3;
    });

    this.pulseRings.forEach(pRing => {
      pRing.scale += 0.015;
      if (pRing.scale > pRing.maxScale) {
        pRing.scale = 0.4;
      }
      pRing.ring.scale.set(pRing.scale, pRing.scale, 1);
      pRing.ring.material.opacity = Math.max(0, 1.0 - (pRing.scale / pRing.maxScale));
    });

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

window.RouteMap3D = RouteMap3D;
