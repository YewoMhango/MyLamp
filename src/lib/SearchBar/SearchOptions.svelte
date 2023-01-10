<script lang="ts">
  import { BOOK_NAMES, darkModeOn } from "../stores";
  import type { SupportedSearchTypes } from "./performSearch";

  export let searchFrom: string;
  export let searchTo: string;
  export let searchType: SupportedSearchTypes;
  export let caseSensitive: boolean;
</script>

<div class="second" data-dark-mode={$darkModeOn ? "on" : "off"}>
  <table>
    <tr>
      <td><label for="search-type">Search type:</label> </td>
      <td>
        <select name="search-type" id="search-type" bind:value={searchType}>
          <option value="standard"> Standard </option>
          <option value="exact">Exact</option>
          <option value="regex"> Regular Expression </option>
        </select>
      </td>
    </tr>
    <tr>
      <td />
      <td>
        <label for="case-sensitivity">
          <input
            type="checkbox"
            name="case-sensitivity"
            id="case-sensitivity"
            bind:checked={caseSensitive}
          />
          case sensitive
        </label>
      </td>
    </tr>
    <tr>
      <td><label for="search-from">From:</label></td>
      <td>
        <select name="search-from" id="search-from" bind:value={searchFrom}>
          {#each BOOK_NAMES as book_name}
            <option value={book_name}>{book_name}</option>
          {/each}
        </select>
      </td>
    </tr>
    <tr>
      <td><label for="search-to">To:</label></td>
      <td>
        <select name="search-to" id="search-to" bind:value={searchTo}>
          {#each BOOK_NAMES as book_name}
            <option value={book_name}>{book_name}</option>
          {/each}
        </select>
      </td>
    </tr>
  </table>
</div>

<style>
  .second {
    margin-top: 5px;
  }

  select {
    border-radius: 0;
    border: 0px;
    border-bottom: 2px rgb(196, 196, 196) solid;
    background-color: rgb(229, 229, 229);
    width: 100%;
    padding: 2px;
    cursor: pointer;
  }

  label {
    cursor: pointer;
    width: 100%;
  }

  [data-dark-mode="on"] select {
    border-bottom: 2px rgb(83, 83, 83) solid;
    background-color: rgb(47, 47, 47);
    color: grey;
  }
</style>
