<script lang="ts">
  import { darkModeOn, fontSize, setDarkMode, setFontSize } from "../stores";
  import SwitchButton from "./SwitchButton.svelte";

  export let closeMenu: () => void;

  function toggleDarkMode() {
    setDarkMode(!$darkModeOn);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="overlay"
  on:click={closeMenu}
  data-dark-mode={$darkModeOn ? "on" : "off"}
>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="menu" on:click={(e) => e.stopPropagation()}>
    <table>
      <tr>
        <td>Dark mode:</td>
        <td>
          <SwitchButton onClick={toggleDarkMode} />
        </td>
      </tr>
      <tr>
        <td>Text size:</td>
        <td>
          <input
            type="range"
            id="fontSizeSlider"
            min="16"
            max="48"
            value={$fontSize}
            on:mousemove={(e) => setFontSize(Number(e.currentTarget.value))}
            on:change={(e) => setFontSize(Number(e.currentTarget.value))}
          />
        </td>
        <td class="fontSizeIndicator">{$fontSize}px</td>
      </tr>
    </table>
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

  .overlay .menu {
    align-self: center;
    justify-self: center;
    width: fit-content;
    height: fit-content;
    max-width: 380px;
    margin: auto;
    padding: 10px;
    background-color: #e2e2e2;
    /* box-shadow: rgba(0, 0, 0, 0.2) 0 0 5px 1px; */
    border: rgb(117, 117, 117) 1px solid;
  }

  .overlay .menu table td {
    padding: 3px;
  }

  .overlay[data-dark-mode="on"] .menu {
    background-color: rgb(29, 29, 29);
    border: rgb(138, 138, 138) 1px solid;
  }

  input {
    cursor: pointer;
  }
</style>
