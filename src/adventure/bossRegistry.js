// ===== BAAS-REGISTRY: alle baas-looks op één plek =====
// Elke wereld-baas is één entry: hoe hij getekend wordt, hoe hij er blij
// uitziet na de nederlaag, welk projectiel hij schiet en hoe snel. De scene
// kent geen looks meer — een nieuwe baas toevoegen = art in enemyArt.js +
// één entry hier. (Voorheen: if-ketens op vier plekken in AdventureScene.)

import {
  drawBoss, recolorBossHappy,
  drawWaveBoss, drawSprayWall, happyWaveBoss, drawWaveMinion,
  drawTreeBoss, happyTreeBoss, drawAcorn,
  drawCrystalBoss, happyCrystalBoss, drawCrystalShard,
  drawMeteorBoss, happyMeteorBoss, drawFireball,
  drawGrauwBoss, happyGrauwBoss, drawGrauwWolkje,
  drawKaasBoss, happyKaasBoss, drawKaasWiel,
  drawDrolBoss, happyDrolBoss, drawDrolletje,
  drawReusBoss, drawKei,
  drawBilBoss, happyBilBoss, drawStinkWolkje, drawZeepbel,
  drawOctopusBoss, happyOctopusBoss, drawInktKlodder,
  drawSchelpKeuze, drawEikeltje, drawKristalKeuze, drawKleurOrb,
  drawPanBoss, happyPanBoss, drawPannenkoekje, drawBordKeuze,
  drawSisserBoss, happySisserBoss, drawStilPuff,
  drawSokDiefBoss, happySokDiefBoss, drawNatteSok, drawSokKeuze,
  drawKegelBoss, happyKegelBoss, drawBowlingBal,
  drawRexBoss, happyRexBoss, drawDinoEi, drawBotBord,
  drawTikTakBoss, happyTikTakBoss, drawWijzertje, drawKlokKeuze,
  drawSterkeManBoss, happySterkeManBoss, drawKettlebell,
  drawVrieskoningBoss, happyVrieskoningBoss, drawSneeuwvlok,
  drawBoeBoss, happyBoeBoss, drawSpookProjectiel, drawSpookKeuze,
} from './enemyArt.js';
import { tekenKegelBord } from './systems/bowling.js';
import { sig } from './palette.js';

