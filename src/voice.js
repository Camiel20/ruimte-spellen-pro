// VoiceManager — vrolijke, WOORDLOZE geluids-feedback in plaats van browser-TTS.
//
// Waarom: de browserstem (SpeechSynthesis) klinkt op iPhone/Safari onnatuurlijk
// en stoort de spelervaring. Daarom gebruiken we hier korte, vrolijke Web
// Audio-klankjes (juichjes, lachjes, melodietjes) die overal hetzelfde en
// betrouwbaar klinken — ook op iOS.
//
// MODULAIR voor later: wil je echte ingesproken Nederlandse stemfragmenten?
// Zet ze in `public/voice/` (bv. voice/cheer.mp3) en registreer ze:
//
//     import { Voice } from './voice.js';
//     Voice.registerClip('cheer', 'voice/cheer.mp3');
//     Voice.registerClip('number-5', 'voice/vijf.mp3');
//
// Is er een clip voor een cue, dan speelt die; anders klinkt de Web
// Audio-fallback hieronder. De rest van de game roept alleen `Voice.cue(...)`
// of `Voice.number(n)` aan en hoeft niets te weten van hoe het geluid ontstaat.

import { getAudioContext, isSoundOn } from './sound.js';
import { getSetting, setSetting } from './progress.js';

// naam -> { url, raw: ArrayBuffer, buffer: AudioBuffer } — échte stemclips.
// Ze spelen via Web Audio (niet via <audio>): zo liften ze mee op de bestaande
// iOS-ontgrendeling van de AudioContext (eerste tik) en klinken ze overal.
const clips = {};

function speelClip(c) {
  const ctx = getAudioContext(); if (!ctx || !c.buffer) return false;
  const src = ctx.createBufferSource();
  src.buffer = c.buffer;
  const g = ctx.createGain(); g.gain.value = 0.95;
  src.connect(g); g.connect(ctx.destination);
  src.start();
  return true;
}

function note(freq, t0, dur, { type = 'sine', vol = 0.18, glide = null } = {}) {
  const ctx = getAudioContext(); if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (glide != null) o.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(t0); o.stop(t0 + dur + 0.03);
}

// Een "stemmig" toontje: grondtoon + zachte boventoon geeft een vrolijk,
// vocaal/kinderlijk gevoel zonder echte woorden.
function blip(freq, t0, dur, vol = 0.16, glide = null) {
  note(freq, t0, dur, { type: 'triangle', vol, glide });
  note(freq * 2, t0, dur * 0.7, { type: 'sine', vol: vol * 0.4, glide: glide ? glide * 2 : null });
}

const SCALE = [523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5];

const CUES = {
  welcome(t) { [523, 659, 784].forEach((f, i) => blip(f, t + i * 0.12, 0.18, 0.16)); blip(1047, t + 0.42, 0.24, 0.12); },
  // Telt vrolijk omhoog tot n (klinkt als "1-2-3-…"), als klankvervanger
  // voor het uitspreken van een getal.
  number(t, n) {
    const c = Math.max(1, Math.min(n || 1, 8));
    for (let i = 0; i < c; i++) blip(SCALE[i % SCALE.length], t + i * 0.1, 0.13, 0.14);
    blip(SCALE[c - 1] * 1.5, t + c * 0.1 + 0.02, 0.22, 0.12); // vrolijke afronding
  },
  cheer(t) { [659, 784, 988, 1319].forEach((f, i) => blip(f, t + i * 0.08, 0.16, 0.16)); CUES.laugh(t + 0.42); },
  great(t) { CUES.cheer(t); },
  laugh(t) { for (let i = 0; i < 4; i++) blip(720 + (i % 2) * 190, t + i * 0.085, 0.08, 0.12); },
  oops(t) { blip(440, t, 0.16, 0.13, 300); blip(300, t + 0.14, 0.12, 0.10, 240); },
  star(t) { [1320, 1760, 2100].forEach((f, i) => note(f, t + i * 0.05, 0.1, { type: 'sine', vol: 0.1 })); },
  greet(t) { blip(620, t, 0.13, 0.14, 900); },           // "hoi!" omhoog
  jump(t) { note(300, t, 0.14, { type: 'sine', vol: 0.14, glide: 720 }); },
  yawn(t) { note(520, t, 0.5, { type: 'sine', vol: 0.1, glide: 260 }); },
  pop(t) { note(640, t, 0.06, { type: 'sine', vol: 0.12 }); },
  whee(t) { note(500, t, 0.22, { type: 'triangle', vol: 0.13, glide: 1000 }); },
};

