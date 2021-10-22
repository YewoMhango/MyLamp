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
      data: renderChapterAsHTMLWithItalics(book, chapter),
    };
  } else {
    return { type: "text", data: "Book or chapter not found" };
  }
}

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

function renderChapterAsHTMLWithItalics(book, chapter) {
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

function handleSearchRequest(query) {
  const supportedSearchTypes = {
    exact: exactMatchSearch,
    standard: standardSearch,
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
 *
 * @param {String} searchText
 * @param {String} language
 */
function standardSearch({ language, searchText, from, to }) {
  let searchResults = [];
  const keywords = searchText.split(" ").map((s) => s.toLowerCase());

  if (
    bookNamesLowerCase.indexOf(from.toLowerCase()) >
    bookNamesLowerCase.indexOf(to.toLowerCase())
  ) {
    [from, to] = [to, from];
  }

  const fromIdx = Math.max(bookNamesLowerCase.indexOf(from.toLowerCase()), 0);
  const toIdx = Math.min(
    bookNamesLowerCase.indexOf(to.toLowerCase()) + 1,
    all_verses.length
  );

  for (
    let i = fromIdx;
    i < toIdx && searchResults.length < max_search_results;
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
        k < currentChapter.length && searchResults.length < max_search_results;
        k++
      ) {
        let matches = true;
        for (let l = 0; l < keywords.length && matches; l++) {
          if (!currentChapter[k].toLowerCase().includes(keywords[l])) {
            matches = false;
          }
        }
        if (matches) {
          searchResults.push({
            book: bookNames[i],
            chapter: j + 1,
            verse: k + 1,
            text: currentChapter[k],
          });
        }
      }
    }
  }

  return searchResults;
}

function exactMatchSearch({ language, searchText, from, to }) {
  let searchResults = [];
  searchText = searchText.toLowerCase();

  if (
    bookNamesLowerCase.indexOf(from.toLowerCase()) >
    bookNamesLowerCase.indexOf(to.toLowerCase())
  ) {
    [from, to] = [to, from];
  }

  const fromIdx = Math.max(bookNamesLowerCase.indexOf(from.toLowerCase()), 0);
  const toIdx = Math.min(
    bookNamesLowerCase.indexOf(to.toLowerCase()) + 1,
    all_verses.length
  );

  for (
    let i = fromIdx;
    i < toIdx && searchResults.length < max_search_results;
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
        k < currentChapter.length && searchResults.length < max_search_results;
        k++
      ) {
        if (
          currentChapter[k]
            .toLowerCase()
            .replace(/\[|\]/g, "")
            .includes(searchText) ||
          currentChapter[k].toLowerCase().includes(searchText)
        ) {
          searchResults.push({
            book: bookNames[i],
            chapter: j + 1,
            verse: k + 1,
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
