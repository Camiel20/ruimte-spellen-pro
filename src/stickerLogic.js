// Plakboek: pure logica, los van Phaser zodat vitest 'm kan testen.
//
// Sterren (verdiend in álle spellen) koop je in voor verrassings-pakjes; die
// leveren stickers voor thema-pagina's. Kindvriendelijk: pakjes geven bij
// voorkeur stickers die je NOG NIET hebt (weinig frustrerende dubbels), maar
// af en toe een dubbel → die sticker gaat "glimmeren".

export const PAK_KOST = 5;          // sterren per verrassings-pakje
export const STICKERS_PER_PAK = 2;  // hoeveel stickers een pakje geeft

// Rariteit bepaalt hoe vaak een sticker valt: gewoon > zeldzaam > goud.
function rariteitGewicht(r) { return r === 'goud' ? 1 : r === 'z' ? 3 : 6; }

// De catalogus: 4 pagina's van 6 stickers. `kind` stuurt de tekening in de
// scene; `kleur` de signatuurkleur; `rar` de rariteit (g/z/goud).
export const PAGINAS = [
  {
    naam: 'Ballonnen-feest', accent: 0xec6aa9, stickers: [
      { id: 'bal_rood', kind: 'ballon', kleur: 0xe8402c, naam: 'Rode Bal', rar: 'g' },
      { id: 'bal_oranje', kind: 'ballon', kleur: 0xf08a24, naam: 'Oranje Bal', rar: 'g' },
      { id: 'bal_geel', kind: 'ballon', kleur: 0xf6c624, naam: 'Gele Bal', rar: 'g' },
      { id: 'bal_groen', kind: 'ballon', kleur: 0x57b947, naam: 'Groene Bal', rar: 'z' },
      { id: 'bal_paars', kind: 'ballon', kleur: 0x9b6dd6, naam: 'Paarse Bal', rar: 'z' },
      { id: 'bal_regenboog', kind: 'ballon_rb', kleur: 0xffffff, naam: 'Regenboog!', rar: 'goud' },
    ],
  },
  {
    naam: 'De Ruimte', accent: 0x4f63c9, stickers: [
      { id: 'ru_ster', kind: 'ster', kleur: 0xfbbf24, naam: 'Sterretje', rar: 'g' },
      { id: 'ru_maan', kind: 'maan', kleur: 0xe2e8f0, naam: 'De Maan', rar: 'g' },
      { id: 'ru_planeet', kind: 'planeet', kleur: 0x38b6cf, naam: 'Planeet', rar: 'g' },
      { id: 'ru_raket', kind: 'raket', kleur: 0xe8402c, naam: 'Raket', rar: 'z' },
      { id: 'ru_komeet', kind: 'komeet', kleur: 0xf6c624, naam: 'Komeet', rar: 'z' },
      { id: 'ru_nulplaneet', kind: 'nulplaneet', kleur: 0x7c3aed, naam: 'Nul-Planeet', rar: 'goud' },
    ],
  },
  {
    naam: 'Getallen-vriendjes', accent: 0xe8402c, stickers: [
      { id: 'getal_1', kind: 'blokje', kleur: 0xe8402c, naam: 'Eén', label: '1', rar: 'g' },
      { id: 'getal_2', kind: 'blokje', kleur: 0xf08a24, naam: 'Twee', label: '2', rar: 'g' },
      { id: 'getal_3', kind: 'blokje', kleur: 0xf6c624, naam: 'Drie', label: '3', rar: 'g' },
      { id: 'getal_4', kind: 'blokje', kleur: 0x57b947, naam: 'Vier', label: '4', rar: 'z' },
      { id: 'getal_5', kind: 'blokje', kleur: 0x38b6cf, naam: 'Vijf', label: '5', rar: 'z' },
      { id: 'getal_10', kind: 'blokje', kleur: 0x9b6dd6, naam: 'Tien!', label: '10', rar: 'goud' },
    ],
  },
  {
    naam: 'Buiten spelen', accent: 0x57b947, stickers: [
      { id: 'bui_bloem', kind: 'bloem', kleur: 0xf87171, naam: 'Bloem', rar: 'g' },
      { id: 'bui_zon', kind: 'zon', kleur: 0xfcd34d, naam: 'Zonnetje', rar: 'g' },
      { id: 'bui_wolk', kind: 'wolk', kleur: 0xffffff, naam: 'Wolkje', rar: 'g' },
      { id: 'bui_vlinder', kind: 'vlinder', kleur: 0xec6aa9, naam: 'Vlinder', rar: 'z' },
      { id: 'bui_boom', kind: 'boom', kleur: 0x35772b, naam: 'Boom', rar: 'z' },
      { id: 'bui_slang', kind: 'slang', kleur: 0x22c55e, naam: 'Slang', rar: 'goud' },
    ],
  },
];

export const TOTAAL = PAGINAS.reduce((n, p) => n + p.stickers.length, 0);

export function alleStickers() {
  return PAGINAS.flatMap((p, pi) => p.stickers.map((s) => ({ ...s, pagina: pi })));
}

export function stickerById(id) {
  return alleStickers().find((s) => s.id === id) || null;
}

function gewogenKies(pool, rnd) {
  const totaal = pool.reduce((s, x) => s + rariteitGewicht(x.rar), 0);
  let r = rnd() * totaal;
  for (const x of pool) { r -= rariteitGewicht(x.rar); if (r < 0) return x; }
  return pool[pool.length - 1];
}

// Open een pakje: geef STICKERS_PER_PAK stickers terug als [{ id, nieuw }].
// `owned` is de sticker-map (id -> aantal) VÓÓR dit pakje. Binnen één pakje
// nooit twee dezelfde; bij voorkeur nieuwe (80%), soms een bewuste dubbel.
export function openPak(owned, rnd = Math.random, aantal = STICKERS_PER_PAK) {
  const alle = alleStickers();
  const gegeven = new Set();
  const res = [];
  for (let i = 0; i < aantal; i++) {
    const ontbreekt = alle.filter((s) => !(owned[s.id] > 0) && !gegeven.has(s.id));
    const rest = alle.filter((s) => !gegeven.has(s.id));
    if (!rest.length) break;
    // Alles al bijna compleet → verplicht een nieuwe pakken zolang die er zijn.
    const wilNieuw = ontbreekt.length > 0 && (rest.length === ontbreekt.length || rnd() < 0.8);
    const pool = wilNieuw ? ontbreekt : rest;
    const s = gewogenKies(pool, rnd);
    gegeven.add(s.id);
    res.push({ id: s.id, nieuw: !(owned[s.id] > 0) });
  }
  return res;
}

export function paginaVol(owned, pagina) {
  return PAGINAS[pagina].stickers.every((s) => (owned[s.id] || 0) > 0);
}

export function albumVol(owned) {
  return PAGINAS.every((_, pi) => paginaVol(owned, pi));
}

export function aantalCompleet(owned) {
  return alleStickers().filter((s) => (owned[s.id] || 0) > 0).length;
}

// Welke pagina's zijn NIEUW compleet geworden (vergelijk vóór en ná)?
export function nieuwVollePaginas(voor, na) {
  const uit = [];
  PAGINAS.forEach((_, pi) => {
    if (paginaVol(na, pi) && !paginaVol(voor, pi)) uit.push(pi);
  });
  return uit;
}
