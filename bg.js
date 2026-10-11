/* Three.js animated background: floating wireframe shapes + soft particles.
   Colours follow the dark/light theme. If WebGL or Three.js is unavailable, the site simply has no background animation. */
(() => {
  if (typeof THREE === "undefined") return;
  const canvas = document.getElementById("bg");
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch (e) { return; }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = innerWidth < 768;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 10;

  const THEMES = {
    dark:  { a: 0x5b8cff, b: 0xa07bff, wire: 0.38, dots: 0.8,  blend: THREE.AdditiveBlending },
    light: { a: 0x3a55c8, b: 0x7a45d6, wire: 0.3,  dots: 0.55, blend: THREE.NormalBlending }
  };

  const shapes = [
    { g: new THREE.IcosahedronGeometry(2.1, 1),        x: -6.2, y: 2.2,  s: 1,    c: "a", r: [0.05, 0.08] },
    { g: new THREE.TorusKnotGeometry(1.1, 0.32, 90, 10), x: 6.4,  y: -1.2, s: 1,    c: "b", r: [0.07, 0.04] },
    { g: new THREE.OctahedronGeometry(1.3),            x: -3.5, y: -4.6, s: 0.9,  c: "b", r: [0.06, 0.09] },
    { g: new THREE.TorusGeometry(1.2, 0.05, 8, 48),    x: 4.2,  y: 4.6,  s: 1,    c: "a", r: [0.09, 0.05] }
  ].map(o => {
    const m = new THREE.Mesh(o.g, new THREE.MeshBasicMaterial({ wireframe: true, transparent: true }));
    const k = small ? 0.65 : 1;
    m.position.set(o.x * (small ? 0.45 : 1), o.y, -2);
    m.scale.setScalar(o.s * k);
    m.userData = o;
    scene.add(m);
    return m;
  });

  const N = small ? 260 : 600, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 34; pos[i * 3 + 1] = (Math.random() - 0.5) * 22; pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2; }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ size: 0.06, transparent: true, depthWrite: false });
  const dots = new THREE.Points(pg, pm);
  scene.add(dots);

  function applyTheme() {
    const t = THEMES[document.documentElement.dataset.theme] || THEMES.dark;
    shapes.forEach(m => { m.material.color.setHex(t[m.userData.c]); m.material.opacity = t.wire; m.material.blending = t.blend; m.material.needsUpdate = true; });
    pm.color.setHex(t.a); pm.opacity = t.dots; pm.blending = t.blend; pm.needsUpdate = true;
    if (reduce) draw();
  }
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    if (reduce) draw();
  }
  addEventListener("resize", resize);

  let mx = 0, my = 0, sy = 0;
  addEventListener("pointermove", e => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  addEventListener("scroll", () => { sy = scrollY; }, { passive: true });

  const clock = new THREE.Clock();
  function draw() { renderer.render(scene, camera); }
  function tick() {
    const t = clock.getElapsedTime();
    shapes.forEach((m, i) => {
      m.rotation.x = t * m.userData.r[0]; m.rotation.y = t * m.userData.r[1];
      m.position.y = m.userData.y + Math.sin(t * 0.5 + i * 1.7) * 0.35 - sy * 0.0012;
    });
    dots.rotation.y = t * 0.012; dots.rotation.x = t * 0.006;
    camera.position.x += (mx * 1.4 - camera.position.x) * 0.04;
    camera.position.y += (-my * 0.9 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    draw();
    if (!document.hidden) requestAnimationFrame(tick);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !reduce) { clock.getDelta(); requestAnimationFrame(tick); } });

  resize(); applyTheme();
  reduce ? draw() : requestAnimationFrame(tick);
})();
