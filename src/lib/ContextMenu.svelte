<script lang="ts">
  import { closeContextMenu, type ContextMenuData, darkModeOn } from "./stores";

  export let contextMenuData: ContextMenuData;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="contextMenu"
  style={contextMenuData.style}
  data-dark-mode={$darkModeOn ? "on" : "off"}
  on:click={closeContextMenu}
>
  {#each contextMenuData.buttons as buttonData}
    <button on:click={buttonData.action} disabled={buttonData.disabled}
      >{buttonData.text}</button
    >
  {/each}
</div>

<style>
  .contextMenu {
    padding: 1px;
    background-color: #f0f0f0;
    border: grey 1px solid;
    position: fixed;
    display: inline-block;
    box-shadow: 0 0 3px rgba(128, 128, 128, 0.5);
    z-index: 10;
  }

  .contextMenu button {
    width: 100%;
    font-family: "Segoe UI", "Open Sans";
    font-size: 18px;
    padding: 4px 8px;
  }

  .contextMenu button:hover {
    background-color: rgb(146, 192, 245);
  }

  .contextMenu button:disabled {
    color: grey;
    cursor: unset;
  }

  .contextMenu button:hover:disabled {
    background-color: #f0f0f0;
  }

  .contextMenu[data-dark-mode="on"] {
    background-color: rgb(15, 15, 15);
    color: white;
  }

  .contextMenu[data-dark-mode="on"] button {
    background-color: rgb(15, 15, 15);
  }

  .contextMenu[data-dark-mode="on"] button:hover {
    background-color: rgb(4, 57, 117);
  }

  .contextMenu[data-dark-mode="on"] button:hover:disabled {
    background-color: rgb(15, 15, 15);
  }
</style>
