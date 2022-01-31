import { stringToWord, type Char, type Word } from './char'
import { isChar } from './char'

type WordNode = {
  value: string
  word: boolean
  children: { [key: string]: WordNode }
}

export async function loadLetters(): Promise<Char[]> {
  const response = await fetch('words.json')

  const letterList: Char[] = []
  const words: string[] = await response.json()

  const randomIndex = Math.floor(Math.random() * words.length)
  const word = stringToWord('stares') // words[randomIndex]

  for (let i = 0; i < word.length; i++) {
    const char = word[i]
    if (isChar(char)) {
      letterList.push(char)
    } else {
      console.error(char)
    }
  }

  return letterList
}

export async function loadWords(letterList: Char[]): Promise<Set<Word>> {
  const response = await fetch('data.json')

  const data: WordNode = await response.json()

  const wordStrings = buildWords(data, letterList)

  const wordList: Set<Word> = new Set<Word>()
  wordStrings.forEach((str) => wordList.add(stringToWord(str)))

  return wordList
}

function buildWords(data: WordNode, letterList: Char[]): Set<string> {
  const wordList: Set<string> = new Set<string>()

  if (data.word) {
    wordList.add(data.value)
  }
  for (let i = 0; i < letterList.length; i++) {
    if (data.children[letterList[i]]) {
      const newWords = buildWords(
        data.children[letterList[i]],
        letterList.filter((letter, index) => index !== i)
      )
      newWords.forEach((word) => wordList.add(word))
    }
  }

  return wordList
}
