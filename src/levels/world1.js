// ===== WERELD 1 — LEVELDATA (data-gedreven) =====
// Een level is PUUR data. De engine (AdventureScene) kent geen level-specifieke
// code: hij leest deze objecten uit en bouwt de wereld. Nieuwe levels voeg je
// toe door een object aan WORLD1 te hangen — geen engine-wijziging nodig.
//
// Coördinaten: (0,0) = linksboven. Platforms zijn [x, y, breedte, hoogte] met
// (x,y) als LINKERBOVENHOEK (statische Arcade-bodies). De grond ligt op y≈660;
// het scherm is 480×800, de wereld scrollt horizontaal mee met de speler.

export const LEVEL_1_1 = {
  id: '1-1',
  naam: 'De Kapotte Brug',

  worldW: 2100,
  worldH: 800,
  killY: 700, // val je hieronder (in de kloof) → meteen zacht terug naar checkpoint
              // (net onder grondhoogte, zodat je NIET op de wereld-bodem kunt landen
              //  en aan de overkant omhoog klimt — de brug is echt nodig)

  // Lucht → gras (Numberblocks-thema)
  bg: { top: 0x8fd3ff, bottom: 0x8ed36b },

  start: { x: 90, y: 560 },
  // Zodra de brug ligt en je oversteekt, verschuift je checkpoint hierheen.
  checkpointAfterGate: { x: 1180, y: 560 },

  // Statische grond en richels. Vóór de kloof (A), erna (B), plus een hoge
  // richel met de verstopte ster (alleen te halen als je gegroeid bent).
  // De kloof (760→1120) is BREED genoeg dat je er NIET overheen kunt springen:
  // de brug bouwen is de enige weg. Zo is de rekenpuzzel de kern, geen omweg.
  platforms: [
    [0, 660, 760, 140],     // grond A
    [1120, 660, 980, 140],  // grond B (na de kloof)
    [1300, 490, 150, 24],   // richel met de ster
  ],

  // Groei-bolletje: oppakken → Één wordt groter en springt hoger.
  pickups: [
    { x: 360, y: 600, amount: 1 },
  ],

  // Eén brug-poort over de kloof. Maak van de losse blokjes het doelgetal
  // (3 = 1+2), dan klikt de brug op z'n plek en stroomt de kleur terug.
  gate: {
    type: 'brug',
    gapX: 760, gapW: 360,   // de kloof die de brug moet dichten (onspringbaar)
    y: 650,
    doel: 3,
    blocks: [1, 2],         // losse blokjes die klaarliggen
    triggerX: 640,          // vanaf hier (rand van grond A) verschijnt de ✋-knop
    triggerW: 120,
  },

  // Eén Grommel (stomp-type): erop springen → hij wordt vrolijk en kleurig.
  // Van opzij raken → je krimpt (geen game-over).
  grommels: [
    { type: 'stomp', x: 540, y: 612, patrol: [460, 700] },
  ],

  // Verstopte ster (geheim) op de hoge richel.
  star: { x: 1375, y: 452 },

  // Doel-vlag: een grote glanzende 3 die het level "compleet maakt".
  goal: { x: 2000, y: 588, value: 3 },
};

export const WORLD1 = [LEVEL_1_1 /*, LEVEL_1_2, ... */];
