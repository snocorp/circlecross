import type { Char } from './char'
import { buildCrossword, Crossword } from './crossword'
import { loadLetters, loadWordList, loadWords } from './loader'
import { random, shuffleArray, type Coords } from './util'

type GameMode = 'daily' | 'unlimited'

export interface Choice {
  letter: Char
  chosen: boolean
}

export type Game = {
  letterChoices: Choice[]
  crossword: Crossword
}

export class GameController {
  constructor(private mode: GameMode) {}

  async newGame(): Promise<Game> {
    const words = await loadWordList()
    const randomIndex =
      this.mode === 'unlimited'
        ? Math.floor(Math.random() * words.length)
        : this.getRandomIndex(new Date())
    const letterList = await loadLetters(words[randomIndex])

    shuffleArray(letterList)

    const letterChoices = letterList.map((letter, i) => ({
      letter,
      chosen: false
    }))

    const wordList = await loadWords(letterList)
    const crossword = buildCrossword(wordList)

    return {
      letterChoices,
      crossword
    }
  }

  private getRandomIndex(date: Date): number {
    const diffInMillis = date.getTime() - new Date(2022, 0, 1).getTime()
    const daysSinceStart = diffInMillis / (1000 * 60 * 60 * 24)

    for (let i = 0; i < daysSinceStart; i++) {
      random()
    }

    return random()
  }
}
