// Centraal voortgangssysteem voor alle spellen.
// Bewaart sterren, medailles, topscores, per-level voortgang en instellingen
// in localStorage, zodat alles bewaard blijft tussen sessies.
//
// v2: - versieveld + migratie (v1 → v2)
//     - DEEP merge met DEFAULT (v1 had een ondiepe merge: nieuwe settings-keys
//       verdwenen voor bestaande spelers)
//     - per-level records (levels['1-2'] = { done, star }) voor de wereldkaart
//     - adventure.current = level-id waar je gebleven bent ("verder spelen")

const KEY = 'rsp_progress_v2';
const OLD_KEY = 'rsp_progress_v1';

const DEFAULT = {
  version: 2,
  stars: 0,                 // totaal verzamelde sterren over alle spellen
  medals: {},               // bv. { balloon: true, adventure_1_1: true }
  high: {},                 // topscores per spel
  levels: {},               // per level-id: { done: true, star: true }
  adventure: { current: null }, // level-id waar het avontuur verder gaat
  settings: {
    music: true,            // achtergrondmuziek aan/uit
    difficulty: 'normaal',  // makkelijk / normaal / moeilijk (globaal)
    childName: 'Adrian',    // naam van het kind (menu + naam-schrijven)
  },
};

// Diepe merge: 'saved' wint, maar keys die alleen in 'base' bestaan blijven
// bestaan (zodat nieuwe velden/instellingen automatisch hun default krijgen).
function deepMerge(base, saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
    return saved === undefined ? clone(base) : saved;
  }
  const out = clone(base) || {};
  for (const k of Object.keys(saved)) {
    const b = base && typeof base === 'object' ? base[k] : undefined;
    out[k] = (b && typeof b === 'object' && !Array.isArray(b)) ? deepMerge(b, saved[k]) : saved[k];
  }
  return out;
}

function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }

// v1 → v2: sterren/medailles/scores/instellingen mee; behaalde avontuur-levels
// afleiden uit de medailles (adventure_1_2 → level '1-2' gehaald).
function migrateV1(v1) {
  const d = deepMerge(DEFAULT, v1);
  d.version = 2;
  d.levels = d.levels || {};
  for (const id of Object.keys(v1.medals || {})) {
    const m = /^adventure_(\d+)_(\d+)$/.exec(id);
    if (m) d.levels[`${m[1]}-${m[2]}`] = { done: true };
  }
  return d;
}

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return deepMerge(DEFAULT, JSON.parse(raw));
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const d = migrateV1(JSON.parse(old));
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
      return d;
    }
  } catch (e) {}
  return clone(DEFAULT);
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
}

// --- Sterren ---
export function getStars() { return data.stars || 0; }
export function addStars(n) { data.stars = (data.stars || 0) + n; save(); return data.stars; }

// --- Medailles ---
export function hasMedal(id) { return !!(data.medals && data.medals[id]); }
export function giveMedal(id) {
  if (!data.medals) data.medals = {};
  const isNew = !data.medals[id];
  data.medals[id] = true;
  save();
  return isNew; // true als het een nieuwe medaille is
}
export function getMedalCount() { return data.medals ? Object.keys(data.medals).length : 0; }

// --- Per-level voortgang (avontuur / wereldkaart) ---
export function getLevelRecord(id) { return (data.levels && data.levels[id]) || null; }
export function markLevelDone(id, extra = {}) {
  if (!data.levels) data.levels = {};
  const prev = data.levels[id] || {};
  const next = Object.assign({}, prev, { done: true }, extra);
  if (prev.star) next.star = true; // een gepakte ster raak je nooit meer kwijt
  // beste sterren-score bewaren (opnieuw spelen kan alleen verbeteren)
  if (prev.sterren != null) next.sterren = Math.max(prev.sterren, extra.sterren || 0);
  data.levels[id] = next;
  save();
}

// Verdiende sterren van een level (0–3). Oude records (van vóór de
// sterren-telling) tellen als: gehaald = 1, plus de geheime ster = 1.
export function getLevelSterren(id) {
  const r = getLevelRecord(id);
  if (!r) return 0;
  if (r.sterren != null) return r.sterren;
  return (r.done ? 1 : 0) + (r.star ? 1 : 0);
}
export function getAdventureCurrent() { return (data.adventure && data.adventure.current) || null; }
export function setAdventureCurrent(id) {
  if (!data.adventure) data.adventure = {};
  data.adventure.current = id;
  save();
}

// --- Topscores ---
export function getHigh(game) { return (data.high && data.high[game]) || 0; }
export function saveHigh(game, score) {
  if (!data.high) data.high = {};
  if (score > (data.high[game] || 0)) {
    data.high[game] = score;
    save();
    return true; // nieuw record
  }
  return false;
}

// --- Instellingen ---
export function getSetting(key) {
  const v = data.settings ? data.settings[key] : undefined;
  return v === undefined ? DEFAULT.settings[key] : v;
}
export function setSetting(key, value) {
  if (!data.settings) data.settings = Object.assign({}, DEFAULT.settings);
  data.settings[key] = value;
  save();
}

// Voor een schone start (debug / "wis voortgang")
export function resetProgress() {
  data = clone(DEFAULT);
  save();
  try { localStorage.removeItem(OLD_KEY); } catch (e) {}
  try { localStorage.removeItem('rsp_clicker'); } catch (e) {}
}
