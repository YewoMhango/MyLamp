"use strict";
// TODO: Add the ability to navigate backwards and
//       forwards using the `VersesStack` class
// class VersesStack {
//   constructor(private verses: Array<Verse>) {}
//   push(verse: Verse) {
//     this.verses.push(verse);
//     if (this.verses.length > 50) {
//       this.verses.shift();
//     }
//   }gives
//   pop() {
//     return this.verses.pop();
//   }
//   get length() {
//     return this.verses.length;
//   }
//   clearAll() {
//     this.verses = [];
//   }
// }
// prettier-ignore
const bookNames = [
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
class Verse {
    constructor(book, chapter, verseNumber) {
        this.book = book;
        this.chapter = chapter;
        this.verseNumber = verseNumber;
    }
    static fromJson(str) {
        let value = JSON.parse(str);
        return new Verse(value.book, value.chapter, value.verseNumber);
    }
}
let verse_count_stats;
let current_verse;
let language;
let current_chapter_verses;
// let previous_verses: VersesStack;
// let forward_verses: VersesStack;
const electron = require("electron");
const { ipcRenderer } = electron;
const customTitlebar = require("custom-electron-titlebar");
let titlebar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex("#c5c5c5"),
    menu: null,
    titleHorizontalAlignment: "left",
    icon: "./bible.ico",
    unfocusEffect: false,
});
/**
 * Initialization function. It needs to be async in order to fetch `verse_count_stats`
 */
async function init() {
    verse_count_stats = await fetch("English/verse_counts.json").then((resp) => resp.json());
    // console.log(verse_count_stats);
    let _current_verse = localStorage.getItem("current_verse");
    current_verse = _current_verse
        ? Verse.fromJson(_current_verse)
        : new Verse("Genesis", 1, 1);
    language =
        localStorage.getItem("language") || "English";
    // let _previous_verses = localStorage.getItem("previous_verses");
    // previous_verses = new VersesStack(
    //   _previous_verses ? JSON.parse(_previous_verses) : []
    // );
    // let _forward_verses = localStorage.getItem("forward_verses");
    // forward_verses = new VersesStack(
    //   _forward_verses ? JSON.parse(_forward_verses) : []
    // );
    navigateTo(current_verse);
    selectBook(current_verse.book);
    selectChapter(current_verse.chapter);
    selectVerseNumber(current_verse.verseNumber);
    let overlaySection = document.querySelector("section.floating-elements");
    for (let child of Array.from(overlaySection.children)) {
        child.addEventListener("click", (event) => {
            event.stopPropagation();
            removeContextMenu();
        });
    }
    let darkModeState = localStorage.getItem("darkMode") || "off";
    if (darkModeState == "on") {
        toggleDarkMode();
    }
    let fontSize = Number(localStorage.getItem("fontSize")) || 26;
    document.querySelector("#fontSizeSlider").value = `${fontSize}`;
    changeFontSize();
    document.body.addEventListener("mousedown", (e) => {
        if (e.button == 2) {
            let copyButton = create("button", {
                className: "textCopy",
                innerText: "Copy",
                disabled: window.getSelection()?.toString() == "" ? true : false,
                onclick: () => {
                    navigator.clipboard.writeText(window.getSelection()?.toString() || "");
                },
            });
            showContextMenu([copyButton], e);
        }
    });
    initSidebarResizeHandle();
    initSearchInput();
    initSearchFromAndTo();
}
init();
/**
 * Customizes the search input field so that it searches when
 * you press enter and it displays a custom context menu
 */
function initSearchInput() {
    let searchInput = document.querySelector("main section.search .input .first input");
    searchInput.addEventListener("keydown", (event) => {
        if (event.key == "Enter") {
            search();
        }
    });
    searchInput.onmousedown = (e) => {
        if (e.button == 2) {
            // console.log(searchInput.selectionStart);
            let copyButton = create("button", {
                className: "textCopy",
                innerText: "Copy",
                disabled: window.getSelection()?.toString() == "" ? true : false,
                onclick: () => {
                    navigator.clipboard.writeText(window.getSelection()?.toString() || "");
                },
            });
            let pasteButton = create("button", {
                innerText: "Paste",
                className: "pasteText",
                onclick: async () => {
                    let from = searchInput.selectionStart, to = searchInput.selectionEnd, words = await navigator.clipboard.readText();
                    searchInput.value =
                        searchInput.value.slice(0, from) +
                            words +
                            searchInput.value.slice(to);
                    // Put the cursor after the word
                    searchInput.selectionStart =
                        from + words.length;
                    searchInput.selectionEnd = from + words.length;
                },
            });
            showContextMenu([copyButton, pasteButton], e);
        }
    };
}
/**
 * Populates the "from" and "to" selector inputs with the appropriate values
 */
