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
} as const;

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

const SOORT_PALET: Record<SoortId, Palet> = {
  vlokje: { basis: '#ffd166', licht: '#ffe9a8', donker: '#d38b1f', buik: '#fff6dc', vin: '#f4a261', accent: '#ffffff' },
  stipje: { basis: '#61c8ec', licht: '#b3ecff', donker: '#1c7fa8', buik: '#e7faff', vin: '#219ebc', accent: '#ffffff' },
  flapper: { basis: '#8fd14f', licht: '#cdf0a0', donker: '#4e8f2a', buik: '#f0ffdc', vin: '#43aa8b', accent: '#ffffff' },
  snapper: { basis: '#f0645a', licht: '#ffa79f', donker: '#9c1f18', buik: '#ffdedb', vin: '#c1121f', accent: '#ffe0b3' },
  grombaars: { basis: '#8f5be0', licht: '#c8a6ff', donker: '#4b1e91', buik: '#e8d9ff', vin: '#5a189a', accent: '#ffd166' },
  diepteschrik: { basis: '#2b3358', licht: '#4d5a91', donker: '#0a0e1f', buik: '#3a4370', vin: '#161b33', accent: '#7cf5d5' },
  kwal: { basis: '#e0aaff', licht: '#f6e4ff', donker: '#9d4edd', buik: '#ffffff', vin: '#c77dff', accent: '#ffffff' },
};

interface VisStijl extends Palet {
  roofdier?: boolean; // hoekige snuit, tanden, boze wenkbrauw
  strepen?: number;
  stippen?: boolean;
  stekels?: boolean; // skin "stekelbaars"
  gloed?: boolean; // skin "neonvisje"
  boosOog?: boolean; // klein fel oog (Diepteschrik)
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

/** Halve lengte en halve hoogte van het lijf (roofdieren zijn langgerekter). */
function lijfMaten(r: number, spits: boolean): [number, number] {
  return spits ? [r * 1.12, r * 0.86] : [r * 1.04, r * 0.9];
}

/** Het lichaamssilhouet als pad: mollige druppel, roofdier iets spitser. */
function lijfPad(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, spits: boolean): void {
  const [L, H] = lijfMaten(r, spits);
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

/** Tekent één vis, met staartslag-hoek `slag` (−1..1). */
function tekenVis(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  stijl: VisStijl,
  slag: number,
): void {
  const [L, H] = lijfMaten(r, !!stijl.roofdier);

  // ── zachte slagschaduw onder de vis: geeft diepte in het water
  const schaduw = ctx.createRadialGradient(cx, cy + H * 0.95, r * 0.1, cx, cy + H * 1.0, r * 1.2);
  schaduw.addColorStop(0, 'rgba(0,0,0,0.28)');
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
  const staartVerloop = ctx.createLinearGradient(-r * 1.3, 0, 0, 0);
  staartVerloop.addColorStop(0, hexNaarRgba(stijl.vin, 0.85));
  staartVerloop.addColorStop(0.7, stijl.vin);
  staartVerloop.addColorStop(1, stijl.basis);
  ctx.fillStyle = staartVerloop;
  vinPad(ctx, r * 1.3, r * 0.9, 0.5);
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
  const rugVerloop = ctx.createLinearGradient(-r, 0, 0, 0);
  rugVerloop.addColorStop(0, hexNaarRgba(stijl.vin, 0.9));
  rugVerloop.addColorStop(1, stijl.basis);
  ctx.fillStyle = rugVerloop;
  if (stijl.roofdier) vinPad(ctx, r * 0.85, r * 0.45, 0.9);
  else vinPad(ctx, r * 0.66, r * 0.5, 0.7);
  ctx.fill();
  ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.7);
  ctx.lineWidth = Math.max(1.2, r * 0.07);
  ctx.stroke();
  ctx.restore();

  // ── lijf met verticaal verloop (rug licht, buik donker) + rimlight
  lijfPad(ctx, cx, cy, r, !!stijl.roofdier);
  const lijfVerloop = ctx.createLinearGradient(cx, cy - H, cx, cy + H);
  lijfVerloop.addColorStop(0, stijl.licht);
  lijfVerloop.addColorStop(0.42, stijl.basis);
  lijfVerloop.addColorStop(1, stijl.donker);
  ctx.fillStyle = lijfVerloop;
  ctx.fill();

  // buik: zachte lichte ovaal, netjes binnen het lijf geknipt
  ctx.save();
  lijfPad(ctx, cx, cy, r, !!stijl.roofdier);
  ctx.clip();

  const buik = ctx.createLinearGradient(cx, cy + H * 0.1, cx, cy + H);
  buik.addColorStop(0, hexNaarRgba(stijl.buik, 0));
  buik.addColorStop(1, hexNaarRgba(stijl.buik, 0.85));
  ctx.fillStyle = buik;
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

  // schubbenboogjes: heel subtiel, geeft "textuur" zonder rommelig te worden
  ctx.strokeStyle = 'rgba(255,255,255,0.13)';
  ctx.lineWidth = Math.max(0.8, r * 0.045);
  for (let ry = -1; ry <= 1; ry++) {
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(cx - L * 0.35 + i * r * 0.34, cy + ry * H * 0.42, r * 0.22, -0.9, 0.9);
      ctx.stroke();
    }
  }

