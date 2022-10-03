import type { PRNG } from "seedrandom";
import { wordToString, type Char, type Word } from "./char";
import { Grid, isElementEmpty } from "./grid";
import { shuffleArray, type Coords } from "./util";

type WordInfo = { start: Coords; vertical: boolean; revealed: boolean };

const MAX_ATTEMPTS = 10;

class CrosswordBox {
  constructor(public readonly value: Char, public readonly hidden: boolean) {}

  toString() {
    return this.value;
  }
}

export class Crossword extends Grid<CrosswordBox> {
  words: { [key: string]: WordInfo } = {};

  constructor() {
    super();
  }

  placeWord(word: Word, start: Coords, vertical: boolean) {
    this.words[wordToString(word)] = { start, vertical, revealed: false };
    if (vertical) {
      for (let i = 0; i < word.length; i++) {
        this.setElem(
          { x: start.x, y: start.y + i },
          new CrosswordBox(word[i], true)
        );
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        this.setElem(
          { x: start.x + i, y: start.y },
          new CrosswordBox(word[i], true)
        );
      }
    }
  }

  findWord(word: Word): WordInfo | undefined {
    return this.words[wordToString(word)];
  }

  revealWord(word: Word): Crossword {
    const info = this.findWord(word);
    if (!info) {
      return;
    }

    info.revealed = true;
    if (info.vertical) {
      for (let i = 0; i < word.length; i++) {
        const coords = { x: info.start.x, y: info.start.y + i };
        this.setElem(coords, new CrosswordBox(word[i], false));
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        const coords = { x: info.start.x + i, y: info.start.y };
        this.setElem(coords, new CrosswordBox(word[i], false));
      }
    }

    return this;
  }

  allRevealed(): boolean {
    return Object.values(this.words).every((info) => info.revealed);
  }

  shiftDown(count: number) {
    super.shiftDown(count);

    Object.values(this.words).forEach((word) => (word.start.y += count));
  }

  shiftRight(count: number) {
    super.shiftRight(count);

    Object.values(this.words).forEach((word) => (word.start.x += count));
  }

  removeColumn(x: number): void {
    super.removeColumn(x);

    Object.values(this.words).forEach((word) => {
      if (word.start.x > x) {
        word.start.x--;
      }
    });
  }

  removeRow(y: number): void {
    super.removeRow(y);

    Object.values(this.words).forEach((word) => {
      if (word.start.y > y) {
        word.start.y--;
      }
    });
  }
}

type CoordModifier = (c: Coords, z: number) => Coords;
interface BuilderInfo {
  primaryCoord: "x" | "y";
  secondaryCoord: "x" | "y";
  shiftFunction: "shiftDown" | "shiftRight";
  expandFunction: "expandDown" | "expandRight";
  lengthFunction: "getHeight" | "getWidth";
  lengthFunctionAltDir: "getHeight" | "getWidth";
  coordBefore: CoordModifier;
  coordAfter: CoordModifier;
  coordBeforeAltDir: CoordModifier;
  coordAfterAltDir: CoordModifier;
  coordAt: CoordModifier;
  wordStart: CoordModifier;
}

