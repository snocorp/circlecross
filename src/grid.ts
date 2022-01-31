import type { Coords } from './util'

interface Element<T> {
  value?: T
}

export function isElementEmpty(elem: Element<any>) {
  return typeof elem.value === 'undefined'
}

export class Grid<T> {
  private grid: Element<T>[][]

  getElem(coords: Coords): Element<T> | undefined {
    const width = this.grid.length
    const height = (x: number) => this.grid[x].length
    if (coords.x >= width || coords.y >= height(coords.x)) {
      console.warn(
        `Lookup outside of grid bounds (${coords.x},${
          coords.y
        }), size ${width}x${height(0)}`
      )
      return undefined
    }

    return this.grid[coords.x][coords.y]
  }

  hasValue(coords: Coords): boolean {
    const width = this.grid.length
    const height = (x: number) => this.grid[x].length
    if (coords.x >= width || coords.y >= height(coords.x)) {
      console.warn(
        `Lookup outside of grid bounds (${coords.x},${
          coords.y
        }), size ${width}x${height(0)}`
      )
      return false
    }

    return !isElementEmpty(this.grid[coords.x][coords.y])
  }

  setElem(coords: Coords, value: T) {
    if (!Array.isArray(this.grid)) {
      this.grid = []
    }
    if (this.grid.length <= coords.x) {
      for (let i = this.grid.length; i <= coords.x; i++) {
        this.grid[i] = []
      }
    }
    if (this.grid[coords.x].length <= coords.y) {
      for (let i = this.grid[coords.x].length; i <= coords.y; i++) {
        this.grid[coords.x][i] = {}
      }
    }

    this.grid[coords.x][coords.y] = { value }
  }

  findValue(predicate: (value: T) => boolean): Coords[] {
    const coordList: Coords[] = []
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        if (
          !isElementEmpty(this.grid[x][y]) &&
          predicate(this.grid[x][y].value)
        ) {
          coordList.push({ x, y })
        }
      }
    }
    return coordList
  }

  getGrid(): Element<T>[][] {
    return this.grid
  }

  getWidth(): number {
    return this.grid.length
  }

  getHeight(): number {
    return this.grid[0].length
  }

  toString(): string {
    return this.grid
      .map((column) =>
        column
          .map((elem) => {
            return isElementEmpty(elem) ? '. ' : ' ' + elem.value.toString()
          })
          .join(' ')
      )
      .join('\n')
  }

  expandDown(count: number) {
    if (!Array.isArray(this.grid)) {
      return
    }
    for (let x = 0; x < this.grid.length; x++) {
      this.grid[x].push(...new Array<Element<T>>(count).fill({}))
    }
  }

  shiftDown(count: number) {
    if (!Array.isArray(this.grid)) {
      return
    }
    for (let x = 0; x < this.grid.length; x++) {
      this.grid[x].unshift(...new Array<Element<T>>(count).fill({}))
    }
  }

  expandRight(count: number) {
    if (!Array.isArray(this.grid)) {
      return
    }
    const arr = new Array(count)
    for (let i = 0; i < count; i++) {
      arr[i] = new Array<Element<T>>(this.grid[0].length).fill({})
    }
    this.grid.push(...arr)
  }

  shiftRight(count: number) {
    if (!Array.isArray(this.grid)) {
      return
    }

    const arr = new Array(count)
    for (let i = 0; i < count; i++) {
      arr[i] = new Array<Element<T>>(this.grid[0].length).fill({})
    }
    this.grid.unshift(...arr)
  }
}
