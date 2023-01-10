<script lang="ts">
  import { writeText } from "@tauri-apps/api/clipboard";

  import {
    type BibleData,
    BOOK_NAMES,
    currentVerse,
    fontSize,
    type ContextMenuButtonData,
    showContextMenu,
  } from "./stores";

  export let bibleData: BibleData;

  $: bookIndex = BOOK_NAMES.indexOf($currentVerse.book);

  /**
   * Displays a context menu for copying a verse when its
   * verse number has been clicked
   * @param e The click event
   * @param verse The verse number
   */
  function verseNumberClicked(e: MouseEvent, verse: number) {
    let copyButton: ContextMenuButtonData = {
      text: "Copy verse",
      action: () => {
        writeText(
          `“${
            bibleData.allVerses[bookIndex][$currentVerse.chapter - 1][verse - 1]
          }” (${$currentVerse.book} ${$currentVerse.chapter}:${verse})`
        );
      },
    };

    showContextMenu(e, [copyButton]);
  }
</script>

<main class="content" style="font-size: {$fontSize}px;">
  <div>
    <div id="top" />
    {#if $currentVerse.chapter === 1}
      <h1>{bibleData.fullTitles[bookIndex]}</h1>
    {/if}

    {#each bibleData.allVerses[bookIndex][$currentVerse.chapter - 1] as verse, index}
      <p id={`${index + 1}`}>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <sup on:click={(e) => verseNumberClicked(e, index + 1)}>{index + 1}</sup
        >
        {verse}
      </p>
    {/each}
  </div>
</main>

<style>
  main.content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 50px;
    padding: 20px;
    font-family: "Sitka Text", "Abyssinica SIL", "Palatino", sans-serif;
    font-size: 28px;
    overflow-y: scroll;
  }

  main.content > div {
    width: 100%;
  }

  main.content h1 {
    font-size: 1.5em;
    margin-top: 0;
    font-weight: 500;
  }

  main.content sup {
    color: #808080;
    font-size: 0.6em;
    cursor: pointer;
  }

  main.content sup:hover {
    color: rgb(0, 126, 230);
  }

  main.content p {
    margin: 0;
    text-align: justify;
    text-indent: 10px;
  }
</style>
