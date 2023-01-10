<script lang="ts">
  import { darkModeOn, searching } from "../stores";

  import SearchInput from "./SearchInput.svelte";
  import SearchResults from "./SearchResults.svelte";

  let isSearching = false;
  let searchbarWidth = 0;

  let inputsSectionHeight: number;

  searching.subscribe((value) => {
    if (value) {
      searchbarWidth = 300;
    } else {
      searchbarWidth = 0;
    }
    isSearching = value;
  });

  function hideSearchbar() {
    searching.set(false);
  }

  /**
   * Initializes the event handlers used to resize the search
   * sidebar once the resize handle is touched
   * @param e The mouse event
   */
  function startResize(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    window.addEventListener("mousemove", resize, false);
    window.addEventListener("touchmove", resize, false);
    window.addEventListener("mouseup", stopResize, false);
    window.addEventListener("touchend", stopResize, false);

    function resize(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      let newWidth = document.body.clientWidth - getClientX(e);
      if (newWidth < 200) {
        hideSearchbar();
        stopResize();
      } else {
        searchbarWidth = Math.min(newWidth, window.innerWidth - 100);
      }
    }

    function stopResize() {
      window.removeEventListener("mousemove", resize, false);
      window.removeEventListener("touchmove", resize, false);
      window.removeEventListener("mouseup", stopResize, false);
      window.removeEventListener("touchend", stopResize, false);
    }

    function getClientX(e: TouchEvent | MouseEvent) {
      return (e as any).touches
        ? (e as TouchEvent).touches[0].clientX
        : (e as MouseEvent).clientX;
    }
  }
</script>

<div
  class="search-resizer"
  style="width: {isSearching ? '5px' : '0'}"
  on:mousedown={startResize}
  on:touchstart={startResize}
/>

<section
  class="search"
  style="width: {searchbarWidth}px; padding: {isSearching ? '10px' : '10px 0'}"
  data-dark-mode={$darkModeOn ? "on" : "off"}
>
  <div class="container" style="display: {isSearching ? 'block' : 'none'};">
    <div class="input" bind:clientHeight={inputsSectionHeight}>
      <SearchInput />
    </div>
    <SearchResults {inputsSectionHeight} />
  </div>
</section>

<style>
  section.search {
    height: calc(100% - 50px);
    flex-shrink: 0;
    background-color: rgb(221, 221, 221);
    padding: 10px 0;
    margin-top: 50px;
    overflow: hidden;
  }

  .container {
    height: 100%;
  }

  .search-resizer {
    cursor: col-resize;
    height: 100%;
    flex-shrink: 0;
  }

  .search-resizer:hover {
    background-color: hsl(0, 0%, 50%);
  }

  section.search[data-dark-mode="on"] {
    background-color: rgb(58, 58, 58);
  }
</style>
