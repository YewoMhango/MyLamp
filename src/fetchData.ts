import { BibleData, bibleData } from "./lib/stores";

/**
 * Used to load the Bible data
 */
export async function fetchData() {
  try {
    let allVerses = await fetchJson<string[][][]>("/English/all_verses.json");
    let fullTitles = await fetchJson<string[]>("/English/full_titles.json");
    let verseCounts = await fetchJson<number[][]>("/English/verse_counts.json");

    bibleData.set(new BibleData(allVerses, fullTitles, verseCounts));
  } catch (e: any) {
    setError(e);
  }
}

/**
 * Used to fetch JSON data from a file
 * @param url The url of the JSON file
 * @returns A promise of parsed data
 */
async function fetchJson<T = any>(url: string): Promise<T> {
  let response = await fetch(url);
  if (response.status >= 400) {
    throw Error(response.statusText);
  }
  return response.json();
}

/**
 * Displays an error which occurs when fetching data
 * @param errorText The error text to display
 */
function setError(errorText: string) {
  bibleData.set(new Error(errorText));
}
