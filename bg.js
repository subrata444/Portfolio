/* Three.js space background: an astronaut flies through the sky while Saturn, planets,
   stars and shooting stars pass by. Works in dark and light themes.
   If WebGL or Three.js is unavailable, the site simply has no background animation.
   Tweak SPEED, ASTRONAUT_SIDE or the planet list below. */
(() => {
  if (typeof THREE === "undefined") return;
  const canvas = document.getElementById("bg");
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { return; }

  const SPEED = 1;                 // 0.5 = slower, 2 = faster
  const ASTRONAUT_SIDE = "right";  // "right", "left" or "center" (desktop)
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = innerWidth < 768;
  const rnd = (a, b) => a + Math.random() * (b - a);

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 170);
  camera.position.z = 10;

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const sun = new THREE.DirectionalLight(0xffffff, 1.1); sun.position.set(-4, 5, 6);
  const rim = new THREE.DirectionalLight(0xa07bff, 0.9); rim.position.set(4, -2, -6);
  scene.add(ambient, sun, rim);

  /* ---------- theme ---------- */
  const THEMES = {
    dark:  { star: 0xffffff, blend: THREE.AdditiveBlending, starOp: 0.9, neb: [0x3b5bff, 0x8b5cf6], nebOp: 0.35, canvas: 0.95, amb: 0.55, shoot: 0xffffff },
    light: { star: 0x3a55c8, blend: THREE.NormalBlending,   starOp: 0.8, neb: [0x9db4ff, 0xc9b3ff], nebOp: 0.4,  canvas: 0.7,  amb: 0.9,  shoot: 0x3a55c8 }
  };

  /* ---------- helpers ---------- */
  function bands(cols) {
    const c = document.createElement("canvas"); c.width = 8; c.height = 128;
    const g = c.getContext("2d");
    for (let y = 0; y < 128;) { const h = rnd(4, 14); g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.fillRect(0, y, 8, h); y += h; }
    return new THREE.CanvasTexture(c);
  }
  function glowTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  /* ---------- nebula glows ---------- */
  const glow = glowTexture();
  const nebulae = [[-20, 9, -80], [24, -11, -90]].map((p, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false }));
    s.position.set(p[0], p[1], p[2]); s.scale.set(70, 70, 1); s.userData.i = i;
    scene.add(s); return s;
  });

  /* ---------- stars ---------- */
  const NS = small ? 350 : 800, sp = new Float32Array(NS * 3);
  const seed = (arr, i, z) => { arr[i * 3] = rnd(-60, 60); arr[i * 3 + 1] = rnd(-34, 34); arr[i * 3 + 2] = z; };
  for (let i = 0; i < NS; i++) seed(sp, i, rnd(-110, 10));
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const sm = new THREE.PointsMaterial({ size: 0.25, transparent: true, depthWrite: false });
  scene.add(new THREE.Points(sg, sm));

  const NB = small ? 18 : 36, bp = new Float32Array(NB * 3);
  for (let i = 0; i < NB; i++) seed(bp, i, rnd(-110, -15));
  const bg = new THREE.BufferGeometry(); bg.setAttribute("position", new THREE.BufferAttribute(bp, 3));
  const bm = new THREE.PointsMaterial({ size: 3.2, sizeAttenuation: false, transparent: true, depthWrite: false });
  scene.add(new THREE.Points(bg, bm));

  /* ---------- shooting stars ---------- */
  const shoots = [0, 1, 2].map(() => {
    const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(-2.6, -1.3, 0)]);
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }));
    l.userData = { wait: rnd(1, 6), life: 0 }; scene.add(l); return l;
  });

  /* ---------- astronaut ---------- */
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.55, metalness: 0.1 }, o));
  const white = M(0xf1f4ff), grey = M(0xaab4d4), blue = M(0x4f7dff);
  const visor = M(0x101a4a, { roughness: 0.15, metalness: 0.8, emissive: 0x0a1030 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa24a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const add = (p, geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); p.add(m); return m; };

  const root = new THREE.Group(), pose = new THREE.Group(), body = new THREE.Group();
  root.add(pose); pose.add(body);
  pose.rotation.x = -Math.PI / 2;   // head points forward (into the screen), belly down
  body.rotation.y = Math.PI;

  add(body, new THREE.CylinderGeometry(0.5, 0.45, 1.1, 20), white);                 // torso
  add(body, new THREE.BoxGeometry(0.42, 0.3, 0.08), blue, 0, 0.15, 0.5);             // chest panel
  add(body, new THREE.BoxGeometry(0.75, 0.9, 0.35), grey, 0, 0.05, -0.52);           // backpack
  const neck = add(body, new THREE.TorusGeometry(0.4, 0.07, 10, 24), grey, 0, 0.6, 0); neck.rotation.x = Math.PI / 2;
  add(body, new THREE.SphereGeometry(0.56, 28, 20), white, 0, 0.98, 0);              // helmet
  const v = add(body, new THREE.SphereGeometry(0.42, 24, 16), visor, 0, 0.98, 0.32); v.scale.set(1, 0.85, 0.6);

  const flames = [-1, 1].map(s => {
    add(body, new THREE.CylinderGeometry(0.14, 0.18, 0.3, 12), grey, s * 0.2, -0.55, -0.52);
    const f = add(body, new THREE.ConeGeometry(0.13, 0.8, 12), flameMat, s * 0.2, -1.1, -0.52);
    f.rotation.x = Math.PI; return f;
  });
  const limb = (x, y, rz) => { const g = new THREE.Group(); g.position.set(x, y, 0); g.rotation.z = rz; body.add(g); return g; };
  const arms = [-1, 1].map(s => {
    const g = limb(s * 0.62, 0.4, -s * 0.35);
    add(g, new THREE.CylinderGeometry(0.14, 0.13, 0.8, 12), white, 0, 0.4, 0);
    add(g, new THREE.SphereGeometry(0.17, 12, 10), grey, 0, 0.85, 0); return g;
  });
  const legs = [-1, 1].map(s => {
    const g = limb(s * 0.24, -0.55, s * 0.15);
    add(g, new THREE.CylinderGeometry(0.17, 0.15, 0.9, 12), white, 0, -0.45, 0);
    add(g, new THREE.BoxGeometry(0.28, 0.2, 0.4), blue, 0, -0.97, 0.08); return g;
  });
  scene.add(root);

  /* ---------- planets (the first one is Saturn) ---------- */
  const DEFS = [
    { r: 2.6, cols: ["#e8c98a", "#d9b070", "#f3dfae", "#c99a5b"], ring: 0xe9d7a6, tilt: 0.45 },
    { r: 1.8, cols: ["#4f7dff", "#7fa6ff", "#2a4fd0", "#a9c2ff"] },
    { r: 2.2, cols: ["#c75b4a", "#e08a5a", "#a8412f", "#f0b48a"], ring: 0xd9c6ff, tilt: -0.7 },
    { r: 1.2, cols: ["#8b5cf6", "#b79bff", "#6a3fd6"] }
  ];
  const planets = DEFS.map(d => {
    const g = new THREE.Group();
    add(g, new THREE.SphereGeometry(d.r, 40, 28), new THREE.MeshStandardMaterial({ map: bands(d.cols), roughness: 0.85 }));
    if (d.ring) {
      [[1.45, 1.75, 0.8], [1.85, 2.2, 0.55]].forEach(r => {
        const m = add(g, new THREE.RingGeometry(d.r * r[0], d.r * r[1], 72),
          new THREE.MeshStandardMaterial({ color: d.ring, side: THREE.DoubleSide, transparent: true, opacity: r[2], roughness: 0.9 }));
        m.rotation.x = Math.PI / 2 - 0.35;
      });
      g.rotation.z = d.tilt;
    }
    g.userData = { spin: rnd(0.05, 0.15) };
    scene.add(g); return g;
  });
  let ax = 3.4, ay = 0.2;
  function respawn(p, z) {
    const hh = 12 * Math.tan(THREE.MathUtils.degToRad(27.5)), hw = hh * camera.aspect;
    let x, y, tries = 0;
    do {
      x = (Math.random() < 0.5 ? -1 : 1) * rnd(0.4, 1.0) * hw; y = rnd(-0.9, 0.9) * hh; tries++;
    } while (tries < 20 && Math.abs(x - ax) < 4.5 && Math.abs(y - ay) < 4.5);
    p.position.set(x, y, z); p.userData.v = rnd(4, 7);
  }

  /* ---------- theme, resize, input ---------- */
  function applyTheme() {
    const t = THEMES[document.documentElement.dataset.theme] || THEMES.dark;
    sm.color.setHex(t.star); bm.color.setHex(t.star);
    sm.opacity = t.starOp; sm.blending = bm.blending = t.blend; sm.needsUpdate = bm.needsUpdate = true;
    nebulae.forEach(s => { s.material.color.setHex(t.neb[s.userData.i]); s.material.opacity = t.nebOp; s.material.blending = t.blend; s.material.needsUpdate = true; });
    shoots.forEach(l => { l.material.color.setHex(t.shoot); l.material.blending = t.blend; l.material.needsUpdate = true; });
    ambient.intensity = t.amb; canvas.style.opacity = t.canvas;
    if (reduce) draw();
  }
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const wide = camera.aspect > 1.3;
    ax = !wide ? 0.4 : ASTRONAUT_SIDE === "left" ? -3.4 : ASTRONAUT_SIDE === "center" ? 0 : 3.4;
    root.scale.setScalar(small ? 0.8 : 1.15);
    if (reduce) draw();
  }
  addEventListener("resize", resize);

  let mx = 0, my = 0, sy = 0;
  addEventListener("pointermove", e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  addEventListener("scroll", () => { sy = scrollY; }, { passive: true });

  /* ---------- animation ---------- */
  const clock = new THREE.Clock();
  function draw() { renderer.render(scene, camera); }
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05) * SPEED, t = clock.elapsedTime;

    // stars fly past
    for (let i = 0; i < NS; i++) { sp[i * 3 + 2] += 9 * dt; if (sp[i * 3 + 2] > 10) seed(sp, i, -110); }
    for (let i = 0; i < NB; i++) { bp[i * 3 + 2] += 3 * dt; if (bp[i * 3 + 2] > 10) seed(bp, i, -110); }
    sg.attributes.position.needsUpdate = bg.attributes.position.needsUpdate = true;
    bm.opacity = 0.65 + 0.35 * Math.sin(t * 2);
    nebulae.forEach(s => { s.position.x += Math.sin(t * 0.05 + s.userData.i) * 0.004; });

    // planets
    planets.forEach(p => {
      p.position.z += p.userData.v * dt; p.rotation.y += p.userData.spin * dt;
      if (p.position.z > 6) respawn(p, rnd(-115, -90));
    });

    // shooting stars
    shoots.forEach(l => {
      const u = l.userData;
      if (u.life > 0) {
        u.life -= dt; l.position.x -= 14 * dt; l.position.y -= 7 * dt;
        l.material.opacity = Math.min(1, u.life * 2) * 0.9;
        if (u.life <= 0) { l.material.opacity = 0; u.wait = rnd(2, 7); }
      } else if ((u.wait -= dt) <= 0) { u.life = 1.2; l.position.set(rnd(-2, 12), rnd(2, 7), -6); }
    });

    // astronaut
    root.position.set(ax + mx * 0.6, ay + Math.sin(t * 0.8) * 0.25 - my * 0.3 - sy * 0.0006, 0);
    root.rotation.y = 0.9 + mx * 0.25;
    root.rotation.z = Math.sin(t * 0.6) * 0.12;
    body.rotation.y = Math.PI + Math.sin(t * 0.5) * 0.15;
    legs[0].rotation.x = Math.sin(t * 2.2) * 0.2; legs[1].rotation.x = -Math.sin(t * 2.2) * 0.2;
    arms[0].rotation.x = Math.sin(t * 1.6) * 0.08; arms[1].rotation.x = -Math.sin(t * 1.6) * 0.08;
    flames.forEach((f, i) => { f.scale.set(1, 1 + 0.3 * Math.sin(t * 30 + i * 2) + rnd(-0.1, 0.1), 1); });

    camera.position.x += (mx * 0.8 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    draw();
    if (!document.hidden) requestAnimationFrame(tick);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !reduce) { clock.getDelta(); requestAnimationFrame(tick); } });

  resize();
  planets.forEach((p, i) => respawn(p, i === 0 ? -28 : rnd(-100, -20)));
  applyTheme();
  if (reduce) { root.position.set(ax, ay, 0); root.rotation.y = 0.9; camera.lookAt(0, 0, 0); draw(); }
  else requestAnimationFrame(tick);
})();
