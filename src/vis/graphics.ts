// Hapvis — alle beeld komt hiervandaan. Nog steeds 100% code (geen enkel
// binair bestand), maar getekend op een 2D-canvas in plaats van met
// Phaser-vormen: canvas geeft verlopen, glans, zachte schaduwen en vloeiende
// bezier-vinnen, en dat is precies het verschil tussen "platte vlakjes" en de
// glimmende look van een moderne mobiele vissengame.
//
// Alles wordt één keer naar een texture gebakken; daarna zijn het gewone
// Images. Vissen kijken naar RECHTS (+x); de scene draait ze.

import Phaser from 'phaser';
import { SOORTEN, VIGNET_KERN, VIGNET_STRAAL, type SoortId } from './GameConfig';

/**
 * Textures worden iets groter getekend dan ze getoond worden, zodat ze bij het
 * draaien glad blijven. 1,6 is de balans tussen scherpte en videogeheugen —
 * op 2 kostte de hele set 27 MB, wat te veel is voor een gewone telefoon.
 */
export const SUPERSAMPLE = 1.6;
export const TEX_SCHAAL = 1 / SUPERSAMPLE;

/**
 * Grote vissen hoeven niet zo zwaar gesupersampled te worden: ze zijn in
 * pixels toch al groot. Zo blijft de hele set (17 soorten × 3 standen + 5
 * spelerfases) rond de 12 MB videogeheugen in plaats van ver daarboven.
 */
function superSampleVoor(radius: number): number {
  if (radius <= 12) return 2;
  if (radius <= 25) return 1.5;
  if (radius <= 40) return 1.2;
  return 1;
}

/** Schaal waarop een vis-texture getoond moet worden (hoort bij superSampleVoor). */
export function texSchaalVoor(radius: number): number {
  return 1 / superSampleVoor(radius);
}
/**
 * De vis wordt iets groter getekend dan zijn botsingsradius. Puur beeld: de
 * eetregel blijft op de radius uit GameConfig werken, maar de vissen vullen
 * het scherm zo veel prettiger (en lezen beter op een telefoon).
 */
export const VIS_SCHAAL = 1.4;

/** Aantal staartslag-frames per vis en de snelheid ervan (art, geen speltuning). */
export const ANIM_FRAMES = 4;
export const ANIM_FPS = 9;

/**
 * De staartslag loopt 0 → uit → 0 → in. Stand 2 is identiek aan stand 0, dus
 * er worden maar drie textures gebakken; frame 2 wijst naar dezelfde.
 */
const FRAME_NAAR_TEXTUUR = [0, 1, 0, 2];
export const UNIEKE_FRAMES = 3;
/** Staartslag-hoek (−1..1) per gebakken texture. */
export const FRAME_SLAG = [0, 1, -1];

export const TEX = {
  // `soort`/`speler` nemen een ANIMATIE-frame (0..3) en vertalen dat naar de
  // gebakken textuur; `soortTex`/`spelerTex` nemen het TEXTUUR-nummer (0..2)
  // en worden alleen bij het bakken gebruikt. Ze door elkaar halen levert
  // ontbrekende textures op.
  soortTex: (id: SoortId, tex: number) => `hv_${id}_${tex}`,
  spelerTex: (fase: number, tex: number) => `hv_speler_${fase}_${tex}`,
  soort: (id: SoortId, frame = 0) => `hv_${id}_${FRAME_NAAR_TEXTUUR[frame] ?? 0}`,
  speler: (fase: number, frame = 0) => `hv_speler_${fase}_${FRAME_NAAR_TEXTUUR[frame] ?? 0}`,
  bubbel: 'hv_bubbel',
  plankton: 'hv_plankton',
  vignet: 'hv_vignet',
  hap: 'hv_hap',
  stralen: 'hv_stralen',
  verVer: 'hv_bg_ver',
  verMid: 'hv_bg_mid',
  stickBasis: 'hv_stick_basis',
  stickDuim: 'hv_stick_duim',
  boostKnop: 'hv_boost',
  caustiek: 'hv_caustiek',
  boek: (id: SoortId) => `hv_boek_${id}`,
  alarm: 'hv_alarm',
  schild: 'hv_schild',
  nul: 'hv_nul',
  ring: 'hv_ring',
} as const;

/**
 * Waar de waterkleur naartoe getrokken wordt tijdens een gebeurtenis (§10.3):
 * de stilte klaart op naar wit, de jachttijd zakt weg naar diep marineblauw.
 * Kleuren = art, dus hier en niet in GameConfig; hoevéél er gemengd wordt is
 * wél tuning (STILTE_LICHT / JACHT_DONKER).
 */
export const GEBEURTENIS_LICHT = 0xffffff;
export const GEBEURTENIS_DONKER = 0x02132b;

/** Het "ploffen" van de speler bij een nieuwe fase: animatie, geen speltuning. */
export const FASE_POP_DUUR = 0.32; // s
export const FASE_POP_KRACHT = 0.35; // aandeel extra schaal op het hoogtepunt

/** Achtergrondkleuren per dieptezone (boven → onder). */
export const ZONE_LUCHT: [number, number][] = [
  [0x86eaf5, 0x1fa4dd], // 1 Riffel-rif — zonnig turkoois
  [0x1f8ecd, 0x0d5f9e], // 2 Open Blauw
  [0x0e4f8c, 0x072f5c], // 3 Schemerlaag
  [0x05203d, 0x01070d], // 4 Inktdiepte
];

interface Palet {
  basis: string; // hoofdkleur
  licht: string; // rug-/glanskleur
  donker: string; // schaduw onderin
  buik: string; // lichte buik
  vin: string; // vinnen en staart (mag doorschijnend ogen)
  accent: string; // strepen/stippen
}

/** Spelerkleuren; id's komen uit GameConfig.KLEUR_UNLOCKS. */
export const KLEUREN: Record<string, Palet> = {
  oranje: { basis: '#ff9f1c', licht: '#ffc46b', donker: '#c96a00', buik: '#ffe6bd', vin: '#ff7b00', accent: '#ffffff' },
  groen: { basis: '#2ec4b6', licht: '#7fe6dc', donker: '#0d7d72', buik: '#d6fff9', vin: '#12a596', accent: '#ffffff' },
  paars: { basis: '#b388eb', licht: '#dcc7ff', donker: '#6d3fb0', buik: '#f3e9ff', vin: '#8f5fd8', accent: '#ffffff' },
  goud: { basis: '#ffd60a', licht: '#fff3b0', donker: '#c79a00', buik: '#fffbe0', vin: '#f2b705', accent: '#ffffff' },
};

/** Hoofdkleur van een spelerkleur als getal — voor de keuzerij in de overlay. */
export function kleurNummer(id: string): number {
  const p = KLEUREN[id] ?? KLEUREN.oranje;
  return parseInt(p.basis.slice(1), 16);
}

/**
 * Het uiterlijk van elke soort: palet + de schakelaars die zijn silhouet
 * bepalen. Elke zone heeft zo een eigen cast die je van ver uit elkaar houdt.
 */
