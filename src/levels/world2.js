// ===== WERELD 2 — HANDJES-KUST (leveldata) =====
// Strand & zee. Concept: vijftallen, dubbelen, en vooral SAMEN 10 MAKEN.
// Nieuw t.o.v. Wereld 1: water met stapstenen (springen over zee) en grotere
// getallen (bouw 10). Je houdt je geleerde krachten (dubbelsprong + stamp).
// Zelfde data-gedreven engine als Wereld 1 (zie AdventureScene / world1.js).

export const LEVEL_2_1 = {
  id: '2-1',
  naam: 'Samen Tien op de Kust',

  worldW: 2400,
  worldH: 800,
  killY: 720,
  bg: { top: 0x8fd3ff, bottom: 0xf3e2b0 }, // lucht → zand

  start: { x: 90, y: 560 },
  startDoubleJump: true, // krachten van Wereld 1 blijven
  startStamp: true,
  intro: 'Welkom op de kust! Maak samen 10!',

  // Zand-eilanden met stapstenen ertussen; daarna een brug-poort over zee.
  platforms: [
    [0, 660, 600, 140],     // zand A (start)
    [690, 660, 150, 40],    // stapsteen 1
    [930, 660, 150, 40],    // stapsteen 2
    [1170, 660, 500, 140],  // zand B
    [2030, 660, 370, 140],  // zand C (na de brug) — met de vlag
  ],

  // Water (alleen visueel) onder het stapsteen-gedeelte.
  water: [
    [600, 692, 1070, 108],
  ],

  grommels: [
    { type: 'stomp', x: 300, y: 612, patrol: [180, 520] },
  ],

  // Brug over zee: maak SAMEN 10 (4 + 6). Grotere som = Wereld-2-concept.
  gate: {
    type: 'brug',
    gapX: 1670, gapW: 360,
    y: 650,
    doel: 10,
    blocks: [4, 6],
    triggerX: 1550,
    triggerW: 120,
    water: true, // teken de kloof als water i.p.v. donkere spleet
  },

  // Ster boven zand B — met de dubbelsprong.
  star: { x: 1400, y: 430 },

  goal: { x: 2300, y: 588, value: 10 },

  reward: {
    title: 'Level 2-1 gehaald! 🏆',
    subtitle: 'Je hebt samen 10 gemaakt op de kust!',
    stars: 3, medal: 'adventure_2_1', medalLabel: 'Tien-Maker',
  },
};

export const WORLD2 = [LEVEL_2_1];
