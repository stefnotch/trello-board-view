<template>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h2>
          <a
            href="https://github.com/stefnotch/trello-board-view/"
            class="plain-link"
          >Trello Roadmap Viewer</a>
        </h2>
        <span>by Stefnotch</span>
      </div>
      <div class="header-center">
        <div class="card-small" style="border: 3px solid white">
          <div class="inset-small">
            <input
              type="text"
              class="search-bar"
              v-model="searchText"
              :placeholder="'Search ' + (trello.board ? trello.board.name : '')"
            />
          </div>
        </div>
      </div>
      <div class="header-right">
        <form class="inset-small" @submit.prevent="trello.fetchBoard(boardId)">
          <input type="text" v-model="boardId" placeholder="Board ID" class="text-input" />
          <button type="submit" :class="{'no-shadow': boardId == trello.boardId}">
            <eva-icon
              :icon="boardId != trello.boardId? 'arrow-forward' : 'refresh'"
              :width="24"
              :height="24"
              :fill="boardId != trello.boardId? 'var(--foreground-highlight)':'black'"
            />
          </button>
        </form>
      </div>
    </div>
    <div class="lists-container">
      <div class="lists">
        <!-- TODO: Hide list button so that it doesn't take up any width & remember that setting-->
        <div class="list card" v-for="list in trello.lists" :key="list.id">
          <h4 class="list-header">{{list.name}}</h4>
          <div class="list-content-container">
            <div class="list-content">
              <div
                class="inset-small"
                v-for="card in list.cards"
                :key="card.id"
                v-show="shouldDisplay(card)"
              >
                {{card.name}}
                <!-- {{card.desc}} -->
                <!-- {{card.idChecklists}} -->
                <!-- TODO: Progress bar & text -->
                <div class="labels">
                  <span
                    v-for="label in card.labels"
                    :key="label.id"
                    class="label"
                    :style="{'background-color': label.color}"
                  >{{label.name}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, watchEffect, watch, computed } from "vue";
import { useTrello, Card } from "./trello";
import EvaIcon from "./components/EvaIcon.vue";

function useURLParams() {
  function setParam(key: string, value: string) {
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.set(key, value);
    history.pushState(
      undefined,
      "",
      location.protocol +
        "//" +
        location.host +
        location.pathname +
        "?" +
        urlParams +
        location.hash
    );
  }

  return {
    setParam
  };
}

export default defineComponent({
  components: { EvaIcon },
  setup() {
    let urlParams = useURLParams();

    let boardId = ref(
      new URLSearchParams(window.location.search).get("board") || "NQjLXRCP"
    );
    const trello = useTrello();
    watch(trello.boardId, value => urlParams.setParam("board", value));

    let searchText = ref("");
    let lowerCaseSearchText = computed(() => searchText.value.toLowerCase());
    function shouldDisplay(card: Card) {
      return card.name.toLowerCase().includes(lowerCaseSearchText.value);
    }

    return {
      searchText,
      boardId,
      trello,
      shouldDisplay
    };
  }
});
</script>
<style>
html,
body {
  --background: #eff1f5;
  --foreground-highlight: rgb(112, 112, 255);
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
  --blur-small-dark: 4px 4px 9px 1px;
  --blur-small-light: -4px -4px 9px 1px;

  background-color: var(--background);
  font-family: var(--font);
  font-size: 16px;
  margin: 0;
  padding: 0;
  height: 100%;
}

#app,
.container {
  height: 100%;
}
.container {
  display: flex;
  flex-direction: column;
}

.card {
  box-shadow: var(--blur-light) white, var(--blur-dark) var(--shadow);
  border-radius: 12px;
}
.card-small {
  box-shadow: var(--blur-small-light) white,
    var(--blur-small-dark) var(--shadow);
  border-radius: 12px;
}
.inset {
  box-shadow: var(--blur-dark) var(--shadow) inset,
    var(--blur-light) white inset;
  border-radius: 12px;
}
.inset-small {
  box-shadow: var(--blur-small-dark) var(--shadow) inset,
    var(--blur-small-light) white inset;
  border-radius: 12px;
}
.no-shadow {
  box-shadow: initial;
  background: transparent;
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
  position: relative;
}
button:hover {
  box-shadow: var(--blur-small-dark) var(--shadow) inset,
    var(--blur-small-light) white inset;
  cursor: pointer;
}

/*
button.highlight {
  box-shadow: var(--blur-light) white, var(--blur-dark) #afb7e6;
}
button.highlight:hover {
  box-shadow: var(--blur-small-dark) #afb7e6 inset,
    var(--blur-small-light) white inset;
}*/

.primary {
  font-weight: bold;
}

.text-input {
  background: transparent;
  border: 0px;
  padding: 6px 12px;
  font-size: 14px;
  color: rgb(61, 61, 61);
}
</style>

<style scoped>
.plain-link {
  text-decoration: none;
  color: inherit;
}
.plain-link:hover {
  text-decoration: underline;
  cursor: pointer;
}
.header {
  display: flex;

  width: 100%;
  padding: 6px 0px;
  align-items: center;
}
.header-left {
  padding-left: 24px;
}
.header-center {
  flex-grow: 1;
  padding-left: 24px;
  padding-right: 24px;
}
.header-right {
  padding-right: 24px;
}
h2 {
  margin: 0px;
  padding: 0px;
}
.search-bar {
  padding: 12px;
  width: 100%;
  background: transparent;
  border: 0px;
  font-size: 18px;
}
.lists-container {
  display: flex;
  flex-grow: 1;
  overflow: hidden;
}
.lists {
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  padding: 12px;
  padding-bottom: 6px;
}
.list {
  display: flex;
  flex-direction: column;
  margin: 12px;
  padding: 0px 12px;
  min-width: 220px;
  max-width: 220px;
  width: 220px;
}
.list-content-container {
  overflow-x: visible;
  overflow-y: scroll;
  scrollbar-width: thin;
}
.list-content > .inset-small {
  padding: 12px;
  margin: 12px 6px;
}

.labels {
  margin-bottom: -8px;
}
.label {
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  padding: 0px 8px;
  color: white;
  margin: 0px 3px;
  margin-bottom: -10px;
  filter: saturate(70%) grayscale(10%);
  display: inline-block;
}
</style>
