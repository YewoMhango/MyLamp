<script lang="ts">
  import {
    BibleData,
    bibleData,
    BOOK_NAMES,
    currentVerse,
    darkModeOn,
    setCurrentVerse,
    Verse,
  } from "../stores";

  export let closeVerseSelector: () => void;

  /**
   * The current verse being selected in the menu
   */
  let selectingVerse = $currentVerse;

  currentVerse.subscribe((value) => {
    selectingVerse = value;
  });

  $: chaptersInBookBeingSelected =
    $bibleData instanceof BibleData
      ? $bibleData.verseCounts[BOOK_NAMES.indexOf(selectingVerse.book)]
      : [];

  function selectBook(bookName: string) {
    selectingVerse = new Verse(bookName, 1, 1);
  }

  function selectChapter(chapter: number) {
    selectingVerse = new Verse(selectingVerse.book, chapter, 1);
  }

  function selectVerse(verseNumber: number) {
    setCurrentVerse(
      new Verse(selectingVerse.book, selectingVerse.chapter, verseNumber)
    );
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="overlay"
  on:click={closeVerseSelector}
  data-dark-mode={$darkModeOn ? "on" : "off"}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="verse-selector" on:click={(e) => e.stopPropagation()}>
    <div class="title">
      <span>Book</span>
    </div>
    <div class="title">
      <span>Chapter</span>
    </div>
    <div class="title">
      <span>Verse</span>
    </div>
    <div class="select select-book">
      {#each BOOK_NAMES as book}
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <div
          class={book === selectingVerse.book ? "selected" : ""}
          on:click={() => selectBook(book)}
          on:keydown={(e) => (e.key === "Enter" ? selectBook(book) : null)}
          tabindex="0"
        >
          <span>{book}</span>
        </div>
      {/each}
    </div>
    <div class="select select-chapter">
      {#if $bibleData instanceof BibleData}
        {#each chaptersInBookBeingSelected as _, index}
          <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
          <div
            class={index + 1 === selectingVerse.chapter ? "selected" : ""}
            on:click={() => selectChapter(index + 1)}
            on:keydown={(e) =>
              e.key === "Enter" ? selectChapter(index + 1) : null}
            tabindex="0"
          >
            <span>{index + 1}</span>
          </div>
        {/each}
      {/if}
    </div>
    <div class="select select-verse">
      {#if $bibleData instanceof BibleData}
        {#each Array(chaptersInBookBeingSelected[selectingVerse.chapter - 1]) as _, index}
          <a
            href="#{index + 1}"
            class={index + 1 === selectingVerse.verseNumber ? "selected" : ""}
            on:click={() => selectVerse(index + 1)}
          >
            <span>{index + 1}</span>
          </a>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .overlay {
    display: flex;
    flex-direction: column;
    top: 50px;
    position: fixed;
    z-index: 5;
    width: 100%;
    height: calc(100% - 50px);
    background-color: rgba(0, 0, 0, 0.4);
  }

  .overlay .verse-selector {
    display: grid;
    background-color: #e2e2e2;
    /* box-shadow: rgba(0, 0, 0, 0.2) 0 0 5px 1px; */
    border: rgb(117, 117, 117) 1px solid;
    align-self: center;
    justify-self: center;
    width: fit-content;
    height: calc(100% - 80px);
    max-height: 500px;
    padding: 8px;
    margin: auto;
    grid-template-columns: 130px 90px 90px;
    grid-template-rows: 30px auto;
  }

  .overlay .verse-selector .title {
    display: flex;
    padding-right: 12px;
  }

  .overlay .verse-selector .select {
    overflow-y: scroll;
    margin: 1px;
    background-color: #dadada;
  }

  .overlay .verse-selector .select div,
  .overlay .verse-selector .select a {
    height: 2em;
    box-sizing: border-box;
    color: rgb(0, 0, 0);
    font-size: 0.75em;
    display: flex;
    background-color: rgb(206, 206, 206);
    margin: 4px;
    cursor: pointer;
  }

  .overlay .verse-selector .select div:hover,
  .overlay .verse-selector .select a:hover {
    background-color: rgb(195, 195, 195);
  }

  .overlay .verse-selector .select div.selected,
  .overlay .verse-selector .select a.selected {
    background-color: rgb(185, 185, 185);
  }

  .overlay .verse-selector div span {
    margin: auto;
  }

  [data-dark-mode="on"] .verse-selector {
    background-color: rgb(29, 29, 29);
    border: rgb(138, 138, 138) 1px solid;
  }

  [data-dark-mode="on"] .verse-selector .select {
    background-color: rgb(37, 37, 37);
  }

  [data-dark-mode="on"] .verse-selector .select div,
  [data-dark-mode="on"] .verse-selector .select a {
    color: white;
    background-color: rgb(49, 49, 49);
  }

  [data-dark-mode="on"] .verse-selector .select div:hover,
  [data-dark-mode="on"] .verse-selector .select a:hover {
    background-color: rgb(60, 60, 60);
  }

  [data-dark-mode="on"] .verse-selector .select div.selected,
  [data-dark-mode="on"] .verse-selector .select a.selected {
    background-color: rgb(70, 70, 70);
  }
</style>
