export type Char =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z'

export type Word = Char[]

export function isChar(char: any): char is Char {
  return (
    typeof char === 'string' &&
    char.length === 1 &&
    char.charCodeAt(0) >= 97 &&
    char.charCodeAt(0) <= 122
  )
}

export function stringToWord(str: string): Word {
  const word: Word = []
  for (let i = 0; i < str.length; i++) {
    const letter = str[i]
    if (isChar(letter)) {
      word.push(letter)
    }
  }
  return word
}

export function wordToString(word: Word): string {
  return word.join('')
}
