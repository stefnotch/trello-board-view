<template>
  <div>
    <div class="header"></div>
    <input type="text" v-model="boardId" />
    <button
      v-bind:class="{'highlight': boardId != trello.boardId}"
      class="primary"
      v-on:click="trello.fetchBoard(boardId)"
    >
      Update
      <eva-icon icon="refresh" />
    </button>
    <img src="./logo.png" />
    <h1>Hello Vue 3!</h1>
    <button @click="inc">Clicked {{ count }} times.</button>
    {{trello.board}}
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import { useTrello } from "./trello";
import EvaIcon from "./components/EvaIcon.vue";

export default defineComponent({
  components: { EvaIcon },
  setup() {
    let boardId = ref("NQjLXRCP");
    const trello = useTrello();

    const count = ref(0);
    const inc = () => {
      count.value++;
    };

    return {
      count,
      inc,
      boardId,
      trello
    };
  }
});
</script>
<style>
html,
body {
  --background: #eff1f5;
  --shadow: #b1b1a97f;
  --background-gradient: linear-gradient(
    145deg,
    var(--shadow) -100%,
    var(--background) 50%
  );
  --font: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans",
    Arial, sans-serif;
  --blur-radius: 12px;
  --blur-light: -9px -9px 12px 1px;
  --blur-dark: 9px 9px 16px 1px;
  --blur-small-dark: 3px 3px 12px 1px;
  --blur-small-light: -3px -3px 12px 1px;
  background-color: var(--background);
  font-family: var(--font);
  font-size: 16px;
}
button {
  border: 0px solid white;
  border-radius: 12px;
  margin: 6px;
  padding: 6px;
  background: var(--background-gradient);
  font-family: var(--font);
  transition-property: box-shadow;
  transition-duration: 0.1s;
  transition-timing-function: ease-in-out;
  font-size: 16px;
  box-shadow: var(--blur-light) white, var(--blur-dark) var(--shadow);
}
button:hover {
  box-shadow: var(--blur-small-dark) var(--shadow) inset,
    var(--blur-small-light) white inset;
}
button.highlight {
  box-shadow: var(--blur-light) white, var(--blur-dark) #afb7e6;
}
button.highlight:hover {
  box-shadow: var(--blur-small-dark) #afb7e6 inset,
    var(--blur-small-light) white inset;
}
.primary {
  font-weight: bold;
}
</style>

<style scoped>
img {
  width: 200px;
}
</style>
