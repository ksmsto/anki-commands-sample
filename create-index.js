
const URL = 'http://localhost:8765'

const VERSION = 6
const METHODS = {
    "getCard": "cardsInfo",
    "cardsToNotes": "cardsToNotes",
    "updateNote": "updateNote",
    "notesInfo": "notesInfo",
    "fetchDeck": "findCards",
    "addTags": "addTags",
    "removeTags": "removeTags",
}

const TAGS = {
    "current": "current",
    "active": "active"
}

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const getBaseMethod = (method) => ({
        action: METHODS[method],
        version: VERSION,
})
const METHODS_PARAMS = {
    "getCard": (id) => ({
        ...getBaseMethod('getCard'),
        params: {
            cards: [id]
        }
    }),
    "cardsToNotes": (ids) => ({
        ...getBaseMethod('cardsToNotes'),
        params: {
            cards: ids
        }
    }),
    "notesInfo": (id) => ({
        ...getBaseMethod('notesInfo'),
        params: {
            notes: [id]
        }
    }),
    "updateNote": (data, index, tags = []) => ({
        ...getBaseMethod('updateNote'),
        params: {
            note: {
                id: data.noteId,
                fields: {
                    Front: `${data.fields.Front.value}`,
                    Back: `${data.fields.Back.value}`,
                    index: `${index}` 
                },
                tags: data.tags
            }
        }
    }),
    "fetchDeck":  (deck, query = '') => ({
        ...getBaseMethod('fetchDeck'),
        params: {
            query: `deck:${deck}${query}`
        }
    }),
    "addTags": (id, tag) => ({
        ...getBaseMethod('addTags'),
        params: {
            notes: [id],
            tags: TAGS[tag]
        }
    }),
    "removeTags": (id, tag) => ({
        ...getBaseMethod('removeTags'),
        params: {
            notes: [id],
            tags: TAGS[tag]
        }
    }),
}

const fetcher = async(reqBody) => {
    return await fetch(URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody)
    }).then(res => res.json()).catch((err) => console.log(`error: ${err}`))
}

const range = (start, end) => {
    // 結果を格納するための配列を初期化
    let result = [];

        for (let i = start; i < end; i += 1) {
            result.push(i);
        }
    return result;
}

const main = async() => {
    const t= range(1, 750)
    const {result: cardIds} = await fetcher(METHODS_PARAMS['fetchDeck']('words:levelB', ' tag:current'))
    // const {result: cardIds} = await fetcher(METHODS_PARAMS['fetchDeck']('sample'))
    console.log(cardIds)
    const {result: noteIds} = await fetcher(METHODS_PARAMS['cardsToNotes'](cardIds))
    console.log(noteIds)
    if(!noteIds) {
        console.log("Error: No Note Id")
        return
    }

    for (const [i, v] of noteIds.entries())  {
        await sleep(25)
        const noteDetail = await fetcher(METHODS_PARAMS['notesInfo'](v))
        if(!noteDetail) return
        console.log(noteDetail.result[0].fields)
        // const res = await fetcher(METHODS_PARAMS['updateNote'](noteDetail.result[0], i + 1))
        // if(Number(noteDetail.result[0].fields.index.value) !== i + 1) console.log(i + 1, 'change')
        // console.log(noteDetail.result[0].fields.index.value, i + 1)
    }
}

void main()

