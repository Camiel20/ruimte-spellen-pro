// ===== BAAS-STIJL-REGISTRY (metadata + fase-opbouw + hit-detectie) =====
// Elke baas heeft een LOOK (art, uit bossRegistry.js) én een STIJL (het gevecht).
// De stijl-logica zat versplinterd over ~17 methodes / 76 `pz.stijl ===`-checks
// in AdventureScene. Deze registry ontvlecht dat: per stijl één entry met
//   - `clip`  : voorlees-aanmoedigings-clip (string, of functie(pz) voor finale);
//   - `stil`  : of het doel-getal NIET hardop wordt verklapt;
//   - `actie` : het korte label ("nog 2× — <actie>");
//   - `startFase(scene, pz)`      : de fase-opbouw (questText + wolkje + de juiste
//     `scene.toonBoss*`/visual-helper);
//   - `updateFase(scene, pz, time)?` : de per-frame hit-detectie (kiest de juiste
//     `scene.boss*Update`-methode; tap-driven/BuildOverlay-stijlen hebben er geen).
// De zware helpers/branch-bodies blijven scene-methodes (ze leunen op veel
// scene-state); de stijl bepaalt alleen WELKE. `bossRegistry.js` (look/art) los.
//
// NB: de klassieke 'bouw'-baas (W1-6) vecht via de ✋-BuildOverlay, niet via
// startBossFase/updateBossFase — vandaar geen start/updateFase (no-op/undefined).

import { bossLook } from '../bossRegistry.js';
import { drawSok } from '../sokken.js';

// gedeelde hit-detectie-dispatchers (meerdere stijlen delen dezelfde branch)
const keuze = (s, pz, time) => s.bossKeuzeUpdate(pz, time);
const vang = (s, pz) => s.bossVangUpdate(pz);

