<script lang="ts">
  import { readText, writeText } from "@tauri-apps/api/clipboard";

  import performSearch from "./performSearch";
  import { searchResults } from "./searchState";
  import type { SupportedSearchTypes } from "./performSearch";

  import SmallSearchIcon from "../Icons/SmallSearchIcon.svelte";
  import SearchOptions from "./SearchOptions.svelte";
  import {
    darkModeOn,
    showContextMenu,
    type ContextMenuButtonData,
  } from "../stores";

  let searchInput = "";
  let searchFrom = "Genesis";
  let searchTo = "Revelation";
  let searchType: SupportedSearchTypes = "standard";
  let caseSensitive = false;

  let searchInputElement: HTMLInputElement;

  /**
   * Performs the search when the search button is clicked
   */
  function search() {
    if (searchInput.trim() !== "") {
      searchResults.set(
        performSearch(
          searchType,
          searchInput,
          searchFrom,
          searchTo,
          caseSensitive
        )
      );
    }
  }

  /**
   * Displays a context menu when the input box is right-clicked
   * @param event The `MouseEvent` triggered by `oncontextmenu`
   */
  function displayInputContextMenu(event: MouseEvent) {
    if (event.button === 2) {
      let textSelection = window.getSelection()?.toString() || "";

      let copyButton: ContextMenuButtonData = {
        text: "Copy",
        disabled: textSelection === "",
        action: () => writeText(textSelection),
      };

      let pasteButton: ContextMenuButtonData = {
        text: "Paste",
        action: async () => {
          let from = searchInputElement.selectionStart,
            to = searchInputElement.selectionEnd,
            words = (await readText()) || "";

          searchInput =
            searchInputElement.value.slice(0, from as number) +
            words +
            searchInputElement.value.slice(to as number);

          // Put the cursor after the word
          searchInputElement.selectionStart = (from as number) + words.length;
          searchInputElement.selectionEnd = (from as number) + words.length;
        },
      };

      showContextMenu(event, [copyButton, pasteButton]);
    }
  }
</script>

<div class="search-input" data-dark-mode={$darkModeOn ? "on" : "off"}>
  <input
    id="searchBox"
    type="search"
    bind:this={searchInputElement}
    bind:value={searchInput}
    on:keydown={(e) => {
      if (e.key === "Enter") {
        search();
      }
    }}
    on:contextmenu={displayInputContextMenu}
  />
  <button on:click={search}>
    <SmallSearchIcon />
  </button>
</div>
<SearchOptions
  bind:caseSensitive
  bind:searchFrom
  bind:searchTo
  bind:searchType
/>

<style>
  .search-input {
    width: 100%;
    height: 30px;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 1px #c4c4c4 solid;
    background-color: white;
  }

  .search-input input {
    width: calc(100% - 28px);
    height: 30px;
    border: none;
    background-color: transparent;
    border-radius: 0;
    padding: 10px;
  }

  .search-input button {
    width: 28px;
    height: 28px;
  }

  .search-input button:hover {
    background-color: rgb(207, 207, 207);
  }

  .search-input button:active {
    background-color: rgb(180, 180, 180);
  }

  .search-input[data-dark-mode="on"] {
    border: 1px rgb(59, 59, 59) solid;
  }
</style>