  // glans over de rug: langgerekte lichtstreep
  const glans = ctx.createLinearGradient(cx, cy - H, cx, cy);
  glans.addColorStop(0, 'rgba(255,255,255,0.55)');
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

  // ── contour: donker genoeg om los te komen van het water, en een lichte
  //    rimlight langs de rug zodat de vis "rond" oogt
  lijfPad(ctx, cx, cy, r, !!stijl.roofdier);
  ctx.strokeStyle = hexNaarRgba(stijl.donker, 0.9);
  ctx.lineWidth = Math.max(2, r * 0.13);
  ctx.stroke();
  ctx.save();
  lijfPad(ctx, cx, cy, r, !!stijl.roofdier);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = Math.max(1.5, r * 0.09);
  lijfPad(ctx, cx, cy - r * 0.06, r, !!stijl.roofdier);
  ctx.stroke();
  ctx.restore();

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
}

/** '#rrggbb' → 'rgba(r,g,b,a)'. */
function hexNaarRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 0xff},${(n >> 8) & 0xff},${n & 0xff},${alpha})`;
}

/** Bakt de drie unieke staartstanden van één vis (keyVoor krijgt het textuurnummer). */
function bakVisFrames(scene: Phaser.Scene, keyVoor: (tex: number) => string, r: number, stijl: VisStijl): void {
  const rr = r * SUPERSAMPLE * VIS_SCHAAL;
  // Krap bemeten canvas: net groot genoeg voor lijf + staart + rugvin.
  const breed = rr * 4;
  const hoog = rr * 3.3;
  for (let f = 0; f < UNIEKE_FRAMES; f++) {
    canvasTextuur(scene, keyVoor(f), breed, hoog, (ctx) => {
      tekenVis(ctx, breed * 0.54, hoog / 2, rr, stijl, FRAME_SLAG[f]);
    });
  }
}

/** Kwal: doorschijnende koepel met wapperende tentakels. */
function bakKwal(scene: Phaser.Scene): void {
  const r = SOORTEN.kwal.radius * SUPERSAMPLE * VIS_SCHAAL;
  const breed = r * 4;
  const hoog = r * 3.3;
  const p = SOORT_PALET.kwal;
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
    const p = SOORT_PALET[id];
    const stijl: VisStijl = {
      ...p,
      roofdier: SOORTEN[id].gedrag === 'roofvis' || SOORTEN[id].gedrag === 'apex',
      strepen: id === 'flapper' ? 3 : id === 'grombaars' ? 3 : 0,
      stippen: id === 'stipje',
      boosOog: id === 'diepteschrik',
    };
    bakVisFrames(scene, (tex) => TEX.soortTex(id, tex), SOORTEN[id].radius, stijl);
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
 * Twee tegelbare silhouet-lagen voor parallax: ver weg (vage bulten en
 * wiervelden) en middenafstand (scherpere rotsen en kelp). Ze worden getint
 * met de zonekleur, zodat ze in elke diepte kloppen.
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

  if (!scene.textures.exists(TEX.verVer)) {
    canvasTextuur(scene, TEX.verVer, breed, hoog, (ctx) => {
      // vage rotspartijen in de verte: nauwelijks zichtbaar, puur diepte
      kei(ctx, breed * 0.18, hoog * 0.92, breed * 0.34, hoog * 0.2, 'rgba(255,255,255,0.09)');
      kei(ctx, breed * 0.66, hoog * 0.97, breed * 0.4, hoog * 0.16, 'rgba(255,255,255,0.08)');
      kei(ctx, breed * 1.02, hoog * 0.9, breed * 0.26, hoog * 0.13, 'rgba(255,255,255,0.09)');
      for (let i = 0; i < 4; i++) {
        kelp(ctx, breed * (0.12 + i * 0.26), hoog * 0.95, hoog * (0.26 + (i % 2) * 0.1), 4, 'rgba(255,255,255,0.07)');
      }
      waaier(ctx, breed * 0.44, hoog * 0.93, hoog * 0.17, 'rgba(255,255,255,0.07)', 3);
    });
  }

  if (!scene.textures.exists(TEX.verMid)) {
    canvasTextuur(scene, TEX.verMid, breed, hoog, (ctx) => {
      kei(ctx, breed * 0.3, hoog * 1.0, breed * 0.2, hoog * 0.13, 'rgba(255,255,255,0.15)');
      kei(ctx, breed * 0.82, hoog * 1.0, breed * 0.24, hoog * 0.11, 'rgba(255,255,255,0.14)');
      // koraal in twee maten geeft een rif-silhouet in plaats van gras
      waaier(ctx, breed * 0.16, hoog * 0.99, hoog * 0.3, 'rgba(255,255,255,0.15)', 5);
      waaier(ctx, breed * 0.55, hoog * 0.99, hoog * 0.22, 'rgba(255,255,255,0.13)', 4);
      waaier(ctx, breed * 0.95, hoog * 0.99, hoog * 0.26, 'rgba(255,255,255,0.14)', 5);
      for (let i = 0; i < 3; i++) {
        kelp(ctx, breed * (0.36 + i * 0.28), hoog, hoog * (0.34 + (i % 2) * 0.12), 6, 'rgba(255,255,255,0.12)');
      }
      // een paar buiskoralen
      ctx.fillStyle = 'rgba(255,255,255,0.13)';
      for (const [bx, bh] of [
        [breed * 0.7, hoog * 0.16],
        [breed * 0.73, hoog * 0.11],
        [breed * 0.76, hoog * 0.19],
      ]) {
        ctx.beginPath();
        ctx.roundRect(bx, hoog - bh, breed * 0.018, bh, breed * 0.01);
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

/** Zichtvignet voor de diepte: helder rond de speler, zwart naar de randen. */
export function maakVignet(scene: Phaser.Scene, grootte: number): void {
  if (scene.textures.exists(TEX.vignet)) return;
  canvasTextuur(scene, TEX.vignet, grootte, grootte, (ctx) => {
    const c = grootte / 2;
    // VIGNET_STRAAL is de afstand waarop je nog goed ziet: tot VIGNET_KERN ×
    // die straal blijft het volledig helder, op de straal zelf is het half
    // donker, en daarbuiten loopt het naar zwart.
    const kern = Math.min(VIGNET_STRAAL * VIGNET_KERN, c);
    const verloop = ctx.createRadialGradient(c, c, kern, c, c, c);
    verloop.addColorStop(0, 'rgba(0,0,0,0)');
    const opStraal = Phaser.Math.Clamp((VIGNET_STRAAL - kern) / Math.max(1, c - kern), 0.05, 0.95);
    verloop.addColorStop(opStraal, 'rgba(0,0,0,0.5)');
    verloop.addColorStop(1, 'rgba(0,0,0,0.92)');
    ctx.fillStyle = verloop;
    ctx.fillRect(0, 0, grootte, grootte);
  });
}
