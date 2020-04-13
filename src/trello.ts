import { ref, reactive, Ref, computed } from "vue";

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
  cards?: Ref<Card[]>;
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

export function useTrello() {
  const boardId = ref("");
  const board = ref<Board>();
  const lists = ref<List[]>();
  const cards = ref<Card[]>();

  async function fetchBoard(trelloBoardId: string) {
    boardId.value = trelloBoardId;
    // TODO: Request in parallel
    // TODO: Caching & then figure out what happened since the last time you visited the page!
    // Basically, display the actions that Trello doesn't display.
    board.value = await (
      await fetch(`https://api.trello.com/1/boards/${boardId.value}`)
    ).json();

    lists.value = await (
      await fetch(`https://api.trello.com/1/boards/${boardId.value}/lists`)
    ).json();

    cards.value = await (
      await fetch(`https://api.trello.com/1/boards/${boardId.value}/cards`)
    ).json();

    if (lists.value) {
      lists.value.forEach((list) => {
        list.cards = computed(() =>
          cards.value
            ? cards.value.filter((card) => card.idList == list.id)
            : []
        );
      });
    }
  }

  return {
    boardId,
    board,
    lists,
    cards,
    fetchBoard,
  };
}
