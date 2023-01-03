import { stringToWord, type Char, type Word } from "./char";
import { isChar } from "./char";

type WordNode = {
  value: string;
  word: boolean;
  children: { [key: string]: WordNode };
};

/**
 * Load the word list from a JSON file into an array.
 * @returns The word list
 */
export async function loadWordList(): Promise<string[]> {
  const response = await fetch("words.json");

  return await response.json();
}

/**
 * Loads the letters from the given word.
 * @param word The word
 * @returns The letters
 */
export async function loadLetters(word: string): Promise<Char[]> {
  const letterList: Char[] = [];

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (isChar(char)) {
      letterList.push(char);
    } else {
      console.error(char);
    }
  }

  return letterList;
}

/**
 * Load matching words from the given list of letters.
 * @param letterList The list of letters
 * @returns The list of matching words
 */
export async function loadWords(letterList: Char[]): Promise<Word[]> {
  const response = await fetch("data.json");

  const data: WordNode = await response.json();

  const wordStrings = buildWords(data, letterList);

  const wordList: Word[] = [];
  wordStrings.forEach((str) => wordList.push(stringToWord(str)));

  return wordList;
}

/**
 * Build a set of strings using the word data and the given list of letters.
 * @param data The word data
 * @param letterList The list of letters
 * @returns The set of valid words
 */
function buildWords(data: WordNode, letterList: Char[]): Set<string> {
  const wordList: Set<string> = new Set<string>();

  if (data.word) {
    wordList.add(data.value);
  }
  for (let i = 0; i < letterList.length; i++) {
    if (data.children[letterList[i]]) {
      const newWords = buildWords(
        data.children[letterList[i]],
        letterList.filter((letter, index) => index !== i)
      );
      newWords.forEach((word) => wordList.add(word));
    }
  }

  return wordList;
}