const SOORT_STIJL: Record<SoortId, VisStijl> = {
  // ── zone 1: zonnig rif ────────────────────────────────────────────────────
  pijltje:   { basis: '#ff7eb6', licht: '#ffc2e0', donker: '#c43f83', buik: '#fff0f8', vin: '#ff4fa3', accent: '#ffffff',
               vormSlank: true, staartPunt: true },
  vlokje:    { basis: '#ffd166', licht: '#ffe9a8', donker: '#d38b1f', buik: '#fff6dc', vin: '#f4a261', accent: '#ffffff' },
  stipje:    { basis: '#61c8ec', licht: '#b3ecff', donker: '#1c7fa8', buik: '#e7faff', vin: '#219ebc', accent: '#ffffff',
               stippen: true },
  pruillip:  { basis: '#2fd4b8', licht: '#9cf3e2', donker: '#0e8f7d', buik: '#eafff9', vin: '#00b39b', accent: '#ffe08a',
               vormHoog: true, lippen: true },
  // ── zone 2: open blauw ────────────────────────────────────────────────────
  flapper:   { basis: '#8fd14f', licht: '#cdf0a0', donker: '#4e8f2a', buik: '#f0ffdc', vin: '#43aa8b', accent: '#ffffff',
               strepen: 3 },
  maantje:   { basis: '#e8eef7', licht: '#ffffff', donker: '#8ea3bd', buik: '#fffef8', vin: '#ffc93c', accent: '#2a3a57',
               vormHoog: true, zadel: true },
  snapper:   { basis: '#f0645a', licht: '#ffa79f', donker: '#9c1f18', buik: '#ffdedb', vin: '#c1121f', accent: '#ffe0b3',
               roofdier: true },
  pijlbek:   { basis: '#c4763a', licht: '#e9a566', donker: '#6f3c17', buik: '#ffe3bd', vin: '#93511f', accent: '#ffd24d',
               roofdier: true, vormSlank: true, snuitLang: true },
  // ── zone 3: schemerlaag ───────────────────────────────────────────────────
  zilverpijl: { basis: '#9fb9d4', licht: '#e9f5ff', donker: '#52708f', buik: '#f6fbff', vin: '#7d9cbd', accent: '#cdf3ff',
               vormSlank: true, staartSikkel: true },
  bolwang:   { basis: '#cf8b3f', licht: '#f2c078', donker: '#7f4a15', buik: '#ffe8c2', vin: '#a9631f', accent: '#fff0c4',
               vormHoog: true, lippen: true },
  grombaars: { basis: '#8f5be0', licht: '#c8a6ff', donker: '#4b1e91', buik: '#e8d9ff', vin: '#5a189a', accent: '#ffd166',
               roofdier: true, strepen: 3 },
  prikbek:   { basis: '#1f7d80', licht: '#57b8b5', donker: '#0a3f45', buik: '#bfe9e2', vin: '#0f5c60', accent: '#ffb703',
               roofdier: true, snuitLang: true, rugkam: true },
  // ── zone 4: inktdiepte ────────────────────────────────────────────────────
  fonkeltje: { basis: '#343a5c', licht: '#5f68a8', donker: '#171a2e', buik: '#8a93c8', vin: '#454d7e', accent: '#ffb763',
               vormHoog: true, gloedstippen: true },
  snorrebol: { basis: '#3d63d6', licht: '#82a4ff', donker: '#17307e', buik: '#cfe0ff', vin: '#2b49a8', accent: '#d9e8ff',
               snorharen: true, lippen: true },
  diepteschrik: { basis: '#2b3358', licht: '#4d5a91', donker: '#0a0e1f', buik: '#3a4370', vin: '#161b33', accent: '#7cf5d5',
               roofdier: true, boosOog: true },
  hengelbek: { basis: '#1c3f4a', licht: '#35707f', donker: '#0a1a20', buik: '#5b93a3', vin: '#12303a', accent: '#cfefff',
               roofdier: true, lampje: true, staartSikkel: true, vlekken: true },
  kwal:      { basis: '#e0aaff', licht: '#f6e4ff', donker: '#9d4edd', buik: '#ffffff', vin: '#c77dff', accent: '#ffffff' },
};

interface VisStijl extends Palet {
  roofdier?: boolean; // hoekige snuit, tanden, boze wenkbrauw
  strepen?: number;
  stippen?: boolean;
  stekels?: boolean; // skin "stekelbaars"
  gloed?: boolean; // skin "neonvisje"
  boosOog?: boolean; // klein fel oog (Diepteschrik)
  // ── silhouet-schakelaars: hiermee verschillen de soorten van ver ──────────
  vormSlank?: boolean; // lang en dun
  vormHoog?: boolean; // plat en hoog (schijfvorm)
  snuitLang?: boolean; // uitstekende punt vooraan
  lippen?: boolean; // dikke tuitlippen
  snorharen?: boolean; // voelsprieten onder de kop
  lampje?: boolean; // lichtgevend bolletje aan een steeltje
  vlekken?: boolean; // grote onregelmatige vlekken
  zadel?: boolean; // brede dwarsband over de rug
  staartSikkel?: boolean; // diep gevorkte snelle staart
  staartPunt?: boolean; // spitse staart
  rugkam?: boolean; // getande kam over de rug
  gloedstippen?: boolean; // lichtgevende stippen langs de rand
}

type Tekenaar = (ctx: CanvasRenderingContext2D) => void;

/** Maakt (of vervangt) een canvas-texture en laat de tekenfunctie erop los. */
function canvasTextuur(
  scene: Phaser.Scene,
  key: string,
  breed: number,
  hoog: number,
  teken: Tekenaar,
): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const tex = scene.textures.createCanvas(key, Math.ceil(breed), Math.ceil(hoog));
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, Math.ceil(breed), Math.ceil(hoog));
  teken(ctx);
  tex.refresh();
}

/** Halve lengte en halve hoogte van het lijf — hier ontstaat het silhouet. */
function lijfMaten(r: number, stijl: VisStijl): [number, number] {
  if (stijl.vormSlank) return [r * 1.45, r * 0.6];
  if (stijl.vormHoog) return [r * 0.88, r * 1.14];
  if (stijl.roofdier) return [r * 1.12, r * 0.86];
  return [r * 1.04, r * 0.9];
}

/** Het lichaamssilhouet als pad: mollige druppel, roofdier iets spitser. */
function lijfPad(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, stijl: VisStijl): void {
  const [L, H] = lijfMaten(r, stijl);
  const spits = !!stijl.roofdier || !!stijl.snuitLang;
  ctx.beginPath();
  ctx.moveTo(cx + L, cy + (spits ? H * 0.12 : 0));
  ctx.bezierCurveTo(cx + L * 0.45, cy - H * 1.02, cx - L * 0.5, cy - H * 1.05, cx - L, cy - H * 0.3);
  ctx.bezierCurveTo(cx - L * 1.12, cy - H * 0.08, cx - L * 1.12, cy + H * 0.08, cx - L, cy + H * 0.3);
  ctx.bezierCurveTo(cx - L * 0.5, cy + H * 1.05, cx + L * 0.45, cy + H * 0.95, cx + L, cy + (spits ? H * 0.12 : 0));
  ctx.closePath();
}

/** Vloeiende waaiervin (staart of rugvin) rond de oorsprong, punt naar links. */
function vinPad(ctx: CanvasRenderingContext2D, lengte: number, spreiding: number, kromming: number): void {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-lengte * 0.45, -spreiding * 0.75, -lengte, -spreiding);
  ctx.quadraticCurveTo(-lengte * kromming, 0, -lengte, spreiding);
  ctx.quadraticCurveTo(-lengte * 0.45, spreiding * 0.75, 0, 0);
  ctx.closePath();
}

/** Staartvorm: waaier (standaard), diep gevorkte sikkel, of één spitse punt. */
function staartPad(
  ctx: CanvasRenderingContext2D,
  lengte: number,
  spreiding: number,
  stijl: VisStijl,
): void {
  if (stijl.staartSikkel) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-lengte * 0.5, -spreiding * 0.9, -lengte * 1.15, -spreiding * 1.25);
    ctx.quadraticCurveTo(-lengte * 0.5, -spreiding * 0.25, -lengte * 0.28, 0);
    ctx.quadraticCurveTo(-lengte * 0.5, spreiding * 0.25, -lengte * 1.15, spreiding * 1.25);
    ctx.quadraticCurveTo(-lengte * 0.5, spreiding * 0.9, 0, 0);
    ctx.closePath();
    return;
  }
  if (stijl.staartPunt) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-lengte * 0.6, -spreiding * 0.5, -lengte * 1.25, 0);
    ctx.quadraticCurveTo(-lengte * 0.6, spreiding * 0.5, 0, 0);
    ctx.closePath();
    return;
  }
  vinPad(ctx, lengte, spreiding, 0.5);
}

