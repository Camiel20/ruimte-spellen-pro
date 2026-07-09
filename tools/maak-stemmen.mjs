// ===== STEMMEN-GENERATOR =====
// Genereert de Nederlandse stemclips voor Nul & Co met de gratis Microsoft
// neural stemmen (dezelfde als Edge's voorleesfunctie). Draaien:
//
//     node tools/maak-stemmen.mjs
//
// Output: public/voice/*.mp3 + public/voice/manifest.json — de app laadt het
// manifest bij het opstarten (zie main.js) en registreert alles bij Voice.
// Andere stem of toon proberen? Pas STEM/TOON hieronder aan en draai opnieuw.
//
// NB: prima voor thuisgebruik. Bij een commerciële release de clips opnieuw
// genereren met een gelicenseerde dienst (Azure TTS / ElevenLabs).

import { MsEdgeTTS, OUTPUT_FORMAT, ProsodyOptions } from 'msedge-tts';
import { createWriteStream, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KLANKEN, WERELDEN } from '../src/alfaLogic.js';

const DOEL = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'voice');

// De stem: Fenna = warme Nederlandse vrouwenstem. Alternatieven: 'nl-NL-ColetteNeural',
// 'nl-NL-MaartenNeural' (man). De toon staat vrolijk-hoog en net iets vlotter.
const STEM = 'nl-NL-FennaNeural';
const TOON = { pitch: '+18Hz', rate: 1.08 };

// clip-key (zoals Voice 'm kent) -> [bestandsnaam, in te spreken tekst]
// Uitroeptekens sturen de neural stem naar een vrolijke, energieke intonatie.
const CLIPS = {
  // Gesproken feest/groet-woorden. LET OP: bewust 'woord-…'-keys en NIET de
  // cue-namen (cheer/welcome/…): die cues klinken tientallen keren per level
  // en blijven daarom jingles (zie JINGLE_CUES in voice.js). De woorden
  // spelen alleen op grote momenten via Voice.hint/hintEens.
  'woord-welkom': ['welkom', 'Welkom!'],
  'woord-joepie': ['joepie', 'Joepie!'],
  'woord-super': ['supergoed', 'Super goed!'],
  'woord-oeps': ['oeps', 'Oeps! Probeer nog eens!'],
  'woord-hoi': ['hoi', 'Hoi!'],

  // getallen 0-20
  // (bestandsnaam NIET 'nul': NUL is een gereserveerde Windows-apparaatnaam —
  // git kan zo'n bestand niet indexeren, zelfde valkuil als maatje.js/nul.js)
  'number-0': ['getal-nul', 'Nul!'],
  'number-1': ['een', 'Eén!'],
  'number-2': ['twee', 'Twee!'],
  'number-3': ['drie', 'Drie!'],
  'number-4': ['vier', 'Vier!'],
  'number-5': ['vijf', 'Vijf!'],
  'number-6': ['zes', 'Zes!'],
  'number-7': ['zeven', 'Zeven!'],
  'number-8': ['acht', 'Acht!'],
  'number-9': ['negen', 'Negen!'],
  'number-10': ['tien', 'Tien!'],
  'number-11': ['elf', 'Elf!'],
  'number-12': ['twaalf', 'Twaalf!'],
  'number-13': ['dertien', 'Dertien!'],
  'number-14': ['veertien', 'Veertien!'],
  'number-15': ['vijftien', 'Vijftien!'],
  'number-16': ['zestien', 'Zestien!'],
  'number-17': ['zeventien', 'Zeventien!'],
  'number-18': ['achttien', 'Achttien!'],
  'number-19': ['negentien', 'Negentien!'],
  'number-20': ['twintig', 'Twintig!'],

  // ===== HINT-CLIPS (fase 2, renovatie-sprint) =====
  // Gesproken instructies voor niet-lezers: bij eerste nadering per level en
  // na een fout antwoord. Kort en energiek; het uitroepteken stuurt de
  // neural stem naar vrolijk.
  'hint-deur': ['hint-deur', 'Word net zo groot als het getal op de deur!'],
  'hint-splits': ['hint-splits', 'Te groot! Tik op jezelf!'],
  'hint-handje': ['hint-handje', 'Tik op het handje!'],
  'hint-meer': ['hint-meer', 'Waar is meer? Spring ertegen!'],
  'hint-minder': ['hint-minder', 'Waar is minder? Spring ertegen!'],
  'hint-plaat': ['hint-plaat', 'Geef blokjes op de plaat!'],
  'hint-portaal': ['hint-portaal', 'Stap in het portaal met de goede som!'],
  'hint-raket': ['hint-raket', 'Pak de vaatjes van tien!'],
  'hint-duikboot': ['hint-duikboot', 'Zoek het maatje van tien!'],
  'hint-grauwmuur': ['hint-grauwmuur', 'Alleen de tien-kracht breekt hem!'],
  'hint-duwkist': ['hint-duwkist', 'Hiervoor heb je de duw-kracht nodig!'],
  'hint-rennen': ['hint-rennen', 'Rennen, rennen, rennen!'],
  'hint-zwem': ['hint-zwem', 'Tik, tik, tik — omhoog zwemmen!'],
  'hint-bil': ['hint-bil', 'Spring op de stuiter-bil!'],
  'hint-paren': ['hint-paren', 'Heeft iedereen een maatje?'],
  'hint-reus': ['hint-reus', 'Hap de appel en word een reus!'],
  'hint-muis': ['hint-muis', 'Eet het besje en word klein!'],
  'hint-pot': ['hint-pot', 'Spring in de pot met de goede som!'],
  // krachten (bij het leren van een nieuwe kracht)
  'kracht-dubbelsprong': ['kracht-dubbelsprong', 'Dubbelsprong!'],
  'kracht-stamp': ['kracht-stamp', 'Stampen!'],
  'kracht-duw': ['kracht-duw', 'Duwen!'],
  'kracht-tien': ['kracht-tien', 'Tien-kracht!'],
  // baas-aanmoedigingen (per stijl, bij de fase-start)
  'baas-bouw': ['baas-bouw', 'Bouw het getal!'],
  'baas-vang': ['baas-vang', 'Vang ze allemaal!'],
  'baas-spoel': ['baas-spoel', 'Zoek de goede pot!'],
  'baas-beuk': ['baas-beuk', 'Word een reus en ram hem!'],
  'baas-tien': ['baas-tien', 'Maak er samen tien van!'],
  'baas-surf': ['baas-surf', 'Tel de golven!'],
  'baas-schud': ['baas-schud', 'Stamp, en raap de eikels!'],
  'baas-splits': ['baas-splits', 'Splits het getal!'],
  'baas-stomp': ['baas-stomp', 'Spring op zijn kop!'],
  // mijlpalen
  'naar-de-vlag': ['naar-de-vlag', 'Naar de vlag!'],
  'gouden-nul': ['gouden-nul', 'Een gouden nul!'],
  'reus-je-bent': ['reus-je-bent', 'Reus!'],
  'muis-je-bent': ['muis-je-bent', 'Muizeklein!'],

  // tientallen + honderd (Tel-Slang-feestjes, Nul-Raket)
  'number-30': ['dertig', 'Dertig!'],
  'number-40': ['veertig', 'Veertig!'],
  'number-50': ['vijftig', 'Vijftig!'],
  'number-60': ['zestig', 'Zestig!'],
  'number-70': ['zeventig', 'Zeventig!'],
  'number-80': ['tachtig', 'Tachtig!'],
  'number-90': ['negentig', 'Negentig!'],
  'number-100': ['honderd', 'Honderd!'],
};

