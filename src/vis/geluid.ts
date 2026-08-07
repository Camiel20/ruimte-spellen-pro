// Hapvis — al het geluid wordt hier ter plekke gesynthetiseerd met de Web
// Audio API. Geen enkel geluidsbestand, dus ook geen download. Browsers staan
// geluid pas toe na een aanraking: de scene roept daarom `ontgrendel()` aan
// bij de eerste invoer.
//
// OPBOUW (herbouw aug 2026, na "het geluid is nog echt slecht"). De eerste
// versie zette kale oscillatoren recht op de uitgang; dat is de klank van een
// goedkope piepgenerator. Vier dingen zijn nu anders:
//
//   1. Elke stem gaat door een FILTER met een eigen envelope. Dat is wat een
//      "toon" in een "geluid" verandert.
//   2. Er is GALM — een impulsrespons die hier zelf gegenereerd wordt (dus nog
//      steeds geen bestand). Onder water hoort alles ruimte te hebben.
//   3. Er is een MIXBUS met een limiter. Zonder dat klipt het zodra er drie
//      dingen tegelijk klinken, en dát is wat "schel" klinkt.
//   4. VARIATIE: elke hap krijgt een willekeurige stemming en een stereopositie
//      die volgt waar het gebeurde. Twintig identieke happen achter elkaar is
//      vermoeiend, ook als het effect op zich goed klinkt.
//
// Signaalweg:  stem → filter → envelope → panner ─┬─ droog ──→ bus
//                                                 └─ send ──→ galm ──→ bus
//              bus → zachte lowpass → limiter → master → speakers

import { SFEER_VOLUME } from './GameConfig';

type Golf = 'sine' | 'triangle' | 'square' | 'sawtooth';
type FilterSoort = 'lowpass' | 'bandpass' | 'highpass';

/** Alle knoppen van één gesynthetiseerde stem. */
interface StemOpties {
  freq: number;
  naar?: number; // eindtoon (glijdend)
  golf?: Golf;
  duur: number; // s
  volume?: number;
  aanslag?: number; // s aanslagtijd
  filter?: number; // Hz begin-kantelpunt
  filterNaar?: number; // Hz eind-kantelpunt
  q?: number;
  soort?: FilterSoort;
  pan?: number; // −1 links … +1 rechts
  galm?: number; // 0..1 hoeveel er naar de galm gaat
  vertraging?: number; // s
  zwerm?: number; // ± centen willekeurige verstemming
}

interface RuisOpties {
  duur: number;
  volume?: number;
  soort?: FilterSoort;
  van?: number; // Hz begin-kantelpunt
  naar?: number; // Hz eind-kantelpunt
  q?: number;
  pan?: number;
  galm?: number;
  vertraging?: number;
}

class HapvisGeluid {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null; // hier komt alle droge signaal binnen
  private galmIn: GainNode | null = null; // send-punt naar de galm

  private sfeerBron: AudioBufferSourceNode | null = null;
  private sfeerGain: GainNode | null = null;
  private sfeerLfo: OscillatorNode | null = null;
  private sfeerDrone: OscillatorNode | null = null;

