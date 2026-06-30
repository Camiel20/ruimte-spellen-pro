// Three.js zit LOKAAL in het project (src/vendor/three.module.js).
import * as THREE from './vendor/three.module.js';
import { SFX, initAudio } from './sound.js';
import { getHigh, saveHigh, addStars, giveMedal } from './progress.js';

// ===== GETALLEN-AVONTUUR 3D (renner-stijl) =====
// Adrian's Numberblock rent automatisch vooruit over een baan met 3 banen.
// Veeg links/rechts om van baan te wisselen, tik/veeg omhoog om te springen.
// Verzamel de GROENE +1-kubussen om te groeien (je wordt een hogere
// kubus-stapel en kleurt mee). Botsen tegen een MIN-monster maakt je kleiner
// (-1); erop springen = poppen. Word het doelgetal en haal de vlag.
//
// Hoger gepolijst dan Snake: zachte schaduwen, glanzende kubussen met dikke
// donkere rand (Numberblocks-look), gloed op de blokjes en de vlag, en een
// vloeiende meebewegende camera. Getuned om soepel te blijven op de iPhone.

const LANES = [-2, 0, 2];            // x-positie van de 3 banen
const SPEED_BASE = 8.5;              // vooruit-snelheid (units/sec)
const JUMP_V = 9.2;                  // sprongsnelheid
const GRAVITY = 26;                  // valversnelling
const SPAWN_DZ = 6;                  // afstand tussen rijen
const TARGETS = [4, 6, 8, 10, 12];   // doelgetal per level
const LEVEL_NAMES = ['Groen Veld', 'Wolkenpad', 'Zonneroute', 'Sterrenbaan', 'Regenboog'];

// Numberblocks-signatuurkleuren (cyclisch voorbij 12)
const SIG = [0xe8402c, 0xff8a1e, 0xffd21e, 0x57c84d, 0x2aa9e0, 0x8b5cf6,
  0xec4899, 0x14b8a6, 0xf472b6, 0xf59e0b, 0x10b981, 0x6366f1];
function sig(v) { return SIG[(Math.max(1, v) - 1) % SIG.length]; }

const WORDS = ['nul', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven',
  'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien',
  'zestien', 'zeventien', 'achttien', 'negentien', 'twintig'];

