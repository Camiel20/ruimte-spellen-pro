// Speel-statistieken: houdt per spel bij hoe vaak en hoe lang het gespeeld
// wordt. Lokaal in localStorage (geen server — het is een statische site),
// dus de cijfers staan op het apparaat waarop gespeeld wordt.

const KEY = 'rsp_stats_v1';

// Scene-key -> nette naam. Alleen deze tellen als "spel".
const NAMES = {
  Balloon: 'Ballon-Feest',
  Math: 'Reken-Raket',
  Trace: 'Schrijven',
  Clicker: 'Planeet Tikker',
  Piano: 'Regenboog Piano',
  Platform: 'Getallen Avontuur',
  Bezorg: 'Bezorg-Baas',
  NumberTower: 'Getallen Toren',
  ZeroRocket: 'Nul-Raket',
  NumberLand: 'Getallen-Land',
  Snake: '3D Snake',
};

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
}
function save(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
}
function entry(d, key) {
  if (!d[key]) d[key] = { plays: 0, ms: 0, last: 0 };
  return d[key];
}

let active = null; // { key, t0 } — het spel dat nu loopt

export function isGame(key) { return !!NAMES[key]; }
export function gameName(key) { return NAMES[key] || key; }
export function getStats() { return load(); }
export function resetStats() { save({}); active = null; }

// Tel een nieuwe speelbeurt (eerste keer dat dit spel start, niet bij een
// herstart binnen hetzelfde spel).
export function notePlay(key) {
  if (!NAMES[key]) return;
  const d = load();
  const e = entry(d, key);
  e.plays += 1;
  e.last = Date.now();
  save(d);
}

// Start/hervat de tijdmeter voor een spel.
export function startTimer(key) {
  if (!NAMES[key]) return;
  if (active && active.key === key) return; // al bezig
  if (active) stopTimer();
  active = { key, t0: Date.now() };
}

// Stop de meter en tel de verstreken tijd op.
export function stopTimer() {
  if (!active) return;
  const ms = Date.now() - active.t0;
  const key = active.key;
  active = null;
  if (ms < 500) return; // negeer minuscule sessies
  const d = load();
  const e = entry(d, key);
  e.ms += ms;
  e.last = Date.now();
  save(d);
}

export function formatDuration(ms) {
  const s = Math.round((ms || 0) / 1000);
  if (s < 60) return `${s} sec`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} u ${m % 60} min`;
}

// Koppelt de tracking aan de Phaser-game: telt automatisch per spel-scene
// hoe vaak en hoe lang er gespeeld wordt. Hervat netjes na app-wisselen.
export function installTracking(game) {
  let prevKey = null;
  game.events.once('ready', () => {
    game.scene.scenes.forEach((sc) => {
      const key = sc.scene.key;
      sc.events.on('start', () => {
        if (NAMES[key]) {
          if (prevKey !== key) notePlay(key); // nieuwe beurt (niet bij herstart)
          startTimer(key);
        }
        prevKey = key;
      });
      sc.events.on('shutdown', () => { if (NAMES[key]) stopTimer(); });
      sc.events.on('sleep', () => { if (NAMES[key]) stopTimer(); });
    });
  });

  if (typeof document !== 'undefined') {
    // App naar achtergrond (of tabblad weg): pauzeer de meter.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopTimer();
      } else {
        const sc = game.scene.scenes.find((s) => NAMES[s.scene.key] && s.scene.isActive());
        if (sc) startTimer(sc.scene.key);
      }
    });
    window.addEventListener('pagehide', stopTimer);
  }
  return game;
}
