<script lang="ts">
  import LetterPicker from "./LetterPicker.svelte";
  import CrosswordView from "./Crossword.svelte";
  import { wordToString } from "./char";
  import Fireworks from "./Fireworks.svelte";
  import type { Choice, Game } from "./game";

  /**
   * Timeout for active letters in milliseconds.
   */
  const ACTIVE_TIMEOUT = 1000;

  /**
   * Whether or not to show the fireworks component.
   */
  let showFireworks = false;

  /**
   * Stop showing the fireworks.
   */
  function stopFireworks() {
    document.body.classList.remove("fireworks");
    showFireworks = false;
  }

  /**
   * Handle a choice by the user.
   * @param event The event holding the choice.
   */
  function handleChoice(event: CustomEvent<Choice[]>) {
    const choices = event.detail;
    const chosenWord = choices.map((choice) => choice.letter);
    if (chosenWord.length >= 3) {
      const foundWord = game.crossword.findWord(chosenWord);
      if (foundWord) {
        console.debug(`match found for ${wordToString(chosenWord)}`);
        game.crossword = game.crossword.revealWord(chosenWord, true);
        game.complete = game.crossword.allRevealed();

        // turn off active mode after some time
        setTimeout(() => {
          game.crossword = game.crossword.revealWord(chosenWord, false);
        }, ACTIVE_TIMEOUT);

        if (game.complete) {
          // delay fireworks to avoid conflict with letter picker events
          setTimeout(() => {
            document.body.classList.add("fireworks");
            showFireworks = true;
          }, 200);
        }
      } else {
        console.debug(`no match found for ${wordToString(chosenWord)}`);
      }
    }
  }

  /**
   * The size of the SVG
   */
  const svgSize = 1000;

  /** The game instance. */
  export let game: Game | null = null;
</script>

<svelte:body on:click={stopFireworks} />

<div class="gameContent">
  {#if game}
    {#if showFireworks}<Fireworks />{/if}
    <LetterPicker
      disabled={game.complete}
      {svgSize}
      choices={game.letterChoices}
      on:choice={handleChoice}
    />{#if game.crossword}<CrosswordView
        {svgSize}
        crossword={game.crossword}
      />{/if}
  {/if}
</div>

<style lang="scss">
  .gameContent {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>