export function launchPlatform3D(onExit) {
  initAudio();

  const root = document.createElement('div');
  root.style.cssText = `position:fixed;inset:0;z-index:9999;background:#8fd3ff;touch-action:none;overflow:hidden;`;
  document.body.appendChild(root);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  root.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // --- Lucht-gradiënt als achtergrond ---
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 2; skyCanvas.height = 256;
  const sg = skyCanvas.getContext('2d');
  const grad = sg.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#4aa3ff');
  grad.addColorStop(0.55, '#9bd4ff');
  grad.addColorStop(1, '#d7f0ff');
  sg.fillStyle = grad; sg.fillRect(0, 0, 2, 256);
  const skyTex = new THREE.CanvasTexture(skyCanvas);
  scene.background = skyTex;
  scene.fog = new THREE.Fog(0xbfe6ff, 26, 72);

  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 200);

  function resize() {
    const w = root.clientWidth, h = root.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  // --- Licht + zachte schaduw (de grote stap voorbij Snake) ---
  scene.add(new THREE.AmbientLight(0xffffff, 0.72));
  const sun = new THREE.DirectionalLight(0xfff3d0, 1.05);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -14;
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  scene.add(sun.target);
  const fill = new THREE.HemisphereLight(0xbfe6ff, 0x6aa84f, 0.5);
  scene.add(fill);

  // --- Oneindige baan: één grote plaat die de speler volgt, met een
  //     herhalende textuur (gras + pad met baanlijnen). ---
  const trackTex = makeTrackTexture();
  trackTex.wrapS = THREE.ClampToEdgeWrapping;
  trackTex.wrapT = THREE.RepeatWrapping;
  trackTex.repeat.set(1, 40);
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 320),
    new THREE.MeshStandardMaterial({ map: trackTex, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Zon-sprite + wolken in de lucht (sfeer) — zacht gedoseerd zodat ze de
  // baan niet overstralen.
  const sunGlow = makeGlow(0xfff2b0, 12, new THREE.Vector3(-12, 20, -30));
  sunGlow.material.opacity = 0.5;
  scene.add(sunGlow);
  const clouds = [];
  for (let i = 0; i < 6; i++) {
    const c = makeGlow(0xffffff, 6 + Math.random() * 4,
      new THREE.Vector3((Math.random() - 0.5) * 40, 9 + Math.random() * 5, -10 - Math.random() * 50));
    c.material.opacity = 0.32;
    clouds.push(c); scene.add(c);
  }

  // --- Gedeelde texturen/geometrie ---
  const happyTex = makeFaceTexture('happy');
  const angryTex = makeFaceTexture('angry');
  const plusTex = makeLabelTexture('+1');
  const flagTex = makeLabelTexture('🏁');
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitEdges = new THREE.EdgesGeometry(unitBox);
  const faceGeo = new THREE.PlaneGeometry(1, 1);

  function cubeMesh(color, w, h, d) {
    const m = new THREE.Mesh(unitBox, new THREE.MeshStandardMaterial({
      color, roughness: 0.42, metalness: 0.04,
      emissive: new THREE.Color(color), emissiveIntensity: 0.06,
    }));
    m.scale.set(w, h, d);
    m.castShadow = true;
    const edges = new THREE.LineSegments(unitEdges, new THREE.LineBasicMaterial({ color: 0x14202e }));
    edges.scale.set(w, h, d);
    m.add(edges);
    return m;
  }
  function facePlane(tex, size) {
    const f = new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    f.scale.set(size, size, 1);
    return f;
  }

  // ===== Speler: een Numberblock-stapel die meegroeit =====
  const player = new THREE.Group();
  scene.add(player);
  const playerState = { value: 1, lane: 1, x: 0, y: 0, z: 0, vy: 0, onGround: true, hitCooldown: 0 };

  function buildPlayer(value) {
    while (player.children.length) {
      const c = player.children[0];
      player.remove(c);
      if (c.geometry && c.geometry !== unitBox && c.geometry !== faceGeo && c.geometry !== unitEdges) c.geometry.dispose?.();
    }
    const v = Math.max(1, value);
    const w = 1.0;
    const cubeH = Math.min(0.92, 3.4 / v); // dunnere plakjes als hij groot wordt
    const color = sig(v);
    for (let i = 0; i < v; i++) {
      const cube = cubeMesh(color, w, cubeH, w);
      cube.position.y = i * cubeH + cubeH / 2;
      player.add(cube);
    }
    const topY = (v - 1) * cubeH + cubeH / 2;
    const fSize = Math.min(0.9, Math.max(cubeH * 1.05, 0.55));
    const face = facePlane(happyTex, fSize);
    face.position.set(0, Math.max(topY, fSize * 0.5), w / 2 + 0.02);
    player.add(face);
  }
  buildPlayer(1);

  // ===== Level-items (vooraf gegenereerd per level) =====
  const items = []; // {type:'plus'|'mob', group, lane, z, done, halo?}
  let flag = null, flagZ = 0;

  function makePlus(lane, z) {
    const g = new THREE.Group();
    const cube = cubeMesh(0x44d36a, 0.7, 0.7, 0.7);
    cube.material.emissiveIntensity = 0.35;
    g.add(cube);
    const lbl = facePlane(plusTex, 0.6);
    lbl.position.set(0, 0, 0.37);
    g.add(lbl);
    const halo = makeGlow(0x9dffb0, 1.5, new THREE.Vector3(0, 0, 0));
    halo.material.opacity = 0.7;
    g.add(halo);
    g.position.set(LANES[lane], 0.85, z);
    scene.add(g);
    items.push({ type: 'plus', group: g, lane, z, done: false, cube });
  }
  function makeMob(lane, z) {
    const g = new THREE.Group();
    const cube = cubeMesh(0x8a3df0, 0.95, 0.95, 0.95);
    g.add(cube);
    const face = facePlane(angryTex, 0.8);
    face.position.set(0, 0, 0.49);
    g.add(face);
    g.position.set(LANES[lane], 0.5, z);
    scene.add(g);
    items.push({ type: 'mob', group: g, lane, z, done: false, cube });
  }

  function buildLevel(idx) {
    // ruim oude items
    items.forEach((it) => scene.remove(it.group));
    items.length = 0;
    if (flag) { scene.remove(flag); flag = null; }

    const target = TARGETS[idx];
    const greensNeeded = target + 3;           // ruim genoeg om te halen
    const rows = greensNeeded + 6 + idx * 2;    // wat extra ruimte
    let greens = 0;
    let z = -12;
    for (let r = 0; r < rows; r++) {
      z -= SPAWN_DZ;
      const monsterRow = r > 2 && greens >= 2 && Math.random() < 0.28 + idx * 0.04;
      if (monsterRow) {
        const mobLane = Math.floor(Math.random() * 3);
        makeMob(mobLane, z);
        // zorg dat er altijd een veilige+groene baan naast ligt
        const safe = (mobLane + 1 + Math.floor(Math.random() * 2)) % 3;
        if (greens < greensNeeded) { makePlus(safe, z); greens++; }
      } else {
        const lane = Math.floor(Math.random() * 3);
        if (greens < greensNeeded) { makePlus(lane, z); greens++; }
        // af en toe een tweede groene in een andere baan
        if (Math.random() < 0.3 && greens < greensNeeded) {
          makePlus((lane + 1 + Math.floor(Math.random() * 2)) % 3, z); greens++;
        }
      }
    }
    flagZ = z - SPAWN_DZ * 2;
    flag = makeFlag(flagZ);
    scene.add(flag);
  }

  function makeFlag(z) {
    const g = new THREE.Group();
    for (let lane = 0; lane < 3; lane++) {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 3.4, 8),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 })
      );
      pole.position.set(LANES[lane], 1.7, 0);
      pole.castShadow = true;
      g.add(pole);
    }
    const banner = facePlane(flagTex, 2.2);
    banner.position.set(0, 3.0, 0.1);
    g.add(banner);
    const arch = makeGlow(0xffe27a, 4, new THREE.Vector3(0, 2.4, 0));
    arch.material.opacity = 0.55;
    g.add(arch);
    g.position.z = z;
    return g;
  }

  // ===== Deeltjes (kleine confetti-burst) =====
  const bursts = [];
  const partGeo = new THREE.SphereGeometry(0.1, 6, 6);
  function burst(x, y, z, color, n = 12) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(partGeo, new THREE.MeshBasicMaterial({ color }));
      m.position.set(x, y, z);
      scene.add(m);
      bursts.push({
        mesh: m, life: 1,
        v: new THREE.Vector3((Math.random() - 0.5) * 0.28, 0.12 + Math.random() * 0.22, (Math.random() - 0.5) * 0.28),
      });
    }
  }

  // ===== HUD =====
  const hud = document.createElement('div');
  hud.style.cssText = `position:absolute;top:max(14px,env(safe-area-inset-top));left:0;right:0;display:flex;justify-content:space-between;align-items:flex-start;padding:0 18px;font-family:Arial,sans-serif;color:#fff;pointer-events:none;text-shadow:0 2px 6px rgba(0,0,0,.45);`;
  hud.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:2px">
      <span id="p3dNum" style="font-size:40px;font-weight:900;line-height:1">1</span>
      <span id="p3dTarget" style="font-size:15px;font-weight:700;color:#fff">Doel: 4</span>
    </div>
    <div style="text-align:right">
      <div id="p3dHearts" style="font-size:22px">❤️❤️❤️</div>
      <div id="p3dLevel" style="font-size:13px;font-weight:700;color:#eaf6ff;margin-top:2px"></div>
    </div>`;
  root.appendChild(hud);

  const backBtn = document.createElement('button');
  backBtn.textContent = '⬅ Terug';
  backBtn.style.cssText = `position:absolute;top:max(70px,calc(env(safe-area-inset-top) + 56px));left:18px;font-family:Arial;font-size:15px;font-weight:600;color:#13314a;background:rgba(255,255,255,.85);border:none;border-radius:10px;padding:8px 14px;z-index:2;`;
  backBtn.onclick = () => quit();
  root.appendChild(backBtn);

  const hint = document.createElement('div');
  hint.textContent = 'Veeg ⬅➡ om te wisselen · tik om te springen';
  hint.style.cssText = `position:absolute;bottom:max(18px,env(safe-area-inset-bottom));left:0;right:0;text-align:center;font-family:Arial;font-size:13px;color:#0c2f49;font-weight:600;pointer-events:none;`;
  root.appendChild(hint);

  function updateHud() {
    const v = playerState.value;
    const num = document.getElementById('p3dNum');
    num.textContent = v;
    num.style.color = '#' + sig(v).toString(16).padStart(6, '0');
    document.getElementById('p3dTarget').textContent = 'Doel: ' + TARGETS[level];
    document.getElementById('p3dHearts').textContent = '❤️'.repeat(Math.max(0, lives)) || '💀';
    document.getElementById('p3dLevel').textContent = `Level ${level + 1} · ${LEVEL_NAMES[level]}`;
  }

  // ===== Besturing: vegen + toetsenbord =====
  let pStart = null;
  function onDown(e) { if (e.target === backBtn) return; pStart = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false }; }
  function onMove(e) {
    if (!pStart) return;
    const dx = e.clientX - pStart.x, dy = e.clientY - pStart.y;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) {
      changeLane(dx > 0 ? 1 : -1);
      pStart.moved = true; pStart = null;
    } else if (dy < -36 && Math.abs(dy) > Math.abs(dx)) {
      jump(); pStart.moved = true; pStart = null;
    }
  }
  function onUp() {
    if (pStart && !pStart.moved && performance.now() - pStart.t < 250) jump(); // tik = springen
    pStart = null;
  }
  root.addEventListener('pointerdown', onDown);
  root.addEventListener('pointermove', onMove);
  root.addEventListener('pointerup', onUp);
  function onKeyDown(e) {
    if (e.key === 'ArrowLeft') changeLane(-1);
    else if (e.key === 'ArrowRight') changeLane(1);
    else if (e.key === 'ArrowUp' || e.key === ' ') jump();
  }
  window.addEventListener('keydown', onKeyDown);

  function changeLane(dir) {
    if (!alive || won) return;
    playerState.lane = Math.max(0, Math.min(2, playerState.lane + dir));
  }
  function jump() {
    if (!alive || won) return;
    if (playerState.onGround) { playerState.vy = JUMP_V; playerState.onGround = false; SFX.pop(); }
  }

  // ===== Groeien / krimpen =====
  function grow() {
    playerState.value += 1;
    buildPlayer(playerState.value);
    SFX.grow(playerState.value);
    speak(playerState.value);
    updateHud();
  }
  function shrink() {
    if (playerState.value > 1) {
      playerState.value -= 1;
      buildPlayer(playerState.value);
      SFX.shrink();
      updateHud();
    } else {
      loseLife();
    }
    playerState.hitCooldown = 0.8;
  }
  function loseLife() {
    lives -= 1;
    SFX.wrong();
    updateHud();
    if (lives <= 0) gameOver();
  }

  // ===== Spelstaat =====
  let level = 0, lives = 3, score = 0;
  let alive = true, won = false;

  function startLevel(idx) {
    level = idx;
    playerState.value = 1;
    playerState.lane = 1;
    playerState.x = 0; playerState.y = 0; playerState.z = 0; playerState.vy = 0;
    playerState.onGround = true; playerState.hitCooldown = 0;
    buildPlayer(1);
    buildLevel(idx);
    alive = true; won = false;
    updateHud();
  }

  // ===== Hoofdlus =====
  let running = true;
  let last = performance.now();

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    const now = performance.now();
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.05) dt = 0.05;

    if (alive && !won) {
      const speed = SPEED_BASE + level * 0.6;
      playerState.z -= speed * dt;

      // baan-wissel (vloeiend)
      const tx = LANES[playerState.lane];
      playerState.x += (tx - playerState.x) * Math.min(1, dt * 12);

      // springen
      if (!playerState.onGround) {
        playerState.vy -= GRAVITY * dt;
        playerState.y += playerState.vy * dt;
        if (playerState.y <= 0) { playerState.y = 0; playerState.vy = 0; playerState.onGround = true; }
      }
      if (playerState.hitCooldown > 0) playerState.hitCooldown -= dt;

      // botsingen met items
      for (const it of items) {
        if (it.done) continue;
        if (Math.abs(it.z - playerState.z) > 0.8) continue;
        if (Math.abs(LANES[it.lane] - playerState.x) > 1.0) continue;
        if (it.type === 'plus') {
          it.done = true;
          scene.remove(it.group);
          burst(it.group.position.x, 1.0, it.z, 0x9dffb0, 14);
          grow();
        } else if (it.type === 'mob') {
          if (playerState.y > 0.65) {
            // erop springen = poppen
            it.done = true;
            scene.remove(it.group);
            burst(it.group.position.x, 0.8, it.z, 0xc9a0ff, 12);
            SFX.stomp();
            playerState.vy = JUMP_V * 0.6; // klein stuitertje
            score += 1;
          } else if (playerState.hitCooldown <= 0) {
            it.done = true;
            scene.remove(it.group);
            burst(it.group.position.x, 0.8, it.z, 0xff8080, 10);
            shrink();
          }
        }
      }

      // finish bereikt?
      if (playerState.z <= flagZ) finishLevel();
    }

    // speler plaatsen + lichte squash bij landen
    player.position.set(playerState.x, playerState.y, playerState.z);
    player.rotation.z = (LANES[playerState.lane] - playerState.x) * 0.12; // leunt in de bocht

    // groene blokjes laten draaien + zweven
    for (const it of items) {
      if (it.done || it.type !== 'plus') continue;
      it.group.rotation.y += dt * 1.8;
      it.group.position.y = 0.85 + Math.sin(now * 0.004 + it.z) * 0.12;
    }
    if (flag) flag.children.forEach((c) => { if (c.isSprite) c.material.rotation += dt; });

    // deeltjes
    for (let i = bursts.length - 1; i >= 0; i--) {
      const p = bursts[i];
      p.mesh.position.add(p.v); p.v.y -= 0.012; p.life -= dt * 1.6;
      p.mesh.scale.setScalar(Math.max(0.01, p.life));
      if (p.life <= 0) { scene.remove(p.mesh); bursts.splice(i, 1); }
    }

    // licht + grond volgen de speler
    ground.position.z = playerState.z - 60;
    trackTex.offset.y = -playerState.z / 320 * 40;
    sun.position.set(playerState.x + 6, 15, playerState.z + 9);
    sun.target.position.set(playerState.x, 0, playerState.z - 4);

    // camera volgt van schuin achter
    const camDesired = new THREE.Vector3(playerState.x * 0.5, 5.4 + playerState.y * 0.3, playerState.z + 8.5);
    camera.position.lerp(camDesired, 0.12);
    camera.lookAt(playerState.x * 0.4, 1.4, playerState.z - 5);

    renderer.render(scene, camera);
  }

  function finishLevel() {
    if (won) return;
    won = true;
    const target = TARGETS[level];
    if (playerState.value >= target) {
      SFX.fanfare(); speak(playerState.value);
      const earned = 2 + level;
      addStars(earned);
      score += target;
      if (level >= TARGETS.length - 1) giveMedal('platform3d_max');
      saveHigh('platform3d', score);
      banner(level >= TARGETS.length - 1 ? 'Gewonnen! 🏆' : 'Level gehaald! 🎉',
        `+${earned} ⭐`,
        level >= TARGETS.length - 1 ? 'Opnieuw 🔄' : 'Volgende ▶',
        () => {
          if (level >= TARGETS.length - 1) startLevel(0);
          else startLevel(level + 1);
        });
    } else {
      SFX.wrong();
      banner('Bijna!', `Je had ${target} nodig. Pak meer groene blokjes!`, 'Opnieuw 🔄',
        () => startLevel(level));
    }
  }

  function gameOver() {
    alive = false;
    SFX.gameover();
    banner('Game Over', `Level ${level + 1}`, 'Opnieuw 🔄', () => startLevel(level));
  }

  // Tussenscherm (win/verlies)
  let panel = null;
  function banner(title, sub, btnText, onBtn) {
    if (panel) panel.remove();
    panel = document.createElement('div');
    panel.style.cssText = `position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(8,20,34,.62);font-family:Arial,sans-serif;color:#fff;text-align:center;z-index:5;`;
    panel.innerHTML = `<div style="font-size:34px;font-weight:900">${title}</div><div style="font-size:18px;color:#dbeafe">${sub}</div>`;
    const go = document.createElement('button');
    go.textContent = btnText;
    go.style.cssText = `font-family:Arial;font-size:20px;font-weight:800;color:#13314a;background:#ffd54d;border:none;border-radius:14px;padding:12px 28px;margin-top:6px;`;
    go.onclick = () => { panel.remove(); panel = null; onBtn(); };
    const home = document.createElement('button');
    home.textContent = '🏠 Menu';
    home.style.cssText = `font-family:Arial;font-size:15px;font-weight:600;color:#fff;background:#334155;border:none;border-radius:12px;padding:9px 18px;`;
    home.onclick = () => quit();
    panel.appendChild(go); panel.appendChild(home);
    root.appendChild(panel);
  }

  function quit() {
    running = false;
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', onKeyDown);
    renderer.dispose();
    root.remove();
    if (onExit) onExit();
  }

  resize();
  startLevel(0);
  camera.position.set(0, 6, 10);
  animate();

  // ===== Hulpfuncties (texturen/gloed/stem) =====
  function makeGlow(colorHex, size, pos) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.38)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(cv);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: tex, color: colorHex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    sp.scale.set(size, size, 1);
    if (pos) sp.position.copy(pos);
    return sp;
  }

  function makeFaceTexture(kind) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const c = cv.getContext('2d');
    // ogen
    for (const ex of [44, 84]) {
      c.fillStyle = '#fff';
      c.beginPath(); c.ellipse(ex, 54, 15, 18, 0, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#14202e'; c.lineWidth = 2.5; c.stroke();
      c.fillStyle = '#14202e';
      const py = kind === 'angry' ? 50 : 56;
      c.beginPath(); c.arc(ex, py, 6.5, 0, Math.PI * 2); c.fill();
    }
    c.strokeStyle = '#14202e'; c.lineWidth = 5; c.lineCap = 'round';
    if (kind === 'angry') {
      // boze wenkbrauwen + frons
      c.beginPath(); c.moveTo(32, 34); c.lineTo(54, 44); c.stroke();
      c.beginPath(); c.moveTo(96, 34); c.lineTo(74, 44); c.stroke();
      c.beginPath(); c.arc(64, 100, 16, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
    } else {
      // lach
      c.beginPath(); c.arc(64, 78, 20, Math.PI * 0.12, Math.PI * 0.88); c.stroke();
    }
    return new THREE.CanvasTexture(cv);
  }

  function makeLabelTexture(text) {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const c = cv.getContext('2d');
    c.font = 'bold 76px Arial';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 8; c.strokeStyle = '#14202e';
    c.strokeText(text, 64, 70);
    c.fillStyle = '#ffffff';
    c.fillText(text, 64, 70);
    return new THREE.CanvasTexture(cv);
  }

  function makeTrackTexture() {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 256;
    const c = cv.getContext('2d');
    // gras
    c.fillStyle = '#7cc24f'; c.fillRect(0, 0, 256, 256);
    c.fillStyle = '#74b948';
    for (let i = 0; i < 40; i++) c.fillRect(Math.random() * 256, Math.random() * 256, 3, 6);
    // pad (midden, 3 banen)
    const padX = 38, padW = 180;
    c.fillStyle = '#caa46a'; c.fillRect(padX, 0, padW, 256);
    c.fillStyle = '#bd965b'; c.fillRect(padX, 0, padW, 256 * 0); // (geen, alleen basis)
    // baan-strepen
    c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 4; c.setLineDash([26, 26]);
    for (const lx of [padX + padW / 3, padX + (padW * 2) / 3]) {
      c.beginPath(); c.moveTo(lx, 0); c.lineTo(lx, 256); c.stroke();
    }
    // randen van het pad
    c.setLineDash([]); c.strokeStyle = '#a07c45'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(padX, 0); c.lineTo(padX, 256); c.stroke();
    c.beginPath(); c.moveTo(padX + padW, 0); c.lineTo(padX + padW, 256); c.stroke();
    return new THREE.CanvasTexture(cv);
  }

  function speak(n) {
    try {
      const synth = window.speechSynthesis;
      if (!synth || n < 0 || n > 20) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(WORDS[n]);
      u.lang = 'nl-NL'; u.pitch = 1.5; u.rate = 1.0;
      synth.speak(u);
    } catch (e) {}
  }
}
