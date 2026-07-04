// Three.js zit LOKAAL in het project (src/vendor/three.module.js).
import * as THREE from './vendor/three.module.js';
import { SFX, initAudio } from './sound.js';
import { Voice } from './voice.js';
import { saveHigh, addStars, giveMedal } from './progress.js';
import {
  gepasseerdeTientallen, tientalNaam, telHint, getallenlijnFractie,
  voerWaarde, maakBestelling, krimpBijBotsing, MISSIES, missieVoortgang,
} from './snakeLogic.js';

// ===== 3D SNAKE (Slither-stijl) =====
// Een groot speelveld met andere slangen die rondkruipen. Laat de kop van
// je slang tegen het LIJF van een andere slang botsen: die valt uit elkaar
// in eetbare bolletjes waar jij groter van wordt. Er komen steeds nieuwe
// slangen bij. Bots je met je kop tegen een ander zijn kop, dan wint de
// langste. De vloeiende slang volgt continu een pad (geen hokjes).

const FIELD = 60;          // half-breedte van het speelveld (groot!)
const PLAYER_SPEED = 6.0;  // tegels per seconde
const TURN_RATE = 3.2;     // hoe snel de speler draait (radialen/sec)
const SEG_SPACING = 0.35;  // afstand tussen lijf-bollen
const TRAIL_STEP = 0.12;
const MAX_BOTS = 6;
const BODY_MAX = 42;   // fysieke lijflengte-cap (perf + oogt goed); de TELLING groeit door

