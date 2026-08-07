// De rest van Nul & Co is JavaScript zonder types. Hapvis gebruikt daar één
// ding uit — het stoppen van de menumuziek — en dat beschrijven we hier, zodat
// de strikte TypeScript-check van src/vis/ blijft kloppen zonder de hele
// JS-codebase te hoeven typen.
declare module '*/music.js' {
  export function stopMusic(): void;
}

declare module '*/progress.js' {
  /** Telt sterren op bij de gedeelde pot van Nul & Co; geeft het nieuwe totaal. */
  export function addStars(n: number): number;
  /** Kent een medaille toe; true als die nog niet behaald was. */
  export function giveMedal(id: string): boolean;
  export function hasMedal(id: string): boolean;
}
