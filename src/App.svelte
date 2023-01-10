<script lang="ts">
  import { writeText } from "@tauri-apps/api/clipboard";
  import { onMount } from "svelte";

  import { fetchData } from "./fetchData";
  import {
    BibleData,
    bibleData,
    contextMenuData,
    darkModeOn,
    showContextMenu,
    type ContextMenuButtonData,
  } from "./lib/stores";

  import ChapterContent from "./lib/ChapterContent.svelte";
  import Navbar from "./lib/Navbar/Navbar.svelte";
  import SearchBar from "./lib/SearchBar/SearchBar.svelte";
  import LoadingError from "./lib/LoadingError.svelte";
  import LoadingAnimation from "./lib/LoadingAnimation.svelte";
  import ContextMenu from "./lib/ContextMenu.svelte";

  onMount(fetchData);

  /**
   * Used to show a context menu when the document is right-clicked
   * @param e The `MouseEvent` of the right-click
   */
  function onRightClick(e: MouseEvent) {
    if (e.button == 2) {
      let copyButton: ContextMenuButtonData = {
        text: "Copy",
        disabled: window.getSelection()?.toString() === "",
        action: () => {
          writeText(window.getSelection()?.toString() || "");
        },
      };

      showContextMenu(e, [copyButton]);
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="container"
  on:contextmenu={onRightClick}
  data-dark-mode={$darkModeOn ? "on" : "off"}
>
  <Navbar />
  <section class="main">
    {#if $bibleData === null}
      <LoadingAnimation />
    {:else if $bibleData instanceof Error}
      <LoadingError error={$bibleData} />
    {:else if $bibleData instanceof BibleData}
      <ChapterContent bibleData={$bibleData} />
      <SearchBar />
    {/if}
  </section>
</div>

{#if $contextMenuData !== null}
  <ContextMenu contextMenuData={$contextMenuData} />
{/if}

<style>
  section.main {
    height: 100vh;
    display: flex;
    flex-direction: row;
  }
  [data-dark-mode="on"] {
    background-color: rgb(15, 15, 15);
    color: white;
  }
</style>
