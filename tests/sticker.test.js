// Tests voor de Plakboek-logica (src/stickerLogic.js).
import { describe, it, expect } from 'vitest';
import {
  PAGINAS, TOTAAL, PAK_KOST, STICKERS_PER_PAK,
  alleStickers, stickerById, openPak, paginaVol, albumVol,
  aantalCompleet, nieuwVollePaginas,
} from '../src/stickerLogic.js';

describe('catalogus', () => {
  it('heeft 4 pagina\'s van 6 stickers = 24', () => {
    expect(PAGINAS).toHaveLength(4);
    PAGINAS.forEach((p) => expect(p.stickers).toHaveLength(6));
    expect(TOTAAL).toBe(24);
    expect(alleStickers()).toHaveLength(24);
  });

  it('alle sticker-ids zijn uniek', () => {
    const ids = alleStickers().map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('elke pagina heeft precies één gouden sticker', () => {
    PAGINAS.forEach((p) => {
      expect(p.stickers.filter((s) => s.rar === 'goud')).toHaveLength(1);
    });
  });

  it('stickerById vindt en mist correct', () => {
    expect(stickerById('bal_rood').naam).toBe('Rode Bal');
    expect(stickerById('bestaat_niet')).toBe(null);
  });
});

describe('openPak', () => {
  it('geeft STICKERS_PER_PAK stickers zonder dubbele binnen één pakje', () => {
    const pak = openPak({});
    expect(pak).toHaveLength(STICKERS_PER_PAK);
    expect(new Set(pak.map((p) => p.id)).size).toBe(pak.length);
  });

  it('markeert stickers als nieuw wanneer je ze nog niet had', () => {
    const pak = openPak({});
    expect(pak.every((p) => p.nieuw)).toBe(true);
  });

  it('duplicaat-bescherming: geeft de laatst ontbrekende sticker (nieuw)', () => {
    // Bezit alles behalve bal_regenboog
    const owned = {};
    alleStickers().forEach((s) => { if (s.id !== 'bal_regenboog') owned[s.id] = 1; });
    const pak = openPak(owned, () => 0, 1); // rnd 0 → kiest verplicht een nieuwe
    expect(pak[0].id).toBe('bal_regenboog');
    expect(pak[0].nieuw).toBe(true);
  });

  it('vol album: pakje bevat dan (noodgedwongen) een dubbel, gemarkeerd niet-nieuw', () => {
    const owned = {};
    alleStickers().forEach((s) => { owned[s.id] = 1; });
    const pak = openPak(owned, () => 0.99, 1);
    expect(pak[0].nieuw).toBe(false);
  });

  it('gewone stickers vallen vaker dan gouden', () => {
    let gewoon = 0, goud = 0;
    for (let i = 0; i < 400; i++) {
      openPak({}, Math.random, 1).forEach((p) => {
        const s = stickerById(p.id);
        if (s.rar === 'g') gewoon++;
        if (s.rar === 'goud') goud++;
      });
    }
    expect(gewoon).toBeGreaterThan(goud);
  });
});

describe('pagina- en album-voortgang', () => {
  it('paginaVol klopt', () => {
    const owned = {};
    PAGINAS[0].stickers.forEach((s) => { owned[s.id] = 1; });
    expect(paginaVol(owned, 0)).toBe(true);
    expect(paginaVol(owned, 1)).toBe(false);
  });

  it('albumVol pas als alles compleet is', () => {
    const owned = {};
    alleStickers().forEach((s) => { owned[s.id] = 1; });
    expect(albumVol(owned)).toBe(true);
    delete owned['bui_slang'];
    expect(albumVol(owned)).toBe(false);
  });

  it('aantalCompleet telt unieke bezeten stickers (dubbels tellen niet dubbel)', () => {
    const owned = { bal_rood: 3, bal_geel: 1 };
    expect(aantalCompleet(owned)).toBe(2);
  });

  it('nieuwVollePaginas ziet alleen net-voltooide pagina\'s', () => {
    const voor = {}; PAGINAS[0].stickers.forEach((s, i) => { if (i < 5) voor[s.id] = 1; });
    const na = { ...voor }; PAGINAS[0].stickers.forEach((s) => { na[s.id] = 1; });
    expect(nieuwVollePaginas(voor, na)).toEqual([0]);
    expect(nieuwVollePaginas(na, na)).toEqual([]);
  });
});

describe('economie', () => {
  it('pak-kost en pak-grootte zijn redelijk', () => {
    expect(PAK_KOST).toBeGreaterThan(0);
    expect(STICKERS_PER_PAK).toBeGreaterThanOrEqual(1);
  });
});