export const Voice = {
  // Registreer een echt stemfragment voor een cue. naam bv. 'cheer' of
  // 'number-5'. url is een pad onder public/, bv. 'voice/vijf.mp3'.
  // De mp3 wordt alvast opgehaald; decoderen gebeurt (lazy) zodra de
  // AudioContext bestaat — die ontstaat pas na de eerste tik (iOS).
  registerClip(name, url) {
    const c = { url, raw: null, buffer: null, decoding: false };
    clips[name] = c;
    fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .then((ab) => { c.raw = ab; })
      .catch(() => {});
  },
  hasClip(name) { return !!clips[name]; },

  // Speel een cue. Echte clip heeft voorrang; anders Web Audio-fallback
  // (ook zolang een clip nog laadt/decodeert — er is dus altijd geluid).
  // UITZONDERING (speeltest): cues die tientallen keren per level klinken
  // (elke stomp, elk bolletje, elke mini-puzzel) blijven ALTIJD een kort
  // jingle-geluidje — een stem die overal "Joepie!" roept wordt irritant.
  // De gesproken feest-woorden ('woord-…') spelen alleen op grote momenten,
  // via het gethrottlede hint-kanaal.
  cue(name, data) {
    if (!isSoundOn()) return;
    const ctx = getAudioContext();
    const clipKey = (name === 'number' && data != null) ? `number-${data}` : name;
    const c = JINGLE_CUES.has(name) ? null : clips[clipKey];
    if (c && ctx) {
      if (c.buffer) { speelClip(c); return; }
      if (c.raw && !c.decoding) {
        c.decoding = true;
        // slice(0): sommige browsers consumeren de ArrayBuffer bij het decoderen
        ctx.decodeAudioData(c.raw.slice(0))
          .then((buf) => { c.buffer = buf; speelClip(c); })
          .catch(() => { c.decoding = false; });
        return;
      }
    }
    if (!ctx) return;
    const fn = CUES[name]; if (!fn) return;
    fn(ctx.currentTime + 0.01, data);
  },

  number(n) { this.cue('number', n); },

  // Als hint(), maar hooguit ÉÉN keer per sessie (bv. "Welkom!" alleen bij
  // het allereerste level, niet bij elke missie).
  hintEens(name, delayMs = 0) {
    if (eensGezegd.has(name)) return;
    eensGezegd.add(name);
    this.hint(name, delayMs);
  },

  // Gesproken HINT (instructie-clips zoals 'hint-deur'). Anders dan cue():
  // - speelt alleen als de clip bestaat (instructies hebben geen jingle-vorm)
  // - GLOBAAL gethrottled (~4s) zodat twee systemen nooit door elkaar praten
  // - optionele delay om netjes NA een number-clip te spreken
  hint(name, delayMs = 0) {
    if (!isSoundOn() || !clips[name]) return;
    const nu = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (nu < hintSlotTot) return; // spreekkanaal bezet → deze hint vervalt
    // Instructie-hints SLIJTEN: na 3× ooit gehoord (over alle sessies heen)
    // snapt het kind het — dan zwijgt de stem. De visuele hulp (tekst,
    // wijs-puls) blijft gewoon werken. Teller pas ná de kanaal-check, zodat
    // een gedropte hint niet meetelt.
    if (name.startsWith('hint-')) {
      const tellers = getSetting('hintTellers') || {};
      if ((tellers[name] || 0) >= 3) return;
      tellers[name] = (tellers[name] || 0) + 1;
      setSetting('hintTellers', tellers);
    }
    hintSlotTot = nu + delayMs + 4000;
    if (delayMs > 0) setTimeout(() => this.cue(name), delayMs);
    else this.cue(name);
  },
};

let hintSlotTot = 0; // tot wanneer het hint-"spreekkanaal" bezet is
const eensGezegd = new Set(); // hintEens: één keer per sessie

// Frequente cues die nooit een pratende clip mogen worden (zie cue()).
const JINGLE_CUES = new Set(['cheer', 'great', 'welcome', 'greet', 'oops', 'laugh']);
