"use strict";
// class VersesStack {
//   constructor(private verses: Array<Verse>) {}
//   push(verse: Verse) {
//     this.verses.push(verse);
//     if (this.verses.length > 50) {
//       this.verses.shift();
//     }
//   }
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
// prettier-ignore
const shortBookNames = [
    "Gen", "Exo", "Lev", "Num", "Deu", "Jos",
    "Jdg", "Rth", "1Sa", "2Sa", "1Ki", "2Ki",
    "1Ch", "2Ch", "Ezr", "Neh", "Est", "Job",
    "Psa", "Pro", "Ecc", "Son", "Isa", "Jer",
    "Lam", "Eze", "Dan", "Hos", "Joe", "Amo",
    "Oba", "Jon", "Mic", "Nah", "Hab", "Zep",
    "Hag", "Zec", "Mal", "Mat", "Mar", "Luk",
    "Joh", "Act", "Rom", "1Co", "2Co", "Gal",
    "Eph", "Phi", "Col", "1Th", "2Th", "1Ti",
    "2Ti", "Tit", "Phm", "Heb", "Jam", "1Pe",
    "2Pe", "1Jn", "2Jn", "3Jn", "Jud", "Rev",
];
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
(async function () {
    verse_count_stats = await fetch("English/verse_counts.json").then((resp) => resp.json());
    console.log(verse_count_stats);
    let _current_verse = localStorage.getItem("current_verse");
    current_verse = _current_verse
        ? JSON.parse(_current_verse)
        : {
            book: "Genesis",
            chapter: 1,
            verse: 1,
        };
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
    navigateTo(current_verse.book, current_verse.chapter, current_verse.verse);
    let overlaySection = document.querySelector("section.detached-elements");
    for (let child of Array.from(overlaySection.children)) {
        child.onclick = (event) => event.stopPropagation();
    }
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
            hideSidebar();
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
    document.querySelector("#searchBox").onkeydown = (event) => {
        if (event.key == "Enter") {
            search();
        }
    };
    let darkModeState = localStorage.getItem("darkMode") || "off";
    if (!["off", "on"].includes(darkModeState)) {
        darkModeState = "off";
    }
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
    let searchInput = document.querySelector("main section.search .input .first input");
    searchInput.onmousedown = (e) => {
        if (e.button == 2) {
            console.log(searchInput.selectionStart);
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
                        searchInput.value.slice(0, from || undefined) +
                            words +
                            searchInput.value.slice(to || undefined);
                    // Put the cursor after the word
                    searchInput.selectionStart =
                        from + words.length;
                    searchInput.selectionEnd = from + words.length;
                },
            });
            showContextMenu([copyButton, pasteButton], e);
        }
    };
})();
function showContextMenu(buttons, clickEvent) {
    Array.from(document.querySelectorAll(".contextMenu")).forEach((element) => element.remove());
    clickEvent.stopPropagation();
    clickEvent.preventDefault();
    let contextMenu = create("div", { className: "contextMenu" }, ...buttons);
    document.body.appendChild(contextMenu);
    if (clickEvent.clientX + contextMenu.clientWidth >
        document.body.clientWidth) {
        contextMenu.style.right =
            document.body.clientWidth - clickEvent.clientX + "px";
    }
    else {
        contextMenu.style.left = clickEvent.clientX + "px";
    }
    if (clickEvent.clientY + contextMenu.clientHeight >
        document.body.clientHeight) {
        contextMenu.style.bottom =
            document.body.clientHeight - clickEvent.clientY + "px";
    }
    else {
        contextMenu.style.top = clickEvent.clientY + "px";
    }
    document.addEventListener("click", removeContextMenu);
}
function removeContextMenu() {
    Array.from(document.querySelectorAll(".contextMenu")).forEach((e) => e.remove());
    document.body.removeEventListener("click", removeContextMenu);
}
async function navigateTo(book, chapter, verse) {
    let mainContent = document.querySelector("main section.content");
    let finishedRequests = 0;
    ipcRenderer.on("response", handleResponse);
    function handleResponse(event, result) {
        if (result.type == "text") {
            finishedRequests++;
            mainContent.innerHTML = `<div>${result.data}</div>`;
            if (verse == 1) {
                mainContent.scrollTo(0, 0);
            }
            else {
                mainContent.scrollTo(0, mainContent.scrollTop +
                    document.getElementById(`${verse}`).getBoundingClientRect().top -
                    85);
            }
            document.querySelector("nav .nav-central .book-select").innerText = book + " " + chapter;
            current_verse = { book, chapter, verse };
            localStorage.setItem("current_verse", JSON.stringify(current_verse));
        }
        else if (result.type == "json") {
            finishedRequests++;
            current_chapter_verses = result.data;
        }
        if (finishedRequests == 2) {
            console.log("removing event listener");
            ipcRenderer.removeListener("response", handleResponse);
        }
    }
    ipcRenderer.send("request", `${language}/${book}/Chapters/${chapter}.txt`);
    ipcRenderer.send("request", `${language}/${book}/Chapters/${chapter}.json`);
}
function verseNumberClicked(e, verse) {
    let copyButton = create("button", {
        className: "verseCopy",
        innerText: "Copy verse",
        onclick: () => {
            navigator.clipboard.writeText(`“${current_chapter_verses[verse - 1]}” (${current_verse.book} ${current_verse.chapter}:${verse})`);
        },
    });
    showContextMenu([copyButton], e);
    e.stopPropagation();
}
function previousChapter() {
    let { chapter, book } = current_verse;
    if (book != "Genesis" || chapter != 1) {
        if (chapter == 1) {
            let newBookIndex = bookNames.indexOf(book) - 1;
            navigateTo(bookNames[newBookIndex], verse_count_stats[newBookIndex].length, 1);
        }
        else {
            navigateTo(book, chapter - 1, 1);
        }
    }
}
function nextChapter() {
    let { chapter, book } = current_verse;
    if (book != "Revelation" || chapter != 22) {
        let currentBookIndex = bookNames.indexOf(book);
        if (chapter == verse_count_stats[currentBookIndex].length) {
            navigateTo(bookNames[currentBookIndex + 1], 1, 1);
        }
        else {
            navigateTo(book, chapter + 1, 1);
        }
    }
}
function showVerseSelector() {
    document.querySelector("section.detached-elements").style.display = "flex";
    let verseSelection = document.querySelector("section.detached-elements .verse-selector");
    verseSelection.style.display = "block";
    for (let i = 0; i < bookNames.length; i++) {
        verseSelection.appendChild(create("div", {
            onclick: () => selectBook(bookNames[i]),
        }, create("span", {
            innerText: shortBookNames[i],
        })));
    }
}
let verse_being_selected;
function selectBook(book) {
    verse_being_selected = { book, chapter: 1, verse: 1 };
    let verseSelection = document.querySelector("section.detached-elements .verse-selector");
    verseSelection.innerHTML = "";
    let numberOfChapters = verse_count_stats[bookNames.indexOf(book)].length;
    for (let chapter = 1; chapter <= numberOfChapters; chapter++) {
        verseSelection.appendChild(create("div", {
            onclick: () => selectChapter(chapter),
        }, create("span", {
            innerText: chapter,
        })));
    }
}
function selectChapter(chapter) {
    verse_being_selected.chapter = chapter;
    let verseSelection = document.querySelector("section.detached-elements .verse-selector");
    verseSelection.innerHTML = "";
    let numberOfVerses = verse_count_stats[bookNames.indexOf(verse_being_selected.book)][Number(chapter) - 1];
    for (let verse = 1; verse <= numberOfVerses; verse++) {
        verseSelection.appendChild(create("div", {
            onclick: () => selectVerse(verse),
        }, create("span", {
            innerText: verse,
        })));
    }
}
function selectVerse(verse) {
    let { book, chapter } = verse_being_selected;
    navigateTo(book, chapter, verse);
    closeOverlay();
}
function closeOverlay() {
    let section = document.querySelector("section.detached-elements");
    section.style.display = "none";
    for (let child of Array.from(section.children)) {
        child.style.display = "none";
    }
    document.querySelector("section.detached-elements .verse-selector").innerHTML = "";
}
function showMenu() {
    document.querySelector("section.detached-elements").style.display = "flex";
    document.querySelector(".detached-elements .menu").style.display = "flex";
}
function toggleSearchBar() {
    let searchBar = document.querySelector("main section.search");
    if (searchBar.style.width.startsWith("0") || searchBar.style.width == "") {
        showSidebar();
    }
    else {
        hideSidebar();
    }
}
function hideSidebar() {
    let searchBar = document.querySelector("main section.search");
    document.querySelector(".search-resizer").style.width =
        "0";
    searchBar.style.width = "0";
    searchBar.style.padding = "10px 0";
    searchBar.children[0].style.display = "none";
}
function showSidebar() {
    let searchBar = document.querySelector("main section.search");
    document.querySelector(".search-resizer").style.width =
        "5px";
    searchBar.children[0].style.display = "block";
    searchBar.style.width = "300px";
    searchBar.style.padding = "10px";
}
function changeFontSize() {
    let size = document.querySelector("#fontSizeSlider")
        .value;
    document.querySelector("main section.content").style.fontSize = size + "px";
    document.querySelector(".fontSizeIndicator").innerText = size + "px";
    localStorage.setItem("fontSize", size);
}
async function search() {
    let searchText = document.querySelector("#searchBox")
        .value;
    let searchType = document.querySelector("#search-type").value;
    ipcRenderer.on("response", handleResponse);
    function handleResponse(event, _result) {
        if (_result.type != "search")
            return;
        let result = _result.data;
        let container = document.querySelector("main section.search .results");
        container.innerHTML = "";
        container.append(create("p", { className: "stats" }, `${result.length} results found (500 max)`));
        container.append(create("div", { className: "results-list" }, ...result.map((resultVerse) => create("div", {
            className: "result",
            onclick: () => navigateTo(resultVerse.book, resultVerse.chapter, resultVerse.verse),
        }, create("strong", null, `${resultVerse.book} ${resultVerse.chapter}:${resultVerse.verse}`), create("br"), resultVerse.text))));
        ipcRenderer.removeListener("response", handleResponse);
    }
    ipcRenderer.send("request", `search/${searchType}/${language}/${searchText}`);
}
function toggleDarkMode() {
    let darkModeState = document.body.getAttribute("darkMode");
    if (darkModeState == "on") {
        document.body.setAttribute("darkMode", "off");
        localStorage.setItem("darkMode", "off");
        titlebar.updateBackground(customTitlebar.Color.fromHex("#c5c5c5"));
    }
    else {
        document.body.setAttribute("darkMode", "on");
        localStorage.setItem("darkMode", "on");
        titlebar.updateBackground(customTitlebar.Color.fromHex("#222"));
    }
}
/**
 * A helper function that creates and returns an HTML Element of the type `type`
 *
 * ---
 * @param {String} type Type of `HTMLElement` to be created
 * @param {Object} props Optional properties of the `HTMLElement` to be created
 * @param  {...HTMLElement} children Optional HTML Elements to be assigned as children of this element
 *
 * ---
 * @returns {HTMLElement} An `HTMLElement` object
 */
function create(type, props, ...children) {
    if (!type)
        throw new TypeError("Empty HTMLElement type: " + type);
    let dom = document.createElement(type);
    if (props)
        Object.assign(dom, props);
    for (let child of children) {
        if (typeof child != "string")
            dom.appendChild(child);
        else
            dom.appendChild(document.createTextNode(child));
    }
    return dom;
}
//# sourceMappingURL=script.js.map