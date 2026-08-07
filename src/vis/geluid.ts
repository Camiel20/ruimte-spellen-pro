// Hapvis — al het geluid wordt hier ter plekke gesynthetiseerd met de Web
// Audio API. Geen enkel geluidsbestand, dus ook geen download. Browsers staan
// geluid pas toe na een aanraking: de scene roept daarom `ontgrendel()` aan
// bij de eerste invoer.

import { SFEER_VOLUME } from './GameConfig';

type Golf = 'sine' | 'triangle' | 'square' | 'sawtooth';

class HapvisGeluid {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfeerBron: AudioBufferSourceNode | null = null;
  private sfeerGain: GainNode | null = null;
  private sfeerLfo: OscillatorNode | null = null;

  /** Maakt (of hervat) de audio-context. Veilig om vaak aan te roepen. */
  ontgrendel(): void {
    if (!this.ctx) {
      const Klasse =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Klasse) return;
      try {
        this.ctx = new Klasse();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.5;
        this.master.connect(this.ctx.destination);
      } catch {
        this.ctx = null; // geen audio beschikbaar: het spel speelt gewoon door
        return;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /** Eén toon met aanzwellen/uitsterven; optioneel glijdend naar een eindtoon. */
  private toon(
    freq: number,
    duur: number,
    golf: Golf = 'sine',
    volume = 0.3,
    naarFreq?: number,
    vertraging = 0,
  ): void {
    if (!this.ctx || !this.master) return;
    const start = this.ctx.currentTime + vertraging;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = golf;
    osc.frequency.setValueAtTime(freq, start);
    if (naarFreq !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(1, naarFreq), start + duur);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.02, duur * 0.3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duur + 0.02);
  }

  /** Korte ruispuls (voor bruis en de plons van een hap). */
  private ruis(duur: number, volume = 0.2, hoogdoorlaat = 700): void {
    if (!this.ctx || !this.master) return;
    const lengte = Math.floor(this.ctx.sampleRate * duur);
    const buffer = this.ctx.createBuffer(1, Math.max(1, lengte), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const bron = this.ctx.createBufferSource();
    bron.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = hoogdoorlaat;
    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    bron.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    bron.start();
  }

  /**
   * Hap: hoe groter de prooi, hoe lager de "blob". `comboStijging` (Hz, uit
   * `comboToonStijging`) tilt de toon op bij een reeks — dat is wat een combo
   * hoorbaar maakt zonder dat je hoeft te kunnen lezen.
   */
  hap(prooiRadius: number, comboStijging = 0): void {
    const basis = Math.max(180, 620 - prooiRadius * 9) + comboStijging;
    this.toon(basis, 0.12, 'triangle', 0.32, basis * 0.55);
    this.ruis(0.08, 0.12, 900);
  }

  /** Nieuwe evolutiefase: klein opgaand fanfaretje. */
  fase(): void {
    [523, 659, 784, 1047].forEach((f, i) => this.toon(f, 0.22, 'triangle', 0.3, undefined, i * 0.09));
  }

  /** Boost: korte bruis-zwiep. */
  boost(): void {
    this.toon(220, 0.25, 'sawtooth', 0.14, 520);
    this.ruis(0.22, 0.1, 500);
  }

  /** Kwal-contact: zachte "au". */
  au(): void {
    this.toon(300, 0.28, 'square', 0.18, 140);
  }

  /** Opgegeten worden: dalende toon. */
  dood(): void {
    this.toon(420, 0.7, 'triangle', 0.3, 90);
    this.ruis(0.35, 0.12, 300);
  }

  /** Nieuw record op de eindkaart. */
  record(): void {
    [659, 784, 988, 1319].forEach((f, i) => this.toon(f, 0.3, 'sine', 0.26, undefined, i * 0.11));
  }

  /** Knop/overlay-tik. */
  knop(): void {
    this.toon(660, 0.07, 'square', 0.16);
  }

  /** Belletje bij het opduiken van een luchtbel. */
  bel(): void {
    this.toon(880 + Math.random() * 300, 0.09, 'sine', 0.08, 1500);
  }

  // ── Leesbaar gevaar (§10.1) ───────────────────────────────────────────────

  /** Een jager heeft je in het vizier: twee korte, dringende blips. */
  gespot(): void {
    this.toon(392, 0.09, 'square', 0.13);
    this.toon(330, 0.11, 'square', 0.13, undefined, 0.1);
  }

  /** De jacht is afgebroken: opgelucht aflopend toontje. */
  opgeven(): void {
    this.toon(520, 0.18, 'sine', 0.11, 320);
  }

  // ── Luchtbelschild (§10.2) ────────────────────────────────────────────────

  /** De bel klapt: plof met een dalende staart. */
  schildKlap(): void {
    this.ruis(0.14, 0.16, 400);
    this.toon(520, 0.3, 'square', 0.2, 130);
  }

  /** Nieuw schild verdiend: opborrelend belletje. */
  schildTerug(): void {
    this.toon(420, 0.16, 'sine', 0.16, 880);
    this.toon(1046, 0.22, 'sine', 0.12, undefined, 0.13);
  }

  // ── Gouden nul (§10.5) ────────────────────────────────────────────────────

  /** Gouden nul opgepikt: kort glinsterend drieklankje. */
  nul(): void {
    [1046, 1319, 1568].forEach((f, i) => this.toon(f, 0.16, 'sine', 0.2, undefined, i * 0.06));
  }

  // ── Gebeurtenissen (§10.3) ────────────────────────────────────────────────

  /** Aankondiging; de sfeer bepaalt of het vrolijk, rustig of dreigend klinkt. */
  gebeurtenis(sfeer: 'blij' | 'rustig' | 'spannend'): void {
    if (sfeer === 'blij') {
      [523, 659, 784].forEach((f, i) => this.toon(f, 0.2, 'triangle', 0.24, undefined, i * 0.08));
    } else if (sfeer === 'rustig') {
      this.toon(392, 0.5, 'sine', 0.16);
      this.toon(294, 0.6, 'sine', 0.13, undefined, 0.12);
    } else {
      this.toon(196, 0.4, 'sawtooth', 0.13, 147);
      this.toon(165, 0.5, 'square', 0.1, undefined, 0.16);
    }
  }

  // ── Onderwatersfeer (§10.4) ───────────────────────────────────────────────

  /**
   * Zachte, laaggefilterde ruis-drone. Geen bestand: de bruine ruis wordt hier
   * gegenereerd en in een lus afgespeeld. Het einde wordt over het begin
   * gemengd, anders klikt de lus elke paar seconden hoorbaar.
   */
  startSfeer(): void {
    this.ontgrendel();
    if (!this.ctx || !this.master || this.sfeerBron) return;
    try {
      const sr = this.ctx.sampleRate;
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
      const buffer = this.ctx.createBuffer(1, lengte, sr);
      buffer.getChannelData(0).set(ruw.subarray(0, lengte));

      const bron = this.ctx.createBufferSource();
      bron.buffer = buffer;
      bron.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 340;
      filter.Q.value = 0.7;

      // Trage golfbeweging op de filter: het water "ademt".
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.08;
      lfoGain.gain.value = 90;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const gain = this.ctx.createGain();
      gain.gain.value = 0.0001;
      gain.gain.exponentialRampToValueAtTime(SFEER_VOLUME, this.ctx.currentTime + 1.5);

      bron.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      bron.start();
      lfo.start();

      this.sfeerBron = bron;
      this.sfeerGain = gain;
      this.sfeerLfo = lfo;
    } catch {
      this.stopSfeer(); // half opgebouwde keten weer opruimen
    }
  }

  /** Zet de drone uit (pauze, sterven, scene verlaten). Veilig zonder drone. */
  stopSfeer(): void {
    try {
      this.sfeerBron?.stop();
    } catch {
      // al gestopt
    }
    this.sfeerBron?.disconnect();
    this.sfeerGain?.disconnect();
    try {
      this.sfeerLfo?.stop();
    } catch {
      // al gestopt
    }
    this.sfeerLfo?.disconnect();
    this.sfeerBron = null;
    this.sfeerGain = null;
    this.sfeerLfo = null;
  }
}

export const Geluid = new HapvisGeluid();
