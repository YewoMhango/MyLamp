<script lang="ts">
  import { darkModeOn } from "./stores";
</script>

<div class="container">
  <div
    class="loading-animation"
    style="color: {$darkModeOn ? 'white' : 'black'};"
  >
    <div class="first">l</div>
    <div class="second">o</div>
    <div class="third">a</div>
    <div class="fourth">d</div>
    <div class="fifth">i</div>
    <div class="sixth">n</div>
    <div class="seventh">g</div>
    <div class="eighth">.</div>
    <div class="ninth">.</div>
    <div class="tenth">.</div>
  </div>
</div>

<style>
  .container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .loading-animation {
    --unit-loading-animation-length: 5px;
    --unit-loading-animation-time: 0.1s;
    display: inline-block;
    width: calc(55 * var(--unit-loading-animation-length));
    height: calc(5 * var(--unit-loading-animation-length));
  }

  .loading-animation div {
    display: inline-block;
    position: relative;
    animation-name: up-and-down;
    animation-duration: calc(var(--unit-loading-animation-time) * 13);
    animation-iteration-count: infinite;
    animation-timing-function: ease;
    width: 7px;
    height: 7px;
    border-radius: 5px;
    margin: calc(1.5 * var(--unit-loading-animation-length));
    font-size: calc(5 * var(--unit-loading-animation-length));
    font-family: monospace;
  }

  .second {
    animation-delay: calc(1 * var(--unit-loading-animation-time));
  }

  .third {
    animation-delay: calc(2 * var(--unit-loading-animation-time));
  }

  .fourth {
    animation-delay: calc(3 * var(--unit-loading-animation-time));
  }

  .fifth {
    animation-delay: calc(4 * var(--unit-loading-animation-time));
  }

  .sixth {
    animation-delay: calc(5 * var(--unit-loading-animation-time));
  }

  .seventh {
    animation-delay: calc(6 * var(--unit-loading-animation-time));
  }

  .eighth {
    animation-delay: calc(7 * var(--unit-loading-animation-time));
  }

  .ninth {
    animation-delay: calc(8 * var(--unit-loading-animation-time));
  }

  .tenth {
    animation-delay: calc(9 * var(--unit-loading-animation-time));
  }

  @keyframes up-and-down {
    0% {
      top: 0;
    }
    10% {
      top: calc(-2 * var(--unit-loading-animation-length));
    }
    20% {
      top: 0;
    }
  }
</style>
