// Hapvis — al het geluid wordt hier ter plekke gesynthetiseerd met de Web
// Audio API. Geen enkel geluidsbestand, dus ook geen download. Browsers staan
// geluid pas toe na een aanraking: de scene roept daarom `ontgrendel()` aan
// bij de eerste invoer.

type Golf = 'sine' | 'triangle' | 'square' | 'sawtooth';

class HapvisGeluid {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

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

  /** Hap: hoe groter de prooi, hoe lager de "blob". */
  hap(prooiRadius: number): void {
    const basis = Math.max(180, 620 - prooiRadius * 9);
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
}

export const Geluid = new HapvisGeluid();
