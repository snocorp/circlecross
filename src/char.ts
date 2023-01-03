/**
 * Character type presenting any lowercase letter.
 */
export type Char =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

/**
 * An arrray of characters.
 */
export type Word = Char[];

export function isChar(char: any): char is Char {
  return (
    typeof char === "string" &&
    char.length === 1 &&
    char.charCodeAt(0) >= 97 &&
    char.charCodeAt(0) <= 122
  );
}

/**
 * Converts a string to a word. Ignores invalid characters.
 * @param str The string to be converted
 * @returns The word
 */
export function stringToWord(str: string): Word {
  const word: Word = [];
  for (let i = 0; i < str.length; i++) {
    const letter = str[i];
    if (isChar(letter)) {
      word.push(letter);
    }
  }
  return word;
}

/**
 * Converts a word to a string.
 * @param word The word to be converted
 * @returns The string
 */
export function wordToString(word: Word): string {
  return word.join("");
}
