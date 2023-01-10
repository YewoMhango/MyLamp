import { BOOK_NAMES, bibleData, BibleData, Verse } from "../stores";

let allVerses: Array<Array<Array<string>>> = [];

bibleData.subscribe((value) => {
  if (value instanceof BibleData) {
    allVerses = value.allVerses;
  }
});

export type SearchResult = {
  text: string;
  verse: Verse;
};

export type SupportedSearchTypes = "exact" | "standard" | "regex";

export const MAX_SEARCH_RESULTS = 500;

/**
 * Performs a search of the Bible text for any verses
 * that match the user input
 *
 * ---
 * @param type The type of search
 * @param searchText The user input for searching
 * @param from The book to start searching from
 * @param to The book to stop searching at
 * @param caseSensitive Whether the search should be case sensitive or not
 * @returns Search results
 */
export default function performSearch(
  type: SupportedSearchTypes,
  searchText: string,
  from: string,
  to: string,
  caseSensitive: boolean
): Array<SearchResult> {
  const supportedSearchTypes = {
    exact: exactMatchSearch,
    standard: standardSearch,
    regex: regexSearch,
  };

  if (Object.keys(supportedSearchTypes).includes(type)) {
    return supportedSearchTypes[type](searchText, from, to, caseSensitive);
  } else {
    return [];
  }
}

/**
 * Searches for text which contains *all* of the individual
 * keywords present in the user's input
 *
 * ---
 * @param searchText The user input for searching
 * @param from The book to start searching from
 * @param to The book to stop searching at
 * @param caseSensitive Whether the search should be case sensitive or not
 * @returns Search results
 */
function standardSearch(
  searchText: string,
  from: string,
  to: string,
  caseSensitive: boolean
): Array<SearchResult> {
  const keywords = searchText
    .split(" ")
    .map((s) => (caseSensitive ? s : s.toLowerCase()));

  return aggregateSearchResults(from, to, (text) => {
    const verse = caseSensitive ? text : text.toLowerCase();
    return keywords.every((word) => verse.includes(word));
  });
}

/**
 * Tests for verses that have the exact sequence of
 * letters as in the user input
 *
 * ---
 * @param searchText The user input for searching
 * @param from The book to start searching from
 * @param to The book to stop searching at
 * @param caseSensitive Whether the search should be case sensitive or not
 * @returns Search results
 */
function exactMatchSearch(
  searchText: string,
  from: string,
  to: string,
  caseSensitive: boolean
): Array<SearchResult> {
  if (!caseSensitive) {
    searchText = searchText.toLowerCase();
  }

  return aggregateSearchResults(
    from,
    to,
    (text) =>
      (caseSensitive ? text : text.toLowerCase())
        .replace(/\[|\]/g, "")
        .includes(searchText) ||
      (caseSensitive ? text : text.toLowerCase()).includes(searchText)
  );
}

/**
 * Treats the user input as a regular expression and uses
 * it for searching
 *
 * ---
 * @param searchText The user input for searching
 * @param from The book to start searching from
 * @param to The book to stop searching at
 * @param caseSensitive Whether the search should be case sensitive or not
 * @returns Search results
 */
function regexSearch(
  searchText: string,
  from: string,
  to: string,
  caseSensitive: boolean
): Array<SearchResult> {
  let regex = RegExp(searchText, caseSensitive ? "" : "i");

  return aggregateSearchResults(
    from,
    to,
    (text) => regex.test(text.replace(/\[|\]/g, "")) || regex.test(text)
  );
}

/**
 * Tests each verse of the bible to see whether it is a
 * valid search result and returns the verses which match
 *
 * ---
 * @param from The book to start searching from
 * @param to The book to stop searching at
 * @param isMatchingResult A function that tests whether a given verse is a matching search result
 * @returns A list of matching search results
 */
function aggregateSearchResults(
  from: string,
  to: string,
  isMatchingResult: (verseText: string) => boolean
): Array<SearchResult> {
  let searchResults: Array<SearchResult> = [];

  // If the "from" book appears after the "to" book, then swap them around
  if (BOOK_NAMES.indexOf(from) > BOOK_NAMES.indexOf(to)) {
    [from, to] = [to, from];
  }

  const fromIndex = Math.max(BOOK_NAMES.indexOf(from), 0);
  const toIndex = Math.min(BOOK_NAMES.indexOf(to) + 1, allVerses.length);

  for (
    let i = fromIndex;
    i < toIndex && searchResults.length < MAX_SEARCH_RESULTS;
    i++
  ) {
    let currentBook = allVerses[i];
    for (
      let j = 0;
      j < currentBook.length && searchResults.length < MAX_SEARCH_RESULTS;
      j++
    ) {
      let currentChapter = currentBook[j];
      for (
        let k = 0;
        k < currentChapter.length && searchResults.length < MAX_SEARCH_RESULTS;
        k++
      ) {
        if (isMatchingResult(currentChapter[k])) {
          searchResults.push({
            text: currentChapter[k],
            verse: new Verse(BOOK_NAMES[i], j + 1, k + 1),
          });
        }
      }
    }
  }

  return searchResults;
}
