// Three.js zit LOKAAL in het project (src/vendor/three.module.js).
import * as THREE from './vendor/three.module.js';
import { SFX, initAudio } from './sound.js';
import { getHigh, saveHigh, addStars, giveMedal, getStars } from './progress.js';

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

  // --- Groot speelveld ---
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1d36, roughness: 1 });
  const floor = new THREE.Mesh(new THREE.CircleGeometry(FIELD, 64), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);
  // Ruitpatroon-ringen ter oriëntatie
  for (let r = 10; r < FIELD; r += 10) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(r - 0.15, r + 0.15, 64),
      new THREE.MeshBasicMaterial({ color: 0x2a2e52, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);
  }
  // Rand-muur (gloeiende cirkel)
  const wall = new THREE.Mesh(
    new THREE.TorusGeometry(FIELD, 0.6, 12, 80),
    new THREE.MeshStandardMaterial({ color: 0x7c5cff, emissive: 0x4a2a90, emissiveIntensity: 0.6, roughness: 0.4 })
  );
  wall.rotation.x = -Math.PI / 2;
  wall.position.y = 0.3;
  scene.add(wall);

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

  // ===== Slang-klasse (zowel speler als bots) =====
  class Snake {
    constructor(x, z, palette, isPlayer) {
      this.isPlayer = isPlayer;
      this.palette = palette;
      this.pos = { x, z };
      this.angle = Math.random() * Math.PI * 2;
      this.length = isPlayer ? 5 : 2.5 + Math.random() * 3;
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
      scene.remove(this.head, this.eyeL, this.eyeR, this.pupilL, this.pupilR);
      this.bodyMeshes.forEach((m) => scene.remove(m));
      this.bodyMeshes = [];
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

    layout() {
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
      for (let k = 0; k < this.trail.length && segIdx < needed; k++) {
        const cur = this.trail[k];
        const seg = Math.hypot(cur.x - prev.x, cur.z - prev.z);
        while (segIdx < needed && acc + seg >= nextDist) {
          const t = seg > 0 ? (nextDist - acc) / seg : 0;
          const px = prev.x + (cur.x - prev.x) * t;
          const pz = prev.z + (cur.z - prev.z) * t;
          const m = this.bodyMeshes[segIdx];
          m.position.set(px, 0.45, pz);
          m.scale.setScalar(headScale * (1 - (segIdx / needed) * 0.4));
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
  function addFood(x, z, value = 1, color = 0xffd54d) {
    const m = new THREE.Mesh(foodGeo, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, roughness: 0.2 }));
    m.position.set(x, 0.4, z);
    m.scale.setScalar(0.7 + value * 0.3);
    scene.add(m);
    foods.push({ mesh: m, x, z, value });
  }
  function addPowerUp(x, z) {
    const m = new THREE.Mesh(starGeoPU, new THREE.MeshStandardMaterial({ color: 0xffe14d, emissive: 0xffaa00, emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.4 }));
    m.position.set(x, 0.6, z);
    scene.add(m);
    foods.push({ mesh: m, x, z, value: 5, power: 'boost' });
  }
  function scatterFood(n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.random() * (FIELD - 4);
      addFood(Math.cos(a) * r, Math.sin(a) * r);
    }
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
    pts.forEach((p, i) => { if (i % 2 === 0) addFood(p.x, p.z, 2, snake.palette[i % snake.palette.length]); });
    burst(snake.pos.x, snake.pos.z, snake.palette[0]);
    snake.destroy();
  }

  function reset() {
    if (player) player.destroy();
    if (bots) bots.forEach((b) => b.destroy());
    foods.forEach((f) => scene.remove(f.mesh));
    foods.length = 0;
    player = new Snake(0, 0, PALETTES[0], true);
    bots = [];
    for (let i = 0; i < 4; i++) spawnBot();
    scatterFood(60);
    score = 0;
    boostTimer = 0;
    powerTimer = 10;
    alive = true;
    document.getElementById('snakeScore').textContent = '🍎 0';
  }

  // ===== HUD =====
  const hud = document.createElement('div');
  hud.style.cssText = `position:absolute;top:max(16px,env(safe-area-inset-top));left:0;right:0;display:flex;justify-content:space-between;padding:0 20px;font-family:Arial,sans-serif;color:#fff;font-size:22px;font-weight:800;pointer-events:none;text-shadow:0 2px 6px rgba(0,0,0,.6);`;
  hud.innerHTML = `<span id="snakeScore">🍎 0</span><span>🐍 Snake</span>`;
  root.appendChild(hud);

  const backBtn = document.createElement('button');
  backBtn.textContent = '⬅ Terug';
  backBtn.style.cssText = `position:absolute;top:max(50px,calc(env(safe-area-inset-top) + 34px));left:20px;font-family:Arial;font-size:15px;font-weight:600;color:#cbd5e1;background:rgba(30,41,59,.85);border:none;border-radius:10px;padding:8px 14px;z-index:2;`;
  backBtn.onclick = () => quit();
  root.appendChild(backBtn);

  const hint = document.createElement('div');
  hint.textContent = 'Houd vast en stuur · eet andere slangen op!';
  hint.style.cssText = `position:absolute;bottom:max(20px,env(safe-area-inset-bottom));left:0;right:0;text-align:center;font-family:Arial;font-size:13px;color:#94a3b8;pointer-events:none;`;
  root.appendChild(hint);

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

      // Speler buiten veld?
      if (Math.hypot(player.pos.x, player.pos.z) > FIELD - 1) { gameOver(); }

      // Bots
      bots.forEach((b) => { updateBot(b, dt); b.update(dt); });

      // Nieuwe bots laten verschijnen
      botSpawnTimer -= dt;
      if (botSpawnTimer <= 0 && bots.filter((b) => b.alive).length < MAX_BOTS) {
        spawnBot(); botSpawnTimer = 4 + Math.random() * 4;
      }

      // Eten oppikken (speler)
      for (let i = foods.length - 1; i >= 0; i--) {
        const f = foods[i];
        const reach = f.power ? 1.3 : 1.0;
        if (Math.hypot(f.x - player.pos.x, f.z - player.pos.z) < reach) {
          if (f.power === 'boost') {
            // Power-up: extra groei + tijdelijke snelheidsboost
            player.length += 2;
            score += 5;
            boostTimer = 3.0;
            burst(f.x, f.z, 0xffe14d);
            SFX.levelup();
          } else {
            player.length += f.value * 0.4;
            score += f.value;
            SFX.coin();
          }
          document.getElementById('snakeScore').textContent = '🍎 ' + score;
          scene.remove(f.mesh);
          foods.splice(i, 1);
        }
      }
      // Power-up zo nu en dan laten verschijnen
      powerTimer -= dt;
      if (powerTimer <= 0) {
        powerTimer = 12 + Math.random() * 8;
        const a = Math.random() * Math.PI * 2, r = Math.random() * (FIELD - 6);
        addPowerUp(Math.cos(a) * r, Math.sin(a) * r);
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
        // Kop-tegen-kop: speler wint meestal (kindvriendelijk).
        // Alleen als een bot véél langer is verliest de speler.
        if (bot.alive && Math.hypot(player.pos.x - bot.pos.x, player.pos.z - bot.pos.z) < 1.0) {
          if (player.length >= bot.length - 3) killSnake(bot);
          else gameOver();
        }
      });

      // Botsing: speler-kop tegen ander bot-lijf is hierboven; nu speler tegen eigen lijf
      const myPts = player.bodyPoints();
      for (let k = 12; k < myPts.length; k++) {
        if (Math.hypot(player.pos.x - myPts[k].x, player.pos.z - myPts[k].z) < 0.55) { gameOver(); break; }
      }

      // Bots eten ook gewoon (groeien) en kunnen elkaar negeren voor de eenvoud
      bots.forEach((bot) => {
        if (!bot.alive) return;
        for (let i = foods.length - 1; i >= 0; i--) {
          const f = foods[i];
          if (Math.hypot(f.x - bot.pos.x, f.z - bot.pos.z) < 0.9) {
            bot.length += f.value * 0.3;
            scene.remove(f.mesh); foods.splice(i, 1);
          }
        }
      });

      // Dode bots opruimen uit de lijst
      bots = bots.filter((b) => b.alive);

      player.layout();
      bots.forEach((b) => b.layout());
    }

    // Eten animeren (power-ups draaien sneller en zweven hoger)
    foods.forEach((f) => {
      if (f.power) {
        f.mesh.rotation.y += 0.12; f.mesh.rotation.x += 0.06;
        f.mesh.position.y = 0.7 + Math.sin(now * 0.006 + f.x) * 0.25;
      } else {
        f.mesh.rotation.y += 0.05;
        f.mesh.position.y = 0.4 + Math.sin(now * 0.004 + f.x) * 0.1;
      }
    });

    // Deeltjes
    for (let i = burstParticles.length - 1; i >= 0; i--) {
      const p = burstParticles[i];
      p.mesh.position.add(p.v); p.v.y -= 0.02; p.life -= 0.03;
      p.mesh.scale.setScalar(Math.max(0.01, p.life));
      if (p.life <= 0) { scene.remove(p.mesh); burstParticles.splice(i, 1); }
    }

    stars.rotation.y += 0.0001;

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

  function gameOver() {
    if (!alive) return;
    alive = false;
    SFX.gameover();
    const panel = document.createElement('div');
    panel.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(0,0,0,.75);font-family:Arial,sans-serif;color:#fff;text-align:center;z-index:3;`;
    panel.innerHTML = `<div style="font-size:60px">🐍</div><div style="font-size:30px;font-weight:800">Game Over!</div><div style="font-size:18px;color:#94a3b8">Score: ${score}</div>`;
    const isRecord = saveHigh('snake', score);
    if (score >= 50) giveMedal('snake_50');
    const earned = Math.max(1, Math.floor(score / 3));
    addStars(earned);
    const rec = document.createElement('div');
    rec.style.cssText = `font-size:15px;font-weight:700;color:${isRecord ? '#fbbf24' : '#64748b'};`;
    rec.textContent = isRecord ? '🌟 Nieuw record! 🌟' : 'Record: ' + getHigh('snake');
    panel.appendChild(rec);
    const starsLine = document.createElement('div');
    starsLine.style.cssText = `font-size:18px;font-weight:800;color:#fbbf24;`;
    starsLine.textContent = `+${earned} ⭐`;
    panel.appendChild(starsLine);
    const again = document.createElement('button');
    again.textContent = 'Opnieuw 🔄';
    again.style.cssText = `font-family:Arial;font-size:20px;font-weight:800;color:#1a1a2e;background:#ffd54d;border:none;border-radius:14px;padding:12px 28px;margin-top:8px;`;
    again.onclick = () => { panel.remove(); reset(); };
    const home = document.createElement('button');
    home.textContent = '🏠 Menu';
    home.style.cssText = `font-family:Arial;font-size:16px;font-weight:600;color:#fff;background:#334155;border:none;border-radius:12px;padding:10px 20px;`;
    home.onclick = () => quit();
    panel.appendChild(again); panel.appendChild(home);
    root.appendChild(panel);
  }

  function quit() {
    running = false;
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