/** Tekent één vis, met staartslag-hoek `slag` (−1..1). */
function tekenVis(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  stijl: VisStijl,
  slag: number,
): void {
  const [L, H] = lijfMaten(r, stijl);

  // ── zachte slagschaduw onder de vis: geeft diepte in het water
  const schaduw = ctx.createRadialGradient(cx, cy + H * 0.95, r * 0.1, cx, cy + H * 1.0, r * 1.2);
  schaduw.addColorStop(0, 'rgba(0,0,0,0.16)');
  schaduw.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = schaduw;
  ctx.beginPath();
  ctx.ellipse(cx, cy + H * 0.95, L * 0.95, H * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (stijl.gloed) {
    const neon = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.9);
    neon.addColorStop(0, hexNaarRgba(stijl.licht, 0.55));
    neon.addColorStop(1, hexNaarRgba(stijl.licht, 0));
    ctx.fillStyle = neon;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * 1.9, r * 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── staart: begint diep ín het lijf, zodat het één vis is en geen
  //    driehoekje dat ertegenaan geplakt zit
  ctx.save();
  ctx.translate(cx - L * 0.62, cy);
  ctx.rotate(slag * 0.36);
  // Vinnen zijn vliezen: aan de buitenrand doorschijnend, bij het lijf dicht.
  const staartVerloop = ctx.createLinearGradient(-r * 1.3, 0, 0, 0);
  staartVerloop.addColorStop(0, hexNaarRgba(stijl.vin, 0.45));
  staartVerloop.addColorStop(0.55, hexNaarRgba(stijl.vin, 0.85));
  staartVerloop.addColorStop(1, stijl.basis);
  ctx.fillStyle = staartVerloop;
  staartPad(ctx, r * 1.3, r * 0.9, stijl);
  ctx.fill();
  ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.85);
  ctx.lineWidth = Math.max(1.4, r * 0.09);
  ctx.stroke();
  // vinstralen: een paar lijntjes geven de staart structuur
  ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.35);
  ctx.lineWidth = Math.max(1, r * 0.05);
  for (const a of [-0.45, 0, 0.45]) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.15, 0);
    ctx.lineTo(-r * 1.15, a * r * 0.85);
    ctx.stroke();
  }
  ctx.restore();

  // ── rugvin
  ctx.save();
  ctx.translate(cx - r * 0.02, cy - H * 0.78);
  ctx.rotate(-Math.PI / 2 + slag * 0.12);
  const rugLengte = stijl.roofdier ? r * 0.85 : r * 0.66;
  const rugSpreiding = stijl.roofdier ? r * 0.45 : r * 0.5;
  const rugVerloop = ctx.createLinearGradient(-rugLengte, 0, 0, 0);
  rugVerloop.addColorStop(0, hexNaarRgba(stijl.vin, 0.45));
  rugVerloop.addColorStop(0.6, hexNaarRgba(stijl.vin, 0.9));
  rugVerloop.addColorStop(1, stijl.basis);
  ctx.fillStyle = rugVerloop;
  vinPad(ctx, rugLengte, rugSpreiding, stijl.roofdier ? 0.9 : 0.7);
  ctx.fill();
  // vinstralen: de ribbels in het vlies
  ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.3);
  ctx.lineWidth = Math.max(0.8, r * 0.04);
  for (const a of [-0.5, 0, 0.5]) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.05, 0);
    ctx.lineTo(-rugLengte * 0.9, a * rugSpreiding);
    ctx.stroke();
  }
  ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.7);
  ctx.lineWidth = Math.max(1.2, r * 0.07);
  vinPad(ctx, rugLengte, rugSpreiding, stijl.roofdier ? 0.9 : 0.7);
  ctx.stroke();
  ctx.restore();

  // ── lijf met verticaal verloop (rug licht, buik donker) + rimlight
  lijfPad(ctx, cx, cy, r, stijl);
  const lijfVerloop = ctx.createLinearGradient(cx, cy - H, cx, cy + H);
  lijfVerloop.addColorStop(0, stijl.licht);
  lijfVerloop.addColorStop(0.42, stijl.basis);
  lijfVerloop.addColorStop(1, stijl.donker);
  ctx.fillStyle = lijfVerloop;
  ctx.fill();

  // buik: zachte lichte ovaal, netjes binnen het lijf geknipt
  ctx.save();
  lijfPad(ctx, cx, cy, r, stijl);
  ctx.clip();

  const buik = ctx.createLinearGradient(cx, cy + H * 0.1, cx, cy + H);
  buik.addColorStop(0, hexNaarRgba(stijl.buik, 0));
  buik.addColorStop(1, hexNaarRgba(stijl.buik, 0.85));
  ctx.fillStyle = buik;
  ctx.fillRect(cx - L, cy - H, L * 2, H * 2);

  // Doorschijnendheid: een warme gloed net onder de rug, alsof het licht een
  // stukje ín de vis valt. Dit is wat een platte vorm "vlezig" maakt.
  const onderhuids = ctx.createRadialGradient(
    cx + L * 0.15, cy - H * 0.25, r * 0.05,
    cx + L * 0.15, cy - H * 0.25, r * 1.15,
  );
  onderhuids.addColorStop(0, hexNaarRgba(stijl.licht, 0.55));
  onderhuids.addColorStop(1, hexNaarRgba(stijl.licht, 0));
  ctx.fillStyle = onderhuids;
  ctx.fillRect(cx - L, cy - H, L * 2, H * 2);

  if (stijl.strepen) {
    ctx.fillStyle = hexNaarRgba(stijl.accent, 0.32);
    for (let i = 0; i < stijl.strepen; i++) {
      const sx = cx - L * 0.45 + i * r * 0.42;
      ctx.beginPath();
      ctx.ellipse(sx, cy, r * 0.09, H * 1.1, -0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (stijl.stippen) {
    ctx.fillStyle = hexNaarRgba(stijl.accent, 0.5);
    for (let i = 0; i < 5; i++) {
      const sx = cx - L * 0.5 + i * r * 0.34;
      const sy = cy - H * 0.3 + (i % 2) * H * 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (stijl.vlekken) {
    ctx.fillStyle = hexNaarRgba(stijl.donker, 0.45);
    for (const [vx, vy, vr] of [
      [-0.45, -0.25, 0.3],
      [0.05, 0.2, 0.24],
      [0.5, -0.3, 0.2],
      [-0.15, -0.5, 0.16],
    ]) {
      ctx.beginPath();
      ctx.ellipse(cx + L * vx, cy + H * vy, r * vr, r * vr * 0.8, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (stijl.zadel) {
    // brede dwarsband over de rug — van ver het opvallendste kenmerk
    ctx.fillStyle = hexNaarRgba(stijl.accent, 0.75);
    ctx.beginPath();
    ctx.moveTo(cx - L * 0.28, cy - H);
    ctx.lineTo(cx + L * 0.04, cy - H);
    ctx.lineTo(cx + L * 0.16, cy + H);
    ctx.lineTo(cx - L * 0.16, cy + H);
    ctx.closePath();
    ctx.fill();
  }

  // ── schubben: echte overlappende schubjes, elk met een lichte bovenrand en
  //    een schaduwrand eronder. Alleen op het middenstuk, want bij de kop en de
  //    staart wordt het rommelig.
  if (!stijl.gloedstippen) {
    const schubR = r * 0.26;
    const stapX = schubR * 1.15;
    const stapY = schubR * 0.85;
    for (let ry = -2; ry <= 2; ry++) {
      const sy = cy + ry * stapY;
      for (let i = -2; i <= 3; i++) {
        const sx = cx - L * 0.25 + i * stapX + (ry % 2 ? stapX / 2 : 0);
        // schaduw onder de schub
        ctx.beginPath();
        ctx.arc(sx, sy + schubR * 0.12, schubR, Math.PI * 0.15, Math.PI * 0.85);
        ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.22);
        ctx.lineWidth = Math.max(0.8, r * 0.05);
        ctx.stroke();
        // lichtrand erboven
        ctx.beginPath();
        ctx.arc(sx, sy, schubR, Math.PI * 0.2, Math.PI * 0.8);
        ctx.strokeStyle = 'rgba(255,255,255,0.20)';
        ctx.lineWidth = Math.max(0.7, r * 0.035);
        ctx.stroke();
      }
    }
  }

  // ── schaduw waar de staart aan het lijf zit: zonder dit lijkt de staart
  //    aangeplakt in plaats van vastgegroeid
  const staartAO = ctx.createLinearGradient(cx - L, cy, cx - L * 0.25, cy);
  staartAO.addColorStop(0, hexNaarRgba(stijl.donker, 0.55));
  staartAO.addColorStop(1, hexNaarRgba(stijl.donker, 0));
  ctx.fillStyle = staartAO;
  ctx.fillRect(cx - L, cy - H, L * 0.8, H * 2);

  // ── donkere onderrand (omgevingsschaduw), zodat de buik "wegdraait"
  const buikAO = ctx.createLinearGradient(cx, cy + H * 0.35, cx, cy + H);
  buikAO.addColorStop(0, hexNaarRgba(stijl.donker, 0));
  buikAO.addColorStop(1, hexNaarRgba(stijl.donker, 0.5));
  ctx.fillStyle = buikAO;
  ctx.fillRect(cx - L, cy, L * 2, H);

  // glans over de rug: langgerekte lichtstreep
  const glans = ctx.createLinearGradient(cx, cy - H, cx, cy);
  glans.addColorStop(0, 'rgba(255,255,255,0.6)');
  glans.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glans;
  ctx.beginPath();
  ctx.ellipse(cx + L * 0.05, cy - H * 0.55, L * 0.62, H * 0.34, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── borstvin: klein en halfdoorschijnend tegen de onderkant van het lijf,
  //    zodat het een vin blijft en geen driehoekje midden op de vis wordt
  ctx.save();
  ctx.translate(cx + L * 0.22, cy + H * 0.42);
  ctx.rotate(0.75 + slag * 0.2);
  const borstVerloop = ctx.createLinearGradient(-r * 0.45, 0, 0, 0);
  borstVerloop.addColorStop(0, hexNaarRgba(stijl.vin, 0.75));
  borstVerloop.addColorStop(1, hexNaarRgba(stijl.buik, 0.55));
  ctx.fillStyle = borstVerloop;
  vinPad(ctx, r * 0.42, r * 0.2, 0.7);
  ctx.fill();
  ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.45);
  ctx.lineWidth = Math.max(1, r * 0.045);
  ctx.stroke();
  ctx.restore();

  if (stijl.stekels) {
    ctx.fillStyle = stijl.donker;
    for (let i = 0; i < 4; i++) {
      const sx = cx - r * 0.5 + i * r * 0.36;
      ctx.beginPath();
      ctx.moveTo(sx, cy - H * 0.86);
      ctx.lineTo(sx + r * 0.1, cy - H * 1.28);
      ctx.lineTo(sx + r * 0.22, cy - H * 0.8);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (stijl.rugkam) {
    // getande kam over de hele rug: verraadt de jager in de schemer
    ctx.fillStyle = hexNaarRgba(stijl.accent, 0.9);
    ctx.beginPath();
    ctx.moveTo(cx - L * 0.6, cy - H * 0.72);
    for (let i = 0; i < 6; i++) {
      const x1 = cx - L * 0.6 + (i + 0.5) * (L * 1.1) / 6;
      const x2 = cx - L * 0.6 + (i + 1) * (L * 1.1) / 6;
      ctx.lineTo(x1, cy - H * (1.02 + (i % 2) * 0.12));
      ctx.lineTo(x2, cy - H * 0.72);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.7);
    ctx.lineWidth = Math.max(1, r * 0.04);
    ctx.stroke();
  }

  if (stijl.snorharen) {
    ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.8);
    ctx.lineWidth = Math.max(1.2, r * 0.055);
    ctx.lineCap = 'round';
    for (const [dy, len] of [
      [0.1, 0.9],
      [0.3, 1.1],
      [0.5, 0.85],
      [0.68, 0.6],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx + L * 0.72, cy + H * dy);
      ctx.quadraticCurveTo(
        cx + L * 0.72 + r * len * 0.4,
        cy + H * dy + r * 0.4,
        cx + L * 0.72 - r * len * 0.25,
        cy + H * dy + r * len * 0.9,
      );
      ctx.stroke();
    }
  }

  // ── contour: donker genoeg om los te komen van het water, en een lichte
  //    rimlight langs de rug zodat de vis "rond" oogt
  lijfPad(ctx, cx, cy, r, stijl);
  ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.9);
  ctx.lineWidth = Math.max(2, r * 0.13);
  ctx.stroke();
  ctx.save();
  lijfPad(ctx, cx, cy, r, stijl);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = Math.max(1.5, r * 0.09);
  lijfPad(ctx, cx, cy - r * 0.06, r, stijl);
  ctx.stroke();
  ctx.restore();

  // ── uitstekende snuit (vóór de mond getekend, zodat de mond erop past)
  if (stijl.snuitLang) {
    ctx.fillStyle = stijl.basis;
    ctx.beginPath();
    ctx.moveTo(cx + L * 0.72, cy - H * 0.3);
    ctx.lineTo(cx + L * 1.5, cy + H * 0.02);
    ctx.lineTo(cx + L * 0.72, cy + H * 0.34);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.9);
    ctx.lineWidth = Math.max(1.5, r * 0.09);
    ctx.stroke();
  }

  // ── mond
  const mx = cx + L * 0.74;
  const my = cy + H * 0.3;
  ctx.lineWidth = Math.max(1.2, r * 0.07);
  ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.85);
  if (stijl.roofdier) {
    ctx.beginPath();
    ctx.moveTo(cx + L * 0.35, my - H * 0.05);
    ctx.quadraticCurveTo(mx, my + H * 0.12, cx + L * 0.98, my - H * 0.3);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      const tx = cx + L * 0.42 + i * r * 0.19;
      ctx.beginPath();
      ctx.moveTo(tx, my - H * 0.02);
      ctx.lineTo(tx + r * 0.14, my - H * 0.02);
      ctx.lineTo(tx + r * 0.07, my + H * 0.26);
      ctx.closePath();
      ctx.fill();
    }
  } else if (stijl.lippen) {
    // dikke tuitlippen: twee gevulde boogjes vooraan
    ctx.fillStyle = hexNaarRgba(stijl.accent, 0.95);
    ctx.beginPath();
    ctx.ellipse(cx + L * 0.86, my - H * 0.36, r * 0.2, r * 0.13, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + L * 0.84, my - H * 0.1, r * 0.18, r * 0.11, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.75);
    ctx.lineWidth = Math.max(1.2, r * 0.05);
    ctx.stroke();
  } else {
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1.8, r * 0.11);
    ctx.beginPath();
    ctx.arc(mx - r * 0.05, my - H * 0.28, r * 0.26, 0.08 * Math.PI, 0.72 * Math.PI);
    ctx.stroke();
  }

  // ── oog: bolletje met verloop, pupil en twee glanspunten
  const ox = cx + L * 0.42;
  const oy = cy - H * 0.3;
  const oogR = r * (stijl.boosOog ? 0.22 : 0.36);
  if (!stijl.boosOog) {
    const oogbal = ctx.createRadialGradient(ox - oogR * 0.3, oy - oogR * 0.35, oogR * 0.1, ox, oy, oogR);
    oogbal.addColorStop(0, '#ffffff');
    oogbal.addColorStop(1, '#d9e6ef');
    ctx.fillStyle = oogbal;
    ctx.beginPath();
    ctx.arc(ox, oy, oogR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.5);
    ctx.lineWidth = Math.max(1, r * 0.045);
    ctx.stroke();

    ctx.fillStyle = '#16222e';
    ctx.beginPath();
    ctx.arc(ox + oogR * 0.28, oy + oogR * 0.05, oogR * 0.52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(ox + oogR * 0.1, oy - oogR * 0.35, oogR * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ox + oogR * 0.55, oy + oogR * 0.45, oogR * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const gloedOog = ctx.createRadialGradient(ox, oy, oogR * 0.1, ox, oy, oogR * 2.2);
    gloedOog.addColorStop(0, hexNaarRgba(stijl.accent, 0.8));
    gloedOog.addColorStop(1, hexNaarRgba(stijl.accent, 0));
    ctx.fillStyle = gloedOog;
    ctx.beginPath();
    ctx.arc(ox, oy, oogR * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = stijl.accent;
    ctx.beginPath();
    ctx.arc(ox, oy, oogR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0a0e1f';
    ctx.beginPath();
    ctx.ellipse(ox + oogR * 0.15, oy, oogR * 0.35, oogR * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (stijl.roofdier) {
    ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.95);
    ctx.lineWidth = Math.max(1.6, r * 0.09);
    ctx.beginPath();
    ctx.moveTo(ox - oogR * 1.1, oy - oogR * 1.15);
    ctx.lineTo(ox + oogR * 1.2, oy - oogR * 0.35);
    ctx.stroke();
  }

  if (stijl.gloedstippen) {
    // rij lichtgevende stipjes langs de onderrand: het enige wat je van deze
    // vis ziet in het donker
    for (let i = 0; i < 6; i++) {
      const gx = cx - L * 0.55 + (i * L * 1.1) / 5;
      const gy = cy + H * (0.55 + Math.sin(i) * 0.08);
      const gloedje = ctx.createRadialGradient(gx, gy, 0, gx, gy, r * 0.28);
      gloedje.addColorStop(0, hexNaarRgba(stijl.accent, 0.95));
      gloedje.addColorStop(1, hexNaarRgba(stijl.accent, 0));
      ctx.fillStyle = gloedje;
      ctx.beginPath();
      ctx.arc(gx, gy, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (stijl.lampje) {
    // hengeltje met lichtbol vóór de kop: je ziet eerst het licht
    const bx = cx + L * 1.05;
    const by = cy - H * 1.15;
    ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.95);
    ctx.lineWidth = Math.max(1.5, r * 0.06);
    ctx.beginPath();
    ctx.moveTo(cx + L * 0.15, cy - H * 0.85);
    ctx.quadraticCurveTo(cx + L * 0.7, cy - H * 1.5, bx, by);
    ctx.stroke();
    const halo = ctx.createRadialGradient(bx, by, 0, bx, by, r * 0.65);
    halo.addColorStop(0, hexNaarRgba(stijl.accent, 0.95));
    halo.addColorStop(0.35, hexNaarRgba(stijl.accent, 0.5));
    halo.addColorStop(1, hexNaarRgba(stijl.accent, 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(bx, by, r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(bx, by, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** '#rrggbb' → 'rgba(r,g,b,a)'. */
function hexNaarRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${alpha})`;
}

/** Bakt de drie unieke staartstanden van één vis (keyVoor krijgt het textuurnummer). */
function bakVisFrames(scene: Phaser.Scene, keyVoor: (tex: number) => string, r: number, stijl: VisStijl): void {
  const rr = r * superSampleVoor(r) * VIS_SCHAAL;
  // Ruim genoeg voor het langste lijf (slank, 1,45r), de staart erachter, een
  // uitstekende snuit of lampje ervóór, en een hoge rugvin/kam erboven.
  const breed = rr * 4.6;
  const hoog = rr * 4;
  for (let f = 0; f < UNIEKE_FRAMES; f++) {
    canvasTextuur(scene, keyVoor(f), breed, hoog, (ctx) => {
      tekenVis(ctx, breed * 0.54, hoog / 2, rr, stijl, FRAME_SLAG[f]);
    });
  }
}

// ── Vissenboek ──────────────────────────────────────────────────────────────
// Alle soorten worden voor het boek op één vaste maat gebakken. Opschalen van
// de spel-textures kan niet: die staan op spelgrootte, en het Pijltje (radius 5)
// zou dan 3× vergroot worden — juist de vis die een kind als eerste vangt.

const BOEK_VIS_R = 17; // getekende straal in het boek (opmaak, geen speltuning)
const BOEK_SUPERSAMPLE = 2;
/** Schaal waarop een boek-texture getoond moet worden. */
export const BOEK_TEX_SCHAAL = 1 / BOEK_SUPERSAMPLE;

/**
 * Bakt één stilstaand plaatje per vissoort op boekgrootte. Lui aanroepen (bij
 * het openen van het boek) en daarna weer opruimen: het kost ~2,7 MB.
 */
export function maakBoekTexturen(scene: Phaser.Scene): void {
  const rr = BOEK_VIS_R * BOEK_SUPERSAMPLE * VIS_SCHAAL;
  const breed = rr * 4.6;
  const hoog = rr * 4;
  for (const id of Object.keys(SOORTEN) as SoortId[]) {
    if (SOORTEN[id].gedrag === 'gevaar') continue; // de kwal is geen vis
    const key = TEX.boek(id);
    if (scene.textures.exists(key)) continue;
    canvasTextuur(scene, key, breed, hoog, (ctx) => {
      tekenVis(ctx, breed * 0.54, hoog / 2, rr, SOORT_STIJL[id], 0);
    });
  }
}

/** Geeft het videogeheugen van de boek-plaatjes weer vrij. */
export function vernietigBoekTexturen(scene: Phaser.Scene): void {
  for (const id of Object.keys(SOORTEN) as SoortId[]) {
    const key = TEX.boek(id);
    if (scene.textures.exists(key)) scene.textures.remove(key);
  }
}

/** Kwal: doorschijnende koepel met wapperende tentakels. */
function bakKwal(scene: Phaser.Scene): void {
  const r = SOORTEN.kwal.radius * superSampleVoor(SOORTEN.kwal.radius) * VIS_SCHAAL;
  const breed = r * 4.6;
  const hoog = r * 4;
  const p = SOORT_STIJL.kwal;
  for (let f = 0; f < UNIEKE_FRAMES; f++) {
    const golf = FRAME_SLAG[f];
    canvasTextuur(scene, TEX.soortTex('kwal', f), breed, hoog, (ctx) => {
      const cx = breed / 2;
      const cy = hoog * 0.36;

      const halo = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.8);
      halo.addColorStop(0, hexNaarRgba(p.basis, 0.35));
      halo.addColorStop(1, hexNaarRgba(p.basis, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, breed, hoog);

      ctx.strokeStyle = hexNaarRgba(p.vin, 0.75);
      ctx.lineWidth = Math.max(1.5, r * 0.13);
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const tx = cx - r * 0.85 + i * r * 0.34;
        ctx.beginPath();
        ctx.moveTo(tx, cy + r * 0.5);
        ctx.quadraticCurveTo(tx + golf * r * 0.3, cy + r * 1.2, tx - golf * r * 0.25, cy + r * 1.8);
        ctx.quadraticCurveTo(tx + golf * r * 0.2, cy + r * 2.2, tx, cy + r * 2.5);
        ctx.stroke();
      }

      const koepel = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.5, r * 0.1, cx, cy, r * 1.25);
      koepel.addColorStop(0, hexNaarRgba('#ffffff', 0.85));
      koepel.addColorStop(0.45, hexNaarRgba(p.basis, 0.8));
      koepel.addColorStop(1, hexNaarRgba(p.vin, 0.75));
      ctx.fillStyle = koepel;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.2, r * 1.0, 0, Math.PI, 0);
      ctx.quadraticCurveTo(cx, cy + r * 0.62, cx - r * 1.2, cy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = hexNaarRgba(p.donker, 0.5);
      ctx.lineWidth = Math.max(1.2, r * 0.07);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.42, cy - r * 0.42, r * 0.3, r * 0.16, -0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3b2a4d';
      ctx.beginPath();
      ctx.arc(cx - r * 0.32, cy - r * 0.02, r * 0.12, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.32, cy - r * 0.02, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3b2a4d';
      ctx.lineWidth = Math.max(1, r * 0.07);
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.05, r * 0.22, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    });
  }
}

/** Alle NPC-textures (één keer per sessie). */
export function maakNpcTexturen(scene: Phaser.Scene): void {
  for (const id of Object.keys(SOORTEN) as SoortId[]) {
    if (id === 'kwal') continue;
    if (scene.textures.exists(TEX.soort(id, 0))) continue;
    bakVisFrames(scene, (tex) => TEX.soortTex(id, tex), SOORTEN[id].radius, SOORT_STIJL[id]);
  }
  if (!scene.textures.exists(TEX.soort('kwal', 0))) bakKwal(scene);
}

/** De vijf spelervissen in de gekozen kleur en skin (opnieuw bij een keuze). */
export function maakSpelerTexturen(
  scene: Phaser.Scene,
  fases: { fase: number; radius: number }[],
  kleurId: string,
  skinId: string,
): void {
  const p = KLEUREN[kleurId] ?? KLEUREN.oranje;
  for (const f of fases) {
    const stijl: VisStijl = {
      ...p,
      strepen: f.fase >= 3 ? 3 : 0,
      roofdier: f.fase >= 4,
      stekels: skinId === 'stekelbaars',
      gloed: skinId === 'neonvisje',
    };
    bakVisFrames(scene, (tex) => TEX.spelerTex(f.fase, tex), f.radius, stijl);
  }
}

/** Belletjes, plankton en de hap-flits. */
export function maakEffectTexturen(scene: Phaser.Scene): void {
  if (!scene.textures.exists(TEX.bubbel)) {
    canvasTextuur(scene, TEX.bubbel, 32, 32, (ctx) => {
      const bol = ctx.createRadialGradient(12, 11, 1, 16, 16, 15);
      bol.addColorStop(0, 'rgba(255,255,255,0.55)');
      bol.addColorStop(0.65, 'rgba(255,255,255,0.10)');
      bol.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = bol;
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.ellipse(11, 10, 3.4, 2.4, -0.6, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  if (!scene.textures.exists(TEX.plankton)) {
    canvasTextuur(scene, TEX.plankton, 10, 10, (ctx) => {
      const v = ctx.createRadialGradient(5, 5, 0, 5, 5, 5);
      v.addColorStop(0, 'rgba(220,255,255,0.9)');
      v.addColorStop(1, 'rgba(200,240,255,0)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, 10, 10);
    });
  }
  if (!scene.textures.exists(TEX.hap)) {
    canvasTextuur(scene, TEX.hap, 64, 64, (ctx) => {
      const ring = ctx.createRadialGradient(32, 32, 6, 32, 32, 30);
      ring.addColorStop(0, 'rgba(255,255,255,0.95)');
      ring.addColorStop(0.5, 'rgba(255,255,255,0.35)');
      ring.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = ring;
      ctx.beginPath();
      ctx.arc(32, 32, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(32, 32, 20, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  // Alarmteken boven een jager die de speler in het vizier heeft (§10.1). Een
  // wolkje met een uitroepteken: leesbaar zonder te kunnen lezen.
  if (!scene.textures.exists(TEX.alarm)) {
    canvasTextuur(scene, TEX.alarm, 44, 52, (ctx) => {
      const gloed = ctx.createRadialGradient(22, 20, 2, 22, 20, 22);
      gloed.addColorStop(0, 'rgba(255,90,90,0.55)');
      gloed.addColorStop(1, 'rgba(255,60,60,0)');
      ctx.fillStyle = gloed;
      ctx.fillRect(0, 0, 44, 44);

      ctx.beginPath(); // bolletje met een puntje naar de vis toe
      ctx.arc(22, 20, 14, 0, Math.PI * 2);
      ctx.moveTo(16, 31);
      ctx.lineTo(22, 44);
      ctx.lineTo(28, 31);
      ctx.closePath();
      ctx.fillStyle = '#e0342f';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#7d1512';
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(19.5, 10, 5, 13, 2.5);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(22, 27.5, 2.8, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Luchtbelschild (§10.2): grote, bijna doorzichtige bel met een glansveeg.
  // Wordt in de scene op de spelerstraal geschaald.
  if (!scene.textures.exists(TEX.schild)) {
    canvasTextuur(scene, TEX.schild, 128, 128, (ctx) => {
      const bol = ctx.createRadialGradient(64, 64, 40, 64, 64, 62);
      bol.addColorStop(0, 'rgba(180,240,255,0.03)');
      bol.addColorStop(0.82, 'rgba(190,245,255,0.20)');
      bol.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = bol;
      ctx.beginPath();
      ctx.arc(64, 64, 62, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(226,250,255,0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(64, 64, 59, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; // glansveeg linksboven
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(64, 64, 52, Math.PI * 1.05, Math.PI * 1.38);
      ctx.stroke();
    });
  }

  // Gouden nul (§10.5) — het huismotief van Nul & Co, hier als verzamelding.
  if (!scene.textures.exists(TEX.nul)) {
    canvasTextuur(scene, TEX.nul, 72, 72, (ctx) => {
      const gloed = ctx.createRadialGradient(36, 36, 8, 36, 36, 36);
      gloed.addColorStop(0, 'rgba(255,226,120,0.55)');
      gloed.addColorStop(1, 'rgba(255,200,60,0)');
      ctx.fillStyle = gloed;
      ctx.fillRect(0, 0, 72, 72);

      const goud = ctx.createLinearGradient(0, 12, 0, 60);
      goud.addColorStop(0, '#fff3b0');
      goud.addColorStop(0.45, '#ffd23f');
      goud.addColorStop(1, '#e39908');

      ctx.lineWidth = 11; // de nul zelf: een dikke ovale ring
      ctx.strokeStyle = goud;
      ctx.beginPath();
      ctx.ellipse(36, 36, 15, 21, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(140,86,0,0.85)';
      ctx.beginPath();
      ctx.ellipse(36, 36, 20.5, 26.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(36, 36, 9.5, 15.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; // glansje linksboven
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.ellipse(36, 36, 18, 24, 0, Math.PI * 1.08, Math.PI * 1.34);
      ctx.stroke();
    });
  }

  // Dunne ring voor uitdijende schokgolfjes (fase-viering, geklapt schild).
  if (!scene.textures.exists(TEX.ring)) {
    canvasTextuur(scene, TEX.ring, 128, 128, (ctx) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(64, 64, 58, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
}

/** Zonnestralen die door het water vallen (additief over de achtergrond). */
export function maakLichtstralen(scene: Phaser.Scene, breed: number, hoog: number): void {
  if (scene.textures.exists(TEX.stralen)) return;
  canvasTextuur(scene, TEX.stralen, breed, hoog, (ctx) => {
    const stralen = [
      { x: breed * 0.18, b: breed * 0.15, a: 0.16 },
      { x: breed * 0.44, b: breed * 0.09, a: 0.12 },
      { x: breed * 0.7, b: breed * 0.18, a: 0.14 },
      { x: breed * 0.93, b: breed * 0.11, a: 0.1 },
    ];
    // Zacht licht: vervagen naar beneden én naar de zijkanten, plus een
    // blur-pas als de browser die kan (anders blijven het nette verlopen).
    const kanBlurren = 'filter' in ctx;
    if (kanBlurren) ctx.filter = `blur(${Math.round(breed * 0.03)}px)`;
    for (const s of stralen) {
      const zij = ctx.createLinearGradient(s.x - s.b, 0, s.x + s.b, 0);
      zij.addColorStop(0, 'rgba(255,255,255,0)');
      zij.addColorStop(0.5, `rgba(255,255,255,${s.a})`);
      zij.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(s.x - s.b * 0.5, 0);
      ctx.lineTo(s.x + s.b * 0.5, 0);
      ctx.lineTo(s.x + s.b * 1.6, hoog);
      ctx.lineTo(s.x - s.b * 0.9, hoog);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = zij;
      ctx.fillRect(s.x - s.b * 2, 0, s.b * 4, hoog);
      // naar onderen uitdoven
      const dood = ctx.createLinearGradient(0, 0, 0, hoog);
      dood.addColorStop(0, 'rgba(0,0,0,0)');
      dood.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = dood;
      ctx.fillRect(s.x - s.b * 2, 0, s.b * 4, hoog);
      ctx.restore();
    }
    if (kanBlurren) ctx.filter = 'none';
  });
}

/**
 * Caustiek: het netwerk van lichtvlekken dat door golven ontstaat. Tegelbaar,
 * wordt additief over het water gelegd en langzaam verschoven. Dit is een van
 * de dingen die water "levend" maakt in plaats van een blauw vlak.
 */
export function maakCaustiek(scene: Phaser.Scene, maat: number): void {
  if (scene.textures.exists(TEX.caustiek)) return;
  canvasTextuur(scene, TEX.caustiek, maat, maat, (ctx) => {
    const kanBlurren = 'filter' in ctx;
    // Stevig vervagen: caustiek moet je vóélen, niet zien. Zonder deze blur
    // leest het als behang in plaats van licht.
    if (kanBlurren) ctx.filter = `blur(${Math.round(maat * 0.035)}px)`;
    ctx.strokeStyle = 'rgba(255,255,255,0.34)';
    ctx.lineCap = 'round';
    // Een grid van vervormde cellen: de randen daarvan zijn de lichtlijnen.
    const cellen = 3;
    const stap = maat / cellen;
    for (let ry = 0; ry <= cellen; ry++) {
      for (let rx = 0; rx <= cellen; rx++) {
        const x = rx * stap;
        const y = ry * stap;
        // deterministische "wiebel" zodat het onregelmatig oogt maar herhaalbaar is
        const w1 = Math.sin(rx * 12.9898 + ry * 78.233) * 0.5;
        const w2 = Math.sin(rx * 39.346 + ry * 11.135) * 0.5;
        ctx.lineWidth = maat * 0.012 * (0.6 + Math.abs(w1));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + stap * (0.5 + w1 * 0.4), y + stap * (0.35 + w2 * 0.3), x + stap, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + stap * (0.35 + w2 * 0.3), y + stap * (0.5 + w1 * 0.4), x, y + stap);
        ctx.stroke();
      }
    }
    if (kanBlurren) ctx.filter = 'none';
  });
}

/**
 * Twee tegelbare lagen voor parallax: ver weg (rotsen en wier in de mist) en
 * middenafstand (het kleurrijke rif). De scene mengt ze met de waterkleur op
 * basis van de diepte — luchtperspectief, niet grijs maken.
 */
export function maakDieptelagen(scene: Phaser.Scene, breed: number, hoog: number): void {
  const kelp = (ctx: CanvasRenderingContext2D, x: number, basisY: number, h: number, dik: number, kleur: string) => {
    ctx.strokeStyle = kleur;
    ctx.lineCap = 'round';
    ctx.lineWidth = dik;
    ctx.beginPath();
    ctx.moveTo(x, basisY);
    ctx.quadraticCurveTo(x - h * 0.28, basisY - h * 0.5, x + h * 0.12, basisY - h);
    ctx.stroke();
    ctx.lineWidth = dik * 0.6;
    ctx.beginPath();
    ctx.moveTo(x + dik, basisY);
    ctx.quadraticCurveTo(x + h * 0.3, basisY - h * 0.45, x - h * 0.08, basisY - h * 0.85);
    ctx.stroke();
  };

  // Koraalwaaier: een bundel takjes die vanaf één voet uitwaaiert.
  const waaier = (ctx: CanvasRenderingContext2D, x: number, y: number, h: number, kleur: string, dik: number) => {
    ctx.strokeStyle = kleur;
    ctx.lineCap = 'round';
    ctx.lineWidth = dik;
    for (let a = -0.85; a <= 0.85; a += 0.17) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + a * h * 0.25, y - h * 0.55, x + a * h * 0.75, y - h);
      ctx.stroke();
    }
  };

  // Ronde keien met een zachte bovenkant.
  const kei = (ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, kleur: string) => {
    ctx.fillStyle = kleur;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
  };

  // Hersenkoraal: bol met kronkellijnen.
  const hersenkoraal = (ctx: CanvasRenderingContext2D, x: number, y: number, rr: number, kleur: string, lijn: string) => {
    const bol = ctx.createRadialGradient(x - rr * 0.3, y - rr * 0.4, rr * 0.1, x, y, rr);
    bol.addColorStop(0, kleur);
    bol.addColorStop(1, lijn);
    ctx.fillStyle = bol;
    ctx.beginPath();
    ctx.ellipse(x, y, rr, rr * 0.8, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = hexNaarRgba(lijn, 0.8);
    ctx.lineWidth = Math.max(1.5, rr * 0.09);
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(x - rr * 0.8, y - rr * 0.1 + i * rr * 0.16);
      ctx.quadraticCurveTo(x, y - rr * 0.45 + i * rr * 0.16, x + rr * 0.8, y - rr * 0.1 + i * rr * 0.16);
      ctx.stroke();
    }
  };

  // Anemoon: bosje tentakels met lichte topjes.
  const anemoon = (ctx: CanvasRenderingContext2D, x: number, y: number, h: number, kleur: string, top: string) => {
    ctx.strokeStyle = kleur;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(2, h * 0.1);
    for (let a = -1; a <= 1; a += 0.22) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + a * h * 0.3, y - h * 0.6, x + a * h * 0.7, y - h);
      ctx.stroke();
      ctx.fillStyle = top;
      ctx.beginPath();
      ctx.arc(x + a * h * 0.7, y - h, Math.max(1.5, h * 0.07), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Zandbodem met een zachte bovenrand.
  const zandbodem = (ctx: CanvasRenderingContext2D, y: number, kleur: string, licht: string) => {
    const zand = ctx.createLinearGradient(0, y - hoog * 0.06, 0, hoog);
    zand.addColorStop(0, hexNaarRgba(licht, 0));
    zand.addColorStop(0.35, hexNaarRgba(licht, 0.75));
    zand.addColorStop(1, kleur);
    ctx.fillStyle = zand;
    ctx.beginPath();
    ctx.moveTo(0, hoog);
    ctx.lineTo(0, y);
    for (let x = 0; x <= breed; x += breed / 8) {
      ctx.quadraticCurveTo(x + breed / 16, y - hoog * 0.02 * Math.sin(x), x + breed / 8, y);
    }
    ctx.lineTo(breed, hoog);
    ctx.closePath();
    ctx.fill();
  };

  // VERRE LAAG: rotsen en wier in de mist. Gedempt en blauwig — dat is wat
  // afstand suggereert (luchtperspectief), niet grijs maken.
  if (!scene.textures.exists(TEX.verVer)) {
    canvasTextuur(scene, TEX.verVer, breed, hoog, (ctx) => {
      kei(ctx, breed * 0.18, hoog * 0.94, breed * 0.34, hoog * 0.22, '#4e7f9c');
      kei(ctx, breed * 0.66, hoog * 0.99, breed * 0.42, hoog * 0.18, '#456f8b');
      kei(ctx, breed * 1.04, hoog * 0.92, breed * 0.28, hoog * 0.15, '#4e7f9c');
      for (let i = 0; i < 5; i++) {
        kelp(ctx, breed * (0.1 + i * 0.21), hoog * 0.96, hoog * (0.26 + (i % 2) * 0.12), 5, '#3f7a72');
      }
      waaier(ctx, breed * 0.44, hoog * 0.94, hoog * 0.19, '#5b7fa6', 4);
      waaier(ctx, breed * 0.86, hoog * 0.95, hoog * 0.15, '#63708f', 4);
    });
  }

  // MIDDENLAAG: hier zit de kleur. Een echt rif in plaats van grijze slierten.
  if (!scene.textures.exists(TEX.verMid)) {
    canvasTextuur(scene, TEX.verMid, breed, hoog, (ctx) => {
      zandbodem(ctx, hoog * 0.9, '#c9a86a', '#f0dba6');

      kei(ctx, breed * 0.3, hoog * 1.0, breed * 0.2, hoog * 0.13, '#6b7f93');
      kei(ctx, breed * 0.84, hoog * 1.0, breed * 0.24, hoog * 0.12, '#5f7387');

      hersenkoraal(ctx, breed * 0.2, hoog * 0.99, hoog * 0.05, '#9a6ab8', '#5f3880');
      hersenkoraal(ctx, breed * 0.62, hoog * 1.0, hoog * 0.04, '#d4924f', '#96501f');

      // Koraalwaaiers: lager en in gedempte rifkleuren. Fel oranje/roze op
      // volle hoogte werd een snoepjungle die het spel opat.
      waaier(ctx, breed * 0.1, hoog * 0.99, hoog * 0.17, '#d96f96', 5);
      waaier(ctx, breed * 0.42, hoog * 0.99, hoog * 0.12, '#d8894f', 4);
      waaier(ctx, breed * 0.74, hoog * 0.99, hoog * 0.15, '#6bb3a8', 4);
      waaier(ctx, breed * 0.97, hoog * 0.98, hoog * 0.11, '#9d72b0', 4);

      for (let i = 0; i < 4; i++) {
        kelp(ctx, breed * (0.26 + i * 0.2), hoog, hoog * (0.17 + (i % 2) * 0.08), 6, '#4a8f66');
      }

      anemoon(ctx, breed * 0.55, hoog * 0.99, hoog * 0.055, '#d98bb0', '#f6dfe9');

      // buiskoralen
      for (const [bx, bh, kl] of [
        [breed * 0.68, hoog * 0.1, '#d97a54'],
        [breed * 0.71, hoog * 0.07, '#e0a077'],
        [breed * 0.735, hoog * 0.12, '#cf6743'],
      ] as [number, number, string][]) {
        ctx.fillStyle = kl;
        ctx.beginPath();
        ctx.roundRect(bx, hoog - bh, breed * 0.02, bh, breed * 0.01);
        ctx.fill();
      }
    });
  }
}

/**
 * Besturing: joystickring, duim en zwiepknop. Getekend met verlopen en een
 * glansrand, zodat het echte knoppen lijken en geen grijze vlekken.
 */
export function maakBesturingTexturen(scene: Phaser.Scene, stickStraal: number, boostStraal: number): void {
  const s = stickStraal * SUPERSAMPLE;
  if (!scene.textures.exists(TEX.stickBasis)) {
    canvasTextuur(scene, TEX.stickBasis, s * 2.2, s * 2.2, (ctx) => {
      const c = s * 1.1;
      const v = ctx.createRadialGradient(c, c, s * 0.2, c, c, s);
      v.addColorStop(0, 'rgba(255,255,255,0.05)');
      v.addColorStop(0.75, 'rgba(255,255,255,0.12)');
      v.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = v;
      ctx.beginPath();
      ctx.arc(c, c, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = Math.max(2, s * 0.045);
      ctx.stroke();
      // vier pijltjes als hint dat je hier stuurt
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(c, c);
        ctx.rotate((i * Math.PI) / 2);
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.78);
        ctx.lineTo(s * 0.12, -s * 0.6);
        ctx.lineTo(-s * 0.12, -s * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    });
  }
  if (!scene.textures.exists(TEX.stickDuim)) {
    const d = s * 0.46;
    canvasTextuur(scene, TEX.stickDuim, d * 2.4, d * 2.4, (ctx) => {
      const c = d * 1.2;
      const v = ctx.createRadialGradient(c - d * 0.3, c - d * 0.35, d * 0.1, c, c, d);
      v.addColorStop(0, 'rgba(255,255,255,0.95)');
      v.addColorStop(1, 'rgba(210,238,255,0.55)');
      ctx.fillStyle = v;
      ctx.beginPath();
      ctx.arc(c, c, d, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = Math.max(2, d * 0.1);
      ctx.stroke();
    });
  }
  if (!scene.textures.exists(TEX.boostKnop)) {
    const b = boostStraal * SUPERSAMPLE;
    canvasTextuur(scene, TEX.boostKnop, b * 2.2, b * 2.2, (ctx) => {
      const c = b * 1.1;
      const v = ctx.createRadialGradient(c - b * 0.25, c - b * 0.3, b * 0.1, c, c, b);
      v.addColorStop(0, 'rgba(255,240,150,0.95)');
      v.addColorStop(0.6, 'rgba(255,193,7,0.85)');
      v.addColorStop(1, 'rgba(245,124,0,0.75)');
      ctx.fillStyle = v;
      ctx.beginPath();
      ctx.arc(c, c, b, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = Math.max(3, b * 0.05);
      ctx.stroke();
      // glansboog bovenin
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = Math.max(2, b * 0.09);
      ctx.beginPath();
      ctx.arc(c, c, b * 0.78, Math.PI * 1.15, Math.PI * 1.75);
      ctx.stroke();
      // dubbele chevron = vooruit
      ctx.strokeStyle = 'rgba(255,255,255,0.95)';
      ctx.lineWidth = Math.max(4, b * 0.13);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const dx of [-b * 0.22, b * 0.14]) {
        ctx.beginPath();
        ctx.moveTo(c + dx - b * 0.12, c - b * 0.3);
        ctx.lineTo(c + dx + b * 0.2, c);
        ctx.lineTo(c + dx - b * 0.12, c + b * 0.3);
        ctx.stroke();
      }
    });
  }
}

/**
 * Zichtvignet voor de diepte: helder rond de speler, zwart naar de randen.
 * Het wordt klein gerasterd (VIGNET_RASTER) en in de scene uitgerekt naar
 * `grootte` — een zacht verloop verliest daar niets bij, en het scheelt een
 * paar megabyte videogeheugen op een telefoon.
 */
export const VIGNET_RASTER = 256;

export function maakVignet(scene: Phaser.Scene, grootte: number): void {
  if (scene.textures.exists(TEX.vignet)) return;
  const k = VIGNET_RASTER / grootte; // van wereld-px naar textuur-px
  canvasTextuur(scene, TEX.vignet, VIGNET_RASTER, VIGNET_RASTER, (ctx) => {
    const c = VIGNET_RASTER / 2;
    // VIGNET_STRAAL is de afstand waarop je nog goed ziet: tot VIGNET_KERN ×
    // die straal blijft het volledig helder, op de straal zelf is het half
    // donker, en daarbuiten loopt het naar zwart.
    const kern = Math.min(VIGNET_STRAAL * VIGNET_KERN * k, c);
    const straal = VIGNET_STRAAL * k;
    const verloop = ctx.createRadialGradient(c, c, kern, c, c, c);
    verloop.addColorStop(0, 'rgba(0,0,0,0)');
    const opStraal = Phaser.Math.Clamp((straal - kern) / Math.max(1, c - kern), 0.05, 0.95);
    verloop.addColorStop(opStraal, 'rgba(0,0,0,0.5)');
    verloop.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = verloop;
    ctx.fillRect(0, 0, VIGNET_RASTER, VIGNET_RASTER);
  });
}
