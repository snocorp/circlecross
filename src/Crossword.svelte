<script lang="ts">
  import type { Crossword } from './crossword'
  import { isElementEmpty } from './grid'

  export let svgSize: number
  export let crossword: Crossword

  let crosswordBoxSize: number = 1
  let crosswordOffsetX: number = 0
  let crosswordOffsetY: number = 0
  const width = crossword.getWidth()
  const height = crossword.getHeight()
  const longSideLength = Math.max(width, height)
  crosswordBoxSize = svgSize / longSideLength
  if (longSideLength === width) {
    crosswordOffsetX = 0
    crosswordOffsetY = (crosswordBoxSize * (width - height)) / 2
  } else {
    crosswordOffsetX = (crosswordBoxSize * (height - width)) / 2
    crosswordOffsetY = 0
  }
</script>

<svg
  id="crossword"
  class="crossword"
  viewBox="0 0 {svgSize} {svgSize}"
  xmlns="http://www.w3.org/2000/svg"
>
  {#each crossword.getGrid() as row, x}
    {#each row as elem, y}
      <rect
        class="crosswordBox"
        class:empty={isElementEmpty(elem)}
        class:hidden={!isElementEmpty(elem) && elem.value.hidden}
        class:revealed={!isElementEmpty(elem) && !elem.value.hidden}
        x={x * crosswordBoxSize + crosswordOffsetX}
        y={y * crosswordBoxSize + crosswordOffsetY}
        width={crosswordBoxSize}
        height={crosswordBoxSize}
      />
      {#if !isElementEmpty(elem) && !elem.value.hidden}
        <text
          class="crosswordBoxText"
          font-size="{crosswordBoxSize * 0.7}px"
          x={x * crosswordBoxSize + crosswordBoxSize / 2 + crosswordOffsetX}
          y={y * crosswordBoxSize + crosswordBoxSize / 2 + crosswordOffsetY}
          >{elem.value}</text
        >
      {/if}
    {/each}
  {/each}
</svg>

<style>
  .crossword {
    background-color: var(--outer-space-crayola);
    max-width: 400px;
  }

  .crosswordBox {
    stroke: var(--outer-space-crayola);
    stroke-width: 5;
  }

  .crosswordBox.empty {
    fill: var(--outer-space-crayola);
  }

  .crosswordBox.hidden,
  .crosswordBox.revealed {
    fill: var(--champagne-pink);
  }

  .crosswordBoxText {
    text-anchor: middle;
    dominant-baseline: middle;
    cursor: pointer;
    pointer-events: none;
    user-select: none;
  }
</style>
