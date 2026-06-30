// Geluidssysteem voor alle spellen.
//
// We genereren de geluiden zelf met de Web Audio API (zoals in de oude
// HTML-versie). Voordeel: geen geluidsbestanden nodig, werkt meteen.
// Wil je later ECHTE geluidsbestanden (mp3) gebruiken? Dan laad je die
// in BootScene met this.load.audio(...) en speel je ze af met
// this.sound.play('naam'). Beide kunnen naast elkaar bestaan.
//
// Gebruik vanuit een scene:
//   import { SFX, initAudio, toggleSound, isSoundOn } from '../sound.js';
//   initAudio();        // eenmalig, na de eerste tik (gebeurt automatisch)
//   SFX.merge(16);      // speel een geluid

let ctx = null;
let soundOn = true;

// Onthoud de aan/uit-keuze tussen sessies
try {
  soundOn = localStorage.getItem('rsp_sound') !== '0';
} catch (e) {}

export function initAudio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

// Geef de gedeelde AudioContext terug (bv. voor de piano-klanken).
// Zo maken we er nooit meer dan één aan — browsers staan maar een
// beperkt aantal AudioContexts toe.
export function getAudioContext() {
  initAudio();
  return ctx;
}

export function isSoundOn() {
  return soundOn;
}

export function toggleSound() {
  soundOn = !soundOn;
  try {
    localStorage.setItem('rsp_sound', soundOn ? '1' : '0');
  } catch (e) {}
  if (soundOn) {
    initAudio();
    SFX.coin();
  }
  return soundOn;
}

// iOS/Safari laat de voorlees-stem (Web Speech) alleen toe als hij voor het
// eerst binnen een ECHTE DOM-tik wordt aangezwengeld. Phaser verwerkt input in
// zijn eigen lus (net naast die echte tik), dus doen we het hier op window-
// niveau. Eén stil zinnetje "ontgrendelt" de stem voor de rest van de sessie.
let speechPrimed = false;
function primeSpeech() {
  if (speechPrimed) return;
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    synth.speak(u);
    if (synth.getVoices().length) speechPrimed = true; // pas "klaar" als stemmen geladen zijn
  } catch (e) {}
}

// Browsers staan audio pas toe na een gebruikersactie.
// Daarom "ontgrendelen" we de audio + stem bij de eerste aanraking/klik.
if (typeof window !== 'undefined') {
  const unlock = () => { initAudio(); primeSpeech(); };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('touchstart', unlock);
}

// --- Bouwstenen ---
function tone(freq, dur, type = 'sine', vol = 0.2, delay = 0) {
  if (!soundOn || !ctx) return;
  try {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch (e) {}
}

function slide(f1, f2, dur, type = 'sine', vol = 0.2) {
  if (!soundOn || !ctx) return;
  try {
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch (e) {}
}

function noise(dur, vol = 0.15) {
  if (!soundOn || !ctx) return;
  try {
    const t = ctx.currentTime;
    const n = ctx.sampleRate * dur;
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource();
    s.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(g);
    g.connect(ctx.destination);
    s.start(t);
  } catch (e) {}
}

// --- De geluidseffecten ---
export const SFX = {
  // Ballon merge: hogere toon naarmate het getal groter wordt
  merge(n = 2) {
    const base = 300 + Math.min(Math.log2(n) * 60, 700);
    tone(base, 0.1, 'sine', 0.2);
    tone(base * 1.5, 0.12, 'sine', 0.15, 0.05);
  },
  pop() {
    tone(600, 0.06, 'sine', 0.15);
  },
  correct() {
    tone(660, 0.12, 'triangle', 0.25);
    tone(880, 0.16, 'triangle', 0.22, 0.08);
  },
  wrong() {
    slide(200, 120, 0.25, 'sawtooth', 0.18);
  },
  levelup() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.22, i * 0.09));
  },
  click() {
    tone(440, 0.05, 'square', 0.08);
  },
  coin() {
    tone(988, 0.08, 'square', 0.15);
    tone(1319, 0.1, 'square', 0.13, 0.05);
  },
  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.2, 'triangle', 0.22, i * 0.1));
  },
  gameover() {
    slide(400, 100, 0.5, 'sawtooth', 0.18);
  },
  // Vrolijk oplopend "tel-toontje": de toon stijgt met het getal, zodat
  // groeien klinkt als 1-2-3-4 omhoog. Werkt ook op iOS (Web Audio).
  grow(n = 1) {
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5];
    const oct = Math.floor((n - 1) / scale.length);
    const f = scale[(n - 1) % scale.length] * Math.pow(2, oct);
    tone(f, 0.15, 'triangle', 0.22);
    tone(f * 2, 0.10, 'sine', 0.10, 0.05); // glinster
  },
  shrink() {
    slide(440, 240, 0.22, 'triangle', 0.16);
  },
  stomp() {
    tone(190, 0.08, 'square', 0.18);
    tone(120, 0.12, 'sine', 0.14, 0.03);
  },
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', 0.2, i * 0.08));
  },

  // --- Vrolijke, speelse geluidjes voor Getallen-Land ---
  // Optillen: een blij "boing" omhoog.
  pick() {
    slide(280, 560, 0.13, 'sine', 0.18);
    tone(840, 0.06, 'sine', 0.08, 0.1);
  },
  // Neerzetten: zacht plofje.
  place() {
    tone(320, 0.07, 'sine', 0.16);
    tone(210, 0.10, 'sine', 0.12, 0.03);
  },
  // Glinster/sprankel.
  sparkle() {
    tone(1568, 0.08, 'sine', 0.12);
    tone(2093, 0.10, 'sine', 0.10, 0.05);
    tone(2637, 0.08, 'sine', 0.07, 0.1);
  },
  // Samenvoegen: vrolijke klim die hoger klinkt naarmate het nieuwe getal groter is.
  combine(n = 2) {
    const base = 392; // sol
    const f = base * Math.pow(2, Math.min(n, 12) / 12);
    tone(f, 0.12, 'triangle', 0.2);
    tone(f * 1.5, 0.14, 'sine', 0.13, 0.05);
    tone(f * 2, 0.12, 'sine', 0.09, 0.1);
  },
  // Hoera! (puzzel opgelost)
  yay() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, 'triangle', 0.2, i * 0.07));
    tone(1568, 0.3, 'sine', 0.12, 0.42);
  },
  // Vriendelijk "oei" bij een foutje (niet streng).
  oops() {
    slide(440, 300, 0.16, 'triangle', 0.14);
    tone(300, 0.12, 'sine', 0.1, 0.12);
  },
  // Vrolijk "wiebel"-stemmetje als een blokje reageert.
  giggle() {
    tone(700, 0.05, 'sine', 0.12);
    tone(900, 0.05, 'sine', 0.12, 0.06);
    tone(800, 0.05, 'sine', 0.1, 0.12);
  },
};