function initSearchFromAndTo() {
    let fromSelector = document.querySelector(".search .input #search-from");
    let toSelector = document.querySelector(".search .input #search-to");
    bookNames.forEach((name) => {
        fromSelector.appendChild(create("option", {
            selected: name == "Genesis",
            value: name,
            innerText: name,
        }));
        toSelector.appendChild(create("option", {
            selected: name == "Revelation",
            value: name,
            innerText: name,
        }));
    });
}
/**
 * Initializes the sidebar resize handle
 */
function initSidebarResizeHandle() {
    let sidebarResizeHandle = document.querySelector(".search-resizer");
    let sidebar = document.querySelector(".search");
    sidebarResizeHandle.addEventListener("mousedown", initResize, false);
    function initResize(e) {
        e.preventDefault();
        window.addEventListener("mousemove", resize, false);
        window.addEventListener("mouseup", stopResize, false);
    }
    function resize(e) {
        e.preventDefault();
        let newWidth = document.body.clientWidth - e.clientX;
        if (newWidth < 100) {
            hideSearchbar();
        }
        else {
            sidebar.style.width =
                Math.min(newWidth, window.innerWidth - 100) + "px";
        }
    }
    function stopResize() {
        window.removeEventListener("mousemove", resize, false);
        window.removeEventListener("mouseup", stopResize, false);
    }
}
/**
 * Navigates to, and displays the specified verse
 *
 * ---
 * @param verse The verse to navigate to
 */
async function navigateTo(verse) {
    let mainContent = document.querySelector("main section.content");
    let finishedRequests = 0;
    ipcRenderer.on("response", handleResponse);
    function handleResponse(event, result) {
        if (result.type == "text") {
            finishedRequests++;
            mainContent.innerHTML = `<div>${result.data}</div>`;
            if (verse.verseNumber == 1) {
                mainContent.scrollTo(0, 0);
            }
            else {
                mainContent.scrollTo(0, mainContent.scrollTop +
                    document.getElementById(`${verse.verseNumber}`).getBoundingClientRect().top -
                    85);
            }
            document.querySelector("nav .nav-central .book-select").innerText = verse.book + " " + verse.chapter;
            current_verse = verse;
            localStorage.setItem("current_verse", JSON.stringify(current_verse));
            selectBook(verse.book);
            selectChapter(verse.chapter);
            selectVerseNumber(verse.verseNumber);
        }
        else if (result.type == "json") {
            finishedRequests++;
            current_chapter_verses = result.data;
        }
        if (finishedRequests == 2) {
            // console.log("removing event listener");
            ipcRenderer.removeListener("response", handleResponse);
        }
    }
    //   ipcRenderer.send("request", `${language}/${book}/Chapters/${chapter}.txt`);
    ipcRenderer.send("request", {
        type: "chapterText",
        details: { book: verse.book, chapter: verse.chapter, language },
    });
    //   ipcRenderer.send("request", `${language}/${book}/Chapters/${chapter}.json`);
    ipcRenderer.send("request", {
        type: "chapterJson",
        details: { book: verse.book, chapter: verse.chapter, language },
    });
}
/**
 * A helper function that creates and returns an HTML Element of the type `type`
 *
 * ---
 * @param {String} type Type of `HTMLElement` to be created
 * @param {Object} props Optional properties of the `HTMLElement` to be created
 * @param {Array<Node | string>} children Optional HTML Elements to be assigned as children of this element
 *
 * ---
 * @returns {HTMLElement} An `HTMLElement`
 */
function create(type, props, children) {
    if (!type)
        throw new TypeError("Empty HTMLElement type: " + type);
    let dom = document.createElement(type);
    if (props)
        Object.assign(dom, props);
    if (children) {
        for (let child of children) {
            if (typeof child != "string")
                dom.appendChild(child);
            else
                dom.appendChild(document.createTextNode(child));
        }
    }
    return dom;
}
//# sourceMappingURL=script.js.map