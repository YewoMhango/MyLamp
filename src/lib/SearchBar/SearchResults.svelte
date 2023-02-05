<script lang="ts">
  import { searchResults } from "./searchState";
  import { MAX_SEARCH_RESULTS } from "./performSearch";
  import { darkModeOn, setCurrentVerse } from "../stores";

  export let inputsSectionHeight: number;
</script>

<div
  class="search-results"
  style="height: calc(100% - {inputsSectionHeight}px)"
  data-dark-mode={$darkModeOn ? "on" : "off"}
>
  {#if $searchResults === null}
    <div class="temporary">
      <p>Search results will appear here</p>
    </div>
  {:else if $searchResults.length === 0}
    <div class="temporary">
      <p>No search results found</p>
    </div>
  {:else}
    <p class="stats">
      {$searchResults.length} results found ({MAX_SEARCH_RESULTS} max)
    </p>
    <div class="results-list">
      {#each $searchResults as result}
        <a
          href="#{result.verse.verseNumber}"
          class="result"
          on:click={() => setCurrentVerse(result.verse)}
        >
          <strong
            >{result.verse.book}
            {result.verse.chapter}:{result.verse.verseNumber}</strong
          >
          <br />
          {result.text}
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .search-results {
    height: calc(100% - 180px);
    padding: 5px 0;
  }

  .search-results .temporary {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .search-results .temporary p {
    color: grey;
  }

  .search-results p {
    margin: 0.25em 0 0.5em 0;
  }

  .search-results .results-list {
    overflow-y: scroll;
    height: calc(100% - 30px);
  }

  .search-results .results-list .result {
    padding: 7px;
    cursor: pointer;
    color: inherit;
    display: block;
    font-weight: 400;
  }

  .search-results .results-list .result:hover {
    background-color: rgb(196, 196, 196);
  }

  .search-results[data-dark-mode="on"] .results-list .result:hover {
    background-color: rgb(70, 70, 70);
  }
</style>
