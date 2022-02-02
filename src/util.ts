// hash from xmur3(str)
const RANDOM_SEED = 1622121033

export type Coords = {
  x: number
  y: number
}

export function shuffleArray(array: any[]) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1))
    var temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

export function getPosition(element: HTMLElement): Coords {
  var xPosition = 0
  var yPosition = 0

  while (element) {
    xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft
    yPosition += element.offsetTop - element.scrollTop + element.clientTop
    element = element.offsetParent as HTMLElement
  }
  return { x: xPosition, y: yPosition }
}

function mulberry32(a: number): () => number {
  return function () {
    var t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const random = () => mulberry32(RANDOM_SEED)() & 0xfff