export const BOSS_LOOKS = {
  // De klassieke grijze Grommel-baas (W1) — schiet niet terug.
  grommel: {
    draw: (s, x, groundTop) => drawBoss(s, x, groundTop),
    happy: (s, c, pz) => recolorBossHappy(s, c, sig(pz.stages[pz.stages.length - 1].doel)),
    projectile: null,
  },
  // Golf-Baas (W2): waterzuil-blokkade + rollende golfjes.
  golf: {
    draw: (s, x, groundTop) => {
      const c = drawWaveBoss(s, x, groundTop);
      c.sprayWall = drawSprayWall(s, x, groundTop); // zichtbare schermhoge blokkade
      return c;
    },
    happy: (s, c) => happyWaveBoss(s, c),
    projectile: drawWaveMinion,
    speed: -175,
    waarschuwing: 'Pas op — een golf! Spring! 🌊',
    keuzeArt: drawSchelpKeuze, // stijl 'surf': antwoord-schelpen i.p.v. bellen
  },
  // Boom-Grommel (W3): eikels.
  boom: {
    draw: (s, x, groundTop) => drawTreeBoss(s, x, groundTop),
    happy: (s, c) => happyTreeBoss(s, c),
    projectile: drawAcorn,
    speed: -175,
    waarschuwing: 'Pas op — een eikel! Spring! 🌰',
    vangArt: drawEikeltje, // stijl 'schud': raap gevallen eikels
    vangIcoon: '🌰',
  },
  // Kristal-Grommel (W4): snellere scherven.
  kristal: {
    draw: (s, x, groundTop) => drawCrystalBoss(s, x, groundTop),
    happy: (s, c) => happyCrystalBoss(s, c),
    projectile: drawCrystalShard,
    speed: -215,
    waarschuwing: 'Pas op — een kristal! Spring! 💎',
    keuzeArt: drawKristalKeuze, // stijl 'splits': antwoord-kristallen
  },
  // Meteoor-Grommel (W5): de snelste vuurballen.
  meteoor: {
    draw: (s, x, groundTop) => drawMeteorBoss(s, x, groundTop),
    happy: (s, c) => happyMeteorBoss(s, c),
    projectile: drawFireball,
    speed: -235,
    waarschuwing: 'Pas op — een vuurbal! Spring! ☄️',
  },
  // Kaas-Grommel (W7, de Pizza-Vulkaan): rollende kaaswielen.
  kaas: {
    draw: (s, x, groundTop) => drawKaasBoss(s, x, groundTop),
    happy: (s, c) => happyKaasBoss(s, c),
    projectile: drawKaasWiel,
    speed: -225,
    waarschuwing: 'Pas op — een kaaswiel! Spring! 🧀',
  },
  // De Reuzen-Grommel (W10, Reuzenland): rollende keien. Verslaan doe je
  // niet met bouwen maar met BEUKEN (stijl 'beuk'): word zelf een reus en
  // ram hem — hij krimpt per klap (de scene tweent zijn schaal omlaag).
  reus: {
    draw: (s, x, groundTop) => drawReusBoss(s, x, groundTop),
    happy: (s, c, pz) => recolorBossHappy(s, c, sig(pz.stages[pz.stages.length - 1].doel)),
    projectile: drawKei,
    speed: -190,
    waarschuwing: 'Pas op — een rollende kei! Spring! 🪨',
  },
  // De Reuzen-Drol (W9, Wc-Wonderland): huppelende drolletjes.
  drol: {
    draw: (s, x, groundTop) => drawDrolBoss(s, x, groundTop),
    happy: (s, c) => happyDrolBoss(s, c),
    projectile: drawDrolletje,
    speed: -240,
    waarschuwing: 'Pas op — een drolletje! Spring! 💩',
  },
  // De Pannen-Baas (W8, Pannenkoeken-Paradijs): flipt telbare pannenkoeken
  // over de arena — stijl 'surf'-hergebruik: tel ze en raak het goede bord.
  pan: {
    draw: (s, x, groundTop) => drawPanBoss(s, x, groundTop),
    happy: (s, c) => happyPanBoss(s, c),
    projectile: drawPannenkoekje,
    speed: -200,
    waarschuwing: 'Pas op — een vliegende pannenkoek! Spring! 🥞',
    keuzeArt: drawBordKeuze,
  },
  // De Stinke-Bil (W11, Billenland): wil NIET in bad — gooit stinkwolkjes.
  // Vang-stijl met een eigen vangst: zeepbellen i.p.v. pizza-toppings.
  bil: {
    draw: (s, x, groundTop) => drawBilBoss(s, x, groundTop),
    happy: (s, c) => happyBilBoss(s, c),
    projectile: drawStinkWolkje,
    speed: -210,
    waarschuwing: 'Pas op — een stinkwolkje! Spring! 💨',
    vangArt: drawZeepbel,
    vangIcoon: '🧼',
    vangTekst: 'Vang {n} zeepbellen — dan moet hij in bad! 🧼',
  },
  // De Inkt-Octopus (W12, de Bubbel-Zee): inkt-klodders. Verslaan met
  // stijl 'tien': raak per fase de bel die zijn getal tot 10 aanvult
  // (verliefde getallen) — dan laat een tentakel los.
  octopus: {
    draw: (s, x, groundTop) => drawOctopusBoss(s, x, groundTop),
    happy: (s, c) => happyOctopusBoss(s, c),
    projectile: drawInktKlodder,
    speed: -215,
    waarschuwing: 'Pas op — een inkt-klodder! Spring! 🖤',
  },
  // BARON GRAUW (W6, de finale): grauw-wolkjes — het allersnelst.
  grauw: {
    draw: (s, x, groundTop) => drawGrauwBoss(s, x, groundTop),
    happy: (s, c) => happyGrauwBoss(s, c),
    projectile: drawGrauwWolkje,
    speed: -250,
    waarschuwing: 'Pas op — een grauw-wolkje! Spring! ⛈️',
    vangArt: drawKleurOrb, // finale akte 1: vang de gestolen kleur terug
    vangIcoon: '🌈',
    vangTekst: 'Vang {n} kleur-orbs terug! 🌈',
  },
  // DE SOKKEN-DIEF (W13, de Kleren-Kast): gooit natte sokken. Verslaan met
  // stijl 'paar': raak per fase de sok die HETZELFDE is als die in zijn
  // denk-wolkje (patronen vergelijken) — dan laat hij een zak sokken los.
  sokdief: {
    draw: (s, x, groundTop) => drawSokDiefBoss(s, x, groundTop),
    happy: (s, c) => happySokDiefBoss(s, c),
    projectile: drawNatteSok,
    speed: -205,
    waarschuwing: 'Pas op — een natte sok! Spring! 🧦',
    keuzeArt: drawSokKeuze, // stijl 'paar': zwevende patroon-sokken
  },
  // DE KEGEL-KONING (W14, het Stuiter-Stadion): rollende bowlingballen.
  // Verslaan met stijl 'kegel': hij kegelt zijn eigen onderdanen om — reken
  // uit hoeveel er nog staan (10−4 … 60−24) en raak het goede antwoord-bord.
  kegel: {
    draw: (s, x, groundTop) => drawKegelBoss(s, x, groundTop),
    happy: (s, c) => happyKegelBoss(s, c),
    projectile: drawBowlingBal,
    speed: -220,
    waarschuwing: 'Pas op — een bowlingbal! Spring! 🎳',
    keuzeArt: tekenKegelBord, // stijl 'kegel': antwoord-borden in kegelvorm
  },
  // REKEN-REX (W15, Dino-Dal): rollende dino-eieren. Verslaan met stijl
  // 'sprong': tel zijn getallenlijn-sprongen mee (start + sprong × keer)
  // en raak het bot-bord met de landing.
  rex: {
    draw: (s, x, groundTop) => drawRexBoss(s, x, groundTop),
    happy: (s, c) => happyRexBoss(s, c),
    projectile: drawDinoEi,
    speed: -210,
    waarschuwing: 'Pas op — een rollend dino-ei! Spring! 🥚',
    keuzeArt: drawBotBord, // stijl 'sprong': antwoord-botten
  },
  // BARON TIK-TAK (W16, de Klokken-Toren): zoevende wijzertjes. Verslaan
  // met stijl 'klok': raak de klok die de gevraagde tijd toont.
  tiktak: {
    draw: (s, x, groundTop) => drawTikTakBoss(s, x, groundTop),
    happy: (s, c) => happyTikTakBoss(s, c),
    projectile: drawWijzertje,
    speed: -230,
    waarschuwing: 'Pas op — een zoevend wijzertje! Spring! 🕐',
    keuzeArt: drawKlokKeuze, // stijl 'klok': antwoord-klokken
  },
  // DE STERKE MAN (W17, het Circus-Kanon): stuiterende kettlebells.
  // Verslaan met stijl 'balans': maak zijn halter precies even zwaar.
  sterkeman: {
    draw: (s, x, groundTop) => drawSterkeManBoss(s, x, groundTop),
    happy: (s, c) => happySterkeManBoss(s, c),
    projectile: drawKettlebell,
    speed: -220,
    waarschuwing: 'Pas op — een kettlebell! Spring! 💪',
  },
  // DE VRIESKONING (W18, Onder-Nul): dwarrelende sneeuwvlokken. Verslaan met
  // stijl 'vries': tel zijn thermometer terug naar het doel (0 of eronder) —
  // dan dooit hij een beetje. Naar nul en verder = zijn ijs smelt.
  vrieskoning: {
    draw: (s, x, groundTop) => drawVrieskoningBoss(s, x, groundTop),
    happy: (s, c) => happyVrieskoningBoss(s, c),
    projectile: drawSneeuwvlok,
    speed: -205,
    waarschuwing: 'Pas op — een sneeuwvlok! Spring! ❄️',
  },
  // HET GROTE BOE (W19, Het Spook-Slot): zoevende spookjes. Verslaan met stijl
  // 'flits': hij tovert een tros spookjes die 1 seconde oplichten — tel ze in
  // één oogopslag (subitizeren) en raak het grafzerkje met het juiste aantal.
  boe: {
    draw: (s, x, groundTop) => drawBoeBoss(s, x, groundTop),
    happy: (s, c) => happyBoeBoss(s, c),
    projectile: drawSpookProjectiel,
    speed: -225,
    waarschuwing: 'Pas op — een zoevend spookje! Spring! 👻',
    keuzeArt: drawSpookKeuze, // stijl 'flits': antwoord-grafzerkjes
  },
  // DE SISSER (Letter-Land, De Praatweide): stilte-wolkjes. Verslaan met stijl
  // 'sisser': ontwijk de wolkjes en SCHRIJF per fase een letter van zijn
  // gestolen woord terug — dan krimpt hij; bij het hele woord bekeert hij zich.
  sisser: {
    draw: (s, x, groundTop) => drawSisserBoss(s, x, groundTop),
    happy: (s, c) => happySisserBoss(s, c),
    projectile: drawStilPuff,
    speed: -190,
    waarschuwing: 'Pas op — een stilte-wolkje! Spring! 🤫',
  },
};

export function bossLook(name) {
  return BOSS_LOOKS[name] || BOSS_LOOKS.grommel;
}
