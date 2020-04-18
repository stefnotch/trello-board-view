<template>
  <!-- TODO: make it clear that those are the cached values! -->
  <div class="lists-container">
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
              @click="openCard(card)"
            >
              <div class="list-item">
                <div>
                  <highlight-matches :text="card.card.name" :highlightText="searchText"></highlight-matches>
                </div>
                <!-- TODO: Card popup -->

                <div class="search-matches" v-if="searchText.length >= 2">
                  <div>
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
              ></div>
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
  toRefs
} from "vue";
import { useTrello, Card, useTrelloState, TrelloState } from "./../trello";
import EvaIcon from "./EvaIcon.vue";
import HighlightMatches from "./HighlightMatches.vue";

function useTrelloWithSearch(
  trelloState: TrelloState,
  searchInput: Ref<string>
) {
  let searchText = computed(() =>
    searchInput.value.length >= 2 ? searchInput.value.toLowerCase() : ""
  );

  function isMatch(text: string) {
    return text.toLowerCase().includes(searchText.value);
  }

  const allLists = computed(() => {
    return trelloState.lists.map(list => {
      return {
        list: list,
        cards: trelloState.cards
          .filter(card => card.idList == list.id)
          .map(card => {
            return {
              card: card,
              checklists: trelloState.checklists.filter(
                checklist => checklist.idCard == card.id
              )
            };
          })
      };
    });
  });

  const filteredLists = computed(() => {
    return allLists.value.map(list => {
      return {
        list: list.list,
        filteredCards: list.cards
          .map(card => {
            let checkItemsCount = 0;
            let completedCheckItemsCount = 0;
            card.checklists.forEach(checklist =>
              checklist.checkItems.forEach(item => {
                checkItemsCount++;
                if (item.state == "complete") {
                  completedCheckItemsCount++;
                }
              })
            );

            return {
              card: card.card,
              completionRate: checkItemsCount
                ? completedCheckItemsCount / checkItemsCount
                : 0,
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
      board: trelloState.board,
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
  components: { EvaIcon, HighlightMatches },
  props: {
    trelloState: {
      type: Object as PropType<TrelloState>,
      required: true
    },
    searchInput: {
      type: String,
      default: ""
    }
  },
  setup(props, context) {
    const { searchInput } = toRefs(props);
    const { searchText, filteredBoard } = useTrelloWithSearch(
      props.trelloState,
      searchInput
    );

    function openCard(card: any) {
      //@ts-ignore
      window.open(card.card.url, "_blank").focus();
    }

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

.no-board {
  width: 100%;
  text-align: center;
  padding-top: 4em;
}
</style>