export function buildCrossword(words: Word[], rng: PRNG): Crossword {
  const sortedWords = words.sort((a, b) => b.length - a.length);

  const cw: Crossword = new Crossword();
  const grid = cw;

  const firstWord = sortedWords[0];
  let vertical = rng() > 0.5;
  cw.placeWord(firstWord, { x: 0, y: 0 }, vertical);

  for (let i = 1; i < sortedWords.length; i++) {
    const currentWord = sortedWords[i];

    console.debug("Attempting to place", wordToString(currentWord));

    let attempts = 0;
    let foundPlacement = false;
    while (!foundPlacement && attempts < MAX_ATTEMPTS) {
      attempts++;

      // pick a random letter
      const randomLetterIndex = Math.floor(rng() * currentWord.length);
      const coordList = grid.findValue(
        (v: CrosswordBox) => v.value === currentWord[randomLetterIndex]
      );
      shuffleArray(coordList, rng);
      console.debug(currentWord[randomLetterIndex], coordList);

      let c = 0;
      while (!foundPlacement && c < coordList.length) {
        const coord = coordList[c];
        vertical = !vertical;

        console.debug(vertical ? "vertically" : "horizontally");

        let blocked = false;
        const bi = getBuilderInfo(vertical);
        const start = coord[bi.primaryCoord] - randomLetterIndex;
        // check if there is room above/beside
        if (start < 0) {
          const diff = -start;
          grid[bi.shiftFunction](diff);
          coordList.forEach((coord) => {
            coord[bi.primaryCoord] += diff;
          });
        }

        // check if there is room below
        const end =
          coord[bi.primaryCoord] - randomLetterIndex + currentWord.length;
        if (end >= grid[bi.lengthFunction]()) {
          grid[bi.expandFunction](end - grid[bi.lengthFunction]());
        }

        for (let i = 0; i < currentWord.length && !blocked; i++) {
          const z = coord[bi.primaryCoord] - randomLetterIndex + i;
          console.debug(
            bi.coordAt(coord, z),
            grid.getElem(bi.coordAt(coord, z)).value?.value
          );

          if (i === 0) {
            const elemBefore = z > 0 && grid.hasValue(bi.coordBefore(coord, z));
            if (elemBefore) {
              console.debug(
                `Blocked at beginning ${
                  grid.getElem(bi.coordBefore(coord, z)).value.value
                }`,
                bi.coordBefore(coord, z)
              );

              blocked = true;
            }
          } else if (i + 1 === currentWord.length) {
            const elemAfter =
              z + 1 < grid[bi.lengthFunction]() &&
              grid.hasValue(bi.coordAfter(coord, z));
            if (elemAfter) {
              console.debug("Blocked at end", bi.coordAfter(coord, z));

              blocked = true;
            }
          }
          if (blocked) {
            continue;
          }

          const elem = grid.getElem(bi.coordAt(coord, z));
          if (isElementEmpty(elem)) {
            // check if there's space at the ends
            if (
              coord[bi.secondaryCoord] > 0 &&
              grid.hasValue(bi.coordBeforeAltDir(coord, z))
            ) {
              console.debug(
                "Blocked above/left",
                bi.coordBeforeAltDir(coord, z)
              );

              blocked = true;
            } else if (
              coord[bi.secondaryCoord] + 1 < grid[bi.lengthFunctionAltDir]() &&
              grid.hasValue(bi.coordAfterAltDir(coord, z))
            ) {
              console.debug(
                "Blocked below/right",
                bi.coordAfterAltDir(coord, z)
              );
              blocked = true;
            }
          } else if (elem.value.value !== currentWord[i]) {
            console.debug(
              `Blocked by existing letter (${elem.value.value} !== ${currentWord[i]})`,
              bi.coordAt(coord, z)
            );
            blocked = true;
          }
        }
        if (!blocked) {
          // place the word
          cw.placeWord(
            currentWord,
            bi.wordStart(coord, randomLetterIndex),
            vertical
          );
          foundPlacement = true;
        }

        c++;
      }
    }

    if (attempts === MAX_ATTEMPTS) {
      console.warn(`No placement found for ${currentWord}`);
    }
  }

  grid.trim();

  return cw;
}

function getBuilderInfo(vertical: boolean): BuilderInfo {
  return vertical
    ? {
        primaryCoord: "y",
        secondaryCoord: "x",
        shiftFunction: "shiftDown",
        expandFunction: "expandDown",
        lengthFunction: "getHeight",
        lengthFunctionAltDir: "getWidth",
        coordBefore: (c: Coords, z: number) => ({ x: c.x, y: z - 1 }),
        coordAfter: (c: Coords, z: number) => ({ x: c.x, y: z + 1 }),
        coordBeforeAltDir: (c: Coords, z: number) => ({ x: c.x - 1, y: z }),
        coordAfterAltDir: (c: Coords, z: number) => ({ x: c.x + 1, y: z }),
        coordAt: (c: Coords, z: number) => ({ x: c.x, y: z }),
        wordStart: (c: Coords, index: number) => ({ x: c.x, y: c.y - index }),
      }
    : {
        primaryCoord: "x",
        secondaryCoord: "y",
        shiftFunction: "shiftRight",
        expandFunction: "expandRight",
        lengthFunction: "getWidth",
        lengthFunctionAltDir: "getHeight",
        coordBefore: (c: Coords, z: number) => ({ x: z - 1, y: c.y }),
        coordAfter: (c: Coords, z: number) => ({ x: z + 1, y: c.y }),
        coordBeforeAltDir: (c: Coords, z: number) => ({ x: z, y: c.y - 1 }),
        coordAfterAltDir: (c: Coords, z: number) => ({ x: z, y: c.y + 1 }),
        coordAt: (c: Coords, z: number) => ({ x: z, y: c.y }),
        wordStart: (c: Coords, index: number) => ({ x: c.x - index, y: c.y }),
      };
}
