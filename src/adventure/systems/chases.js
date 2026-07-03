// ===== SYSTEEM: ACHTERVOLGINGEN =====
// Een rollende rotsbal (of vlammende komeet, skin 'komeet') komt achter je
// aan: RENNEN! Raak = krimpen en de rots spat uiteen (opnieuw proberen bij de
// trigger); haal het einde en hij spat vanzelf. Werkwoord: rennen/durven.

import { SFX } from '../../sound.js';
import { Voice } from '../../voice.js';

function start(s, ch) {
  ch.actief = true;
  const groundTop = s.level.platforms[0][1];
  const c = s.add.container(ch.spawnX, groundTop - 30).setDepth(9);
  const g = s.add.graphics();
  if (ch.skin === 'komeet') {
    // vlammende komeet: gloeiende kop met een flakkerende vuurstaart erachter
    const trail = s.add.graphics();
    trail.fillStyle(0xf07c1f, 0.75); trail.fillEllipse(-36, 0, 46, 24);
    trail.fillStyle(0xffc14d, 0.75); trail.fillEllipse(-24, 0, 28, 14);
    c.add(trail);
    s.tweens.add({ targets: trail, scaleX: 1.2, alpha: 0.5, duration: 150, yoyo: true, repeat: -1 });
    g.fillStyle(0xe8402c, 1); g.fillCircle(0, 0, 26);
    g.fillStyle(0xf07c1f, 1); g.fillCircle(3, -3, 19);
    g.fillStyle(0xffe16b, 1); g.fillCircle(6, -5, 10);
    g.lineStyle(3, 0xb93227, 1); g.strokeCircle(0, 0, 26);
    c.add(g);
  } else {
    g.fillStyle(0x6a7078, 1); g.fillCircle(0, 0, 28);
    g.fillStyle(0x7d838c, 1); g.fillCircle(-6, -6, 20);
    g.lineStyle(3, 0x4a4f55, 1); g.strokeCircle(0, 0, 28);
    g.fillStyle(0x4a4f55, 0.8); g.fillCircle(8, 4, 5); g.fillCircle(-10, 8, 4); g.fillCircle(2, -12, 4);
    c.add(g);
    s.tweens.add({ targets: g, angle: 360, duration: 700, repeat: -1 });
  }
  c._g = g;
  s.physics.add.existing(c);
  c.body.setAllowGravity(false);
  c.body.setSize(56, 56); c.body.setOffset(-28, -28);
  c.body.setVelocityX(ch.speed || 185);
  ch.rots = c;
  SFX.stomp(); s.cameraPunch(0.02, 6); Voice.cue('oops');
  s.questText.setText(ch.skin === 'komeet' ? 'RENNEN! De komeet komt! ☄️' : 'RENNEN! 🪨');
}

function crash(s, ch, geraakt) {
  if (ch.rots) {
    s.burstStars(ch.rots.x, ch.rots.y, 12); SFX.stomp();
    s.tweens.killTweensOf(ch.rots._g);
    ch.rots.destroy();
  }
  ch.rots = null;
  ch.actief = false;
  ch.klaar = !geraakt; // gehaald → klaar; geraakt → opnieuw bij de trigger
}

export default {
  build(s, L) {
    s.chases = (L.achtervolgingen || []).map((A) => ({ ...A, actief: false, klaar: false, rots: null }));
  },

  update(s, time) {
    const p = s.player;
    for (const ch of s.chases) {
      if (ch.actief && ch.rots) {
        if (time > s.invulnUntil && Math.abs(p.x - ch.rots.x) < 44 && Math.abs(p.y - ch.rots.y) < 90) {
          s.shrinkPlayer(ch.rots);
          crash(s, ch, true);
        } else if (ch.rots.x > ch.endX) {
          crash(s, ch, false);
          s.questText.setText('Gehaald! De rots is stuk! 🎉');
          s.vierMijlpaal(ch.endX);
        }
      } else if (!ch.actief && !ch.klaar && p.x > ch.triggerX && p.x < ch.endX - 80) {
        start(s, ch);
      }
    }
  },
};
