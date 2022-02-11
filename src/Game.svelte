<script lang="ts">

  import LetterPicker from './LetterPicker.svelte'
  import CrosswordView from './Crossword.svelte'
  import { wordToString } from './char'
  import type { Crossword } from './crossword'
  import { GameController, type Choice, type Game } from './game'

  function handleChoice(event: CustomEvent<Choice[]>) {
    const choices = event.detail
    const chosenWord = choices.map((choice) => choice.letter)
    if (chosenWord.length >= 3) {
      const foundWord = crossword.findWord(chosenWord)
      if (foundWord) {
        console.log(`match found for ${wordToString(chosenWord)}`)
        crossword = crossword.revealWord(chosenWord)
      } else {
        console.log(`no match found for ${wordToString(chosenWord)}`)
      }
    }
  }

  const svgSize = 1000

  let letterChoices: Choice[] = []
  let crossword: Crossword | null = null

  const controller = new GameController('daily')
  controller.newGame().then((game: Game) => {
    letterChoices = game.letterChoices
    crossword = game.crossword
  })
</script>

<div>
  <LetterPicker svgSize={svgSize} choices={letterChoices} on:choice={handleChoice} />
  {#if crossword !== null}
    <CrosswordView svgSize={svgSize} crossword={crossword} />
  {/if}
</div>