// ===== ALFA-BLOKKEN (schrijfspel) =====
// Afgeleid uit de woord-data zodat het altijd in sync is: één klank-clip per
// letter (voor het 'blenden') + één clip per te schrijven woord. De klank-
// tekst komt uit KLANKEN (bv. 'mm', 'buh') — de neural stem maakt daar de
// letterklank van. Bij een rare klank: pas KLANKEN in src/alfaLogic.js aan en
// draai opnieuw.
for (const [letter, klank] of Object.entries(KLANKEN)) {
  CLIPS[`klank-${letter}`] = [`klank-${letter}`, klank];
}
for (const W of WERELDEN) {
  for (const { w } of W.woorden) {
    CLIPS[`woord-${w}`] = [`woord-${w}`, `${w[0].toUpperCase()}${w.slice(1)}!`];
  }
}
// Letter-Land woord-magie (Praatweide): een af woord klinkt als één schoon woord
// (i.p.v. de losse klanken door elkaar). Deze woorden "gebeuren" in het spel.
for (const w of ['zon', 'mat', 'bel', 'sok', 'bal', 'bok', 'vis', 'pen', 'bus']) {
  CLIPS[`woord-${w}`] = [`woord-${w}`, `${w[0].toUpperCase()}${w.slice(1)}!`];
}

// Letter-NAMEN (het alfabet, schoon uitgesproken) voor het letter-voor-letter
// uitspellen in Letter-Land: "z o n" klinkt als "zet · oo · en" (géén dubbele
// klanken zoals de fonetische KLANKEN 'zz'/'nn'). Klinkers = hun lange naam,
// medeklinkers = de Nederlandse letternaam.
const LETTERNAMEN = {
  a: 'aa', b: 'bee', c: 'see', d: 'dee', e: 'ee', f: 'ef', g: 'gee', h: 'haa',
  i: 'ie', j: 'jee', k: 'kaa', l: 'el', m: 'em', n: 'en', o: 'oo', p: 'pee',
  q: 'kuu', r: 'er', s: 'es', t: 'tee', u: 'uu', v: 'vee', w: 'wee', x: 'iks',
  y: 'ij', z: 'zet',
};
for (const [l, naam] of Object.entries(LETTERNAMEN)) CLIPS[`letter-${l}`] = [`letter-${l}`, naam];

async function maakClip(tts, tekst, pad) {
  const opts = new ProsodyOptions();
  opts.pitch = TOON.pitch;
  opts.rate = TOON.rate;
  const { audioStream } = await tts.toStream(tekst, opts);
  await new Promise((resolve, reject) => {
    const uit = createWriteStream(pad);
    audioStream.pipe(uit);
    uit.on('finish', resolve);
    audioStream.on('error', reject);
    uit.on('error', reject);
  });
}

async function main() {
  mkdirSync(DOEL, { recursive: true });
  const tts = new MsEdgeTTS();
  await tts.setMetadata(STEM, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const manifest = {};
  const items = Object.entries(CLIPS);
  for (let i = 0; i < items.length; i++) {
    const [key, [bestand, tekst]] = items[i];
    const pad = join(DOEL, `${bestand}.mp3`);
    process.stdout.write(`[${i + 1}/${items.length}] ${key} → ${bestand}.mp3 ("${tekst}") … `);
    await maakClip(tts, tekst, pad);
    manifest[key] = `${bestand}.mp3`;
    console.log('OK');
  }

  writeFileSync(join(DOEL, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nKlaar: ${items.length} clips + manifest.json in public/voice/`);
}

main().catch((e) => { console.error('MISLUKT:', e.message || e); process.exit(1); });
