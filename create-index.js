// ankiのport(デフォルト)
const URL = "http://localhost:8765";

const VERSION = 6;

// 使用しているメソッド
const METHODS = {
  getCard: "cardsInfo",
  cardsToNotes: "cardsToNotes",
  addNote: "addNote",
  addNotes: "addNotes",
  updateNote: "updateNote",
  notesInfo: "notesInfo",
  fetchDeck: "findCards",
  addTags: "addTags",
  removeTags: "removeTags",
};

// 使用しているタグ
const TAGS = {
  current: "current",
  active: "active",
};

// sleep関数
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// indexの配列からsort用のkeyを作成
// getSortByIndexKey(createSortByIndex(range(1, 10))) -> [{key: 'index', value: 1}, {key: 'index', value: 2}, ...]
const createSortByIndex = (indexArr) =>
  indexArr.map((v) => ({ key: "index", value: v }));

// type SortKeys = {
//    key: 'index',
//   value: number
// }
// filter用のkeyを作成
const getSortByIndexKey = (key) => {
  return `(${key.map((v) => `${v.key}:${v.value}`).join(" OR ")})`;
};

// methodのbodyのベース
const getBaseMethod = (method) => ({
  action: METHODS[method],
  version: VERSION,
});
// METHODSまとめ
const METHODS_PARAMS = {
  // card取得
  getCard: (id) => ({
    ...getBaseMethod("getCard"),
    params: {
      cards: [id],
    },
  }),
  // card -> note情報取得
  cardsToNotes: (ids) => ({
    ...getBaseMethod("cardsToNotes"),
    params: {
      cards: ids,
    },
  }),
  // note情報取得
  notesInfo: (id) => ({
    ...getBaseMethod("notesInfo"),
    params: {
      notes: [id],
    },
  }),
  // note追加
  // deckName: デッキ名
  // modelName: モデル名
  // data: フィールド情報: {Front: string, Back: string, index: string}
  // tags: タグ
  addNote: (deckName, modelName, data, tags = []) => ({
    ...getBaseMethod("addNote"),
    params: {
      note: {
        deckName: deckName,
        modelName: modelName,
        fields: {
          Front: `${data.Front}`,
          Back: `${data.Back}`,
          index: `${data.index}`,
        },
        options: {
          // 重複を許可
          allowDuplicate: true,
        },
        tags: tags,
      },
    },
  }),
  // note追加
  // deckName: デッキ名
  // modelName: モデル名
  // data: フィールド情報: {Front: string, Back: string, index: string}
  // tags: タグ
  addNotes: (deckName, modelName, data, tags = []) => ({
    ...getBaseMethod("addNotes"),
    params: {
      notes: data.map((v) => ({
        deckName: deckName,
        modelName: modelName,
        fields: {
          Front: `${v.Front}`,
          Back: `${v.Back}`,
          index: `${v.index}`,
        },
        options: {
          // 重複を許可
          allowDuplicate: true,
        },
        tags: tags,
      })),
    },
  }),
  // note更新
  updateNote: (data, updateFields = {}, tags = []) => ({
    ...getBaseMethod("updateNote"),
    params: {
      note: {
        id: data.noteId,
        fields: {
          Front: `${data.fields.Front.value}`,
          Back: `${data.fields.Back.value}`,
          index: `${data.fields.index.value}`,
          ...updateFields,
        },
        tags: tags,
      },
    },
  }),
  // deckからカード取得
  fetchDeck: (deck, query = "") => ({
    ...getBaseMethod("fetchDeck"),
    params: {
      query: `deck:${deck}${query}`,
    },
  }),
  // noteにタグ追加
  addTags: (id, tag) => ({
    ...getBaseMethod("addTags"),
    params: {
      notes: [id],
      tags: TAGS[tag],
    },
  }),
  // noteにタグ削除
  removeTags: (id, tag) => ({
    ...getBaseMethod("removeTags"),
    params: {
      notes: [id],
      tags: TAGS[tag],
    },
  }),
};

// API fetcher
const fetcher = async (reqBody) => {
  return await fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reqBody),
  })
    .then((res) => res.json())
    .catch((err) => console.log(`error: ${err}`));
};

// range: (start: number, end: number) => number[]
const range = (start, end) => {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
};

// sample codes: targetDeckのカードの1~100番目を更新する
const main = async () => {
  const targetDeck = "sample";
  // 対象は1 ~ 100番目のカード
  const rangeInfo = range(1, 100);
  // sampleのデッキからカードを取得
  const { result: cardIds } = await fetcher(
    METHODS_PARAMS["fetchDeck"](
      targetDeck,
      " " + getSortByIndexKey(createSortByIndex(rangeInfo))
    )
  );
  // カードからノートIDを取得
  const { result: noteIds } = await fetcher(
    METHODS_PARAMS["cardsToNotes"](cardIds)
  );

  if (!noteIds) {
    console.log("Error: No Note Id");
    return;
  }

  // ノートIDからノート情報を取得し、indexを更新
  for (const [i, v] of noteIds.entries()) {
    // 25ms待機: 一気に処理させるとエラーが出るため
    await sleep(25);
    // ノート情報取得
    const noteDetail = await fetcher(METHODS_PARAMS["notesInfo"](v));
    if (!noteDetail) return;
    // update処理: 第二引数、第三引数は任意になっているが、そこに更新したい内容を入れる
    const res = await fetcher(
      METHODS_PARAMS["updateNote"](noteDetail.result[0], {}, [])
    );
  }
};

// sample add deck codes
// const addDeckSample = async () => {
//   // deck名
//   const targetDeck = "sample";
//   await fetcher(
//   // 配列で追加するデータを渡す
//     METHODS_PARAMS["addNotes"]("my_words", "Basic", [
//       { Front: "test", Back: "テスト", index: "1" },
//     ])
//   );
// };

void main();
