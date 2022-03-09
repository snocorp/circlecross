<script lang="ts">
  import LetterPicker from './LetterPicker.svelte'
  import CrosswordView from './Crossword.svelte'
  import { wordToString } from './char'
  import type { Crossword } from './crossword'
  import Fireworks from './Fireworks.svelte'
import type { Choice, Game } from './game';

  function handleChoice(event: CustomEvent<Choice[]>) {
    const choices = event.detail
    const chosenWord = choices.map((choice) => choice.letter)
    if (chosenWord.length >= 3) {
      const foundWord = game.crossword.findWord(chosenWord)
      if (foundWord) {
        console.log(`match found for ${wordToString(chosenWord)}`)
        game.crossword = game.crossword.revealWord(chosenWord)
        game.complete = game.crossword.allRevealed()
      } else {
        console.log(`no match found for ${wordToString(chosenWord)}`)
      }
    }
  }

  const svgSize = 1000

  export let game: Game | null = null
</script>

<div>
  {#if game}
    {#if game.complete}<Fireworks />{/if}
    <LetterPicker svgSize={svgSize} choices={game.letterChoices} on:choice={handleChoice} 
    />{#if game.crossword}<CrosswordView svgSize={svgSize} crossword={game.crossword} />{/if}
  {/if}
</div>
