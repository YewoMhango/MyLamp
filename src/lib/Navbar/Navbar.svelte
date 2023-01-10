<script lang="ts">
  import {
    BibleData,
    bibleData,
    BOOK_NAMES,
    currentVerse,
    darkModeOn,
    searching,
    setCurrentVerse,
    Verse,
  } from "../stores";

  import MenuIcon from "../Icons/MenuIcon.svelte";
  import NextIcon from "../Icons/NextIcon.svelte";
  import PreviousIcon from "../Icons/PreviousIcon.svelte";
  import SearchIcon from "../Icons/SearchIcon.svelte";
  import VerseSelector from "./VerseSelector.svelte";
  import SettingsMenu from "./SettingsMenu.svelte";

  let openMenu: null | "settings" | "verse selector" = null;

  function toggleSeachbar() {
    searching.update((value) => !value);
  }

  /**
   * Navigates to the chapter before this one in the book where
   * it is located, or to the last chapter in the previous book
   * if the current chapter is the first one
   */
  function previousChapter() {
    if (
      !($currentVerse.book == "Genesis" && $currentVerse.chapter == 1) &&
      $bibleData instanceof BibleData
    ) {
      if ($currentVerse.chapter == 1) {
        let newBookIndex = BOOK_NAMES.indexOf($currentVerse.book) - 1;
        setCurrentVerse(
          new Verse(
            BOOK_NAMES[newBookIndex],
            $bibleData.verseCounts[newBookIndex].length,
            1
          )
        );
      } else {
        setCurrentVerse(
          new Verse($currentVerse.book, $currentVerse.chapter - 1, 1)
        );
      }
    }
  }

  /**
   * Navigates to the chapter after this one in the book where
   * it is located, or to the first chapter in the next book
   * if the current chapter is the last one
   */
  function nextChapter() {
    if (
      !($currentVerse.book == "Revelation" && $currentVerse.chapter == 22) &&
      $bibleData instanceof BibleData
    ) {
      let currentBookIndex = BOOK_NAMES.indexOf($currentVerse.book);
      if (
        $currentVerse.chapter == $bibleData.verseCounts[currentBookIndex].length
      ) {
        setCurrentVerse(new Verse(BOOK_NAMES[currentBookIndex + 1], 1, 1));
      } else {
        setCurrentVerse(
          new Verse($currentVerse.book, $currentVerse.chapter + 1, 1)
        );
      }
    }
  }

  function closeMenu() {
    openMenu = null;
  }

  function settingsMenuButtonClicked() {
    openMenu = openMenu === "settings" ? null : "settings";
  }

  function selectVerseButtonClicked() {
    openMenu = openMenu === "verse selector" ? null : "verse selector";
  }
</script>

<nav data-dark-mode={$darkModeOn ? "on" : "off"}>
  <div class="left">
    <button on:click={settingsMenuButtonClicked}>
      <MenuIcon />
    </button>
  </div>
  <div class="central">
    <a href="#top" on:click={previousChapter}>
      <PreviousIcon />
    </a>
    <button class="select-verse" on:click={selectVerseButtonClicked}>
      {#if $currentVerse instanceof Verse}
        {$currentVerse.book} {$currentVerse.chapter}:{$currentVerse.verseNumber}
      {/if}
    </button>
    <a href="#top" on:click={nextChapter}>
      <NextIcon />
    </a>
  </div>
  <div class="right">
    <button on:click={toggleSeachbar}>
      <SearchIcon />
    </button>
  </div>
</nav>

{#if openMenu === "verse selector"}
  <VerseSelector closeVerseSelector={closeMenu} />
{:else if openMenu === "settings"}
  <SettingsMenu {closeMenu} />
{/if}

<style>
  nav {
    height: 50px;
    padding: 5px;
    position: fixed;
    z-index: 5;
    top: 0;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: #c5c5c5;
  }

  nav button,
  nav a {
    height: 40px;
    width: 40px;
    padding: 0;
  }

  nav button:hover,
  nav a:hover {
    background-color: rgb(185, 185, 185);
  }

  nav button:active,
  nav a:active {
    background-color: rgb(175, 175, 175);
  }

  nav .central {
    display: flex;
    flex-direction: row;
  }

  nav .central .select-verse {
    padding: 0 10px;
    font-size: 1.4em;
    width: auto;
  }

  nav[data-dark-mode="on"] {
    background-color: rgb(34, 34, 34);
  }

  nav[data-dark-mode="on"] button:hover,
  nav[data-dark-mode="on"] a:hover {
    background-color: rgb(70, 70, 70);
  }

  nav[data-dark-mode="on"] button:active,
  nav[data-dark-mode="on"] a:active {
    background-color: rgb(80, 80, 80);
  }
</style>
