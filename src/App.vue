<template>
  <div class="container">
    <div class="header">
      <div class="header-left">
        <h2>
          <a
            href="https://github.com/stefnotch/trello-board-view/"
            class="plain-link"
            >Trello Roadmap Viewer</a
          >
        </h2>
        <span>by Stefnotch</span>
      </div>
      <div class="header-center">
        <div class="card-small" style="border: 3px solid white">
          <div class="inset-small">
            <label class="search-bar">
              <eva-icon
                icon="search"
                :width="24"
                :height="24"
                class="search-bar-icon"
              ></eva-icon>
              <input
                type="text"
                class="search-bar-input"
                v-model="searchInput"
                :placeholder="
                  'Search ' +
                  (trelloState.board && boardId != trello.boardId.value
                    ? 'Cached '
                    : '') +
                  (trelloState.board ? trelloState.board.name : '')
                "
              />
            </label>
          </div>
        </div>
      </div>
      <div class="header-right">
        <form class="inset-small" @submit.prevent="trello.fetchBoard(boardId)">
          <input
            type="text"
            v-model="boardId"
            placeholder="Board ID"
            class="text-input"
          />
          <button
            type="submit"
            :class="{ 'no-shadow': boardId == trello.boardId.value }"
          >
            <eva-icon
              :icon="
                boardId != trello.boardId.value ? 'arrow-forward' : 'refresh'
              "
              :width="24"
              :height="24"
              :fill="
                boardId != trello.boardId.value
                  ? 'var(--foreground-highlight)'
                  : 'black'
              "
            />
          </button>
          <div class="text-input-options-container">
            <div class="text-input-options">
              <ul>
                <li
                  v-for="(_, cachedBoardId) in trello.cachedBoardIds.value"
                  :key="cachedBoardId"
                  @mousedown="
                    boardId = cachedBoardId;
                    trello.fetchBoard(boardId);
                  "
                >
                  {{ cachedBoardId }}
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
    <div>
      <button class="card-small history-button">Show History</button>
    </div>
    <!-- TODO: make it clear that those are the cached values! -->
    <trello-board
      :trelloBoard="trello.fullBoard.value"
      :searchInput="searchInput"
    ></trello-board>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, watchEffect, watch, computed } from "vue";
import { useTrello, Card, TrelloState } from "./trello";
import EvaIcon from "./components/EvaIcon.vue";
import HighlightMatches from "./components/HighlightMatches.vue";
import TrelloBoard from "./components/TrelloBoard.vue";

function useURLParams() {
  function getParam(key: string) {
    return new URLSearchParams(window.location.search).get(key);
  }

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
    getParam,
    setParam,
  };
}

export default defineComponent({
  components: { EvaIcon, HighlightMatches, TrelloBoard },
  setup() {
    let urlParams = useURLParams();

    let boardId = ref(urlParams.getParam("board") ?? "");

    const trello = useTrello();
    watch(trello.boardId, (value) => urlParams.setParam("board", value));
    let loadedFromCache = trello.tryLoadCachedBoard(boardId.value);
    if (!loadedFromCache && !!boardId.value) {
      trello.fetchBoard(boardId.value);
    }

    let title = ref("");
    watchEffect(() => (document.title = title.value));

    watchEffect(
      () =>
        (title.value = trello.trelloState.board
          ? trello.trelloState.board.name
          : "")
    );

    const searchInput = ref("");

    return {
      searchInput,
      boardId,
      trello,
      trelloState: trello.trelloState,
    };
  },
});
</script>

<style scoped>
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
  white-space: nowrap;
  display: flex;
  align-items: center;
}
.search-bar-icon {
  color: black;
  opacity: 0.6;
  padding-left: 12px;
}
.search-bar-input {
  padding: 12px;
  background: transparent;
  border: 0px;
  font-size: 18px;
  flex: 1;
}
.search-bar-input::placeholder {
  color: black;
  opacity: 0.6;
}

.text-input-options-container {
  position: relative;
}
.text-input-options {
  position: absolute;
  left: 0px;
  right: 0px;
  display: none;
  box-shadow: 12px 12px 16px 1px var(--shadow);
  border-radius: 12px;
  background: var(--background);
  padding-left: 12px;
  font-size: 12px;
}
.text-input:focus ~ .text-input-options-container > .text-input-options {
  display: initial;
}
.text-input-options li:hover:before {
  box-shadow: -2px -2px 4px 1px white, 2px 2px 4px 1px #b1b1a9cc,
    1px 1px 2px 0px white inset, -1px -1px 2px 0px #b1b1a9cc inset;
  background: #19a187;
}
.text-input-options li:hover {
  cursor: pointer;
}

.history-button {
  font-size: 16;
  font-weight: bold;
  margin-left: 24px;
}
</style>
