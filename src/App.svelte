<script lang="ts">
  import { watchResize } from 'svelte-watch-resize'

  import { wordToString, type Char, type Word } from './char'
  import { buildCrossword, Crossword } from './crossword'
  import { isElementEmpty } from './grid'
  import { loadLetters, loadWords } from './loader'
  import { shuffleArray, type Coords } from './util'

  type Choice = {
    letter: Char
    chosen: boolean
    hover: boolean
    position: Coords
  }

  function circlePosition(
    radius: number,
    index: number,
    offset: Coords
  ): Coords {
    const angle = ((2 * Math.PI) / 6) * index
    const coords = {
      x: radius * Math.sin(angle) + offset.x,
      y: radius * Math.cos(angle) + offset.y
    }
    return coords
  }

  function handlePickerResize(node: HTMLElement) {
    svgSizeRatio = svgSize / node.clientWidth
  }

  function checkCurrentChoices() {
    const chosenWord = currentChoices.map((choice) => choice.letter)
    if (chosenWord.length >= 3) {
      const foundWord = crossword.findWord(chosenWord)
      if (foundWord) {
        console.log(`match found for ${wordToString(chosenWord)}`)
        crossword = crossword.revealWord(chosenWord)
      } else {
        console.log(`no match found for ${wordToString(chosenWord)}`)
      }
    }
    for (let i = 0; i < letterChoices.length; i++) {
      letterChoices[i].chosen = false
    }
    currentChoices = []
    choosing = false
    choiceArrowPosition = null
  }

  function handleChoiceMouseEnter(index: number) {
    return () => {
      if (choosing && !letterChoices[index].chosen) {
        letterChoices[index].chosen = true
        currentChoices = [...currentChoices, letterChoices[index]]
      }
      letterChoices[index].hover = true
    }
  }

  function handleChoiceMouseLeave(index: number) {
    return () => {
      letterChoices[index].hover = false
    }
  }

  function handleChoiceMouseDown(index: number) {
    return () => {
      if (!letterChoices[index].chosen) {
        choosing = true
        letterChoices[index].chosen = true
        currentChoices = [...currentChoices, letterChoices[index]]
      }
    }
  }

  function handleMouseMove(event: MouseEvent) {
    if (choosing && currentChoices.length < 6) {
      choiceArrowPosition = {
        x: event.offsetX * svgSizeRatio,
        y: event.offsetY * svgSizeRatio
      }
    } else {
      choiceArrowPosition = null
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (choosing && currentChoices.length < 6) {
      const touch = event.touches.item(0)

      const rect = letterPickerNode.getBoundingClientRect()

      choiceArrowPosition = {
        x: (touch.clientX - rect.x) * svgSizeRatio,
        y: (touch.clientY - rect.y) * svgSizeRatio
      }
      for (let i = 0; i < letterChoices.length; i++) {
        if (
          letterChoices[i].position.x - innerCircleRadius <
            choiceArrowPosition.x &&
          letterChoices[i].position.x + innerCircleRadius >
            choiceArrowPosition.x &&
          letterChoices[i].position.y - innerCircleRadius <
            choiceArrowPosition.y &&
          letterChoices[i].position.y + innerCircleRadius >
            choiceArrowPosition.y
        ) {
          if (!letterChoices[i].chosen) {
            letterChoices[i].chosen = true
            currentChoices = [...currentChoices, letterChoices[i]]
          }
          break
        }
      }
    } else {
      choiceArrowPosition = null
    }
  }

  let letterPickerNode: HTMLElement

  export const svgSize = 1000
  export const outerCircleRadius = svgSize * 0.3
  export const outerCircleOffset: Coords = {
    x: svgSize * 0.5,
    y: svgSize * 0.5
  }
  export const innerCircleRadius = outerCircleRadius / 4
  export let svgSizeRatio = svgSize / 400
  export let letterChoices: Choice[] = []
  export let words: Word[] = []
  export let crossword: Crossword | null = null
  export let currentChoices: Choice[] = []
  export let choosing: boolean = false
  export let choiceArrowPosition: Coords | null = null
  export let crosswordBoxSize: number = 1
  export let crosswordOffsetX: number = 0
  export let crosswordOffsetY: number = 0

  loadLetters().then((letterList: Char[]) => {
    letterPickerNode = document.getElementById('letterPicker')
    handlePickerResize(letterPickerNode)

    shuffleArray(letterList)

    letterChoices = letterList.map((letter, i) => ({
      letter,
      chosen: false,
      hover: false,
      position: circlePosition(outerCircleRadius, i, outerCircleOffset)
    }))
    loadWords(letterList).then((wordList) => {
      words = Array.from(wordList)

      crossword = buildCrossword(words)
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
    })
  })
</script>

<main>
  <h1 class="title">WordWorx</h1>
  <svg
    id="letterPicker"
    class="letterPicker"
    viewBox="0 0 {svgSize} {svgSize}"
    xmlns="http://www.w3.org/2000/svg"
    on:mouseleave={checkCurrentChoices}
    on:mousemove={handleMouseMove}
    on:touchmove|preventDefault={handleTouchMove}
    on:mouseup={checkCurrentChoices}
    on:touchend={checkCurrentChoices}
    use:watchResize={handlePickerResize}
  >
    <circle
      cx={outerCircleOffset.x}
      cy={outerCircleOffset.y}
      r={outerCircleRadius}
      fill="none"
      stroke="#714955"
      stroke-width="10"
    />
    {#each currentChoices as currChoice, i}
      {#if currentChoices.length > i + 1}
        <line
          class="choiceLine"
          x1={currChoice.position.x}
          y1={currChoice.position.y}
          x2={currentChoices[i + 1].position.x}
          y2={currentChoices[i + 1].position.y}
          stroke-width="10"
        />
      {:else if choiceArrowPosition !== null}
        <line
          class="choiceLine"
          x1={currChoice.position.x}
          y1={currChoice.position.y}
          x2={choiceArrowPosition.x}
          y2={choiceArrowPosition.y}
          stroke-width="10"
        />
      {/if}
    {/each}
    {#each letterChoices as choice, i}
      <circle
        class="choiceCircle"
        class:hover={!choice.chosen && choice.hover}
        class:chosen={choice.chosen}
        cx={choice.position.x}
        cy={choice.position.y}
        r={innerCircleRadius}
        on:mouseenter={handleChoiceMouseEnter(i)}
        on:mouseleave={handleChoiceMouseLeave(i)}
        on:mousedown={handleChoiceMouseDown(i)}
        on:touchstart={handleChoiceMouseDown(i)}
      />
      <text
        class="choiceText"
        font-size="{innerCircleRadius}px"
        x={choice.position.x}
        y={choice.position.y}>{choice.letter}</text
      >
    {/each}
  </svg>
  {#if crossword !== null}
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
  {/if}
</main>

<style>
  .title {
    max-width: 800px;
    text-align: center;
  }

  .letterPicker {
    max-width: 400px;
  }

  .choiceCircle {
    fill: var(--eggplant);
    stroke: none;
    cursor: pointer;
    user-select: none;
  }

  .choiceCircle.chosen {
    fill: var(--flame);
  }

  .choiceCircle.hover {
    fill: var(--skobeloff);
  }

  .choiceText {
    stroke: var(--champagne-pink);
    fill: var(--champagne-pink);
    text-anchor: middle;
    dominant-baseline: middle;
    cursor: pointer;
    pointer-events: none;
    user-select: none;
  }

  .choiceLine {
    stroke: var(--flame);
  }

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
