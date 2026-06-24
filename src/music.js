// Zachte, vrolijke achtergrondmuziek — opgebouwd met de Web Audio API,
// dus geen mp3-bestanden nodig. Speelt een rustige, herhalende melodie.
// Aan/uit via de instellingen (progress.js) en de muziekknop.

import { getAudioContext } from './sound.js';
import { getSetting } from './progress.js';

let playing = false;
let timer = null;
let masterGain = null;
let step = 0;

// Een vrolijk, rustig deuntje in een pentatonische toonladder (klinkt altijd goed).
// Frequenties (Hz) van de noten; 0 = stilte.
const MELODY = [
  523, 0, 659, 784, 587, 0, 659, 523,
  587, 659, 784, 0, 880, 784, 659, 0,
  523, 587, 659, 784, 880, 0, 784, 659,
  587, 0, 523, 0, 659, 587, 523, 0,
];
const BASS = [131, 131, 165, 165, 147, 147, 175, 175];
const STEP_MS = 320;

function playNote(freq, dur, vol, type) {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.04);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + dur + 0.05);
}

function tick() {
  // Melodie
  const note = MELODY[step % MELODY.length];
  if (note > 0) playNote(note, 0.35, 0.05, 'triangle');
  // Bas (elke 4 stappen)
  if (step % 4 === 0) {
    const b = BASS[(step / 4) % BASS.length];
    playNote(b, 0.6, 0.04, 'sine');
  }
  // Zacht glinster-laagje af en toe
  if (note > 0 && step % 8 === 2) playNote(note * 2, 0.25, 0.02, 'sine');
  step++;
}

export function startMusic() {
  if (playing) return;
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
  timer = setInterval(tick, STEP_MS);
}

export function stopMusic() {
  playing = false;
  if (timer) { clearInterval(timer); timer = null; }
}

export function isMusicPlaying() { return playing; }

// Schakel muziek aan/uit en onthoud niet hier (dat doet de aanroeper via setSetting).
export function setMusicEnabled(on) {
  if (on) startMusic();
  else stopMusic();
}
