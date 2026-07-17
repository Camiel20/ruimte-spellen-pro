// ===== ALLE LEVEL-SYSTEMEN OP ÉÉN PLEK =====
// Elk systeem = één mechanic met { build(s, L), update?(s, time, delta),
// afterPlayer?(s) }. AdventureScene loopt hier generiek overheen:
//   - create():      SYSTEMS.forEach((sys) => sys.build(this, L))
//   - na buildPlayer: SYSTEMS.forEach((sys) => sys.afterPlayer?.(this))
//   - update():      SYSTEMS.forEach((sys) => sys.update?.(this, time, delta))
// Nieuwe mechanic = één bestand in deze map + één regel hieronder — de scene
// hoeft er niets van te weten. Volgorde = update-volgorde.

import telWolken from './telwolken.js';
import plates from './plates.js';
import vraagMuren from './vraagmuren.js';
import chases from './chases.js';
import maanZones from './maanzones.js';
import raket from './raket.js';
import portalen from './portalen.js';
import duwKisten from './duwkisten.js';
import grauwMuren from './grauwmuren.js';
import geisers from './geisers.js';
import kantels from './kantels.js';
import bakkerij from './bakkerij.js';
import nulFeest from './nulfeest.js';
import flippers from './flippers.js';
import glijbanen from './glijbanen.js';
import stapel from './stapel.js';
import reuzenflip from './reuzenflip.js';
import patroon from './patroon.js';
import spoelpotten from './spoelpotten.js';
import wcRollen from './wcrollen.js';
import stinkZones from './stinkzones.js';
import grootte from './grootte.js';
import bilTrampolines from './biltrampoline.js';
import parenBorden from './parenbord.js';
import zwemZones from './zwemzones.js';
import duikboten from './duikboot.js';
import schrijf from './schrijf.js';
import wasLijnen from './waslijnen.js';
import sokkenParen from './sokkenparen.js';
import maatRekken from './maatrekken.js';
import knopenWinkels from './knopenwinkel.js';
import stuiterBallen from './stuiterballen.js';
import bowlingBanen from './bowling.js';
import baskets from './baskets.js';
import dinoRitten from './dinorit.js';
import fossielen from './fossielen.js';
import koekoeken from './koekoek.js';
import slingers from './slingers.js';
import tandwielen from './tandwielen.js';
import weegWippen from './weegwip.js';
import kanonnen from './kanonnen.js';
import koorden from './koorden.js';
import thermometers from './thermometer.js';
import sneeuwballen from './sneeuwbal.js';
import flitsSpoken from './flitsspoken.js';
import spookTreden from './spooktreden.js';

export const SYSTEMS = [telWolken, plates, vraagMuren, chases, maanZones, raket, portalen, duwKisten, grauwMuren, geisers, kantels, bakkerij, nulFeest, flippers, glijbanen, stapel, reuzenflip, patroon, spoelpotten, wcRollen, stinkZones, grootte, bilTrampolines, parenBorden, zwemZones, duikboten, schrijf, wasLijnen, sokkenParen, maatRekken, knopenWinkels, stuiterBallen, bowlingBanen, baskets, dinoRitten, fossielen, koekoeken, slingers, tandwielen, weegWippen, kanonnen, koorden, thermometers, sneeuwballen, flitsSpoken, spookTreden];
