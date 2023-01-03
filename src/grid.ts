import type { Coords } from "./util";

/**
 * An element in the grid.
 */
interface Element<T> {
  value?: T;
}

/**
 * Checks if an element is empty
 * @param elem The element to check
 * @returns True if the element is empty, false otherwise.
 */
export function isElementEmpty(elem: Element<any>) {
  return typeof elem.value === "undefined";
}

/**
 * The grid object.
 * @param T The type that the grid contains
 */
export class Grid<T> {
  /**
   * The data for the grid.
   */
  private grid: Element<T>[][];

  /**
   * Gets an element from the grid. Returns undefined if the coordinates are outside of the grid.
   * @param coords The coordinates of the element
   * @returns The element
   */
  getElem(coords: Coords): Element<T> | undefined {
    const width = this.grid.length;
    const height = (x: number) => this.grid[x].length;
    if (coords.x >= width || coords.y >= height(coords.x)) {
      console.warn(
        `Lookup outside of grid bounds (${coords.x},${
          coords.y
        }), size ${width}x${height(0)}`
      );
      return undefined;
    }

    return this.grid[coords.x][coords.y];
  }

  /**
   * Returns whether or not the given coordinates have a value that is defined.
   * @param coords The coordinates
   * @returns True if the element has a value
   */
  hasValue(coords: Coords): boolean {
    const elem = this.getElem(coords);
    if (typeof elem === "undefined") {
      return false;
    }

    return !isElementEmpty(elem);
  }

  /**
   * Sets the value of the element at the given coordinates. Expands the grid if the coordinates are outside the grid.
   * @param coords The coordinates
   * @param value The value of the element
   */
  setElem(coords: Coords, value: T) {
    if (!Array.isArray(this.grid)) {
      this.grid = [];
    }
    if (this.grid.length <= coords.x) {
      for (let i = this.grid.length; i <= coords.x; i++) {
        this.grid[i] = [];
      }
    }
    if (this.grid[coords.x].length <= coords.y) {
      for (let i = this.grid[coords.x].length; i <= coords.y; i++) {
        this.grid[coords.x][i] = {};
      }
    }

    this.grid[coords.x][coords.y] = { value };
  }

  /**
   * Finds all mathing values using the given predicate.
   * @param predicate The function to test the value
   * @returns All matching coordinates
   */
  findValue(predicate: (value: T) => boolean): Coords[] {
    const coordList: Coords[] = [];
    for (let x = 0; x < this.grid.length; x++) {
      for (let y = 0; y < this.grid[x].length; y++) {
        if (
          !isElementEmpty(this.grid[x][y]) &&
          predicate(this.grid[x][y].value)
        ) {
          coordList.push({ x, y });
        }
      }
    }
    return coordList;
  }

  /**
   * Returns the entire grid.
   * @returns The grid
   */
  getGrid(): Element<T>[][] {
    return this.grid;
  }

  /**
   * Returns the width of the grid.
   * @returns The width of the grid
   */
  getWidth(): number {
    return this.grid.length;
  }

  /**
   * Returns the height of the grid.
   * @returns The height of the grid
   */
  getHeight(): number {
    return this.grid[0].length;
  }

  /**
   * Returns a string version of the grid.
   * @returns A string version of the grid
   */
  toString(): string {
    return this.grid
      .map((column) =>
        column
          .map((elem) => {
            return isElementEmpty(elem) ? " ." : " " + elem.value.toString();
          })
          .join(" ")
      )
      .join("\n");
  }

  /**
   * Expands the grid down by adding new rows.
   * @param count The number of rows to be added.
   */
  expandDown(count: number): void {
    if (!Array.isArray(this.grid)) {
      return;
    }
    for (let x = 0; x < this.grid.length; x++) {
      this.grid[x].push(...new Array<Element<T>>(count).fill({}));
    }
  }

  /**
   * Shifts the rows down by adding new rows.
   * @param count The number of rows to shift.
   */
  shiftDown(count: number): void {
    if (!Array.isArray(this.grid)) {
      return;
    }
    for (let x = 0; x < this.grid.length; x++) {
      this.grid[x].unshift(...new Array<Element<T>>(count).fill({}));
    }
  }

  /**
   * Expands the grid to the right by adding new columns.
   * @param count The number of columns to add
   */
  expandRight(count: number) {
    if (!Array.isArray(this.grid)) {
      return;
    }
    const arr = new Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = new Array<Element<T>>(this.grid[0].length).fill({});
    }
    this.grid.push(...arr);
  }

  /**
   * Moves the grid right by adding new columns.
   * @param count The number of columns to add
   */
  shiftRight(count: number) {
    if (!Array.isArray(this.grid)) {
      return;
    }

    const arr = new Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = new Array<Element<T>>(this.grid[0].length).fill({});
    }
    this.grid.unshift(...arr);
  }

  /**
   * Removes a column.
   * @param x The index of the column
   */
  removeColumn(x: number) {
    this.grid.splice(x, 1);
  }

  /**
   * Removes a row.
   * @param y The index of the row
   */
  removeRow(y: number) {
    for (let x = 0; x < this.getWidth(); x++) {
      this.grid[x].splice(y, 1);
    }
  }

  /**
   * Trim empty rows from the grid.
   */
  trim() {
    for (let x = 0; x < this.getWidth(); x++) {
      const emptyColumn = this.grid[x].every((elem) => isElementEmpty(elem));
      if (emptyColumn) {
        this.removeColumn(x);
      }
    }

    for (let y = 0; y < this.getHeight(); y++) {
      const emptyRow = this.grid.every((column) => isElementEmpty(column[y]));
      if (emptyRow) {
        this.removeRow(y);
      }
    }
  }
}
