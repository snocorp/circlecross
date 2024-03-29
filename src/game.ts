import seedrandom from "seedrandom";

import type { Char } from "./char";
import { buildCrossword, Crossword } from "./crossword";
import { loadLetters, loadWordList, loadWords } from "./loader";
import { shuffleArray } from "./util";

/** The type of game. Daily is one game per day and everyone gets the same game. Random is just a random game. */
export type GameMode = "daily" | "random";

/**
 * A choice by the user.
 */
export interface Choice {
  letter: Char;
  chosen: boolean;
}

/**
 * Type representing the game.
 */
export interface Game {
  letterChoices: Choice[];
  crossword: Crossword;
  complete: boolean;
}

/**
 * Creates a new game.
 * @param mode The game mode
 * @returns The new game
 */
export async function newGame(mode: GameMode): Promise<Game> {
  const rng =
    mode === "random" ? seedrandom() : seedrandom(new Date().toDateString());

  const words = await loadWordList();
  const randomIndex = Math.floor(rng() * words.length);
  const letterList = await loadLetters(words[randomIndex]);

  shuffleArray(letterList, rng);

  const letterChoices = letterList.map((letter, i) => ({
    letter,
    chosen: false,
  }));

  const wordList = await loadWords(letterList);
  const crossword = buildCrossword(wordList, rng);

  return {
    letterChoices,
    crossword,
    complete: false,
  };
}
