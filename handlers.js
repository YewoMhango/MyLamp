const fs = require("fs");
const path = require("path");

const all_verses = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "./public/English/all_verses_with_italics.json"),
        "utf-8"
    )
);
const full_book_titles = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, "./public/English/full_titles.json"),
        "utf-8"
    )
);

// prettier-ignore
const bookNames = [
  "Genesis","Exodus","Leviticus","Numbers","Deutoronomy","Joshua",
  "Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings",
  "1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job",
  "Psalms","Proverbs","Ecclesiastes","Song of Songs","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah",
  "Haggai","Zechariah","Malachi","Matthew","Mark","Luke",
  "John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians",
  "Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy",
  "2 Timothy","Titus","Philemon","Hebrews","James","1 Peter",
  "2 Peter","1 John","2 John","3 John","Jude","Revelation",
];

const bookNamesLowerCase = bookNames.map((s) => s.toLowerCase());

/**
 * Returns all verses in a specified chapter as HTML
 *
 * ---
 * @param {{book: string, chapter: number, language: string}} param0
 */
function handleChapterTextRequest({ book, chapter, language }) {
    chapter = Number(chapter);
    book = book.toLowerCase();

    if (
        bookNamesLowerCase.includes(book) &&
        chapter <= all_verses[bookNamesLowerCase.indexOf(book)].length &&
        chapter != 0
    ) {
        return {
            type: "text",
            data: renderChapterAsHTML(book, chapter),
        };
    } else {
        return { type: "text", data: "Book or chapter not found" };
    }
}

/**
 * Returns a list of all verses in a specified chapter
 *
 * ---
 * @param {{book: string, chapter: number, language: string}} param0
 */
function handleChapterJsonRequest({ book, chapter, language }) {
    chapter = Number(chapter);
    book = book.toLowerCase();

    if (
        bookNamesLowerCase.includes(book) &&
        chapter <= all_verses[bookNamesLowerCase.indexOf(book)].length &&
        chapter != 0
    ) {
        const bookIndex = bookNamesLowerCase.indexOf(book);
        return { type: "json", data: all_verses[bookIndex][chapter - 1] };
    } else {
        return { type: "json", data: null };
    }
}

/**
 * Renders a requested chapter as HTML
 *
 * ---
 * @param {string} book Book name
 * @param {number} chapter Chapter name
 */
function renderChapterAsHTML(book, chapter) {
    const bookIndex = bookNamesLowerCase.indexOf(book);

    let html = "";

    if (chapter == 1) {
        html += `<h1 class="bookHeading">${full_book_titles[bookIndex]}</h1>`;
    }

    const chapterVerses = all_verses[bookIndex][chapter - 1];

    for (let i = 1; i <= chapterVerses.length; i++) {
        html += `<p><sup class="verseNumber" id="${i}" onclick="verseNumberClicked(event, ${i})">${i}</sup> ${chapterVerses[
            i - 1
        ].replace(/\[(.+?)\]/g, "<i>$1</i>")}</p>`;
    }

    return html;
}

/**
 * @param {{type: string, language: string, searchText: string, from: string, to: string, caseSensitive: boolean}} query
 * @returns {{type: string, data: {book: string, chapter: number, verseNumber: number, text: string} | string}}
 */
function handleSearchRequest(query) {
    const supportedSearchTypes = {
        exact: exactMatchSearch,
        standard: standardSearch,
        regex: regexSearch,
    };

    if (Object.keys(supportedSearchTypes).includes(query.type.toLowerCase())) {
        return {
            type: "search",
            data: supportedSearchTypes[query.type.toLowerCase()](query),
        };
    } else {
        return { type: "search", data: "Search method not supported" };
    }
}

const max_search_results = 500;

/**
 * @param {{language: string, searchText: string, from: string, to: string}} param0
 * @returns {{book: string, chapter: number, verseNumber: number, text: string, caseSensitive: boolean}}
 */
