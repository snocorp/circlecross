<script lang="ts">
  import Dialog, {
    Title as DialogTitle,
    Content as DialogContent,
    Actions,
  } from "@smui/dialog";
  import Drawer, { Content } from "@smui/drawer";
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import IconButton from "@smui/icon-button";
  import List, { Group, Item, Subheader, Text } from "@smui/list";
  import GameView from "./Game.svelte";
  import { newGame, type Game, type GameMode } from "./game";
  import { onMount } from "svelte";
  import Button, { Label } from "@smui/button";

  /**
   * Whether or not the menu drawer is open.
   */
  let drawerOpen = false;

  /**
   * Whether or not to show the confirmation dialog.
   */
  let showConfirmDialog = false;

  /**
   * The current game mode
   */
  let gameMode: GameMode = "daily";

  /**
   * The game instance
   */
  let game: Game | null = null;

  /**
   * Close the menu when it is clicked.
   * @param event The event
   */
  const handleMenuClick = (event: CustomEvent) => {
    event.preventDefault();
    drawerOpen = !drawerOpen;
  };

  /**
   * Sets the game mode
   * @param mode The new mode
   */
  const setGameMode = (mode: GameMode) => {
    if (gameMode !== mode) {
      gameMode = mode;
    }
  };

  /**
   * Use the confirmation dialog to confirm they want to start a new game.
   */
  const confirmNewGame = () => {
    drawerOpen = false;
    showConfirmDialog = true;
  };

  /**
   * Starts a new game.
   */
  const startGame = () => {
    drawerOpen = false;
    showConfirmDialog = false;
    game = null;
    newGame(gameMode).then((newGame: Game) => {
      game = newGame;
    });
  };

  onMount(() => {
    startGame();
  });
</script>

<main>
  <TopAppBar variant="static">
    <Row>
      <Section>
        <IconButton
          color="primary"
          class="material-icons"
          on:click={handleMenuClick}>menu</IconButton
        >
        <Title>CircleCross</Title>
      </Section>
    </Row>
  </TopAppBar>
  <Drawer variant="modal" fixed={false} open={drawerOpen}>
    <Content>
      <List>
        <Item href="javascript:void(0)" on:SMUI:action={confirmNewGame}
          ><Text>New</Text></Item
        >
        <Group
          ><Subheader>Mode</Subheader>
          <Item
            href="javascript:void(0)"
            activated={gameMode === "daily"}
            on:SMUI:action={() => setGameMode("daily")}><Text>Daily</Text></Item
          >
          <Item
            href="javascript:void(0)"
            activated={gameMode === "random"}
            on:SMUI:action={() => setGameMode("random")}
            ><Text>Random</Text></Item
          >
        </Group></List
      ></Content
    >
  </Drawer>
  <GameView {game} />
  <Dialog
    open={showConfirmDialog}
    aria-labelledby="simple-title"
    aria-describedby="simple-content"
  >
    <DialogTitle>New Game</DialogTitle>
    <DialogContent id="simple-content"
      >Are you sure you want to start a new game?</DialogContent
    >
    <Actions>
      <Button on:click={() => (showConfirmDialog = false)}>
        <Label>No</Label>
      </Button>
      <Button on:click={() => startGame()}>
        <Label>Yes</Label>
      </Button>
    </Actions>
  </Dialog>
</main>
