// ===== SYSTEEM: TEL-WOLKEN =====
// Platforms die op een vast ritme verdwijnen en verschijnen (met knipper-
// waarschuwing): spring op het goede moment! Werkwoord: timen.
//
// Elk systeem in deze map heeft dezelfde vorm: { build(s, L), update?(s, t),
// afterPlayer?(s) } — de scene loopt er generiek overheen en weet niets van
// de inhoud. Een nieuwe mechanic = één nieuw bestand + één regel in index.js.

export default {
  build(s, L) {
    s.telWolken = [];
    (L.telWolken || []).forEach(([x, y, w, offset = 0]) => {
      const plat = s.add.rectangle(x + w / 2, y + 10, w, 20, 0x000000, 0);
      s.physics.add.existing(plat, true);
      plat._noCheckpoint = true; // nooit een checkpoint op een verdwijn-wolk!
      s.platforms.add(plat);
      const art = s.add.container(x + w / 2, y + 8).setDepth(-9);
      const g = s.add.graphics();
      const r = 15;
      g.fillStyle(0xffffff, 1);
      for (let cx = -w / 2 + r; cx <= w / 2 - r + 1; cx += r * 1.3) g.fillCircle(cx, 0, r);
      g.fillCircle(-w / 2 + r * 1.6, -9, r * 0.85); g.fillCircle(w / 2 - r * 1.6, -9, r * 0.85);
      g.fillStyle(0xdfeeff, 0.8);
      for (let cx = -w / 2 + r; cx <= w / 2 - r + 1; cx += r * 1.3) g.fillCircle(cx, 5, r * 0.7);
      art.add(g);
      s.telWolken.push({ plat, art, offset });
    });
  },

  update(s) {
    const CYCLE = 3400, ON = 2300, WARN = 700; // 2,3s aan (laatste 0,7s knipperen), 1,1s weg
    for (const wl of s.telWolken) {
      const t = (s.time.now + wl.offset) % CYCLE;
      const on = t < ON;
      wl.plat.body.enable = on;
      if (!on) wl.art.setAlpha(0.12);
      else if (t > ON - WARN) wl.art.setAlpha(Math.floor(t / 130) % 2 ? 0.35 : 0.95);
      else wl.art.setAlpha(0.95);
    }
  },
};
