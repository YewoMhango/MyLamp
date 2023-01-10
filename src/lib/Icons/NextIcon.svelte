<script lang="ts">
  import { darkModeOn } from "../stores";
</script>

<svg
  width="40px"
  height="40px"
  version="1.1"
  viewBox="0 0 105.83 105.83"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="m44.829 36.741 16.176 16.176"
    stroke-linecap="round"
    stroke-width="5.2917"
    fill="none"
    stroke={$darkModeOn ? "white" : "black"}
  />
  <path
    d="m44.829 69.092 16.176-16.176"
    stroke-linecap="round"
    stroke-width="5.2917"
    fill="none"
    stroke={$darkModeOn ? "white" : "black"}
  />
</svg>
