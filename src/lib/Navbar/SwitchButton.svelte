<script lang="ts">
  import { darkModeOn } from "../stores";

  export let onClick: () => void;
</script>

<button
  on:click={onClick}
  class="switchButton"
  data-dark-mode={$darkModeOn ? "on" : "off"}
>
  <div class="circleInBtn" />
</button>

<style>
  .switchButton {
    --on-color: #2d6;
    --off-color: #000;
    --unit-size: 3px;
    border-style: solid;
    border-color: var(--off-color);
    border-width: 1px;
    padding: 2px;
    height: 18px;
    width: 33px;
    background-color: inherit;
    border-radius: 9px;
  }

  .switchButton .circleInBtn {
    top: 0;
    position: relative;
    width: 12px;
    height: 12px;
    border-radius: 6px;
    background: var(--off-color);
    transition: left 0.1s ease-in-out;
    left: 0px;
  }

  [data-dark-mode="on"].switchButton {
    background-color: var(--on-color);
    border-color: var(--on-color);
  }

  [data-dark-mode="on"].switchButton .circleInBtn {
    left: 15px;
    background-color: white;
  }
</style>