function standardSearch({ language, searchText, from, to, caseSensitive }) {
    let searchResults = [];
    const keywords = searchText
        .split(" ")
        .map((s) => (caseSensitive ? s : s.toLowerCase()));

    // If the "from" book actually appears after the
    // "to" book in the order of books in the bible
    if (
        bookNamesLowerCase.indexOf(from.toLowerCase()) >
        bookNamesLowerCase.indexOf(to.toLowerCase())
    ) {
        [from, to] = [to, from];
    }

    const fromIndex = Math.max(
        bookNamesLowerCase.indexOf(from.toLowerCase()),
        0
    );
    const toIndex = Math.min(
        bookNamesLowerCase.indexOf(to.toLowerCase()) + 1,
        all_verses.length
    );

    for (
        let i = fromIndex;
        i < toIndex && searchResults.length < max_search_results;
        i++
    ) {
        let currentBook = all_verses[i];
        for (
            let j = 0;
            j < currentBook.length && searchResults.length < max_search_results;
            j++
        ) {
            let currentChapter = currentBook[j];
            for (
                let k = 0;
                k < currentChapter.length &&
                searchResults.length < max_search_results;
                k++
            ) {
                let matches = true;
                for (let l = 0; l < keywords.length && matches; l++) {
                    if (
                        !(
                            caseSensitive
                                ? currentChapter[k]
                                : currentChapter[k].toLowerCase()
                        ).includes(keywords[l])
                    ) {
                        matches = false;
                    }
                }
                if (matches) {
                    searchResults.push({
                        book: bookNames[i],
                        chapter: j + 1,
                        verseNumber: k + 1,
                        text: currentChapter[k],
                    });
                }
            }
        }
    }

    return searchResults;
}

/**
 * @param {{language: string, searchText: string, from: string, to: string}} param0
 * @returns {{book: string, chapter: number, verseNumber: number, text: string, caseSensitive: boolean}}
 */
function exactMatchSearch({ language, searchText, from, to, caseSensitive }) {
    let searchResults = [];

    if (!caseSensitive) {
        searchText = searchText.toLowerCase();
    }

    // If the "from" book actually appears after the
    // "to" book in the order of books in the bible
    if (
        bookNamesLowerCase.indexOf(from.toLowerCase()) >
        bookNamesLowerCase.indexOf(to.toLowerCase())
    ) {
        [from, to] = [to, from];
    }

    const fromIndex = Math.max(
        bookNamesLowerCase.indexOf(from.toLowerCase()),
        0
    );
    const toIndex = Math.min(
        bookNamesLowerCase.indexOf(to.toLowerCase()) + 1,
        all_verses.length
    );

    for (
        let i = fromIndex;
        i < toIndex && searchResults.length < max_search_results;
        i++
    ) {
        let currentBook = all_verses[i];
        for (
            let j = 0;
            j < currentBook.length && searchResults.length < max_search_results;
            j++
        ) {
            let currentChapter = currentBook[j];
            for (
                let k = 0;
                k < currentChapter.length &&
                searchResults.length < max_search_results;
                k++
            ) {
                if (
                    (caseSensitive
                        ? currentChapter[k]
                        : currentChapter[k].toLowerCase()
                    )
                        .replace(/\[|\]/g, "")
                        .includes(searchText) ||
                    (caseSensitive
                        ? currentChapter[k]
                        : currentChapter[k].toLowerCase()
                    ).includes(searchText)
                ) {
                    searchResults.push({
                        book: bookNames[i],
                        chapter: j + 1,
                        verseNumber: k + 1,
                        text: currentChapter[k],
                    });
                }
            }
        }
    }

    return searchResults;
}

/**
 * @param {{language: string, searchText: string, from: string, to: string}} param0
 * @returns {{book: string, chapter: number, verseNumber: number, text: string, caseSensitive: boolean}}
 */
function regexSearch({ language, searchText, from, to, caseSensitive }) {
    let searchResults = [];
    let regex = RegExp(searchText, caseSensitive ? "" : "i");

    // If the "from" book actually appears after the
    // "to" book in the order of books in the bible
    if (
        bookNamesLowerCase.indexOf(from.toLowerCase()) >
        bookNamesLowerCase.indexOf(to.toLowerCase())
    ) {
        [from, to] = [to, from];
    }

    const fromIndex = Math.max(
        bookNamesLowerCase.indexOf(from.toLowerCase()),
        0
    );
    const toIndex = Math.min(
        bookNamesLowerCase.indexOf(to.toLowerCase()) + 1,
        all_verses.length
    );

    for (
        let i = fromIndex;
        i < toIndex && searchResults.length < max_search_results;
        i++
    ) {
        let currentBook = all_verses[i];
        for (
            let j = 0;
            j < currentBook.length && searchResults.length < max_search_results;
            j++
        ) {
            let currentChapter = currentBook[j];
            for (
                let k = 0;
                k < currentChapter.length &&
                searchResults.length < max_search_results;
                k++
            ) {
                if (
                    regex.test(currentChapter[k].replace(/\[|\]/g, "")) ||
                    regex.test(currentChapter[k])
                ) {
                    searchResults.push({
                        book: bookNames[i],
                        chapter: j + 1,
                        verseNumber: k + 1,
                        text: currentChapter[k],
                    });
                }
            }
        }
    }

    return searchResults;
}

module.exports = {
    handleChapterTextRequest,
    handleChapterJsonRequest,
    handleSearchRequest,
};
