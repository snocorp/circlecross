import { wordToString, type Char, type Word } from './char'
import { Grid, isElementEmpty } from './grid'
import type { Coords } from './util'

type WordInfo = { start: Coords; vertical: boolean }

class CrosswordBox {
  constructor(public readonly value: Char, public readonly hidden: boolean) {}

  toString() {
    return this.value
  }
}

export class Crossword extends Grid<CrosswordBox> {
  words: { [key: string]: WordInfo } = {}

  constructor() {
    super()
  }

  placeWord(word: Word, start: Coords, vertical: boolean) {
    this.words[wordToString(word)] = { start, vertical }
    if (vertical) {
      for (let i = 0; i < word.length; i++) {
        this.setElem(
          { x: start.x, y: start.y + i },
          new CrosswordBox(word[i], true)
        )
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        this.setElem(
          { x: start.x + i, y: start.y },
          new CrosswordBox(word[i], true)
        )
      }
    }
  }

  findWord(word: Word): WordInfo | undefined {
    return this.words[wordToString(word)]
  }

  revealWord(word: Word): Crossword {
    const info = this.findWord(word)
    if (!info) {
      return
    }

    if (info.vertical) {
      for (let i = 0; i < word.length; i++) {
        this.setElem(
          { x: info.start.x, y: info.start.y + i },
          new CrosswordBox(word[i], false)
        )
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        this.setElem(
          { x: info.start.x + i, y: info.start.y },
          new CrosswordBox(word[i], false)
        )
      }
    }

    return this
  }

  shiftDown(count: number) {
    super.shiftDown(count)

    Object.values(this.words).forEach((word) => (word.start.y += count))
  }

  shiftRight(count: number) {
    super.shiftRight(count)

    Object.values(this.words).forEach((word) => (word.start.x += count))
  }
}

export function buildCrossword(words: Word[]): Crossword {
  const sortedWords = words.sort((a, b) => b.length - a.length)

  const cw: Crossword = new Crossword()
  const grid = cw

  let x: number
  let y: number
  const firstWord = sortedWords[0]
  let vertical = Math.random() > 0.5
  cw.placeWord(firstWord, { x: 0, y: 0 }, vertical)

  for (let i = 1; i < sortedWords.length; i++) {
    const currentWord = sortedWords[i]

    let attempts = 0
    let foundPlacement = false
    while (!foundPlacement && attempts < 100) {
      attempts++
      vertical = !vertical

      // pick a random letter
      const randomLetterIndex = Math.floor(Math.random() * currentWord.length)
      const coordList = grid.findValue(
        (v: CrosswordBox) => v.value === currentWord[randomLetterIndex]
      )
      const randomCoordIndex = Math.floor(Math.random() * coordList.length)
      const coord = coordList[randomCoordIndex]

      let blocked = false
      if (vertical) {
        // check if there is room above
        const yStart = coord.y - randomLetterIndex
        if (yStart < 0) {
          const diff = -yStart
          grid.shiftDown(diff)
          coord.y += diff
        }
        // check if there is room below
        const yEnd = coord.y - randomLetterIndex + currentWord.length
        if (yEnd >= grid.getHeight()) {
          grid.expandDown(yEnd - grid.getHeight())
        }

        for (let i = 0; i < currentWord.length && !blocked; i++) {
          const y = coord.y - randomLetterIndex + i
          if (i === 0) {
            const elemBefore = y > 0 && grid.hasValue({ x: coord.x, y: y - 1 })
            if (elemBefore) {
              blocked = true
            }
          } else if (i + 1 === currentWord.length) {
            const elemAfter =
              y + 1 < grid.getHeight() &&
              grid.hasValue({ x: coord.x, y: y + 1 })
            if (elemAfter) {
              blocked = true
            }
          }
          if (blocked) {
            continue
          }

          const elem = grid.getElem({ x: coord.x, y })
          if (isElementEmpty(elem)) {
            // check if there's space to the sides
            if (
              (coord.x > 0 && grid.hasValue({ x: coord.x - 1, y })) ||
              (coord.x + 1 < grid.getWidth() &&
                grid.hasValue({ x: coord.x + 1, y }))
            ) {
              blocked = true
            }
          } else if (elem.value.value !== currentWord[i]) {
            blocked = true
          }
        }
        if (!blocked) {
          // place the word
          cw.placeWord(
            currentWord,
            { x: coord.x, y: coord.y - randomLetterIndex },
            vertical
          )
          foundPlacement = true
        }
      } else {
        // check if there is room to the left
        const xStart = coord.x - randomLetterIndex
        if (xStart < 0) {
          const diff = -xStart
          grid.shiftRight(diff)
          coord.x += diff
        }
        // check if ther is room to the right
        const xEnd = coord.x - randomLetterIndex + currentWord.length
        if (xEnd >= grid.getWidth()) {
          grid.expandRight(xEnd - grid.getWidth())
        }

        for (let i = 0; i < currentWord.length && !blocked; i++) {
          const x = coord.x - randomLetterIndex + i
          if (i === 0) {
            const elemBefore = x > 0 && grid.hasValue({ x: x - 1, y: coord.y })
            if (elemBefore) {
              blocked = true
            }
          } else if (i + 1 === currentWord.length) {
            const elemAfter =
              x + 1 < grid.getWidth() && grid.hasValue({ x: x + 1, y: coord.y })
            if (elemAfter) {
              blocked = true
            }
          }
          if (blocked) {
            continue
          }

          const elem = grid.getElem({ x, y: coord.y })
          if (isElementEmpty(elem)) {
            // check if there's space to the top and bottom
            if (
              (coord.y > 0 && grid.hasValue({ x, y: coord.y - 1 })) ||
              (coord.y + 1 < grid.getHeight() &&
                grid.hasValue({ x, y: coord.y + 1 }))
            ) {
              blocked = true
            }
          } else if (elem.value.value !== currentWord[i]) {
            blocked = true
          }
        }
        if (!blocked) {
          // place the word
          cw.placeWord(
            currentWord,
            { x: coord.x - randomLetterIndex, y: coord.y },
            vertical
          )
          foundPlacement = true
        }
      }
    }
  }

  console.log('Final crossword')
  console.log(grid.toString())

  return cw
}
