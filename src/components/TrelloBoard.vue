<template>
  <div class="lists-container">
    <teleport to="#popup-window">
      <div class="open-card-popup" v-if="openCard" @click.self="openCard = undefined">
        <div class="open-card">
          <div class="list-item">
            <eva-icon
              class="close-button"
              icon="close"
              fill="grey"
              :width="24"
              :height="24"
              @click="openCard = undefined"
            />
            <div>
              <h3>
                <a :href="openCard.card.url" class="plain-link">
                  {{openCard.card.name}}
                  <eva-icon icon="external-link" fill="var(--foreground-highlight)" />
                </a>
              </h3>
            </div>

            <div class="labels">
              <span
                v-for="label in openCard.card.labels"
                :key="label.id"
                class="label"
                :style="{'color': label.color != 'yellow'?label.color:'#5B5B00'}"
              >
                <span class="label-text">{{label.name}}</span>
              </span>
            </div>

            <div class="scrollbar-y">
              <div class="description">{{openCard.card.desc}}</div>
              <div v-for="checklist in openCard.checklists" :key="checklist.id">
                <h5>{{checklist.name}}</h5>
                <ul>
                  <li
                    v-for="checkItem in checklist.checkItems"
                    :key="checkItem.id"
                    :class="{'completed': checkItem.state == 'complete'}"
                  >{{checkItem.name}}</li>
                </ul>
              </div>
            </div>
          </div>
          <progress-bar :max="openCard.itemsCount" :value="openCard.itemsCompleted" :large="true"></progress-bar>
        </div>
      </div>
    </teleport>

    <div class="lists" v-if="filteredBoard.board">
      <!-- TODO: Hide list button so that it doesn't take up any width & remember that setting-->
      <div class="list card" v-for="list in filteredBoard.filteredLists" :key="list.list.id">
        <h4 class="list-header">{{list.list.name}}</h4>
        <div class="list-content-container">
          <div class="list-content">
            <div
              class="card-small"
              v-for="card in list.filteredCards"
              :key="card.card.id"
              @click="openCard = card.fullCard"
            >
              <div class="list-item">
                <div>
                  <highlight-matches :text="card.card.name" :highlightText="searchText"></highlight-matches>
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

                <div class="search-matches" v-if="searchText.length >= 2">
                  <div class="description">
                    <highlight-matches :text="card.filteredDescription" :highlightText="searchText"></highlight-matches>
                  </div>
                  <div v-for="checklist in card.filteredChecklists" :key="checklist.checklist.id">
                    <h5>{{checklist.checklist.name}}</h5>
                    <ul>
                      <li
                        v-for="checkItem in checklist.filteredCheckItems"
                        :key="checkItem.id"
                        :class="{'completed': checkItem.state == 'complete'}"
                      >
                        <highlight-matches :text="checkItem.name" :highlightText="searchText"></highlight-matches>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <progress-bar :max="card.fullCard.itemsCount" :value="card.fullCard.itemsCompleted"></progress-bar>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="no-board">No board selected</div>
  </div>
</template>

<script lang="ts">
import {
  ref,
  defineComponent,
  watchEffect,
  watch,
  computed,
  PropType,
  Ref,
  toRef,
  toRefs,
  reactive
} from "vue";
import {
  useTrello,
  Card,
  useTrelloState,
  TrelloState,
  Checklist,
  FullBoard,
  FullCard
} from "./../trello";
import EvaIcon from "./EvaIcon.vue";
import HighlightMatches from "./HighlightMatches.vue";
import ProgressBar from "./ProgressBar.vue";

function useTrelloWithSearch(
  trelloBoard: Ref<FullBoard>,
  searchInput: Ref<string>
) {
  let searchText = computed(() =>
    searchInput.value.length >= 2 ? searchInput.value.toLowerCase() : ""
  );

  function isMatch(text: string) {
    return text.toLowerCase().includes(searchText.value);
  }

  const filteredLists = computed(() => {
    return trelloBoard.value.lists.map(list => {
      return {
        list: list.list,
        filteredCards: list.cards
          .map(card => {
            return {
              card: card.card,
              fullCard: card,
              filteredDescription: isMatch(card.card.desc)
                ? card.card.desc
                : "",
              filteredChecklists: card.checklists
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
      board: trelloBoard.value.board,
      filteredLists: filteredLists.value
    };
  });

  return {
    searchInput,
    searchText,
    filteredBoard
  };
}

export default defineComponent({
  components: { EvaIcon, HighlightMatches, ProgressBar },
  props: {
    trelloBoard: {
      type: Object as PropType<FullBoard>,
      required: true
    },
    searchInput: {
      type: String,
      default: ""
    }
  },
  setup(props, context) {
    const { searchInput, trelloBoard } = toRefs(props);
    const { searchText, filteredBoard } = useTrelloWithSearch(
      trelloBoard,
      searchInput
    );

    const openCard = ref<FullCard>();

    // Hack until backdrop-filter support arrives in FF
    watchEffect(() => {
      let app = document.querySelector<HTMLElement>("#app");
      if (app) {
        if (openCard.value) {
          app.style.filter = "blur(2px)";
        } else {
          app.style.filter = "";
        }
      }
    });

    return {
      searchText,
      filteredBoard,
      openCard
    };
  }
});
</script>

<style scoped>
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
  display: flex;
  flex-direction: column;
  min-height: 0;
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

.label {
  border-radius: 6px;
  letter-spacing: 0.5px;
  font-size: 12px;
  padding: 0px 8px;
  /*color: white;*/
  margin: 3px;
  display: inline-block;
  box-shadow: -2px -2px 4px 1px white, 2px 2px 4px 1px #b1b1a9cc;
}
.label-text {
  filter: brightness(80%) saturate(90%);
}

.description {
  white-space: pre-line;
}

.no-board {
  width: 100%;
  text-align: center;
  padding-top: 4em;
}

.open-card-popup {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.open-card {
  box-shadow: var(--blur-light) white, 12px 12px 16px 10px var(--shadow);
  border-radius: 12px;
  background: var(--background);
  opacity: 1;
  width: 80vmin;
  height: 80vmin;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.open-card .list-item {
  padding: 24px;
  padding-bottom: 0px;
  flex-grow: 1;
  position: relative;
}
.open-card .labels {
  margin-bottom: 12px;
}
.open-card .progress-bar {
  min-height: 20px;
}
.scrollbar-y {
  overflow-y: auto;
  scrollbar-width: thin;
}
.close-button {
  position: absolute;
  right: 24px;
}
.close-button:hover {
  cursor: pointer;
}
</style>
