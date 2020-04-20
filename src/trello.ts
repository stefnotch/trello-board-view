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

export interface Checklist {
  id: string;
  name: string;
  idCard: string;
  pos: number;
  idBoard: string;
  checkItems: CheckItem[];
}

export interface CheckItem {
  idChecklist: string;
  state: string;
  idMember: any;
  id: string;
  name: string;
  nameData: any;
  pos: number;
  due: any;
}

export interface Label {
  id: string;
  idBoard: string;
  name: string;
  color: string;
}

interface CachedTrelloBoard {
  state: TrelloState;
  date: Date;
}

export interface TrelloState {
  board: Board | undefined;
  lists: List[];
  cards: Card[];
  checklists: Checklist[];
}

export interface FullCard {
  card: Card;
  completionRate: number;
  itemsCompleted: number;
  itemsCount: number;
  checklists: Checklist[];
}

export interface FullList {
  list: List;
  cards: FullCard[];
}

export interface FullBoard {
  board: Board | undefined;
  lists: FullList[];
}

export function useTrelloState() {
  const state: TrelloState = reactive({
    board: undefined as Board | undefined,
    lists: [] as List[],
    cards: [] as Card[],
    checklists: [] as Checklist[],
  });

  return { trelloState: state };
}

export function useTrello(trelloState: TrelloState) {
  const { setCacheValue, getCacheValue } = useLocalCache();

  const boardId = ref("");
  const cachedBoardIds = ref<Set<string>>(
    new Set<string>(getCacheValue<string[]>("trello-boards") || ["NQjLXRCP"])
  );

  function tryLoadCachedBoard(trelloBoardId: string) {
    let cachedValues = getCacheValue<CachedTrelloBoard>(
      `trello-board-${trelloBoardId}`
    );

    if (cachedValues && cachedValues.state) {
      trelloState.board = cachedValues.state.board;
      trelloState.lists = cachedValues.state.lists;
      trelloState.cards = cachedValues.state.cards;
      trelloState.checklists = cachedValues.state.checklists;
      return true;
    }
    return false;
  }

  async function fetchBoard(trelloBoardId: string) {
    boardId.value = trelloBoardId;
    trelloState.board = undefined as Board | undefined;
    trelloState.lists = [];
    trelloState.cards = [];
    trelloState.checklists = [];
    // TODO: figure out what happened since the last time you visited the page!
    // Basically, display the actions that Trello doesn't display.
    try {
      let boardFetch = fetch(`https://api.trello.com/1/boards/${boardId.value}`)
        .then((r) => r.json())
        .then((val) => (trelloState.board = val as Board | undefined));
      let listsFetch = fetch(
        `https://api.trello.com/1/boards/${boardId.value}/lists`
      )
        .then((r) => r.json())
        .then((val) => (trelloState.lists = (val || []) as List[]));
      let cardsFetch = fetch(
        `https://api.trello.com/1/boards/${boardId.value}/cards`
      )
        .then((r) => r.json())
        .then((val) => (trelloState.cards = (val || []) as Card[]));

      let checklistsFetch = fetch(
        `https://api.trello.com/1/boards/${boardId.value}/checklists`
      )
        .then((r) => r.json())
        .then((val) => (trelloState.checklists = (val || []) as Checklist[]));

      await Promise.all([boardFetch, listsFetch, cardsFetch, checklistsFetch]);
    } catch (e) {
      console.warn(e);
      let allHaveValues =
        !!trelloState.board &&
        !!trelloState.lists &&
        !!trelloState.cards &&
        !!trelloState.checklists;
      if (allHaveValues) {
        tryLoadCachedBoard(boardId.value);
      }
    }

    if (
      !!trelloState.board &&
      !!trelloState.lists &&
      !!trelloState.cards &&
      !!trelloState.checklists
    ) {
      setCacheValue<CachedTrelloBoard>(`trello-board-${trelloBoardId}`, {
        state: trelloState,
        date: new Date(),
      });
      cachedBoardIds.value.add(trelloBoardId);
      setCacheValue<string[]>(
        `trello-boards`,
        Array.from(cachedBoardIds.value.values())
      );
    }
  }

  const fullLists = computed(() => {
    return trelloState.lists.map((list) => {
      return {
        list: list,
        cards: trelloState.cards
          .filter((card) => card.idList == list.id)
          .map((card) => {
            let checklists = trelloState.checklists.filter(
              (checklist) => checklist.idCard == card.id
            );
            let itemsCount = 0;
            let itemsCompleted = 0;
            checklists.forEach((checklist) =>
              checklist.checkItems.forEach((item) => {
                itemsCount++;
                if (item.state == "complete") {
                  itemsCompleted++;
                }
              })
            );

            return {
              card: card,
              completionRate: itemsCount ? itemsCompleted / itemsCount : 0,
              itemsCount,
              itemsCompleted,
              checklists: checklists,
            } as FullCard;
          }),
      } as FullList;
    });
  });

  const fullBoard = computed(() => {
    return {
      board: trelloState.board,
      lists: fullLists.value,
    } as FullBoard;
  });

  return {
    boardId,
    fetchBoard,
    tryLoadCachedBoard,
    cachedBoardIds,
    fullBoard,
  };
}
