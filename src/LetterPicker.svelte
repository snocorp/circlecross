<script lang="ts">
  import { watchResize } from "svelte-watch-resize";
  import { createEventDispatcher, onMount } from "svelte";
  import type { Choice } from "./game";
  import type { Coords } from "./util";

  interface PickerChoice extends Choice {
    hover: boolean;
    position: Coords;
  }

  export let disabled: boolean;
  export let svgSize: number;
  export let choices: Choice[];

  let svgSizeRatio = svgSize / 400;
  let outerCircleRadius = svgSize * 0.3;
  let innerCircleRadius = outerCircleRadius / 4;
  let outerCircleOffset: Coords = {
    x: svgSize * 0.5,
    y: svgSize * 0.5,
  };

  $: letterChoices = choices.map((choice, i) => {
    return {
      ...choice,
      hover: false,
      position: circlePosition(outerCircleRadius, i, outerCircleOffset),
    };
  });
  let currentChoices: PickerChoice[] = [];
  let choosing: boolean = false;
  let choiceArrowPosition: Coords | null = null;

  let letterPickerNode: HTMLElement;

  type EventMap = {
    choice: Choice[];
  };
  const dispatch = createEventDispatcher<EventMap>();

  onMount(() => {
    letterPickerNode = document.getElementById("letterPicker");
    handlePickerResize(letterPickerNode);
  });

  function circlePosition(
    radius: number,
    index: number,
    offset: Coords
  ): Coords {
    const angle = ((2 * Math.PI) / 6) * index;
    const coords = {
      x: radius * Math.sin(angle) + offset.x,
      y: radius * Math.cos(angle) + offset.y,
    };
    return coords;
  }

  function handleMouseMove(event: MouseEvent) {
    if (!disabled && choosing && currentChoices.length < 6) {
      choiceArrowPosition = {
        x: event.offsetX * svgSizeRatio,
        y: event.offsetY * svgSizeRatio,
      };
    } else {
      choiceArrowPosition = null;
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (!disabled && choosing && currentChoices.length < 6) {
      const touch = event.touches.item(0);

      const rect = letterPickerNode.getBoundingClientRect();

      choiceArrowPosition = {
        x: (touch.clientX - rect.x) * svgSizeRatio,
        y: (touch.clientY - rect.y) * svgSizeRatio,
      };
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
            letterChoices[i].chosen = true;
            currentChoices = [...currentChoices, letterChoices[i]];
          }
          break;
        }
      }
    } else {
      choiceArrowPosition = null;
    }
  }

  function handleChoiceMouseEnter(index: number) {
    return () => {
      if (disabled) {
        return;
      }
      if (choosing && !letterChoices[index].chosen) {
        letterChoices[index].chosen = true;
        currentChoices = [...currentChoices, letterChoices[index]];
      }
      letterChoices[index].hover = true;
    };
  }

  function handleChoiceMouseLeave(index: number) {
    return () => {
      letterChoices[index].hover = false;
    };
  }

  function handleChoiceMouseDown(index: number) {
    return () => {
      if (disabled) {
        return;
      }
      if (!letterChoices[index].chosen) {
        choosing = true;
        letterChoices[index].chosen = true;
        currentChoices = [...currentChoices, letterChoices[index]];
      }
    };
  }

  function handlePickerResize(node: HTMLElement) {
    svgSizeRatio = svgSize / node.clientWidth;
  }

  function chooseLetters() {
    const choices = currentChoices;
    dispatch("choice", choices);
    for (let i = 0; i < letterChoices.length; i++) {
      letterChoices[i].chosen = false;
    }
    currentChoices = [];
    choosing = false;
    choiceArrowPosition = null;
  }
</script>

<svg
  id="letterPicker"
  class="letterPicker"
  viewBox="0 0 {svgSize} {svgSize}"
  xmlns="http://www.w3.org/2000/svg"
  on:mouseleave={chooseLetters}
  on:mousemove={handleMouseMove}
  on:touchmove|preventDefault={handleTouchMove}
  on:mouseup={chooseLetters}
  on:touchend={chooseLetters}
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

<style>
  .letterPicker {
    background-color: var(--champagne-pink);
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
</style>
