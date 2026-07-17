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
  } else if (ch.skin === 'bal') {
    // rollende reuzen-voetbal (het Stuiter-Stadion): wit met zwarte vlakken
    g.fillStyle(0xffffff, 1); g.fillCircle(0, 0, 27);
    g.fillStyle(0x16202b, 1);
    g.fillCircle(0, 0, 8);
    for (let a = 0; a < 5; a++) {
      const ang = (a / 5) * Math.PI * 2;
      g.fillCircle(Math.cos(ang) * 17, Math.sin(ang) * 17, 5.5);
    }
    g.fillStyle(0xffffff, 0.5); g.fillEllipse(-9, -11, 12, 7);
    g.lineStyle(3, 0x9aa0a6, 1); g.strokeCircle(0, 0, 27);
    c.add(g);
    s.tweens.add({ targets: g, angle: 360, duration: 600, repeat: -1 });
  } else if (ch.skin === 'sneeuwbal') {
    // een rollende reuzen-sneeuwbal (Onder-Nul): wit met een blauwe glans
    g.fillStyle(0xffffff, 1); g.fillCircle(0, 0, 28);
    g.fillStyle(0xe8f4ff, 1); g.fillCircle(-8, -9, 16);
    g.fillStyle(0xdff2ff, 1); g.fillCircle(9, 6, 6); g.fillCircle(-4, 11, 4); g.fillCircle(6, -12, 4);
    g.lineStyle(3, 0xbfe3fb, 1); g.strokeCircle(0, 0, 28);
    c.add(g);
    s.tweens.add({ targets: g, angle: 360, duration: 620, repeat: -1 });
  } else if (ch.skin === 'spook') {
    // een groot, grijnzend jaag-spook (het Spook-Slot): zweeft en golft
    g.fillStyle(0xf2f4f8, 0.96); g.fillCircle(0, -4, 27); g.fillRect(-27, -4, 54, 26);
    for (let k = -3; k <= 3; k++) g.fillCircle(k * 8.5, 22, 6);
    g.fillStyle(0x2b2f34, 1); g.fillEllipse(-9, -8, 7, 10); g.fillEllipse(9, -8, 7, 10);
    g.fillStyle(0x2b2f34, 1); g.beginPath(); g.arc(0, 4, 8, 0, Math.PI, false); g.fillPath(); // grijns-mond
    c.add(g);
    s.tweens.add({ targets: g, y: -8, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
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
  s.questText.setText(ch.skin === 'komeet' ? 'RENNEN! De komeet komt! ☄️'
    : ch.skin === 'bal' ? 'RENNEN! De reuzen-voetbal rolt! ⚽'
    : ch.skin === 'sneeuwbal' ? 'RENNEN! De reuzen-sneeuwbal rolt! ⛄'
    : ch.skin === 'spook' ? 'RENNEN! Het spook jaagt je! 👻' : 'RENNEN! 🪨');
  Voice.hint('hint-rennen'); // direct, geen delay — urgentie!
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
