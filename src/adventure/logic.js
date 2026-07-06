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

// Portalen staan PORTAL_AFSTAND uit elkaar; het sterrenhek staat er 150px
// achter. Eén formule voor scene én validator, zodat ze nooit uit de pas lopen.
export const PORTAL_AFSTAND = 130;
export function portaalMuurX(P) {
  return P.x + (P.opties.length - 1) * PORTAL_AFSTAND + 150;
}

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
  // Vliegers zweven en hebben geen grond nodig — alleen wereld-grenzen.
  (L.grommels || []).forEach((gr, i) => {
    if (!gr.patrol || gr.patrol.length !== 2) { err(`grommel ${i + 1} mist een patrol [lo, hi]`); return; }
    const [lo, hi] = gr.patrol;
    if (lo >= hi) err(`grommel ${i + 1}: patrol lo (${lo}) >= hi (${hi})`);
    if (gr.type === 'vlieger') {
      if (lo < 0 || hi > L.worldW) err(`vlieger ${i + 1} vliegt buiten de wereld`);
      return;
    }
    const supported = L.platforms.some(([px, py, pw]) =>
      py >= gr.y && py <= gr.y + 140 && px <= lo - 16 && px + pw >= hi + 16);
    if (!supported) err(`grommel ${i + 1}: patrouille ${lo}..${hi} loopt (deels) buiten een platform — hij wandelt de kloof in`);
  });

  if (!L.goal) err('level mist een doel-vlag');
  else if (L.goal.x < 0 || L.goal.x > L.worldW) err(`vlag (x=${L.goal.x}) ligt buiten de wereld (breedte ${L.worldW})`);

  if (L.star && (L.star.x < 0 || L.star.x > L.worldW || L.star.y < 0 || L.star.y > L.worldH)) {
    err('ster ligt buiten de wereld');
  }

  if (L.goudenNul && (L.goudenNul.x < 0 || L.goudenNul.x > L.worldW || L.goudenNul.y < 0 || L.goudenNul.y > L.worldH)) {
    err('gouden nul ligt buiten de wereld');
  }

  (L.pickups || []).forEach((p, i) => {
    if (p.x < 0 || p.x > L.worldW) err(`groei-bolletje ${i} ligt buiten de wereld`);
  });

  // Alle poorten over kloven (brug of trein) — zelfde vorm als in AdventureScene.
  // NB: in het spel mag je ook SPLITSEN, dus een doel is haalbaar zodra de
  // blokjes er samen genoeg zijn (som ≥ doel) — subset-som is geen eis.
  const gates = [L.gate, ...(L.gates || [])].filter(Boolean);
  gates.forEach((G, i) => {
    const naam = `${G.type === 'trein' ? 'trein' : 'brug'} ${i + 1}`;
    if (G.type === 'trein') {
      if (!Array.isArray(G.wagons) || G.wagons.length < 2) err(`${naam} heeft minstens 2 wagons nodig`);
      else if (G.wagons.some((w) => !w || w < 1)) err(`${naam}: elke wagon wil minstens 1`);
      else if (sum(G.wagons) !== sum(G.blocks || [])) {
        err(`${naam}: wagons (${sum(G.wagons)}) ≠ blokjes (${sum(G.blocks || [])}) — verdelen moet precies kloppen`);
      }
    } else {
      if (G.doel == null || !Array.isArray(G.blocks)) { err(`${naam} mist doel/blocks`); return; }
      if (sum(G.blocks) < G.doel) err(`${naam}: blokjes (${G.blocks.join('+')}=${sum(G.blocks)}) zijn samen minder dan het doel ${G.doel} — onoplosbaar`);
    }
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
    if (sum(R.blocks) < R.doel) err(`redding ${i + 1} (${R.name || '?'}): blokjes zijn samen minder dan ${R.doel} — onoplosbaar`);
    if (R.x < 0 || R.x > L.worldW) err(`redding ${i + 1} ligt buiten de wereld`);
  });

  (L.doors || []).forEach((D, i) => {
    if (D.doel == null) err(`deur ${i + 1} mist een doel`);
    if (D.x < 0 || D.x > L.worldW) err(`deur ${i + 1} ligt buiten de wereld`);
  });

  // Tel-wolken (verdwijn-platforms) binnen de wereld.
  (L.telWolken || []).forEach(([x, y, w], i) => {
    if (x < 0 || x + w > L.worldW) err(`tel-wolk ${i + 1} ligt buiten de wereld`);
  });

  // Geef-platen: haalbaar (genoeg groei vóór de plaat) + goed geplaatst.
  (L.plates || []).forEach((P, i) => {
    if (P.doel == null || P.doel < 1) { err(`plaat ${i + 1} mist een geldig doel`); return; }
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= P.x && px + pw >= P.x);
    if (!support) err(`plaat ${i + 1} staat niet op de grond`);
    const before = (L.pickups || []).filter((p) => p.x < P.x);
    const regen = before.some((p) => p.regen);
    const sum = before.reduce((s, p) => s + (p.amount || 1), 0);
    if (!regen && sum < P.doel) {
      err(`plaat ${i + 1}: vraagt ${P.doel}, maar er zijn maar ${sum} groei-bolletjes vóór de plaat — kan vastlopen (tip: regen: true)`);
    }
    if (L.goal && L.goal.x < P.x + 96) err(`plaat ${i + 1}: de vlag staat vóór de slagboom`);
  });

  // Missie-levels hebben hun missie-doelen nodig.
  if (L.missie === 'grommels' && !(L.grommels || []).length) {
    err("missie 'grommels' zonder grommels in het level");
  }

  if (L.boss) {
    const B = L.boss;
    if (B.x < 0 || B.x > L.worldW) err('baas staat buiten de wereld');
    if (!Array.isArray(B.stages) || B.stages.length === 0) err('baas heeft geen fasen');
    (B.stages || []).forEach((S, i) => {
      if (sum(S.blocks || []) < S.doel) err(`baas-fase ${i + 1}: blokjes zijn samen minder dan ${S.doel} — onoplosbaar`);
    });
    if (L.goal && L.goal.x < B.x) err('vlag staat vóór de baas — baas is te omzeilen');
  }

  // Antwoord-muren (spring tegen het juiste blok: meer/minder).
  (L.vraagMuren || []).forEach((V, i) => {
    if (!['meer', 'minder'].includes(V.kies)) err(`vraagmuur ${i + 1}: kies moet 'meer' of 'minder' zijn`);
    if (!Array.isArray(V.opties) || V.opties.length !== 2) err(`vraagmuur ${i + 1}: precies 2 opties nodig`);
    else if (V.opties[0] === V.opties[1]) err(`vraagmuur ${i + 1}: opties zijn gelijk — geen goed antwoord mogelijk`);
    if (V.x < 0 || V.x > L.worldW) err(`vraagmuur ${i + 1} staat buiten de wereld`);
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= V.x - 220 && px + pw >= V.x);
    if (!support) err(`vraagmuur ${i + 1}: geen doorlopende grond vóór de muur (aanloop + blokken)`);
  });

  // Achtervolgingen (rollende rots): volgorde + grond onder het hele stuk.
  (L.achtervolgingen || []).forEach((A, i) => {
    if (!(A.spawnX < A.triggerX && A.triggerX < A.endX)) err(`achtervolging ${i + 1}: verwacht spawnX < triggerX < endX`);
    if (A.endX > L.worldW) err(`achtervolging ${i + 1} loopt buiten de wereld`);
    const cover = L.platforms.some(([px, py, pw]) => py === groundTop && px <= A.spawnX && px + pw >= A.endX);
    if (!cover) err(`achtervolging ${i + 1}: geen doorlopende grond van spawn tot einde — de rots valt in een gat`);
  });

  // Duw-kisten: op doorlopende grond (anders valt hij bij het schuiven).
  (L.duwKisten || []).forEach((x, i) => {
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= x - 30 && px + pw >= x + 30);
    if (!support) err(`duw-kist ${i + 1} (x=${x}) staat niet op doorlopende grond`);
  });

  // Grauwe muren: alleen de tien-kracht breekt ze — die moet er dus zijn.
  if ((L.grauwMuren || []).length) {
    const heeftMega = !!L.startMega || (L.rescues || []).some((r) => r.gives === 'mega');
    if (!heeftMega) err('grauwe muur zonder tien-kracht (startMega of een redding met gives:mega) — onpasseerbaar');
    L.grauwMuren.forEach((x, i) => {
      const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= x && px + pw >= x);
      if (!support) err(`grauwe muur ${i + 1} (x=${x}) staat niet op de grond`);
    });
  }

  // Maan-zones (lage zwaartekracht) binnen de wereld.
  (L.maanZones || []).forEach((Z, i) => {
    if (Z.x < 0 || Z.x + Z.w > L.worldW) err(`maan-zone ${i + 1} ligt buiten de wereld`);
  });

  // Saus-geisers (Pizza-Vulkaan): op de grond en binnen de wereld.
  (L.geisers || []).forEach((G, i) => {
    if (G.x < 0 || G.x > L.worldW) err(`geiser ${i + 1} staat buiten de wereld`);
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= G.x && px + pw >= G.x);
    if (!support) err(`geiser ${i + 1} (x=${G.x}) staat niet op de grond`);
  });

  // Kantel-punten binnen de wereld.
  (L.kantels || []).forEach(([x, , w], i) => {
    if (x - w / 2 < 0 || x + w / 2 > L.worldW) err(`kantel-punt ${i + 1} steekt buiten de wereld`);
  });

  // Flipperpannen: binnen de wereld (mogen zweven).
  (L.flippers || []).forEach(([x, y], i) => {
    if (x < 0 || x > L.worldW || y < 0 || y > L.worldH) err(`flipperpan ${i + 1} hangt buiten de wereld`);
  });

  // Boter-glijbanen: op doorlopende grond (anders glij je een spookbaan op).
  (L.glijbanen || []).forEach(([x, w, dir, y], i) => {
    if (x < 0 || x + w > L.worldW) err(`glijbaan ${i + 1} steekt buiten de wereld`);
    if (dir !== 1 && dir !== -1) err(`glijbaan ${i + 1}: richting moet 1 of -1 zijn`);
    const top = y != null ? y : groundTop;
    const support = L.platforms.some(([px, py, pw]) => py === top && px <= x && px + pw >= x + w);
    if (!support) err(`glijbaan ${i + 1} (x=${x}..${x + w}) ligt niet op doorlopende grond`);
  });

  // Pannenkoeken-toren: haalbaar doel + trap binnen de wereld.
  if (L.stapel) {
    const ST = L.stapel;
    if (!ST.doel || ST.doel < 3) err('stapel: doel moet minstens 3 zijn (anders valt er niets te tellen)');
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= ST.x && px + pw >= ST.x);
    if (!support) err('stapel: het bak-station staat niet op de grond');
    if (!Array.isArray(ST.trap) || !ST.trap.length) err('stapel mist een trap [[x,y,w],…]');
    (ST.trap || []).forEach(([x, , w], i) => {
      if (x - w / 2 < 0 || x + w / 2 > L.worldW) err(`stapel-trede ${i + 1} steekt buiten de wereld`);
    });
  }

  // Reuzenflips: binnen de wereld.
  (L.reuzenflips || []).forEach(([x, y, w], i) => {
    if (x - w / 2 < 0 || x + w / 2 > L.worldW || y < 0 || y > L.worldH) err(`reuzenflip ${i + 1} hangt buiten de wereld`);
  });

  // Patroon-pannenkoek: elk rondje heeft precies één goed antwoord dat ook
  // echt tussen de opties staat.
  if (L.patroon) {
    const P = L.patroon;
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= P.x && px + pw >= P.x + 130);
    if (!support) err('patroon: het bord (of de slagboom erachter) staat niet op de grond');
    if (!Array.isArray(P.rondes) || !P.rondes.length) err('patroon heeft geen rondes');
    (P.rondes || []).forEach((R, i) => {
      if (!Array.isArray(R.reeks) || R.reeks.length < 3) err(`patroon-ronde ${i + 1}: reeks te kort (min 3)`);
      if (!Array.isArray(R.opties) || R.opties.length < 2) err(`patroon-ronde ${i + 1}: minstens 2 opties nodig`);
      else if (!R.opties.includes(R.antwoord)) err(`patroon-ronde ${i + 1}: het antwoord zit niet tussen de opties`);
      else if (R.opties.filter((o) => o === R.antwoord).length !== 1) err(`patroon-ronde ${i + 1}: het antwoord staat er dubbel in`);
    });
    if (L.goal && L.goal.x < P.x + 130) err('patroon: de vlag staat vóór de slagboom');
  }

  // Doorspoel-potten: precies één juiste som, potten én uitgang op de grond.
  (L.spoelpotten || []).forEach((SP, i) => {
    if (!Array.isArray(SP.opties) || SP.opties.length < 2) { err(`spoelpotten-groep ${i + 1}: minstens 2 potten nodig`); return; }
    const goed = SP.opties.filter((o) => o[0] + o[1] === SP.doel).length;
    if (goed !== 1) err(`spoelpotten-groep ${i + 1}: ${goed} sommen maken ${SP.doel} — er moet er precies één kloppen`);
    const laatste = SP.x + (SP.opties.length - 1) * 130;
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= SP.x - 40 && px + pw >= laatste + 40);
    if (!support) err(`spoelpotten-groep ${i + 1}: geen doorlopende grond onder de potten`);
    const uit = L.platforms.some(([px, py, pw]) => py === groundTop && px <= SP.uitX && px + pw >= SP.uitX);
    if (!uit) err(`spoelpotten-groep ${i + 1}: de uitgang-pot (x=${SP.uitX}) heeft geen grond`);
  });

  // Wc-rol-platforms en stink-zones binnen de wereld.
  (L.wcRollen || []).forEach(([x, , w], i) => {
    if (x - w / 2 < 0 || x + w / 2 > L.worldW) err(`wc-rol ${i + 1} steekt buiten de wereld`);
  });
  (L.stinkZones || []).forEach((Z, i) => {
    if (Z.x < 0 || Z.x + Z.w > L.worldW) err(`stink-zone ${i + 1} ligt buiten de wereld`);
  });

  // Nul-feest (geheime wereld): alles binnen de wereld.
  if (L.nulFeest) {
    (L.nulFeest.nullen || []).forEach(([x, y], i) => {
      if (x < 0 || x > L.worldW || y < 0 || y > L.worldH) err(`feest-nul ${i + 1} ligt buiten de wereld`);
    });
    (L.nulFeest.ringen || []).forEach(([x, y], i) => {
      if (x < 0 || x > L.worldW || y < 0 || y > L.worldH) err(`nul-ring ${i + 1} ligt buiten de wereld`);
    });
  }

  // Pizza-Bakkerij: eerlijk te verdelen (toppings = pizzas × per), oven op
  // de grond, en de brug moet echt ergens heen leiden (binnen de wereld).
  if (L.bakkerij) {
    const B = L.bakkerij;
    if (!B.pizzas || B.pizzas < 2) err('bakkerij: minstens 2 pizza\'s nodig (anders valt er niets te verdelen)');
    if (!B.per || B.per < 1) err('bakkerij: per (toppings per pizza) ontbreekt');
    const nodig = (B.pizzas || 0) * (B.per || 0);
    const aantal = (B.toppings || []).length;
    if (aantal !== nodig) err(`bakkerij: ${aantal} toppings maar ${B.pizzas} × ${B.per} = ${nodig} nodig — eerlijk delen moet precies kloppen`);
    (B.toppings || []).forEach(([x], i) => {
      if (x < 0 || x > L.worldW) err(`bakkerij-topping ${i + 1} ligt buiten de wereld`);
    });
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= B.x && px + pw >= B.x);
    if (!support) err('bakkerij: de oven staat niet op de grond');
    if (!Array.isArray(B.brug) || B.brug.length !== 3) err('bakkerij mist een brug [x, y, w]');
    else if (B.brug[0] < 0 || B.brug[0] + B.brug[2] > L.worldW) err('bakkerij: de brug steekt buiten de wereld');
  }

  // Raket: precies vol te tanken (vaatjes van 10) + vertrek en landing op grond.
  if (L.raket) {
    const R = L.raket;
    if (!R.doel || R.doel % 10 !== 0) err('raket: doel moet een tiental zijn (bv. 100)');
    const drums = (R.drums || []).length;
    if (drums * 10 < (R.doel || 0)) err(`raket: ${drums} vaatjes (= ${drums * 10}) zijn samen minder dan ${R.doel} — de tank kan nooit vol`);
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= R.x && px + pw >= R.x);
    if (!support) err('raket staat niet op de grond');
    const land = L.platforms.some(([px, py, pw]) => py === groundTop && px <= R.landX && px + pw >= R.landX + 80);
    if (!land) err(`raket: de landingsplek (x=${R.landX}) heeft geen grond`);
  }

  // Portaal-groepen: precies één som klopt, en doorlopende grond onder de
  // hele groep (inclusief de terug- en vooruit-teleportplekken).
  (L.portalen || []).forEach((P, i) => {
    if (!Array.isArray(P.opties) || P.opties.length < 2) { err(`portaal-groep ${i + 1}: minstens 2 portalen nodig`); return; }
    const goed = P.opties.filter((o) => o[0] + o[1] === P.doel).length;
    if (goed !== 1) err(`portaal-groep ${i + 1}: ${goed} sommen maken ${P.doel} — er moet er precies één kloppen`);
    const muurX = portaalMuurX(P);
    if (muurX + 130 > L.worldW) err(`portaal-groep ${i + 1}: het sterrenhek valt buiten de wereld`);
    const support = L.platforms.some(([px, py, pw]) => py === groundTop && px <= P.x - 200 && px + pw >= muurX + 130);
    if (!support) err(`portaal-groep ${i + 1}: geen doorlopende grond rond de portalen`);
  });

  return errors;
}
