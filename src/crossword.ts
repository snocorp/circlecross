import type { PRNG } from "seedrandom";
import { wordToString, type Char, type Word } from "./char";
import { Grid, isElementEmpty } from "./grid";
import { shuffleArray, type Coords } from "./util";

/**
 * Information about the words.
 */
type WordInfo = { start: Coords; vertical: boolean; revealed: boolean };

/**
 * The maximum number of attempts to place a word before giving up.
 */
const MAX_ATTEMPTS = 100;

/**
 * A single box in the crossword.
 */
class CrosswordBox {
  constructor(
    /**
     * The character in the box.
     */
    public readonly value: Char,

    /**
     * Whether or not the character is hidden.
     */
    public readonly hidden: boolean,

    /**
     * Whether or not the character is highlighted.
     */
    public active: boolean
  ) {}

  /**
   * @returns The value of the box
   */
  toString() {
    return this.value;
  }
}

/**
 * The crossword object.
 */
export class Crossword extends Grid<CrosswordBox> {
  /**
   * The words in the crossword.
   */
  words: Record<string, WordInfo> = {};

  /**
   * Places a word into the crossword.
   * @param word The word to be placed.
   * @param start The starting coordinates of the word
   * @param vertical If the direction is vertical or not.
   */
  placeWord(word: Word, start: Coords, vertical: boolean) {
    // add the word to the map
    this.words[wordToString(word)] = { start, vertical, revealed: false };

    // set the letters in the grid
    for (let i = 0; i < word.length; i++) {
      const coords = vertical
        ? { x: start.x, y: start.y + i }
        : { x: start.x + i, y: start.y };
      this.setElem(coords, new CrosswordBox(word[i], true, false));
    }
  }

  /**
   * Look up the word in the map of words in the crossword.
   * @param word The word to look up
   * @returns The word info if found, undefined otherwise.
   */
  findWord(word: Word): WordInfo | undefined {
    return this.words[wordToString(word)];
  }

  /**
   * Reveals the given word if it is in the crossword.
   * @param word The word to reveal
   * @param active Whether or not to highlight the word
   * @returns The crossword
   */
  revealWord(word: Word, active: boolean): Crossword {
    const info = this.findWord(word);
    if (!info) {
      return;
    }

    info.revealed = true;
    for (let i = 0; i < word.length; i++) {
      const coords = info.vertical
        ? { x: info.start.x, y: info.start.y + i }
        : { x: info.start.x + i, y: info.start.y };
      this.setElem(coords, new CrosswordBox(word[i], false, active));
    }

    return this;
  }

  allRevealed(): boolean {
    return Object.values(this.words).every((info) => info.revealed);
  }

  /**
   * Shifts the grid down such that all boxes y-coords are increased by the given count.
   * @param count The number of boxes to move down
   */
  shiftDown(count: number) {
    super.shiftDown(count);

    Object.values(this.words).forEach((word) => (word.start.y += count));
  }

  /**
   * Shift the grid right such that all boxes x-coords are increased by the given count.
   * @param count The number of boxes to move right
   */
  shiftRight(count: number) {
    super.shiftRight(count);

    Object.values(this.words).forEach((word) => (word.start.x += count));
  }

  /**
   * Removes the given column.
   * @param x THe index of the column to be removed
   */
  removeColumn(x: number): void {
    super.removeColumn(x);

    Object.values(this.words).forEach((word) => {
      if (word.start.x > x) {
        word.start.x--;
      }
    });
  }

  /**
   * Removes the given row.
   * @param y The index of the row to be removed
   */
  removeRow(y: number): void {
    super.removeRow(y);

    Object.values(this.words).forEach((word) => {
      if (word.start.y > y) {
        word.start.y--;
      }
    });
  }
}

/**
 * A type used for modifying coordinates.
 */
type CoordModifier = (c: Coords, z: number) => Coords;

/**
 * A type used to help build the crossword.
 */
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

/**
 * An interface to wrap a grid using builder info.
 */
interface Builder {
  shift: (count: number) => void;
  expand: (count: number) => void;
  length: () => number;
  lengthAltDir: () => number;
}

/**
 * Builds a crossword
 * @param words The list of words to be included
 * @param rng The random number generator
 * @returns The crossword
 */
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
        const builder = getBuilder(bi, grid);

        const start = coord[bi.primaryCoord] - randomLetterIndex;
        // check if there is room above/beside
        if (start < 0) {
          const diff = -start;
          builder.shift(diff);
          coordList.forEach((coord) => {
            coord[bi.primaryCoord] += diff;
          });
        }

        // check if there is room below
        const end =
          coord[bi.primaryCoord] - randomLetterIndex + currentWord.length;
        if (end >= builder.length()) {
          grid[bi.expandFunction](end - builder.length());
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
              z + 1 < builder.length() &&
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
              coord[bi.secondaryCoord] + 1 < builder.lengthAltDir() &&
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

/**
 * Create an object to help access the grid.
 * @param vertical Whether the direction is vertical or not
 * @returns The builder info
 */
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

/**
 * Create an object to help access the grid.
 * @param bi The builder info
 * @param grid The grid being accessed
 * @returns The builder
 */
function getBuilder<T>(bi: BuilderInfo, grid: Grid<T>): Builder {
  return {
    expand(count: number) {
      return grid[bi.expandFunction](count);
    },
    shift(count: number) {
      return grid[bi.shiftFunction](count);
    },
    length() {
      return grid[bi.lengthFunction]();
    },
    lengthAltDir() {
      return grid[bi.lengthFunctionAltDir]();
    },
  };
}
