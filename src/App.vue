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
              :placeholder="'Search ' + (filteredBoard.board ? filteredBoard.board.name : '')"
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
    <!-- TODO: make it clear that those are the cached values! -->
    <div class="lists-container">
      <div class="lists" v-if="filteredBoard">
        <!-- TODO: Hide list button so that it doesn't take up any width & remember that setting-->
        <div class="list card" v-for="list in filteredBoard.filteredLists" :key="list.list.id">
          <h4 class="list-header">{{list.list.name}}</h4>
          <div class="list-content-container">
            <div class="list-content">
              <div
                class="card-small"
                v-for="card in list.filteredCards"
                :key="card.card.id"
                @click="openCard(card)"
              >
                <div class="list-item">
                  <div>{{card.card.name}}</div>
                  <!-- TODO: Card popup -->

                  <!-- TODO: When searching for something, highlight the matches -->
                  <div class="search-matches" v-if="searchText.length >= 2">
                    <div>{{card.filteredDescription}}</div>
                    <div v-for="checklist in card.filteredChecklists" :key="checklist.checklist.id">
                      <h5>{{checklist.checklist.name}}</h5>
                      <ul>
                        <li
                          v-for="checkItem in checklist.filteredCheckItems"
                          :key="checkItem.id"
                          :class="{'completed': checkItem.state == 'complete'}"
                        >{{checkItem.name}}</li>
                      </ul>
                    </div>
                  </div>
                  <div class="labels">
                    <span
                      v-for="label in card.card.labels"
                      :key="label.id"
                      class="label"
                      :style="{'color': label.color != 'yellow'?label.color:'#5B5B00'}"
                    >
                      <span class="label-text">{{label.name}}</span>
                    </span>
                  </div>
                </div>
                <div
                  class="progress-bar"
                  :style="{'width': Math.round(card.completionRate * 100)+ '%'}"
                >-</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>No board selected</div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, watchEffect, watch, computed } from "vue";
import { useTrello, Card, useTrelloState, TrelloState } from "./trello";
import EvaIcon from "./components/EvaIcon.vue";

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
    setParam
  };
}

function useTrelloWithSearch(trelloState: TrelloState) {
  let searchText = ref("");
  let lowerCaseSearchText = computed(() => searchText.value.toLowerCase());

  function isMatch(text: string) {
    return text.toLowerCase().includes(lowerCaseSearchText.value);
  }

  const filteredLists = computed(() => {
    return trelloState.lists.map(list => {
      return {
        list: list,
        filteredCards: trelloState.cards
          .filter(card => card.idList == list.id)
          .map(card => {
            let cardChecklists = trelloState.checklists.filter(
              checklist => checklist.idCard == card.id
            );

            let completedCardCount = cardChecklists.flatMap(checklist =>
              checklist.checkItems.filter(
                checkItem => checkItem.state == "complete"
              )
            ).length;

            let cardCount = cardChecklists.flatMap(
              checklist => checklist.checkItems
            ).length;

            return {
              card: card,
              completionRate: cardCount ? completedCardCount / cardCount : 0,
              filteredDescription: isMatch(card.desc) ? card.desc : "",
              filteredChecklists: cardChecklists
                .map(checklist => {
                  return {
                    checklist: checklist,
                    filteredCheckItems: checklist.checkItems.filter(checkitem =>
                      isMatch(checkitem.name)
                    )
                  };
                })
                .filter(
                  filteredChecklist =>
                    filteredChecklist.filteredCheckItems.length > 0
                )
            };
          })
          .filter(
            fullCard =>
              isMatch(fullCard.card.name) ||
              !!fullCard.filteredDescription ||
              fullCard.filteredChecklists.length > 0
          )
      };
    });
  });

  const filteredBoard = computed(() => {
    return {
      board: trelloState.board,
      filteredLists: filteredLists.value
    };
  });

  return {
    searchText,
    filteredBoard
  };
}

export default defineComponent({
  components: { EvaIcon },
  setup() {
    let urlParams = useURLParams();

    let boardId = ref(urlParams.getParam("board") || "NQjLXRCP");

    const { trelloState } = useTrelloState();
    const trello = useTrello(trelloState);
    watch(trello.boardId, value => urlParams.setParam("board", value));
    trello.tryLoadCachedBoard(boardId.value);

    const { searchText, filteredBoard } = useTrelloWithSearch(trelloState);

    function openCard(card: any) {
      //@ts-ignore
      window.open(card.card.url, "_blank").focus();
    }

    return {
      searchText,
      boardId,
      trello,
      filteredBoard,
      openCard
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

ul {
  position: relative;
  list-style: none;
  margin-left: 0;
  padding-left: 24px;
}

ul li:before {
  content: "";
  width: 12px;
  height: 12px;
  position: absolute;
  left: 0;
  border-radius: 6px;
  box-shadow: -2px -2px 4px 1px white, 2px 2px 4px 1px #b1b1a9cc,
    2px 2px 3px 0px #b1b1a9cc inset, -2px -2px 4px 1px white inset;
}

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
  overflow: hidden;
}
.list-content-container {
  overflow-x: visible;
  overflow-y: scroll;
  scrollbar-width: thin;
  margin: -12px;
  padding: 12px;
  margin-bottom: 0px;
  padding-bottom: 0px;
}
.list-content > div {
  padding: 0px;
  margin: 12px 6px;
  overflow: hidden;
}
.list-content > .card-small:hover {
  box-shadow: var(--blur-small-dark) var(--shadow) inset,
    var(--blur-small-light) white inset;
  cursor: pointer;
}
.list-item {
  padding: 12px;
}

.search-matches {
  font-size: 14px;
  color: rgb(61, 61, 61);
}

ul li.completed:before {
  box-shadow: -2px -2px 4px 1px white, 2px 2px 4px 1px #b1b1a9cc,
    1px 1px 2px 0px white inset, -1px -1px 2px 0px #b1b1a9cc inset;
  background: #19a187;
}

.labels {
  margin-bottom: -8px;
}
.label {
  border-radius: 6px;
  letter-spacing: 0.5px;
  font-size: 12px;
  padding: 0px 8px;
  /*color: white;*/
  margin: 0px 3px;
  margin-bottom: -10px;
  display: inline-block;
  box-shadow: -2px -2px 4px 1px white, 2px 2px 4px 1px #b1b1a9cc;
}
.label-text {
  filter: brightness(80%) saturate(90%);
}

.progress-bar {
  background-color: #19a187;
  height: 4px;
}
</style>
