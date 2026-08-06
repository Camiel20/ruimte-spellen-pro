// De rest van Nul & Co is JavaScript zonder types. Hapvis gebruikt daar één
// ding uit — het stoppen van de menumuziek — en dat beschrijven we hier, zodat
// de strikte TypeScript-check van src/vis/ blijft kloppen zonder de hele
// JS-codebase te hoeven typen.
declare module '*/music.js' {
  export function stopMusic(): void;
}
