<script lang="ts">
  export let error: Error;
</script>

<div>
  <p>
    An error occurred while loading: {error.message}
  </p>
</div>

<style>
  div {
    width: 100%;
    height: 100%;
    padding: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  p {
    width: fit-content;
    max-width: 400px;
    color: #f55;
    font-size: 1.5em;
    text-align: center;
  }
</style>