export function launchSnake3D(onExit) {
  initAudio();

  const root = document.createElement('div');
  root.style.cssText = `position:fixed;inset:0;z-index:9999;background:#070815;touch-action:none;overflow:hidden;`;
  document.body.appendChild(root);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070815);
  scene.fog = new THREE.Fog(0x070815, 28, 55);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);

  function resize() {
    const w = root.clientWidth, h = root.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  // Licht (geen schaduwen voor performance)
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(10, 20, 10);
  scene.add(sun);
  const pink = new THREE.PointLight(0xff6ec7, 0.4, 60); pink.position.set(-20, 8, -15); scene.add(pink);
  const cyan = new THREE.PointLight(0x4dd0e1, 0.4, 60); cyan.position.set(20, 8, 15); scene.add(cyan);

  // Sterren
  const starGeo = new THREE.BufferGeometry();
  const sc = 400, sp = new Float32Array(sc * 3);
  for (let i = 0; i < sc; i++) { sp[i*3]=(Math.random()-0.5)*180; sp[i*3+1]=Math.random()*60-10; sp[i*3+2]=(Math.random()-0.5)*180; }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, transparent: true, opacity: 0.6 }));
  scene.add(stars);

  // --- Groot speelveld: neon-arena met gradiënt-vloer i.p.v. platte kleur ---
  function maakVloerTextuur() {
    const sz = 512, cv = document.createElement('canvas');
    cv.width = sz; cv.height = sz;
    const c = cv.getContext('2d');
    // radiale gradiënt: diep nachtblauw in het midden → paars aan de rand
    const gr = c.createRadialGradient(sz / 2, sz / 2, 20, sz / 2, sz / 2, sz / 2);
    gr.addColorStop(0, '#262b5e');
    gr.addColorStop(0.55, '#1c1f44');
    gr.addColorStop(0.85, '#231b4a');
    gr.addColorStop(1, '#31205e');
    c.fillStyle = gr; c.fillRect(0, 0, sz, sz);
    // subtiel stippen-raster (diepte-gevoel bij het bewegen)
    c.fillStyle = 'rgba(140,150,255,0.10)';
    for (let y = 8; y < sz; y += 20) {
      for (let x = 8 + ((y / 20) % 2) * 10; x < sz; x += 20) {
        c.beginPath(); c.arc(x, y, 1.4, 0, Math.PI * 2); c.fill();
      }
    }
    return new THREE.CanvasTexture(cv);
  }
  const floorMat = new THREE.MeshBasicMaterial({ map: maakVloerTextuur() });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(FIELD, 64), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);
  // Gloeiende oriëntatie-ringen — elke ring z'n eigen zachte neonkleur
  const RING_KLEUREN = [0x35406e, 0x3e3570, 0x2f4a6e, 0x45306a, 0x2e5468];
  let ringIdx = 0;
  for (let r = 10; r < FIELD; r += 10) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r - 0.18, r + 0.18, 64),
      new THREE.MeshBasicMaterial({ color: RING_KLEUREN[ringIdx++ % RING_KLEUREN.length], side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);
  }
  // Rand-muur (gloeiende cirkel; pulseert in de animate-lus)
  const wall = new THREE.Mesh(
    new THREE.TorusGeometry(FIELD, 0.6, 12, 80),
    new THREE.MeshStandardMaterial({ color: 0x7c5cff, emissive: 0x4a2a90, emissiveIntensity: 0.6, roughness: 0.4 })
  );
  wall.rotation.x = -Math.PI / 2;
  wall.position.y = 0.3;
  scene.add(wall);
  // Gloeiende kristallen rond de arena-rand (decor dat meedeint)
  const decor = [];
  const kristalGeo = new THREE.IcosahedronGeometry(1, 0);
  const DECOR_KLEUREN = [0xff6ec7, 0x4dd0e1, 0x6ee86e, 0xffa14d, 0xb06eff, 0x6e9bff];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const col = DECOR_KLEUREN[i % DECOR_KLEUREN.length];
    const m = new THREE.Mesh(kristalGeo, new THREE.MeshStandardMaterial({
      color: col, emissive: col, emissiveIntensity: 0.55, roughness: 0.25, metalness: 0.2,
    }));
    const r = FIELD - 2.2;
    m.position.set(Math.cos(a) * r, 1.1, Math.sin(a) * r);
    m.scale.setScalar(0.7 + (i % 3) * 0.35);
    scene.add(m);
    decor.push({ mesh: m, a, faz: i * 0.9 });
  }

  // --- Gedeelde geometrie ---
  const bodyGeo = new THREE.SphereGeometry(0.45, 12, 12);
  const headGeo = new THREE.SphereGeometry(0.6, 16, 16);
  const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const pupilGeo = new THREE.SphereGeometry(0.06, 6, 6);
  const foodGeo = new THREE.IcosahedronGeometry(0.35, 0);

  const PALETTES = [
    [0xff6ec7, 0xffa14d, 0xffe14d, 0x6ee86e, 0x4dd0e1, 0x6e9bff, 0xb06eff],
    [0x4ade80, 0x22d3ee, 0x60a5fa],
    [0xfbbf24, 0xfb923c, 0xf87171],
    [0xa855f7, 0xec4899, 0xf472b6],
    [0x22d3ee, 0x67e8f9, 0xa5f3fc],
  ];

  // Genereer een schubben-textuur op een canvas (grijs, kleur-neutraal zodat
  // de palette-kleur van het materiaal als tint werkt).
  function maakSchubbenTextuur() {
    const sz = 256, cv = document.createElement('canvas');
    cv.width = sz; cv.height = sz;
    const c = cv.getContext('2d');
    c.fillStyle = '#888'; c.fillRect(0, 0, sz, sz);
    const sw = sz / 5, sh = sz / 8;
    for (let r = -1; r < 12; r++) {
      for (let col = -1; col < 7; col++) {
        const ox = (r & 1) ? sw * 0.5 : 0;
        const cx = col * sw + ox, cy = r * sh * 0.75;
        const gr = c.createRadialGradient(cx, cy - sh * 0.15, 0, cx, cy, sw * 0.53);
        gr.addColorStop(0, 'rgba(255,255,255,0.92)');
        gr.addColorStop(0.6, 'rgba(160,160,160,0.7)');
        gr.addColorStop(1, 'rgba(30,30,30,0.85)');
        c.beginPath();
        c.ellipse(cx, cy, sw * 0.51, sh * 0.68, 0, 0, Math.PI * 2);
        c.fillStyle = gr; c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.28)'; c.lineWidth = 1.2; c.stroke();
      }
    }
    return new THREE.CanvasTexture(cv);
  }
  const schubbenTex = maakSchubbenTextuur();

  // Cijfer-labels voor het voer: een sprite (kijkt altijd naar de camera) met
  // een wit cijfer + donkere rand, per cijfer één keer gemaakt (cache).
  const digitTexCache = {};
  function digitTexture(n) {
    if (digitTexCache[n]) return digitTexCache[n];
    const sz = 64, cv = document.createElement('canvas');
    cv.width = sz; cv.height = sz;
    const c = cv.getContext('2d');
    c.font = '900 46px Arial';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 8; c.strokeStyle = '#0b1026'; c.strokeText(String(n), sz / 2, sz / 2 + 3);
    c.fillStyle = '#ffffff'; c.fillText(String(n), sz / 2, sz / 2 + 3);
    const t = new THREE.CanvasTexture(cv);
    digitTexCache[n] = t;
    return t;
  }
  function digitSprite(n, schaal = 0.75) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: digitTexture(n), transparent: true, depthTest: false }));
    s.scale.set(schaal, schaal, 1);
    return s;
  }

  // ===== Slang-klasse (zowel speler als bots) =====
  class Snake {
    constructor(x, z, palette, isPlayer) {
      this.isPlayer = isPlayer;
      this.palette = palette;
      this.pos = { x, z };
      this.angle = Math.random() * Math.PI * 2;
      this.length = isPlayer ? 5 : 2.5 + Math.random() * 3;
      // De speler telt: `count` is HET getal (de slang ís het getal). De
      // fysieke lijflengte groeit langzamer mee en is gecapt (perf + look).
      this.count = isPlayer ? 5 : 0;
      this.speed = isPlayer ? PLAYER_SPEED : 3.5 + Math.random() * 1.5;
      this.trail = [];
      for (let i = 0; i < 200; i++) this.trail.push({ x: x - Math.cos(this.angle) * i * TRAIL_STEP, z: z - Math.sin(this.angle) * i * TRAIL_STEP });
      this.bodyMeshes = [];
      this.alive = true;
      this.botTurnTimer = 0;
      this.botTurnDir = 0;

      // Kop
      const c = palette[0];
      this.head = new THREE.Mesh(headGeo, new THREE.MeshStandardMaterial({ map: schubbenTex, color: c, emissive: new THREE.Color(c), emissiveIntensity: 0.12, roughness: 0.28, metalness: 0.05 }));
      scene.add(this.head);
      const white = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const black = new THREE.MeshStandardMaterial({ color: 0x111111 });
      this.eyeL = new THREE.Mesh(eyeGeo, white); this.eyeR = new THREE.Mesh(eyeGeo, white);
      this.pupilL = new THREE.Mesh(pupilGeo, black); this.pupilR = new THREE.Mesh(pupilGeo, black);
      scene.add(this.eyeL, this.eyeR, this.pupilL, this.pupilR);

      // Flikkerende rode tong (schiet in en uit — slangen doen dat)
      this.tong = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.03, 0.45),
        new THREE.MeshBasicMaterial({ color: 0xff4d6d })
      );
      scene.add(this.tong);
      // Zachte schaduw-blob onder de kop: de slang "staat" op de vloer
      this.schaduw = new THREE.Mesh(
        new THREE.CircleGeometry(0.55, 16),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
      );
      this.schaduw.rotation.x = -Math.PI / 2;
      scene.add(this.schaduw);
      // De speler draagt een gouden kroontje — je vindt jezelf altijd terug
      if (isPlayer) {
        this.kroon = new THREE.Mesh(
          new THREE.CylinderGeometry(0.34, 0.26, 0.24, 8, 1, true),
          new THREE.MeshStandardMaterial({ color: 0xffd54d, emissive: 0xcc8800, emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide })
        );
        scene.add(this.kroon);
      }
    }

    ensureBody(count) {
      while (this.bodyMeshes.length < count) {
        const idx = this.bodyMeshes.length;
        const col = this.palette[idx % this.palette.length];
        const m = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ map: schubbenTex, color: col, roughness: 0.3, metalness: 0.05 }));
        m.visible = false;
        scene.add(m);
        this.bodyMeshes.push(m);
      }
    }

    destroy() {
      scene.remove(this.head, this.eyeL, this.eyeR, this.pupilL, this.pupilR, this.tong, this.schaduw);
      if (this.kroon) scene.remove(this.kroon);
      this.bodyMeshes.forEach((m) => scene.remove(m));
      this.bodyMeshes = [];
    }

    // Groei de TELLING met n (heel getal) en werk de fysieke lijflengte bij.
    groeiTelling(n) {
      this.count += n;
      this.length = Math.min(BODY_MAX, 5 + this.count * 0.35);
    }

    // Geef de wereldposities van de lijf-punten (voor botsdetectie)
    bodyPoints() {
      const pts = [];
      let nextDist = 0.6, acc = 0, prev = { x: this.pos.x, z: this.pos.z };
      const needed = Math.ceil(this.length / SEG_SPACING);
      for (let k = 0; k < this.trail.length && pts.length < needed; k++) {
        const cur = this.trail[k];
        const seg = Math.hypot(cur.x - prev.x, cur.z - prev.z);
        while (pts.length < needed && acc + seg >= nextDist) {
          const t = seg > 0 ? (nextDist - acc) / seg : 0;
          pts.push({ x: prev.x + (cur.x - prev.x) * t, z: prev.z + (cur.z - prev.z) * t });
          nextDist += SEG_SPACING;
        }
        acc += seg; prev = cur;
      }
      return pts;
    }

    update(dt) {
      if (!this.alive) return;
      // Beweeg
      this.pos.x += Math.cos(this.angle) * this.speed * dt;
      this.pos.z += Math.sin(this.angle) * this.speed * dt;
      // Trail
      const front = this.trail[0];
      if (Math.hypot(this.pos.x - front.x, this.pos.z - front.z) >= TRAIL_STEP) {
        this.trail.unshift({ x: this.pos.x, z: this.pos.z });
        const maxT = Math.ceil(this.length / TRAIL_STEP) + 30;
        if (this.trail.length > maxT) this.trail.length = maxT;
      }
    }

    layout(now = 0) {
      const needed = Math.ceil(this.length / SEG_SPACING);
      this.ensureBody(needed);
      // Kop
      this.head.position.set(this.pos.x, 0.5, this.pos.z);
      const fx = Math.cos(this.angle), fz = Math.sin(this.angle);
      this.head.rotation.y = -this.angle + Math.PI / 2;
      const rx = fz, rz = -fx;
      this.eyeL.position.set(this.pos.x + fx*0.35 + rx*0.25, 0.66, this.pos.z + fz*0.35 + rz*0.25);
      this.eyeR.position.set(this.pos.x + fx*0.35 - rx*0.25, 0.66, this.pos.z + fz*0.35 - rz*0.25);
      this.pupilL.position.set(this.pos.x + fx*0.44 + rx*0.25, 0.68, this.pos.z + fz*0.44 + rz*0.25);
      this.pupilR.position.set(this.pos.x + fx*0.44 - rx*0.25, 0.68, this.pos.z + fz*0.44 - rz*0.25);
      // Lijf
      let segIdx = 0, nextDist = 0.5, acc = 0, prev = { x: this.pos.x, z: this.pos.z };
      const headScale = Math.min(1.6, 0.8 + this.length * 0.02);
      this.head.scale.setScalar(headScale);
      // Tong: schiet ritmisch in en uit vóór de kop
      const tongUit = Math.max(0, Math.sin(now * 0.006 + this.pos.x)); // 0..1
      this.tong.visible = tongUit > 0.55;
      const tLen = 0.3 + tongUit * 0.35;
      this.tong.scale.z = tLen;
      this.tong.position.set(this.pos.x + fx * (0.55 + tLen * 0.25) * headScale, 0.5, this.pos.z + fz * (0.55 + tLen * 0.25) * headScale);
      this.tong.rotation.y = -this.angle + Math.PI / 2;
      // Schaduw onder de kop
      this.schaduw.position.set(this.pos.x, 0.035, this.pos.z);
      this.schaduw.scale.setScalar(headScale);
      // Kroontje (alleen de speler) draait langzaam mee
      if (this.kroon) {
        this.kroon.position.set(this.pos.x, 0.5 + 0.62 * headScale, this.pos.z);
        this.kroon.scale.setScalar(headScale);
        this.kroon.rotation.y = now * 0.001;
      }
      for (let k = 0; k < this.trail.length && segIdx < needed; k++) {
        const cur = this.trail[k];
        const seg = Math.hypot(cur.x - prev.x, cur.z - prev.z);
        while (segIdx < needed && acc + seg >= nextDist) {
          const t = seg > 0 ? (nextDist - acc) / seg : 0;
          const px = prev.x + (cur.x - prev.x) * t;
          const pz = prev.z + (cur.z - prev.z) * t;
          const m = this.bodyMeshes[segIdx];
          // ademende puls die door het lijf golft — de slang leeft
          const puls = 1 + Math.sin(now * 0.008 - segIdx * 0.55) * 0.07;
          m.position.set(px, 0.45, pz);
          m.scale.setScalar(headScale * (1 - (segIdx / needed) * 0.4) * puls);
          m.visible = true;
          segIdx++; nextDist += SEG_SPACING;
        }
        acc += seg; prev = cur;
      }
      for (let s = segIdx; s < this.bodyMeshes.length; s++) this.bodyMeshes[s].visible = false;
    }
  }

  // ===== Eten (losse bolletjes) =====
  const foods = []; // {mesh, x, z, value, power}
  const starGeoPU = new THREE.OctahedronGeometry(0.6, 0);
  function addFood(x, z, value = 1, color = 0xffd54d, cijfer = null, extra = {}) {
    const m = new THREE.Mesh(foodGeo, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.2 }));
    m.position.set(x, 0.4, z);
    m.scale.setScalar(0.7 + value * 0.25);
    scene.add(m);
    const f = Object.assign({ mesh: m, x, z, value }, extra);
    if (cijfer != null) {
      const spr = digitSprite(cijfer, 0.6 + value * 0.06);
      spr.position.set(x, 0.9, z);
      scene.add(spr);
      f.label = spr; f.cijfer = cijfer;
    }
    foods.push(f);
    return f;
  }
  function removeFoodAt(i) {
    const f = foods[i];
    scene.remove(f.mesh);
    if (f.label) scene.remove(f.label);
    foods.splice(i, 1);
  }
  function clearFoods() {
    foods.forEach((f) => { scene.remove(f.mesh); if (f.label) scene.remove(f.label); });
    foods.length = 0;
  }
  function addPowerUp(x, z) {
    const m = new THREE.Mesh(starGeoPU, new THREE.MeshStandardMaterial({ color: 0xffe14d, emissive: 0xffaa00, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.4 }));
    m.position.set(x, 0.6, z);
    scene.add(m);
    foods.push({ mesh: m, x, z, value: 5, power: 'boost' });
  }
  // De GOUDEN NUL ⭕ — zeldzaam: 6 seconden lang vliegt al het eten naar je toe!
  const nulGeo = new THREE.TorusGeometry(0.55, 0.2, 10, 24);
  function addGoudenNul(x, z) {
    const m = new THREE.Mesh(nulGeo, new THREE.MeshStandardMaterial({ color: 0xffd54d, emissive: 0xcc8800, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.6 }));
    m.position.set(x, 0.8, z);
    scene.add(m);
    foods.push({ mesh: m, x, z, value: 10, power: 'magneet' });
  }
  // Eten in vrolijke snoepkleuren (niet alles geel)
  const ETEN_KLEUREN = [0xffd54d, 0xff6ec7, 0x6ee86e, 0x4dd0e1, 0xffa14d, 0xb06eff];
  function scatterFood(n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * (FIELD - 4);
      const v = voerWaarde();  // cijfer-voer: 1, 2 of 3 — eten wordt optellen
      addFood(Math.cos(a) * r, Math.sin(a) * r, v, ETEN_KLEUREN[Math.floor(Math.random() * ETEN_KLEUREN.length)], v);
    }
  }

  // --- Bestelling "Eet de N!": een paar grote genummerde bollen, één is goed ---
  let bestelling = null;      // { doel, orbs:[foodRefs] } of null
  function startBestelling() {
    if (bestelling || !alive) return;
    const b = maakBestelling(Math.random, 2);
    const orbs = [];
    b.opties.forEach((n, i) => {
      const a = (i / b.opties.length) * Math.PI * 2 + Math.random();
      const r = 8 + Math.random() * (FIELD - 18);
      const kleur = n === b.doel ? 0xfde047 : 0x8aa0c8;
      const f = addFood(Math.cos(a) * r, Math.sin(a) * r, 3, kleur, n, { bestel: true, cijfer: n });
      orbs.push(f);
    });
    bestelling = { doel: b.doel, orbs, leven: 30 };
    toonBestelHud(b.doel);
  }
  function eindigBestelling(gelukt) {
    // ruim resterende bestel-orbs op
    for (let i = foods.length - 1; i >= 0; i--) if (foods[i].bestel) removeFoodAt(i);
    bestelling = null;
    toonBestelHud(null);
    if (gelukt) { addStars(1); Voice.cue('star'); }
  }

  // ===== Deeltjes =====
  const burstParticles = [];
  const partGeo = new THREE.SphereGeometry(0.12, 6, 6);
  function burst(x, z, color) {
    for (let i = 0; i < 10; i++) {
      const m = new THREE.Mesh(partGeo, new THREE.MeshBasicMaterial({ color }));
      m.position.set(x, 0.5, z);
      scene.add(m);
      burstParticles.push({ mesh: m, v: new THREE.Vector3((Math.random()-0.5)*0.3, Math.random()*0.3, (Math.random()-0.5)*0.3), life: 1 });
    }
  }

  // ===== Spelstaat =====
  let player, bots, score, alive;
  let boostTimer = 0;
  let powerTimer = 10;
  let nulTimer = 16;        // wanneer de volgende Gouden Nul verschijnt
  let magnetTimer = 0;      // Gouden Nul actief: eten vliegt naar je toe
  let lastTiental = 0;      // laatste gevierde tel-tiental (10, 20, …)
  let rainbowT = 0;         // regenboog-slang animatieklok
  let missieIndex = 0;      // welke missie is bezig
  let nullenDezeMissie = 0; // gouden nullen sinds de missie begon
  let bestelTimer = 18;     // wanneer de volgende "Eet de N!" verschijnt
  let lastTelHintDoel = 0;  // laatst getoonde tel-hint ("nog 2 tot 20")
  let botBumpCd = 0;        // afkoeltijd na botsing met een grotere slang

  // Tellen met tientallen — namen (TIEN!…HONDERD!) komen uit snakeLogic.js.
  const RAINBOW = [0xf87171, 0xfb923c, 0xfbbf24, 0x4ade80, 0x22d3ee, 0x6e9bff, 0xb06eff];

  // Een zwevende tekst midden in beeld (voor tiental-feest én tel-hints).
  function zweefTekst(tekst, kleur = '#ffe14d', maat = 46, top = '36%') {
    const el = document.createElement('div');
    el.textContent = tekst;
    el.style.cssText = `position:absolute;top:${top};left:0;right:0;text-align:center;font-family:Arial Black,Arial;font-size:${maat}px;font-weight:900;color:${kleur};text-shadow:0 3px 12px rgba(0,0,0,.7);pointer-events:none;transition:all 1.2s ease;z-index:2;`;
    root.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = 'translateY(-70px) scale(1.35)'; el.style.opacity = '0'; });
    setTimeout(() => el.remove(), 1300);
  }

  function tientalFeest(n) {
    SFX.fanfare();
    Voice.cue('cheer');
    burst(player.pos.x, player.pos.z, 0xffe14d);
    zweefTekst(tientalNaam(n), '#ffe14d', 48);
  }

  function spawnBot() {
    const a = Math.random() * Math.PI * 2;
    const r = FIELD * (0.4 + Math.random() * 0.5);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    const pal = PALETTES[1 + Math.floor(Math.random() * (PALETTES.length - 1))];
    bots.push(new Snake(x, z, pal, false));
  }

  function killSnake(snake) {
    snake.alive = false;
    // Laat eten achter langs het lijf
    const pts = snake.bodyPoints();
    pts.forEach((p, i) => { if (i % 2 === 0) addFood(p.x, p.z, 1, snake.palette[i % snake.palette.length]); });
    burst(snake.pos.x, snake.pos.z, snake.palette[0]);
    snake.destroy();
  }

  function reset() {
    if (player) player.destroy();
    if (bots) bots.forEach((b) => b.destroy());
    clearFoods();
    bestelling = null;
    player = new Snake(0, 0, PALETTES[0], true);
    bots = [];
    for (let i = 0; i < 4; i++) spawnBot();
    scatterFood(60);
    score = 0;
    boostTimer = 0;
    powerTimer = 10;
    nulTimer = 16;
    magnetTimer = 0;
    lastTiental = 0;
    missieIndex = 0;
    nullenDezeMissie = 0;
    bestelTimer = 18;
    lastTelHintDoel = 0;
    alive = true;
    updateTelHud();
    toonMissie();
    toonBestelHud(null);
  }

  // ===== HUD =====
  // Bovenbalk: missie-chip links, titel rechts
  const hud = document.createElement('div');
  hud.style.cssText = `position:absolute;top:max(14px,env(safe-area-inset-top));left:0;right:0;display:flex;justify-content:space-between;align-items:flex-start;padding:0 16px;font-family:Arial,sans-serif;color:#fff;font-weight:800;pointer-events:none;text-shadow:0 2px 6px rgba(0,0,0,.6);z-index:2;`;
  hud.innerHTML = `<span id="snakeMissie" style="font-size:13px;background:rgba(11,16,38,.72);border:1px solid #3a4680;border-radius:12px;padding:6px 12px;max-width:62%;"></span><span style="font-size:16px">🐍 Tel-Slang</span>`;
  root.appendChild(hud);

  // De grote TELLING (het getal) midden-boven
  const countEl = document.createElement('div');
  countEl.id = 'snakeCount';
  countEl.style.cssText = `position:absolute;top:max(44px,calc(env(safe-area-inset-top) + 28px));left:0;right:0;text-align:center;font-family:Arial Black,Arial;font-size:42px;font-weight:900;color:#ffe14d;text-shadow:0 3px 10px rgba(0,0,0,.7);pointer-events:none;z-index:2;`;
  countEl.textContent = '5';
  root.appendChild(countEl);

  // Bestelling-banner ("Eet de 7!")
  const bestelEl = document.createElement('div');
  bestelEl.id = 'snakeBestel';
  bestelEl.style.cssText = `position:absolute;top:max(98px,calc(env(safe-area-inset-top) + 82px));left:0;right:0;text-align:center;font-family:Arial Black,Arial;font-size:20px;font-weight:900;color:#fff;pointer-events:none;z-index:2;display:none;`;
  root.appendChild(bestelEl);

  // Getallenlijn 0..100 onderin — het lichtje schuift mee terwijl je telt
  const lijn = document.createElement('div');
  lijn.style.cssText = `position:absolute;bottom:max(34px,calc(env(safe-area-inset-bottom) + 22px));left:26px;right:26px;height:32px;pointer-events:none;z-index:2;`;
  lijn.innerHTML = `
    <div style="position:absolute;top:13px;left:0;right:0;height:5px;background:#232a5e;border-radius:3px;"></div>
    <div id="snakeLijnVul" style="position:absolute;top:13px;left:0;width:5%;height:5px;background:#ffe14d;border-radius:3px;"></div>
    <div id="snakeLijnMarker" style="position:absolute;top:8px;left:5%;width:15px;height:15px;margin-left:-7px;background:#ff6ec7;border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px #ff6ec7;"></div>
    <div style="position:absolute;top:20px;left:0;right:0;display:flex;justify-content:space-between;font-family:Arial;font-size:10px;font-weight:700;color:#8b98d8;">
      <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span></div>`;
  root.appendChild(lijn);

  const backBtn = document.createElement('button');
  backBtn.textContent = '⬅ Terug';
  backBtn.style.cssText = `position:absolute;bottom:max(78px,calc(env(safe-area-inset-bottom) + 60px));left:20px;font-family:Arial;font-size:14px;font-weight:600;color:#cbd5e1;background:rgba(30,41,59,.85);border:none;border-radius:10px;padding:8px 14px;z-index:3;`;
  backBtn.onclick = () => quit();
  root.appendChild(backBtn);

  // Korte besturings-hint die na een paar seconden vervaagt
  const hint = document.createElement('div');
  hint.textContent = 'Houd vast en stuur · eet cijfers · tel omhoog! 🔢';
  hint.style.cssText = `position:absolute;bottom:max(112px,calc(env(safe-area-inset-bottom) + 92px));left:0;right:0;text-align:center;font-family:Arial;font-size:13px;color:#94a3b8;pointer-events:none;transition:opacity 1s ease;z-index:2;`;
  root.appendChild(hint);
  setTimeout(() => { hint.style.opacity = '0'; }, 6000);

  // HUD-updaters (function-declaraties → beschikbaar in reset())
  function updateTelHud() {
    const n = Math.floor(player.count);
    countEl.textContent = String(n);
    const pct = getallenlijnFractie(n, 100) * 100;
    document.getElementById('snakeLijnVul').style.width = pct + '%';
    document.getElementById('snakeLijnMarker').style.left = pct + '%';
  }
  function toonMissie() {
    const el = document.getElementById('snakeMissie');
    const m = MISSIES[missieIndex];
    if (!m) { el.textContent = '🎉 Blijf tellen!'; return; }
    const vp = missieVoortgang(m, { lengte: player.count, nullenDezeMissie });
    el.textContent = `📋 ${m.tekst}  (${vp.huidig}/${vp.doel})`;
  }
  function toonBestelHud(doel) {
    if (doel == null) { bestelEl.style.display = 'none'; return; }
    bestelEl.textContent = `Eet de ${doel}! 🍽️`;
    bestelEl.style.display = 'block';
  }
  function missieVoltooid(m) {
    addStars(2);
    SFX.levelup(); Voice.cue('cheer');
    zweefTekst('Missie klaar! +2 ⭐', '#4ade80', 34, '44%');
    burst(player.pos.x, player.pos.z, 0x4ade80);
    missieIndex += 1;
    nullenDezeMissie = 0;
    toonMissie();
  }

  // ===== Besturing: stuur naar waar je vinger/muis is =====
  let pointerActive = false;
  let pointerPos = { x: 0, y: 0 };
  function onDown(e) { if (e.target === backBtn) return; pointerActive = true; pointerPos = { x: e.clientX, y: e.clientY }; }
  function onMove(e) { if (pointerActive) pointerPos = { x: e.clientX, y: e.clientY }; }
  function onUp() { pointerActive = false; }
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  // Toetsenbord
  const keys = {};
  function onKeyDown(e) { keys[e.key] = true; }
  function onKeyUp(e) { keys[e.key] = false; }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  // ===== Hoofdlus =====
  let running = true;
  let last = performance.now();
  let botSpawnTimer = 0;

  function steerPlayer(dt) {
    let targetTurn = 0;
    // Muis/vinger: stuur kop naar het scherm-punt
    if (pointerActive) {
      // projecteer: bereken hoek van kop naar pointer in wereld-vlak
      const ndcX = (pointerPos.x / root.clientWidth) * 2 - 1;
      const ndcY = -((pointerPos.y / root.clientHeight) * 2 - 1);
      const ray = new THREE.Raycaster();
      ray.setFromCamera({ x: ndcX, y: ndcY }, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();
      if (ray.ray.intersectPlane(plane, hit)) {
        const desired = Math.atan2(hit.z - player.pos.z, hit.x - player.pos.x);
        targetTurn = angleDiff(desired, player.angle);
      }
    }
    // Pijltjes
    if (keys['ArrowLeft']) targetTurn = -1;
    if (keys['ArrowRight']) targetTurn = 1;

    const maxTurn = TURN_RATE * dt;
    player.angle += Math.max(-maxTurn, Math.min(maxTurn, targetTurn));
  }

  function angleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function updateBot(bot, dt) {
    // Simpele AI: af en toe van richting wisselen, weg van de rand blijven,
    // en richting dichtstbijzijnde eten draaien.
    bot.botTurnTimer -= dt;
    let desired = bot.angle;
    // Naar dichtstbijzijnde eten
    let nearest = null, nd = 1e9;
    for (const f of foods) {
      const d = Math.hypot(f.x - bot.pos.x, f.z - bot.pos.z);
      if (d < nd) { nd = d; nearest = f; }
    }
    if (nearest && nd < 25) desired = Math.atan2(nearest.z - bot.pos.z, nearest.x - bot.pos.x);
    // Weg van de rand
    const distC = Math.hypot(bot.pos.x, bot.pos.z);
    if (distC > FIELD - 8) desired = Math.atan2(-bot.pos.z, -bot.pos.x);
    const turn = angleDiff(desired, bot.angle);
    const maxTurn = 2.0 * dt;
    bot.angle += Math.max(-maxTurn, Math.min(maxTurn, turn));
  }

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    const now = performance.now();
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.05) dt = 0.05;

    if (alive) {
      steerPlayer(dt);
      player.update(dt);

      // Speler tegen de rand? Zacht terugsturen naar het midden (geen game-over).
      const distRand = Math.hypot(player.pos.x, player.pos.z);
      if (distRand > FIELD - 1.5) {
        player.angle = Math.atan2(-player.pos.z, -player.pos.x);
        const k = (FIELD - 1.6) / distRand;
        player.pos.x *= k; player.pos.z *= k;
      }

      // Bots
      bots.forEach((b) => { updateBot(b, dt); b.update(dt); });

      // Nieuwe bots laten verschijnen
      botSpawnTimer -= dt;
      if (botSpawnTimer <= 0 && bots.filter((b) => b.alive).length < MAX_BOTS) {
        spawnBot(); botSpawnTimer = 4 + Math.random() * 4;
      }

      // Eten oppikken (speler) — eten is TELLEN: je telling groeit met hele getallen
      for (let i = foods.length - 1; i >= 0; i--) {
        const f = foods[i];
        const reach = (f.power || f.bestel) ? 1.4 : 1.0;
        if (Math.hypot(f.x - player.pos.x, f.z - player.pos.z) >= reach) continue;

        if (f.power === 'magneet') {
          // GOUDEN NUL: 6 seconden lang komt al het eten naar jou toe!
          magnetTimer = 6.0;
          player.groeiTelling(3);
          nullenDezeMissie += 1;
          burst(f.x, f.z, 0xffd54d);
          SFX.fanfare(); Voice.cue('star');
        } else if (f.power === 'boost') {
          player.groeiTelling(2);
          boostTimer = 3.0;
          burst(f.x, f.z, 0xffe14d);
          SFX.levelup();
        } else if (f.bestel) {
          if (f.cijfer === (bestelling && bestelling.doel)) {
            player.groeiTelling(3);
            burst(f.x, f.z, 0xfde047);
            zweefTekst(`Goed! de ${f.cijfer} 🎉`, '#4ade80', 30, '40%');
            SFX.levelup();
            removeFoodAt(i);
            eindigBestelling(true);
            updateTelHud();
            continue;
          } else {
            // verkeerde bestel-bol: telt gewoon als +1, zachte oeps
            player.groeiTelling(1);
            SFX.oops(); Voice.cue('oops');
            zweefTekst('oeps!', '#ff9db0', 24, '40%');
          }
        } else {
          player.groeiTelling(f.value);
          score += f.value;
          SFX.coin();
        }
        removeFoodAt(i);
        updateTelHud();
      }
      // Power-up zo nu en dan laten verschijnen
      powerTimer -= dt;
      if (powerTimer <= 0) {
        powerTimer = 12 + Math.random() * 8;
        const a = Math.random() * Math.PI * 2, r = Math.random() * (FIELD - 6);
        addPowerUp(Math.cos(a) * r, Math.sin(a) * r);
      }
      // …en heel af en toe: de Gouden Nul ⭕
      nulTimer -= dt;
      if (nulTimer <= 0) {
        nulTimer = 20 + Math.random() * 12;
        const a = Math.random() * Math.PI * 2, r = Math.random() * (FIELD - 6);
        addGoudenNul(Math.cos(a) * r, Math.sin(a) * r);
      }
      // Bestelling "Eet de N!" — verschijnt af en toe, verdwijnt na een tijdje
      if (bestelling) {
        bestelling.leven -= dt;
        if (bestelling.leven <= 0) eindigBestelling(false);
      } else {
        bestelTimer -= dt;
        if (bestelTimer <= 0) { startBestelling(); bestelTimer = 22 + Math.random() * 10; }
      }
      // Magneet actief: eten zweeft naar je toe (en je kop gloeit goud)
      if (magnetTimer > 0) {
        magnetTimer -= dt;
        for (const f of foods) {
          if (f.power || f.bestel) continue; // bestel-bollen niet meetrekken (anders eet je fout)
          const dx = player.pos.x - f.x, dz = player.pos.z - f.z;
          const d = Math.hypot(dx, dz);
          if (d < 14 && d > 0.1) {
            const trek = 9 * dt / d;
            f.x += dx * trek; f.z += dz * trek;
            f.mesh.position.x = f.x; f.mesh.position.z = f.z;
          }
        }
        player.head.material.emissiveIntensity = 0.6;
      } else {
        player.head.material.emissiveIntensity = 0.12;
      }
      // Tellen: HUD bij, tel-hint bij naderen tiental, feest bij elk tiental
      const telling = Math.floor(player.count);
      updateTelHud();
      const hintT = telHint(telling);
      if (hintT && hintT.doel !== lastTelHintDoel) {
        lastTelHintDoel = hintT.doel;
        zweefTekst(`nog ${hintT.rest} tot ${hintT.woord}`, '#a5b4fc', 26, '30%');
      }
      if (telling > lastTiental) {
        gepasseerdeTientallen(lastTiental, telling).forEach((t) => tientalFeest(t));
        lastTiental = telling;
      }
      if (telling >= 50) giveMedal('snake_50');
      if (telling >= 100) giveMedal('snake_100');
      // Missie-voortgang (geen game-over: elke missie klaar = ster + volgende)
      const mis = MISSIES[missieIndex];
      if (mis) {
        const vp = missieVoortgang(mis, { lengte: player.count, nullenDezeMissie });
        if (vp.klaar) missieVoltooid(mis); else toonMissie();
      }
      // Snelheidsboost aftellen
      if (boostTimer > 0) {
        boostTimer -= dt;
        player.speed = PLAYER_SPEED * 1.7;
      } else {
        player.speed = PLAYER_SPEED;
      }
      // Houd genoeg eten op het veld
      if (foods.length < 40) scatterFood(10);

      // Botsing: speler-kop tegen bot-lijf => bot sterft, wordt eten
      bots.forEach((bot) => {
        if (!bot.alive) return;
        const pts = bot.bodyPoints();
        for (let k = 2; k < pts.length; k++) {
          if (Math.hypot(player.pos.x - pts[k].x, player.pos.z - pts[k].z) < 0.8) {
            killSnake(bot);
            break;
          }
        }
        // Kop-tegen-kop: speler wint meestal (kindvriendelijk). Tegen een véél
        // grotere slang word je KORTER i.p.v. dood — nooit game-over.
        if (bot.alive && Math.hypot(player.pos.x - bot.pos.x, player.pos.z - bot.pos.z) < 1.0) {
          if (player.length >= bot.length - 3) {
            killSnake(bot);
          } else if (botBumpCd <= 0) {
            botBumpCd = 1.2;
            player.count = krimpBijBotsing(player.count);
            player.length = Math.min(BODY_MAX, 5 + player.count * 0.35);
            const away = Math.atan2(player.pos.z - bot.pos.z, player.pos.x - bot.pos.x);
            player.pos.x += Math.cos(away) * 2.4; player.pos.z += Math.sin(away) * 2.4;
            player.angle = away;
            burst(player.pos.x, player.pos.z, 0xff6ec7);
            SFX.oops(); Voice.cue('oops');
            zweefTekst('oeps, korter!', '#ff9db0', 28, '40%');
            updateTelHud();
          }
        }
      });
      if (botBumpCd > 0) botBumpCd -= dt;
      // (geen eigen-staart-dood meer — faal-vriendelijk)

      // Bots eten ook gewoon (maar niet de bestel-bollen)
      bots.forEach((bot) => {
        if (!bot.alive) return;
        for (let i = foods.length - 1; i >= 0; i--) {
          const f = foods[i];
          if (f.bestel || f.power) continue;
          if (Math.hypot(f.x - bot.pos.x, f.z - bot.pos.z) < 0.9) {
            bot.length += f.value * 0.3;
            removeFoodAt(i);
          }
        }
      });

      // Dode bots opruimen uit de lijst
      bots = bots.filter((b) => b.alive);

      player.layout(now);
      bots.forEach((b) => b.layout(now));

      // REGENBOOG-SLANG: vanaf telling 25 golven alle kleuren door je lijf.
      if (player.count >= 25) {
        rainbowT += dt * 8;
        const off = Math.floor(rainbowT);
        player.head.material.color.setHex(RAINBOW[off % RAINBOW.length]);
        player.bodyMeshes.forEach((m, i) => {
          if (m.visible) m.material.color.setHex(RAINBOW[(i + off) % RAINBOW.length]);
        });
      }
    }

    // Eten animeren (power-ups draaien sneller en zweven hoger)
    foods.forEach((f) => {
      if (f.power === 'magneet') {
        // de Gouden Nul staat rechtop te pronken en draait rond
        f.mesh.rotation.y += 0.06;
        f.mesh.rotation.x = Math.PI / 2 + Math.sin(now * 0.004 + f.x) * 0.3;
        f.mesh.position.y = 0.9 + Math.sin(now * 0.005 + f.x) * 0.3;
      } else if (f.power) {
        f.mesh.rotation.y += 0.12; f.mesh.rotation.x += 0.06;
        f.mesh.position.y = 0.7 + Math.sin(now * 0.006 + f.x) * 0.25;
      } else {
        f.mesh.rotation.y += 0.05;
        f.mesh.position.y = 0.4 + Math.sin(now * 0.004 + f.x) * 0.1;
      }
      if (f.label) f.label.position.set(f.x, f.mesh.position.y + 0.6, f.z);
    });

    // Deeltjes
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const p = burstParticles[i];
      p.mesh.position.add(p.v); p.v.y -= 0.02; p.life -= 0.03;
      p.mesh.scale.setScalar(Math.max(0.01, p.life));
      if (p.life <= 0) { scene.remove(p.mesh); burstParticles.splice(i, 1); }
    }

    stars.rotation.y += 0.0001;

    // De arena leeft: rand-muur pulseert, kristallen deinen en fonkelen
    wall.material.emissiveIntensity = 0.5 + Math.sin(now * 0.0018) * 0.25;
    for (const d of decor) {
      d.mesh.position.y = 1.1 + Math.sin(now * 0.0016 + d.faz) * 0.45;
      d.mesh.rotation.y += 0.008;
      d.mesh.material.emissiveIntensity = 0.45 + Math.sin(now * 0.003 + d.faz) * 0.25;
    }

    // Camera volgt speler van schuin boven (hoogte schaalt licht mee met lengte)
    if (player && player.alive) {
      const camHeight = 16 + Math.min(player.length * 0.3, 14);
      const camBack = 12 + Math.min(player.length * 0.2, 10);
      const desired = new THREE.Vector3(player.pos.x, camHeight, player.pos.z + camBack);
      camera.position.lerp(desired, 0.06);
      camera.lookAt(player.pos.x, 0, player.pos.z);
    }

    renderer.render(scene, camera);
  }

  // Geen game-over meer (faal-vriendelijk): de "score" is hoe hoog je telde.
  // Die bewaren we bij het verlaten van het spel.
  function quit() {
    running = false;
    if (player) saveHigh('snake', Math.floor(player.count));
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    renderer.dispose();
    root.remove();
    if (onExit) onExit();
  }

  resize();
  reset();
  camera.position.set(0, 18, 14);
  animate();
}