export const BOSS_STIJLEN = {
  bouw: {
    clip: null, stil: false, actie: (pz) => `bouw de ${pz.doel}`,
    startFase: () => {}, // via de BuildOverlay, niet via startBossFase
  },
  vang: {
    clip: 'baas-vang', stil: false, actie: (pz) => `vang er ${pz.doel}`,
    startFase: (s, pz) => {
      const look = bossLook(pz.look);
      s.questText.setText((look.vangTekst || 'Vang {n} toppings terug! 🍅').replace('{n}', pz.doel));
      s.strooiToppings(pz);
    },
    updateFase: vang,
  },
  spoel: {
    clip: 'baas-spoel', stil: false, actie: (pz) => `zoek de pot met ${pz.doel}`,
    startFase: (s, pz) => {
      s.questText.setText(`Spring in de pot met ${pz.doel}! 🚽`);
      s.toonBossPotten(pz);
    },
    updateFase: (s, pz, time) => s.bossSpoelUpdate(pz, time),
  },
  beuk: {
    clip: 'baas-beuk', stil: false, actie: () => 'word een reus en RAM hem',
    startFase: (s, pz) => {
      s.questText.setText(`Hij is ${pz.doel} groot! Hap een appel en RAM hem! 🍎🦣`);
    },
    updateFase: (s, pz, time) => s.bossBeukUpdate(pz, time),
  },
  tien: {
    clip: 'baas-tien', stil: false, actie: (pz) => `${pz.doel} + ? = 10`,
    startFase: (s, pz) => {
      s.questText.setText(`${pz.doel} + ? = 10 — raak de goede bel! 💙`);
      pz.bossArt.bubbleText.setText(`${pz.doel}+?`);
      s.toonBossBellen(pz);
    },
    updateFase: keuze,
  },
  surf: {
    clip: 'baas-surf', stil: true, actie: () => 'tel de golven',
    startFase: (s, pz) => {
      // TEL de golven: de baas stuurt een telbaar setje — geen antwoord tonen!
      s.questText.setText('TEL de golven — daar komen ze! 🌊');
      pz.bossArt.bubbleText.setText('?');
      s.surfBurst(pz);
    },
    updateFase: (s, pz, time) => s.bossSurfUpdate(pz, time),
  },
  schud: {
    clip: 'baas-schud', stil: false, actie: (pz) => `stamp en raap er ${pz.doel}`,
    startFase: (s, pz) => {
      pz.eikelsLos = false; // eerst de boom wakker stampen — dán vallen de eikels
      s.questText.setText('STAMP naast de boom — schud de eikels los! 🌰');
    },
    // eerst stampen (boom wakker), daarna de gevallen eikels rapen
    updateFase: (s, pz, time) => (pz.eikelsLos ? s.bossVangUpdate(pz) : s.bossSchudStamp(pz, time)),
  },
  stomp: {
    clip: 'baas-stomp', stil: false, actie: () => 'spring op zijn kop',
    startFase: (s) => { s.questText.setText('Zweef omhoog en spring ÓP zijn kop! 🌙'); },
    updateFase: (s, pz, time) => s.bossStompUpdate(pz, time),
  },
  splits: {
    clip: 'baas-splits', stil: true, actie: () => 'splits het getal',
    startFase: (s, pz) => {
      const st = pz.stages[pz.stageIndex];
      s.questText.setText(`${st.van} = ${st.weg} + ? — raak het goede kristal! 💎`);
      pz.bossArt.bubbleText.setText(`${st.van}=${st.weg}+?`).setFontSize(14);
      s.toonBossBellen(pz);
    },
    updateFase: keuze,
  },
  paar: {
    clip: 'baas-paar', stil: true, actie: () => 'zoek de tweelingsok',
    startFase: (s, pz) => {
      // de Sokken-Dief toont een sok — raak de TWEELING tussen de opties
      s.questText.setText('Kijk in zijn wolkje — raak de sok die HETZELFDE is! 🧦');
      if (pz.bossArt.bubbleSok) { pz.bossArt.bubbleSok.clear(); drawSok(pz.bossArt.bubbleSok, pz.doel, 0.62); }
      s.toonBossBellen(pz);
    },
    updateFase: keuze,
  },
  kegel: {
    clip: 'baas-kegel', stil: true, actie: () => 'reken de kegels uit',
    startFase: (s, pz) => {
      const st = pz.stages[pz.stageIndex];
      s.questText.setText(`${st.van} kegels, ${st.weg} vallen om — hoeveel staan er NOG? 🎳`);
      pz.bossArt.bubbleText.setText(`${st.van}−${st.weg}=?`).setFontSize(14);
      s.kegelStamp(pz, st);
      s.toonBossBellen(pz);
    },
    updateFase: keuze,
  },
  sprong: {
    clip: 'baas-sprong', stil: true, actie: () => 'tel de sprongen mee',
    startFase: (s, pz) => {
      const st = pz.stages[pz.stageIndex];
      s.questText.setText(`Start op ${st.start}: ${st.keer} sprongen van ${st.sprong} — waar landt hij? 🦖`);
      pz.bossArt.bubbleText.setText(`${st.start} ▸ ?`).setFontSize(18);
      s.sprongVisual(pz, st);
      s.toonBossBellen(pz);
    },
    updateFase: keuze,
  },
  klok: {
    clip: 'baas-klok', stil: true, actie: () => 'zoek de goede klok',
    startFase: (s, pz) => {
      s.questText.setText(`Zet de tijd op ${s.tijdTekst(pz.doel)} — raak de goede klok! 🕐`);
      pz.bossArt.bubbleText.setText(s.tijdTekst(pz.doel)).setFontSize(16);
      s.toonBossBellen(pz);
    },
    updateFase: keuze,
  },
  balans: {
    clip: 'baas-balans', stil: false, actie: () => 'maak de halter gelijk',
    startFase: (s, pz) => {
      s.questText.setText(`Zijn kant weegt ${pz.doel} — maak jouw kant GELIJK! 💪`);
      s.toonBalans(pz);
    },
    // tap-driven (de schijven-tikken regelen de voortgang) — geen updateFase
  },
  vries: {
    clip: 'baas-vries', stil: true, actie: () => 'tel terug naar het ijs',
    startFase: (s, pz) => {
      s.questText.setText(`Zijn ijs is ${pz.stages[pz.stageIndex].start}° — tel terug naar ${pz.doel}°! ❄️`);
      pz.bossArt.bubbleText.setText(`${pz.stages[pz.stageIndex].start}°`).setFontSize(18);
      s.toonVriesMeter(pz);
    },
    // tap-driven (kouder/warmer/bevries-knoppen) — geen updateFase
  },
  flits: {
    clip: 'baas-flits', stil: true, actie: () => 'tel de spookjes',
    startFase: (s, pz) => {
      s.questText.setText('Kijk snel — hoeveel spookjes zie je? 👻');
      pz.bossArt.bubbleText.setText('?');
      s.flitsBurst(pz, true);
    },
    updateFase: keuze,
  },
  sisser: {
    clip: 'baas-bouw', stil: true, actie: (pz) => `schrijf de "${pz.stages[pz.stageIndex].letter}"`,
    startFase: (s, pz) => {
      // De Sisser: schrijf de fase-letter terug; hij hijst ondertussen wolkjes.
      const letter = pz.stages[pz.stageIndex].letter;
      s.questText.setText(`Schrijf de "${letter}" om De Sisser te verzwakken! ✍️`);
      pz.bossArt.bubbleText.setText(s.maskWoord(pz.woord, pz.stageIndex));
      s.toonSisserBlok(pz);
    },
    // het schrijven (✋ → schrijf-overlay) regelt de voortgang — geen updateFase
  },
  finale: {
    // finale: de clip én het label hangen af van de akte-soort (vang/muur/bouw)
    clip: (pz) => ({ vang: 'baas-vang', muur: 'hint-grauwmuur', bouw: 'baas-bouw' })[pz.stages[pz.stageIndex].soort],
    stil: false,
    actie: (pz) => ({ vang: 'vang de kleur-orbs', muur: 'ram zijn schilden', bouw: `bouw de ${pz.doel}` })[pz.stages[pz.stageIndex].soort],
    startFase: (s, pz) => {
      // BARON GRAUW: drie aktes die de hele reis samenvatten; elke akte delegeert
      // naar een bestaande sub-flow via het soort-veld.
      const akte = pz.stages[pz.stageIndex];
      pz.soort = akte.soort;
      s.nulReact('ster'); // Nul moedigt je aan — het heldenmoment!
      if (akte.soort === 'vang') {
        s.questText.setText('Hij morst de gestolen KLEUR — vang de orbs! 🌈');
        s.strooiToppings(pz);
      } else if (akte.soort === 'muur') {
        s.questText.setText('Hij verschanst zich — RAM zijn schilden! 🔟💥');
        s.spawnFinaleMuren(pz);
      } else {
        // de slot-akte: het grootste bouwwerk, via de vertrouwde bouw-flow
        // (stijl-overname is definitief: dit is altijd de laatste akte)
        pz.stijl = 'bouw';
        s.questText.setText('De laatste klap: bouw zijn grootste getal! 🔨');
      }
    },
    // akte 1 = vang de orbs; akte 2 = ram de schilden; akte 3 = bouw (BuildOverlay)
    updateFase: (s, pz) => {
      if (pz.soort === 'muur') s.bossFinaleMuur(pz);
      else if (pz.soort === 'vang') s.bossVangUpdate(pz);
    },
  },
};

export function bossStijl(naam) {
  return BOSS_STIJLEN[naam] || BOSS_STIJLEN.bouw;
}
