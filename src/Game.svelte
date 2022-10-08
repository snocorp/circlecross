<script lang="ts">
  import LetterPicker from "./LetterPicker.svelte";
  import CrosswordView from "./Crossword.svelte";
  import { wordToString } from "./char";
  import Fireworks from "./Fireworks.svelte";
  import type { Choice, Game } from "./game";

  let showFireworks = false;

  function stopFireworks() {
    document.body.classList.remove("fireworks");
    showFireworks = false;
  }

  function handleChoice(event: CustomEvent<Choice[]>) {
    const choices = event.detail;
    const chosenWord = choices.map((choice) => choice.letter);
    if (chosenWord.length >= 3) {
      const foundWord = game.crossword.findWord(chosenWord);
      if (foundWord) {
        console.debug(`match found for ${wordToString(chosenWord)}`);
        game.crossword = game.crossword.revealWord(chosenWord);
        game.complete = game.crossword.allRevealed();

        // delay fireworks to avoid conflict with letter picker events
        setTimeout(() => {
          document.body.classList.add("fireworks");
          showFireworks = game.complete;
        }, 200);
      } else {
        console.debug(`no match found for ${wordToString(chosenWord)}`);
      }
    }
  }

  const svgSize = 1000;

  export let game: Game | null = null;
</script>

<svelte:body on:click={stopFireworks} />

<div>
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
