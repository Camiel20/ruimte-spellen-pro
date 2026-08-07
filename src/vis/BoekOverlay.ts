// Hapvis — het vissenboek-scherm. Alleen opbouw: welke soorten er in staan en
// wat ontdekt is, wordt bepaald in logic/boek.ts; de scene blijft de regisseur.
//
// Bewust een eigen overlay en niet VisScene.toonKaart(): die functie is
// "gecentreerde tekstregels met automatische hoogte" en roept altijd de
// kleur/skin-keuzerij aan. Een 4×4-raster wil juist de hele kaart. De kleine
// hoeveelheid dubbele kaart-opmaak (dimvlak, witte kaart, knopstijl) nemen we
// op de koop toe.

import Phaser from 'phaser';
import * as CFG from './GameConfig';
import { BOEK_TEX_SCHAAL, TEX, ZONE_LUCHT } from './graphics';
import type { BoekItem } from './logic/boek';

const KAART_X = 12;
const KAART_B = CFG.SCHERM_B - 24;
const KAART_Y = 16;
const KAART_H = CFG.SCHERM_H - 32;

const KOLOMMEN = 4;
const RASTER_X = 30; // midden van de eerste kolom
const RASTER_Y = 148; // midden van de eerste rij (plaatje)
const STAP_X = 108;
const STAP_Y = 150;

export function bouwBoek(
  scene: Phaser.Scene,
  laag: Phaser.GameObjects.Container,
  pagina: BoekItem[],
  ontdekt: number,
  opTerug: (p: Phaser.Input.Pointer) => void,
): void {
  const b = CFG.SCHERM_B;

  laag.add(scene.add.rectangle(0, 0, b, CFG.SCHERM_H, 0x03101f, 0.72).setOrigin(0));

  const kaart = scene.add.graphics();
  kaart.fillStyle(0xffffff, 0.96);
  kaart.fillRoundedRect(KAART_X, KAART_Y, KAART_B, KAART_H, 22);
  kaart.lineStyle(4, 0x14303f, 1);
  kaart.strokeRoundedRect(KAART_X, KAART_Y, KAART_B, KAART_H, 22);
  laag.add(kaart);

  laag.add(
    scene.add
      .text(b / 2, KAART_Y + 34, 'VISSENBOEK', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '26px',
        color: '#14303f',
      })
      .setOrigin(0.5),
  );
  laag.add(
    scene.add
      .text(b / 2, KAART_Y + 64, `${ontdekt} van de ${pagina.length} gevonden`, {
        fontFamily: 'Arial',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#0ea5e9',
      })
      .setOrigin(0.5),
  );

  // Alle tegelachtergronden in één Graphics: 16 losse Rectangles zouden 16
  // extra display-objecten kosten voor iets wat één pad kan zijn.
  const tegels = scene.add.graphics();
  laag.add(tegels);

  pagina.forEach((item, i) => {
    const kol = i % KOLOMMEN;
    const rij = Math.floor(i / KOLOMMEN);
    const x = RASTER_X + kol * STAP_X + 24;
    const y = RASTER_Y + rij * STAP_Y;

    tegels.fillStyle(item.ontdekt ? 0xeaf6fb : 0xeef2f5, 1);
    tegels.fillRoundedRect(x - 50, y - 46, 100, 128, 12);

    const vis = scene.add
      .image(x, y, TEX.boek(item.id))
      .setScale(BOEK_TEX_SCHAAL)
      .setDepth(1);
    laag.add(vis);

    if (!item.ontdekt) {
      // Silhouet: donker vlak ín de vorm van de vis. setTintFill werkt niet in
      // de Canvas-renderer, dus ook alpha verlagen zodat het altijd leest.
      vis.setTintFill(0x0b2536);
      vis.setAlpha(0.55);
      laag.add(
        scene.add
          .text(x, y, '?', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '30px',
            color: '#ffffff',
          })
          .setOrigin(0.5)
          .setDepth(2),
      );
    }

    laag.add(
      scene.add
        .text(x, y + 44, item.ontdekt ? item.naam : '???', {
          fontFamily: 'Arial',
          fontSize: '11px',
          fontStyle: 'bold',
          color: item.ontdekt ? '#14303f' : '#8ba3b3',
        })
        .setOrigin(0.5)
        .setDepth(2),
    );

    // Onderregel: hoe vaak gegeten, of waar hij zwemt.
    if (item.opSlot) {
      laag.add(
        scene.add
          .text(x, y + 62, `🔒 fase ${CFG.ZONE4_EIS_FASE}`, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#8ba3b3',
          })
          .setOrigin(0.5)
          .setDepth(2),
      );
    } else if (item.ontdekt && item.aantal > 0) {
      laag.add(
        scene.add
          .text(x, y + 62, `${item.aantal}× gegeten`, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#5b7083',
          })
          .setOrigin(0.5)
          .setDepth(2),
      );
    } else if (item.ontdekt && !item.vangbaar) {
      laag.add(
        scene.add
          .text(x, y + 62, 'te groot!', {
            fontFamily: 'Arial',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#c1121f',
          })
          .setOrigin(0.5)
          .setDepth(2),
      );
    } else if (item.ontdekt) {
      laag.add(
        scene.add
          .text(x, y + 62, 'ontmoet', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#5b7083',
          })
          .setOrigin(0.5)
          .setDepth(2),
      );
    }

    // Zone-stippen in exact de kleuren van de dieptemeter, zodat een kind ze
    // kan matchen met de balk langs de rechterrand — werkt zonder lezen.
    if (!item.opSlot) {
      const stippen = scene.add.graphics().setDepth(2);
      const totaal = item.zones.length;
      item.zones.forEach((nr, n) => {
        const sx = x - ((totaal - 1) * 12) / 2 + n * 12;
        stippen.fillStyle(ZONE_LUCHT[Math.min(nr, ZONE_LUCHT.length) - 1][1], 1);
        stippen.fillCircle(sx, y + 76, 4.5);
        stippen.lineStyle(1, 0x14303f, 0.5);
        stippen.strokeCircle(sx, y + 76, 4.5);
      });
      laag.add(stippen);
    }
  });

  const knopY = CFG.SCHERM_H - 62;
  const vlak = scene.add
    .rectangle(b / 2, knopY, b - 110, 42, 0x64748b, 1)
    .setInteractive({ useHandCursor: true })
    .setDepth(3);
  vlak.on('pointerdown', opTerug);
  laag.add(vlak);
  laag.add(
    scene.add
      .text(b / 2, knopY, '⬅ Terug', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '17px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(4),
  );
}
