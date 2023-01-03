import type { PRNG } from "seedrandom";

/**
 * Coordinates
 */
export type Coords = {
  x: number;
  y: number;
};

/**
 * Shuffles the given array.
 * @param array The array to be shuffled
 * @param rng The random number generator
 */
export function shuffleArray(array: any[], rng: PRNG) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

/**
 * Gets the position of the given DOM node.
 * @param element The DOM node
 * @returns The coordinates of the node
 */
export function getPosition(element: HTMLElement): Coords {
  var xPosition = 0;
  var yPosition = 0;

  while (element) {
    xPosition += element.offsetLeft - element.scrollLeft + element.clientLeft;
    yPosition += element.offsetTop - element.scrollTop + element.clientTop;
    element = element.offsetParent as HTMLElement;
  }
  return { x: xPosition, y: yPosition };
}
