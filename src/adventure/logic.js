// ===== PURE PUZZELLOGICA + LEVEL-VALIDATOR =====
// Geen Phaser, geen DOM — alleen rekenwerk. Daardoor 1:1 unit-testbaar
// (zie tests/) en herbruikbaar in de scene én in de validator.

// Kan je 'doel' maken door een DEELVERZAMELING van 'values' samen te voegen
// (zonder te splitsen)? Klassieke subset-som.
export function canMakeTarget(values, doel) {
  const reach = new Set([0]);
  for (const v of values) {
    const add = [];
    for (const r of reach) {
      const s = r + v;
      if (s === doel) return true;
      if (s < doel) add.push(s);
    }
    add.forEach((s) => reach.add(s));
  }
  return reach.has(doel);
}

// Vind twee blokken die samen 'doel' zijn. Geeft [i, j] (indexen) of null.
export function findPair(values, doel) {
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (values[i] + values[j] === doel) return [i, j];
    }
  }
  return null;
}

// Splits 'value' op celgrens k (k cellen onderaan). Geeft [onder, boven].
export function splitParts(value, k) {
  const bot = Math.max(1, Math.min(k, value - 1));
  return [bot, value - bot];
}

const sum = (a) => a.reduce((s, v) => s + v, 0);

// Controleer een level-object op ontwerpfouten die je anders pas al spelend
// ontdekt. Geeft een lijst foutmeldingen (leeg = level is in orde).
export function validateLevel(L) {
  const errors = [];
  const err = (msg) => errors.push(`[${L.id || '?'}] ${msg}`);

  if (!L.id) err('level mist een id');
  if (!L.worldW || !L.worldH) err('level mist worldW/worldH');
  if (!Array.isArray(L.platforms) || L.platforms.length === 0) {
    err('level heeft geen platforms');
    return errors; // zonder grond heeft de rest geen zin
  }

  const groundTop = L.platforms[0][1];
  if (L.killY != null && L.killY <= groundTop) err(`killY (${L.killY}) ligt op/boven de grond (${groundTop}) — speler sterft op de grond`);
  if (!L.start) err('level mist een startpositie');
  else {
    if (L.start.x < 0 || L.start.x > L.worldW) err('start ligt buiten de wereld');
    // Er moet een platform ONDER de startpositie liggen, anders val je meteen.
    const support = L.platforms.some(([px, py, pw]) => px <= L.start.x && px + pw >= L.start.x && py >= L.start.y);
    if (!support) err(`start (x=${L.start.x}) heeft geen platform eronder — speler valt meteen`);
  }

  // Grommels moeten hun HELE patrouille op een platform kunnen lopen (marge =
  // halve lijfbreedte), anders wandelen ze de zee/kloof in en vallen ze weg.
  (L.grommels || []).forEach((gr, i) => {
    if (!gr.patrol || gr.patrol.length !== 2) { err(`grommel ${i + 1} mist een patrol [lo, hi]`); return; }
    const [lo, hi] = gr.patrol;
    if (lo >= hi) err(`grommel ${i + 1}: patrol lo (${lo}) >= hi (${hi})`);
    const supported = L.platforms.some(([px, py, pw]) =>
      py >= gr.y && py <= gr.y + 140 && px <= lo - 16 && px + pw >= hi + 16);
    if (!supported) err(`grommel ${i + 1}: patrouille ${lo}..${hi} loopt (deels) buiten een platform — hij wandelt de kloof in`);
  });

  if (!L.goal) err('level mist een doel-vlag');
  else if (L.goal.x < 0 || L.goal.x > L.worldW) err(`vlag (x=${L.goal.x}) ligt buiten de wereld (breedte ${L.worldW})`);

  if (L.star && (L.star.x < 0 || L.star.x > L.worldW || L.star.y < 0 || L.star.y > L.worldH)) {
    err('ster ligt buiten de wereld');
  }

  (L.pickups || []).forEach((p, i) => {
    if (p.x < 0 || p.x > L.worldW) err(`groei-bolletje ${i} ligt buiten de wereld`);
  });

  // Alle bruggen (enkel of lijst) — zelfde vorm als in AdventureScene.
  const gates = [L.gate, ...(L.gates || [])].filter(Boolean);
  gates.forEach((G, i) => {
    const naam = `brug ${i + 1}`;
    if (G.doel == null || !Array.isArray(G.blocks)) { err(`${naam} mist doel/blocks`); return; }
    if (sum(G.blocks) < G.doel) err(`${naam}: blokjes (${G.blocks.join('+')}=${sum(G.blocks)}) zijn samen minder dan het doel ${G.doel} — onoplosbaar`);
    else if (!canMakeTarget(G.blocks, G.doel)) err(`${naam}: doel ${G.doel} is niet te maken uit [${G.blocks.join(', ')}] zonder splitsen`);
    if (G.gapX + G.gapW > L.worldW) err(`${naam}: kloof steekt buiten de wereld`);
    if (G.triggerX >= G.gapX) err(`${naam}: trigger (x=${G.triggerX}) ligt niet vóór de kloof (x=${G.gapX})`);
    // Geen grond-platform dwars door de kloof.
    L.platforms.forEach(([px, py, pw], pi) => {
      if (py === groundTop && px < G.gapX + G.gapW && px + pw > G.gapX) {
        err(`${naam}: platform ${pi} (x=${px}..${px + pw}) overlapt de kloof (${G.gapX}..${G.gapX + G.gapW})`);
      }
    });
  });

  (L.rescues || []).forEach((R, i) => {
    if (R.doel == null || !Array.isArray(R.blocks)) { err(`redding ${i + 1} mist doel/blocks`); return; }
    if (!canMakeTarget(R.blocks, R.doel)) err(`redding ${i + 1} (${R.name || '?'}): doel ${R.doel} niet te maken uit [${R.blocks.join(', ')}]`);
    if (R.x < 0 || R.x > L.worldW) err(`redding ${i + 1} ligt buiten de wereld`);
  });

  (L.doors || []).forEach((D, i) => {
    if (D.doel == null) err(`deur ${i + 1} mist een doel`);
    if (D.x < 0 || D.x > L.worldW) err(`deur ${i + 1} ligt buiten de wereld`);
  });

  if (L.boss) {
    const B = L.boss;
    if (B.x < 0 || B.x > L.worldW) err('baas staat buiten de wereld');
    if (!Array.isArray(B.stages) || B.stages.length === 0) err('baas heeft geen fasen');
    (B.stages || []).forEach((S, i) => {
      if (!canMakeTarget(S.blocks || [], S.doel)) err(`baas-fase ${i + 1}: doel ${S.doel} niet te maken uit [${(S.blocks || []).join(', ')}]`);
    });
    if (L.goal && L.goal.x < B.x) err('vlag staat vóór de baas — baas is te omzeilen');
  }

  return errors;
}
