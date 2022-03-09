import type { PRNG } from 'seedrandom'

export type Coords = {
  x: number
  y: number
}

export function shuffleArray(array: any[], rng: PRNG) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1))
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
