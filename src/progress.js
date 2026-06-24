// Centraal voortgangssysteem voor alle spellen.
// Bewaart sterren, medailles, topscores en instellingen in localStorage,
// zodat alles bewaard blijft tussen sessies.

const KEY = 'rsp_progress_v1';

const DEFAULT = {
  stars: 0,                 // totaal verzamelde sterren over alle spellen
  medals: {},               // bv. { balloon: true, math_easy: true }
  high: {},                 // topscores per spel
  settings: {
    music: true,            // achtergrondmuziek aan/uit
    difficulty: 'normaal',  // makkelijk / normaal / moeilijk (globaal)
    childName: 'Adrian',    // naam van het kind (menu + naam-schrijven)
  },
};

let data = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return Object.assign({}, DEFAULT, JSON.parse(raw));
  } catch (e) {}
  return JSON.parse(JSON.stringify(DEFAULT));
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
export function getSetting(key) { return data.settings ? data.settings[key] : DEFAULT.settings[key]; }
export function setSetting(key, value) {
  if (!data.settings) data.settings = Object.assign({}, DEFAULT.settings);
  data.settings[key] = value;
  save();
}

// Voor een schone start (debug / "wis voortgang")
export function resetProgress() {
  data = JSON.parse(JSON.stringify(DEFAULT));
  save();
  try { localStorage.removeItem('rsp_clicker'); } catch (e) {}
}
