import { ref, reactive, Ref, computed } from "vue";
import { useLocalCache } from "./local-cache";

export interface Board {
  id: string;
  name: string;
  desc: string;
  descData?: any;
  closed: boolean;
  idOrganization?: any;
  idEnterprise?: any;
  pinned: boolean;
  url: string;
  shortUrl: string;
  prefs: {
    permissionLevel: string;
    hideVotes: boolean;
    voting: string;
    comments: string;
    invitations: string;
    selfJoin: boolean;
    cardCovers: boolean;
    isTemplate: boolean;
    cardAging: string;
    calendarFeedEnabled: boolean;
    background: string;
    backgroundImage?: any;
    backgroundImageScaled?: any;
    backgroundTile: boolean;
    backgroundBrightness: string;
    backgroundColor: string;
    backgroundBottomColor: string;
    backgroundTopColor: string;
    canBePublic: boolean;
    canBeEnterprise: boolean;
    canBeOrg: boolean;
    canBePrivate: boolean;
    canInvite: boolean;
  };
  labelNames: {
    green: string;
    yellow: string;
    orange: string;
    red: string;
    purple: string;
    blue: string;
    sky: string;
    lime: string;
    pink: string;
    black: string;
  };
}

export interface List {
  id: string;
  name: string;
  closed: boolean;
  pos: number;
  softLimit?: any;
  idBoard: string;
  subscribed?: any;
}

export interface Card {
  id: string;
  checkItemStates?: any;
  closed: boolean;
  dateLastActivity: string;
  desc: string;
  descData?: any;
  dueReminder?: any;
  idBoard: string;
  idList: string;
  idMembersVoted: any[];
  idShort: number;
  idAttachmentCover?: any;
  idLabels: string[];
  manualCoverAttachment: boolean;
  name: string;
  pos: number;
  shortLink: string;
  isTemplate: boolean;
  badges: any;
  dueComplete: boolean;
  due?: any;
  idChecklists: string[];
  idMembers: string[];
  labels: Label[];
  shortUrl: string;
  subscribed: boolean;
  url: string;
  cover: {
    idAttachment?: any;
    color?: any;
    idUploadedBackground?: any;
    size: string;
    brightness: string;
  };
}

export interface Label {
  id: string;
  idBoard: string;
  name: string;
  color: string;
}

interface CachedTrelloBoard {
  board: Board;
  lists: List[];
  cards: Card[];
  date: Date;
}

export function useTrello() {
  const { setCacheValue, getCacheValue } = useLocalCache();

  const boardId = ref("");
  const board = ref<Board>();
  const lists = ref<List[]>();
  const cards = ref<Card[]>();

  const fullLists = computed(() => {
    if (lists.value) {
      return lists.value.map((list) => {
        return {
          list: list,
          cards: cards.value
            ? cards.value.filter((card) => card.idList == list.id)
            : [],
        };
      });
    } else {
      return [];
    }
  });

  const fullBoard = computed(() => {
    return {
      board: board.value,
      fullLists: fullLists.value,
    };
  });

  function tryLoadCachedBoard(trelloBoardId: string) {
    let cachedValues = getCacheValue<CachedTrelloBoard>(
      `trello-board-${trelloBoardId}`
    );

    if (cachedValues) {
      board.value = cachedValues.board;
      lists.value = cachedValues.lists;
      cards.value = cachedValues.cards;
    }
  }

  async function fetchBoard(trelloBoardId: string) {
    boardId.value = trelloBoardId;
    // TODO: figure out what happened since the last time you visited the page!
    // Basically, display the actions that Trello doesn't display.
    try {
      let boardFetch = fetch(`https://api.trello.com/1/boards/${boardId.value}`)
        .then((r) => r.json())
        .then((val) => (board.value = val));
      let listsFetch = fetch(
        `https://api.trello.com/1/boards/${boardId.value}/lists`
      )
        .then((r) => r.json())
        .then((val) => (lists.value = val));
      let cardsFetch = fetch(
        `https://api.trello.com/1/boards/${boardId.value}/cards`
      )
        .then((r) => r.json())
        .then((val) => (cards.value = val));

      await Promise.all([boardFetch, listsFetch, cardsFetch]);
    } catch (e) {
      console.warn(e);
      let allHaveValues = !!board.value && !!lists.value && !!cards.value;
      if (!allHaveValues) {
        tryLoadCachedBoard(boardId.value);
      }
    }

    if (board.value && lists.value && cards.value) {
      setCacheValue<CachedTrelloBoard>(`trello-board-${trelloBoardId}`, {
        board: board.value,
        lists: lists.value,
        cards: cards.value,
        date: new Date(),
      });
    }
  }

  return {
    boardId,
    board,
    lists,
    cards,
    fetchBoard,
    tryLoadCachedBoard,
    fullBoard,
  };
}
