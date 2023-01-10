import { writable } from "svelte/store";

// prettier-ignore
export const BOOK_NAMES = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deutoronomy", "Joshua",
    "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
    "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job",
    "Psalms", "Proverbs", "Ecclesiastes", "Song of Songs", "Isaiah", "Jeremiah",
    "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
    "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke",
    "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
    "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
    "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter",
    "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

/**
 * Represents a verse in the bible
 */
export class Verse {
  constructor(
    public book: string,
    public chapter: number,
    public verseNumber: number
  ) {}

  /**
   * Parses a JSON string to generate a new verse
   * @param str The JSON string representation of the verse
   * @returns A new verse parsed from the string
   */
  static fromJson(str: string) {
    let value: { book?: string; chapter?: number; verseNumber?: number } =
      JSON.parse(str);

    return new Verse(
      value.book || "Genesis",
      value.chapter || 1,
      value.verseNumber || 1
    );
  }
}

/**
 * A representation of all the bible data required in the app
 */
export class BibleData {
  constructor(
    /** A list of all the verses in the Bible nested by book and chapter */
    public allVerses: Array<Array<Array<string>>>,
    /** The full-length titles of each book of the bible */
    public fullTitles: Array<string>,
    /** A list of the number of verses in each chapter, nested by book */
    public verseCounts: Array<Array<number>>
  ) {}
}

/**
 * The data used to render each button in a context menu
 */
export type ContextMenuButtonData = {
  text: string;
  /** The callback to be triggered when the context menu button/option is clicked */
  action: (event: MouseEvent) => void;
  disabled?: boolean;
};

export type ContextMenuData = {
  /** A string which contains the CSS style of the context menu, particularly the positional anchor points (top, bottom, left, right) */
  style: string;
  buttons: Array<ContextMenuButtonData>;
};

export const contextMenuData = writable<ContextMenuData | null>(null);
export const searching = writable(false);
export const bibleData = writable<null | BibleData | Error>(null);
export const darkModeOn = writable(getInitialDarkModeValue());
export const currentVerse = writable(getInitialCurrentVerse());
export const fontSize = writable(
  Number(localStorage.getItem("fontSize")) || 28
);

function getInitialCurrentVerse(): Verse {
  if (localStorage.getItem("currentVerse")) {
    return Verse.fromJson(localStorage.getItem("currentVerse") || "");
  } else {
    return new Verse("Genesis", 1, 1);
  }
}

function getInitialDarkModeValue(): boolean {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => setDarkMode(event.matches));

  if (localStorage.getItem("darkMode")) {
    return localStorage.getItem("darkMode") === "dark";
  } else if (window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    return false;
  }
}

/**
 * Sets the current verse as well as storing the value in local storage
 * @param verse The new `currentVerse` value
 */
export function setCurrentVerse(verse: Verse) {
  localStorage.setItem("currentVerse", JSON.stringify(verse));
  currentVerse.set(verse);
}

/**
 * Sets the current dark mode as well as storing the value in local storage
 * @param isDark Whether the dark mode should be on or not
 */
export function setDarkMode(isDark: boolean) {
  localStorage.setItem("darkMode", isDark ? "dark" : "light");
  darkModeOn.set(isDark);
}

/**
 * Sets the current font size as well as storing the value in local storage
 * @param size The new font size
 */
export function setFontSize(size: number) {
  if (!Number.isNaN(size)) {
    localStorage.setItem("fontSize", size.toString());
    fontSize.set(size);
  }
}

/**
 * Shows a context menu onto the screen
 *
 * ---
 * @param event The mouseevent which was triggered by `oncontextmenu`
 * @param buttons The data for the buttons which will be part of the context menu
 */
export function showContextMenu(
  event: MouseEvent,
  buttons: Array<ContextMenuButtonData>
) {
  event.stopPropagation();
  event.preventDefault();

  let style: { right?: string; left?: string; bottom?: string; top?: string } =
    {};

  if (event.clientX > window.innerWidth / 2) {
    style.right = window.innerWidth - event.clientX + "px";
  } else {
    style.left = event.clientX + "px";
  }

  if (event.clientY > window.innerHeight / 2) {
    style.bottom = window.innerHeight - event.clientY + "px";
  } else {
    style.top = event.clientY + "px";
  }

  contextMenuData.set({
    buttons,
    style: (Object.keys(style) as Array<"right" | "left" | "top" | "bottom">)
      .map((key) => `${key}: ${style[key]};`)
      .reduce((prev, curr) => `${prev} ${curr}`, ""),
  });
}

document.addEventListener("click", closeContextMenu);

/**
 * Closes the contextmenu
 */
export function closeContextMenu() {
  contextMenuData.set(null);
}
