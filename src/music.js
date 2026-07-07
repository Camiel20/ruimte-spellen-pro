// Vrolijke achtergrondmuziek — opgebouwd met de Web Audio API, dus geen
// mp3-bestanden nodig. Er zijn twee deuntjes:
//   'menu'      — rustig, zacht (voor het hoofdmenu);
//   'adventure' — bouncy, cartoonish chiptune met een stuiterende kick,
//                 voor de platform-levels (Getallen-Land).
// Aan/uit via de instellingen (progress.js) en de muziekknop.

import { getAudioContext } from './sound.js';
import { getSetting } from './progress.js';

let playing = false;
let timer = null;
let masterGain = null;
let step = 0;
let current = 'menu';
let variatie = { pitch: 1, tempo: 1 };

// Elke wereld z'n eigen klankkleur: hetzelfde avontuur-deuntje, maar
// getransponeerd en in een ander tempo — de kust klinkt zonnig, het bos
// dieper, de ruimte dromerig en het fort dreigend laag.
export function muziekVoorTerrein(terrain) {
  return {
    zand: { pitch: 1.122, tempo: 1.05 },   // +2 halve tonen: zonnig
    bos: { pitch: 0.891, tempo: 0.96 },    // −2: dieper het bos in
    berg: { pitch: 0.841, tempo: 1.0 },    // −3: stoer
    ruimte: { pitch: 1.189, tempo: 0.9 },  // +3, trager: zweven
    fort: { pitch: 0.749, tempo: 0.88 },   // −5, traag: hier woont Grauw
    pizza: { pitch: 1.059, tempo: 1.08 },  // +1, vlotter: smikkel-feest
    pannenkoek: { pitch: 1.26, tempo: 0.97 }, // +4, dromerig zoet
    wc: { pitch: 0.944, tempo: 1.12 },     // −1, hupsend: giechel-tempo
    reus: { pitch: 1.122, tempo: 0.92 },   // +2, traag & groots: reuzenstappen
    billen: { pitch: 0.891, tempo: 1.15 }, // −2, hupsend: stuiter-giechel
    zee: { pitch: 1.059, tempo: 0.84 },    // +1, traag golvend: onderwater-dromen
  }[terrain] || { pitch: 1, tempo: 1 };
}

const TUNES = {
  // Rustig menu-deuntje (pentatonisch — klinkt altijd goed).
  menu: {
    stepMs: 320, melodyWave: 'triangle', melodyVol: 0.05,
    bassWave: 'sine', bassVol: 0.04, bassEvery: 4, kick: false,
    melody: [
      523, 0, 659, 784, 587, 0, 659, 523,
      587, 659, 784, 0, 880, 784, 659, 0,
      523, 587, 659, 784, 880, 0, 784, 659,
      587, 0, 523, 0, 659, 587, 523, 0,
    ],
    bass: [131, 131, 165, 165, 147, 147, 175, 175],
  },
  // Bouncy, vrolijk avontuur-deuntje (square-golf = cartoonish) + kick.
  adventure: {
    stepMs: 216, melodyWave: 'square', melodyVol: 0.04,
    bassWave: 'triangle', bassVol: 0.05, bassEvery: 2, kick: true,
    melody: [
      784, 0, 784, 880, 988, 0, 880, 784,
      659, 0, 784, 659, 587, 0, 0, 0,
      698, 0, 698, 784, 880, 0, 784, 698,
      587, 0, 659, 587, 523, 0, 523, 0,
    ],
    bass: [
      131, 131, 165, 165, 196, 196, 165, 165,
      147, 147, 175, 175, 131, 131, 196, 196,
    ],
  },
};

function playNote(freq, dur, vol, type) {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + dur + 0.05);
}

// Korte "boem" die de melodie laat stuiteren.
function playKick() {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(52, t + 0.12);
  g.gain.setValueAtTime(0.09, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + 0.17);
}

function tick() {
  const T = TUNES[current] || TUNES.menu;
  const note = T.melody[step % T.melody.length];
  if (note > 0) playNote(note * variatie.pitch, T.melodyWave === 'square' ? 0.16 : 0.35, T.melodyVol, T.melodyWave);
  const be = T.bassEvery || 4;
  if (step % be === 0) {
    const b = T.bass[(step / be) % T.bass.length];
    if (b > 0) playNote(b * variatie.pitch, be * (T.stepMs / 1000) * 0.9, T.bassVol, T.bassWave);
  }
  if (T.kick && step % 2 === 0) playKick();
  // vrolijk glinster-laagje af en toe
  if (note > 0 && step % 8 === 2) playNote(note * 2 * variatie.pitch, 0.22, 0.02, 'sine');
  step++;
}

// tune: 'menu' (standaard) of 'adventure'; varr: optionele wereld-variatie
// ({ pitch, tempo }, zie muziekVoorTerrein). Wisselt als er iets verandert.
export function startMusic(tune = 'menu', varr = null) {
  const v = varr || { pitch: 1, tempo: 1 };
  if (playing && current === tune && v.pitch === variatie.pitch && v.tempo === variatie.tempo) return;
  stopMusic();                             // ander deuntje/variatie? herstart schoon
  current = tune;
  variatie = v;
  if (!getSetting('music')) return; // staat uit in instellingen
  const ctx = getAudioContext();
  if (!ctx) return;
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(ctx.destination);
  }
  playing = true;
  step = 0;
  tick();
  timer = setInterval(tick, TUNES[current].stepMs / variatie.tempo);
}

export function stopMusic() {
  playing = false;
  if (timer) { clearInterval(timer); timer = null; }
}

export function isMusicPlaying() { return playing; }

export function setMusicEnabled(on) {
  if (on) startMusic(current);
  else stopMusic();
}
