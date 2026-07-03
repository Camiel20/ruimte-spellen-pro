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

export const SYSTEMS = [telWolken, plates, vraagMuren, chases, maanZones, raket, portalen];
