// ===== DORPS-ROSTER: welke Numberblock-vriendjes zijn gered? =====
// Pure afleiding uit de leveldata + welke levels gehaald zijn — er is GEEN
// apart save-veld nodig: level gehaald ⇒ de vriendjes uit dat level zijn gered.
// (isLevelDone is injecteerbaar zodat dit unit-testbaar is zonder localStorage.)

// Het dorp heeft plek voor de getallen 1 t/m 10 — en sinds Wereld 5 ook
// voor TWINTIG (het eerste grote-getallen-vriendje, gered in 5-2).
export const ROSTER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20];

// Set van geredde getallen. Één (1) ben je zelf — die woont er altijd al.
export function rescuedFrom(levels, isLevelDone) {
  const s = new Set([1]);
  for (const L of levels) {
    if (!isLevelDone(L.id)) continue;
    (L.rescues || []).forEach((r) => s.add(r.doel));
  }
  return s;
}

// Waar red je getal n? → { id, name } van het eerste level met die redding,
// of null als het (nog) nergens te redden is ("komt binnenkort").
export function rescueInfo(levels, n) {
  for (const L of levels) {
    const r = (L.rescues || []).find((x) => x.doel === n);
    if (r) return { id: L.id, name: r.name || `${n}` };
  }
  return null;
}