  /** Maakt (of hervat) de audio-context en de mixbus. Veilig om vaak aan te roepen. */
  ontgrendel(): void {
    if (!this.ctx) {
      const Klasse =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Klasse) return;
      try {
        const ctx = new Klasse();
        this.ctx = ctx;

        this.master = ctx.createGain();
        this.master.gain.value = 0.9;
        this.master.connect(ctx.destination);

        // Limiter: vangt op wat er gebeurt als hap + alarm + combo samenvallen.
        // Zonder dit telt alles bij elkaar op tot boven 1 en klinkt het schel.
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -6;
        limiter.knee.value = 6;
        limiter.ratio.value = 8;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.18;
        limiter.connect(this.master);

        // Zachte lowpass over alles: haalt de scherpe randjes eraf en past bij
        // een spel dat onder water speelt.
        const zacht = ctx.createBiquadFilter();
        zacht.type = 'lowpass';
        zacht.frequency.value = 8200;
        zacht.Q.value = 0.4;
        zacht.connect(limiter);

        this.bus = ctx.createGain();
        this.bus.gain.value = 1;
        this.bus.connect(zacht);

        // Galm-tak. De impulsrespons wordt hier gegenereerd (geen bestand).
        const galm = ctx.createConvolver();
        galm.buffer = this.maakImpuls(ctx, 1.9);
        const galmUit = ctx.createGain();
        galmUit.gain.value = 0.5;
        galm.connect(galmUit);
        galmUit.connect(zacht);

        this.galmIn = ctx.createGain();
        this.galmIn.gain.value = 1;
        this.galmIn.connect(galm);
      } catch {
        this.ctx = null; // geen audio beschikbaar: het spel speelt gewoon door
        return;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /**
   * Impulsrespons voor de galm: ruis die uitdooft, per kanaal apart (dat geeft
   * breedte) en met een simpele één-pols lowpass zodat de staart dof is in
   * plaats van sissend — precies het verschil tussen "een ruimte" en "witte ruis".
   */
  private maakImpuls(ctx: AudioContext, duur: number): AudioBuffer {
    const lengte = Math.floor(ctx.sampleRate * duur);
    const buffer = ctx.createBuffer(2, lengte, ctx.sampleRate);
    for (let kanaal = 0; kanaal < 2; kanaal++) {
      const data = buffer.getChannelData(kanaal);
      let vorige = 0;
      for (let i = 0; i < lengte; i++) {
        const t = i / lengte;
        const ruis = Math.random() * 2 - 1;
        vorige = vorige * 0.72 + ruis * 0.28; // dempt de hoge tonen
        data[i] = vorige * Math.pow(1 - t, 2.6);
      }
    }
    return buffer;
  }

  /** Koppelt een stem aan de bus, met een aandeel naar de galm. */
  private verbind(bron: AudioNode, pan: number, galm: number): void {
    if (!this.ctx || !this.bus) return;
    let uit: AudioNode = bron;
    // StereoPanner ontbreekt op heel oude Safari; dan gewoon mono verder.
    if (pan !== 0 && typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.value = Math.max(-1, Math.min(1, pan));
      uit.connect(panner);
      uit = panner;
    }
    uit.connect(this.bus);
    if (galm > 0 && this.galmIn) {
      const send = this.ctx.createGain();
      send.gain.value = galm;
      uit.connect(send);
      send.connect(this.galmIn);
    }
  }

  /** Eén oscillator-stem met filter- en volume-envelope. */
  private stem(o: StemOpties): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const start = ctx.currentTime + (o.vertraging ?? 0);
    const duur = o.duur;
    const volume = o.volume ?? 0.5;
    const aanslag = Math.min(o.aanslag ?? 0.008, duur * 0.4);

    const osc = ctx.createOscillator();
    osc.type = o.golf ?? 'sine';
    osc.frequency.setValueAtTime(o.freq, start);
    if (o.naar !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.naar), start + duur);
    }
    // Kleine willekeurige verstemming: hierdoor klinkt de twintigste hap niet
    // exact als de eerste. Dat is het verschil tussen "effect" en "gezeur".
    if (o.zwerm) osc.detune.setValueAtTime((Math.random() * 2 - 1) * o.zwerm, start);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + aanslag);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duur);

    let keten: AudioNode = osc;
    if (o.filter !== undefined) {
      const filter = ctx.createBiquadFilter();
      filter.type = o.soort ?? 'lowpass';
      filter.Q.value = o.q ?? 1;
      filter.frequency.setValueAtTime(o.filter, start);
      if (o.filterNaar !== undefined) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(20, o.filterNaar), start + duur);
      }
      osc.connect(filter);
      keten = filter;
    }
    keten.connect(gain);
    this.verbind(gain, o.pan ?? 0, o.galm ?? 0);

    osc.start(start);
    osc.stop(start + duur + 0.03);
  }

  /** Gefilterde ruispuls — de basis van plonzen, happen en zwiepen. */
  private ruis(o: RuisOpties): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const start = ctx.currentTime + (o.vertraging ?? 0);
    const duur = o.duur;
    const lengte = Math.max(1, Math.floor(ctx.sampleRate * duur));

    const buffer = ctx.createBuffer(1, lengte, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < lengte; i++) data[i] = Math.random() * 2 - 1;

    const bron = ctx.createBufferSource();
    bron.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = o.soort ?? 'lowpass';
    filter.Q.value = o.q ?? 1;
    filter.frequency.setValueAtTime(o.van ?? 1200, start);
    if (o.naar !== undefined) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(20, o.naar), start + duur);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(o.volume ?? 0.15, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duur);

    bron.connect(filter);
    filter.connect(gain);
    this.verbind(gain, o.pan ?? 0, o.galm ?? 0);
    bron.start(start);
  }

  // ── Spelgeluiden ──────────────────────────────────────────────────────────

  /**
   * Hap. Twee lagen: een korte "beet" (bandpass-ruis die naar beneden veegt) en
   * een "body"-toon die met de prooigrootte meezakt. `comboStijging` (Hz, uit
   * `comboToonStijging`) tilt de toonhoogte op bij een reeks; `pan` volgt waar
   * het gebeurde, zodat happen links en rechts van je verschillen.
   */
  hap(prooiRadius: number, comboStijging = 0, pan = 0): void {
    const basis = Math.max(160, 500 - prooiRadius * 7) + comboStijging;
    this.ruis({ duur: 0.07, volume: 0.75, soort: 'bandpass', van: 1900, naar: 480, q: 1.2, pan, galm: 0.12 });
    this.stem({
      freq: basis, naar: basis * 0.42, golf: 'triangle', duur: 0.16, volume: 1.6,
      filter: basis * 4, filterNaar: basis * 1.8, q: 2, pan, galm: 0.16, zwerm: 40,
    });
  }

  /** Nieuwe evolutiefase: warme opgaande drieklank met een lage bodem. */
  fase(): void {
    [523, 659, 784, 1047].forEach((f, i) => {
      this.stem({
        freq: f, golf: 'triangle', duur: 0.5, volume: 0.38, aanslag: 0.015,
        filter: f * 5, filterNaar: f * 1.6, q: 1.2, galm: 0.5, vertraging: i * 0.085,
        pan: (i - 1.5) * 0.12,
      });
    });
    this.stem({ freq: 131, golf: 'sine', duur: 0.9, volume: 0.42, filter: 400, galm: 0.4 });
  }

  /** Zwiep: ruis die door de banden omhoog veegt, plus een lage duw. */
  boost(): void {
    this.ruis({ duur: 0.3, volume: 0.6, soort: 'bandpass', van: 320, naar: 2300, q: 1.6, galm: 0.2 });
    this.stem({ freq: 150, naar: 90, golf: 'sine', duur: 0.24, volume: 0.8, filter: 300 });
  }

  /** Kwal-contact: zachte, doffe "au" — geen blokgolf meer. */
  au(): void {
    this.stem({
      freq: 330, naar: 165, golf: 'triangle', duur: 0.32, volume: 0.9,
      filter: 900, filterNaar: 260, q: 3, galm: 0.3,
    });
  }

  /** Opgegeten worden: alles zakt weg, met veel galm. */
  dood(): void {
    this.stem({
      freq: 360, naar: 70, golf: 'triangle', duur: 0.9, volume: 0.9,
      filter: 1400, filterNaar: 180, q: 2, galm: 0.6,
    });
    this.ruis({ duur: 0.6, volume: 0.34, soort: 'lowpass', van: 900, naar: 120, galm: 0.5 });
  }

  /** Nieuw record: helder klokkenspel. */
  record(): void {
    [659, 784, 988, 1319].forEach((f, i) => {
      this.stem({
        freq: f, golf: 'sine', duur: 0.75, volume: 0.4, aanslag: 0.006,
        filter: f * 4, filterNaar: f * 1.5, galm: 0.6, vertraging: i * 0.1,
        pan: (i - 1.5) * 0.2,
      });
    });
  }

  /** Knop/overlay-tik: kort en zacht, niet klikkerig. */
  knop(): void {
    this.stem({ freq: 620, naar: 880, golf: 'sine', duur: 0.09, volume: 0.6, filter: 2200, galm: 0.1 });
  }

  /**
   * Luchtbelletje. Een echte bel is een sine die SNEL OMHOOG glijdt — dat is
   * het hele geheim; met een dalende toon klinkt het als een druppel in een gootsteen.
   */
  bel(pan = 0): void {
    const f = 420 + Math.random() * 360;
    this.stem({
      freq: f, naar: f * 2.9, golf: 'sine', duur: 0.075, volume: 0.6,
      aanslag: 0.004, filter: 4000, galm: 0.35, pan,
    });
  }

  // ── Leesbaar gevaar (§10.1) ───────────────────────────────────────────────

  /** Een jager heeft je in het vizier: laag en dreigend, geen alarmpiep. */
  gespot(pan = 0): void {
    this.stem({
      freq: 233, golf: 'sawtooth', duur: 0.16, volume: 0.3,
      filter: 700, filterNaar: 420, q: 5, galm: 0.25, pan,
    });
    this.stem({
      freq: 185, golf: 'sawtooth', duur: 0.24, volume: 0.3, vertraging: 0.13,
      filter: 620, filterNaar: 340, q: 5, galm: 0.3, pan,
    });
  }

  /** De jacht is afgebroken: zacht en opgelucht, bewust nauwelijks hoorbaar. */
  opgeven(pan = 0): void {
    this.stem({
      freq: 440, naar: 294, golf: 'sine', duur: 0.26, volume: 0.24,
      filter: 1200, galm: 0.35, pan,
    });
  }

  // ── Luchtbelschild (§10.2) ────────────────────────────────────────────────

  /** De bel klapt: een echte plof — korte resonante knal plus een dalende staart. */
  schildKlap(): void {
    this.ruis({ duur: 0.06, volume: 1.2, soort: 'bandpass', van: 1700, naar: 300, q: 3.5, galm: 0.25 });
    this.stem({
      freq: 620, naar: 150, golf: 'triangle', duur: 0.34, volume: 1.3,
      filter: 1600, filterNaar: 250, q: 2.5, galm: 0.45,
    });
  }

  /** Nieuw schild verdiend: twee opborrelende belletjes en een zacht klokje. */
  schildTerug(): void {
    this.bel(-0.2);
    this.bel(0.25);
    this.stem({
      freq: 784, golf: 'sine', duur: 0.55, volume: 0.4, vertraging: 0.1,
      filter: 3000, filterNaar: 1200, galm: 0.55,
    });
  }

  // ── Gouden nul (§10.5) ────────────────────────────────────────────────────

  /** Gouden nul: klokkenspel met wat onzuivere boventonen, dus echt "goud". */
  nul(): void {
    [1046, 1319, 1580, 2093].forEach((f, i) => {
      this.stem({
        freq: f, golf: 'sine', duur: 0.9 - i * 0.12, volume: 0.32, aanslag: 0.004,
        filter: f * 3, galm: 0.65, vertraging: i * 0.055, zwerm: 12,
        pan: (i - 1.5) * 0.18,
      });
    });
  }

  // ── Gebeurtenissen (§10.3) ────────────────────────────────────────────────

  /** Aankondiging; de sfeer bepaalt of het vrolijk, rustig of dreigend klinkt. */
  gebeurtenis(sfeer: 'blij' | 'rustig' | 'spannend'): void {
    if (sfeer === 'blij') {
      [523, 659, 784].forEach((f, i) => {
        this.stem({
          freq: f, golf: 'triangle', duur: 0.42, volume: 0.4,
          filter: f * 4, filterNaar: f * 1.6, galm: 0.45, vertraging: i * 0.075,
          pan: (i - 1) * 0.22,
        });
      });
    } else if (sfeer === 'rustig') {
      this.stem({ freq: 392, golf: 'sine', duur: 1.1, volume: 0.34, filter: 1400, galm: 0.7 });
      this.stem({ freq: 294, golf: 'sine', duur: 1.4, volume: 0.3, filter: 900, galm: 0.7, vertraging: 0.16 });
    } else {
      // Twee licht verstemde zagen door een resonant filter: onrustig, maar
      // laag genoeg om niet in de oren te snijden.
      this.stem({
        freq: 98, golf: 'sawtooth', duur: 1.0, volume: 0.34,
        filter: 220, filterNaar: 520, q: 7, galm: 0.4,
      });
      this.stem({
        freq: 98, golf: 'sawtooth', duur: 1.0, volume: 0.3, zwerm: 0,
        filter: 240, filterNaar: 540, q: 7, galm: 0.4, pan: 0.3,
      });
      this.stem({ freq: 65, golf: 'sine', duur: 1.2, volume: 0.42, filter: 200, galm: 0.3 });
    }
  }

  // ── Onderwatersfeer (§10.4) ───────────────────────────────────────────────

  /**
   * Zachte onderwater-bedding: laag gefilterde bruine ruis met een trage
   * golfbeweging op het filter, plus een heel lage sinus als "body". Geen
   * bestand — de ruis wordt hier gemaakt. Het einde van de lus wordt over het
   * begin gemengd, anders klikt hij elke paar seconden hoorbaar.
   */
  startSfeer(): void {
    this.ontgrendel();
    if (!this.ctx || !this.bus || this.sfeerBron) return;
    try {
      const ctx = this.ctx;
      const sr = ctx.sampleRate;
      const lengte = Math.floor(sr * 4);
      const overlap = Math.floor(lengte * 0.1);
      const ruw = new Float32Array(lengte + overlap);
      let vorige = 0;
      for (let i = 0; i < ruw.length; i++) {
        vorige = (vorige + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        ruw[i] = vorige * 3.5;
      }
      for (let i = 0; i < overlap; i++) {
        const t = i / overlap;
        ruw[i] = ruw[i] * t + ruw[lengte + i] * (1 - t);
      }
      const buffer = ctx.createBuffer(1, lengte, sr);
      buffer.getChannelData(0).set(ruw.subarray(0, lengte));

      const bron = ctx.createBufferSource();
      bron.buffer = buffer;
      bron.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 260;
      filter.Q.value = 0.6;

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.06;
      lfoGain.gain.value = 80;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      gain.gain.exponentialRampToValueAtTime(SFEER_VOLUME, ctx.currentTime + 2);

      bron.connect(filter);
      filter.connect(gain);
      gain.connect(this.bus);
      bron.start();
      lfo.start();

      // Heel lage bodem: geeft het water gewicht zonder hoorbare toon.
      const drone = ctx.createOscillator();
      const droneGain = ctx.createGain();
      drone.type = 'sine';
      drone.frequency.value = 48;
      droneGain.gain.value = SFEER_VOLUME * 0.55;
      drone.connect(droneGain);
      droneGain.connect(this.bus);
      drone.start();

      this.sfeerBron = bron;
      this.sfeerGain = gain;
      this.sfeerLfo = lfo;
      this.sfeerDrone = drone;
    } catch {
      this.stopSfeer(); // half opgebouwde keten weer opruimen
    }
  }

  /** Zet de sfeer uit (pauze, sterven, scene verlaten). Veilig zonder sfeer. */
  stopSfeer(): void {
    for (const knoop of [this.sfeerBron, this.sfeerLfo, this.sfeerDrone]) {
      try {
        knoop?.stop();
      } catch {
        // al gestopt
      }
      knoop?.disconnect();
    }
    this.sfeerGain?.disconnect();
    this.sfeerBron = null;
    this.sfeerGain = null;
    this.sfeerLfo = null;
    this.sfeerDrone = null;
  }
}

export const Geluid = new HapvisGeluid();
