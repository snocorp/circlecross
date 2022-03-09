import seedrandom, { type PRNG } from 'seedrandom'

import type { Char } from './char'
import { buildCrossword, Crossword } from './crossword'
import { loadLetters, loadWordList, loadWords } from './loader'
import { shuffleArray, type Coords } from './util'

export type GameMode = 'daily' | 'random'

export interface Choice {
  letter: Char
  chosen: boolean
}

export interface Game {
  letterChoices: Choice[]
  crossword: Crossword
  complete: boolean
}

export async function newGame(mode: GameMode): Promise<Game> {
  const rng =
    mode === 'random' ? seedrandom() : seedrandom(new Date().toDateString())

  const words = await loadWordList()
  const randomIndex = Math.floor(rng() * words.length)
  const letterList = await loadLetters(words[randomIndex])

  shuffleArray(letterList, rng)

  const letterChoices = letterList.map((letter, i) => ({
    letter,
    chosen: false
  }))

  const wordList = await loadWords(letterList)
  const crossword = buildCrossword(wordList, rng)

  return {
    letterChoices,
    crossword,
    complete: false
  }
}
