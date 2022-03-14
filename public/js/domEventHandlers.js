"use strict";
/**
 * Displays the main application menu
 */
function showMenu() {
    document.querySelector("section.floating-elements").style.display = "flex";
    document.querySelector(".floating-elements .menu").style.display = "flex";
}
/**
 * This function mainly shows a context menu for copying a verse
 * when the verse number for a verse in the DOM is clicked. (To
 * see where it's called, look in the `renderChapterAsHTML`
 * function in `handlers.js`)
 *
 * ---
 * @param e Mouse Event for where the verse number was clicked
 * @param verse The verse number
 */
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
/**
 * Navigates to the chapter before this one in the book where
 * it is located, or to the last chapter in the previous book
 * if the current chapter is the first one
 */
function previousChapter() {
    let { chapter, book } = current_verse;
    if (!(book == "Genesis" && chapter == 1)) {
        if (chapter == 1) {
            let newBookIndex = bookNames.indexOf(book) - 1;
            navigateTo(new Verse(bookNames[newBookIndex], verse_count_stats[newBookIndex].length, 1));
        }
        else {
            navigateTo(new Verse(book, chapter - 1, 1));
        }
    }
}
/**
 * Navigates to the chapter after this one in the book where
 * it is located, or to the first chapter in the next book
 * if the current chapter is the last one
 */
function nextChapter() {
    let { chapter, book } = current_verse;
    if (!(book == "Revelation" && chapter == 22)) {
        let currentBookIndex = bookNames.indexOf(book);
        if (chapter == verse_count_stats[currentBookIndex].length) {
            navigateTo(new Verse(bookNames[currentBookIndex + 1], 1, 1));
        }
        else {
            navigateTo(new Verse(book, chapter + 1, 1));
        }
    }
}
/**
 * Shows the menu which allows you to navigate to any verse you want
 */
function showVerseSelector() {
    document.querySelector("section.floating-elements").style.display = "flex";
    let verseSelection = document.querySelector("section.floating-elements .verse-selector");
    verseSelection.style.display = "grid";
}
/**
 * Updates the list of books in the verse selector to show
 * the book specified as the currently selected one. However,
 * the function can also be used to initialize the list with
 * values since the HTML is originally empty
 *
 * ---
 * @param book The book which has been selected
 */
function selectBook(book) {
    let bookSelector = document.querySelector("section.floating-elements .verse-selector .select-book");
    let scrollTop = bookSelector.scrollTop;
    bookSelector.innerHTML = "";
    for (let bookName of bookNames) {
        let option = create("div", {
            className: book == bookName ? "selected" : "",
            value: bookName,
            onclick: () => selectBook(bookName),
        }, [create("span", null, [bookName])]);
        bookSelector.appendChild(option);
    }
    // console.log(scrollTop);
    bookSelector.scrollTop = scrollTop;
    selectChapter(1);
    selectVerseNumber(1);
}
/**
 * Updates the list of chapter in the verse selector to show
 * the chapter specified as the currently selected one. However,
 * the function can also be used to initialize the list with
 * values since the HTML is originally empty
 *
 * ---
 * @param chapter The chapter which has been selected
 */
function selectChapter(chapter) {
    let chapterSelector = document.querySelector("section.floating-elements .verse-selector .select-chapter");
    let scrollTop = chapterSelector.scrollTop;
    chapterSelector.innerHTML = "";
    let currentBook = document.querySelector("section.floating-elements .verse-selector .select-book").querySelector(".selected").innerText;
    let numOfChapters = verse_count_stats[bookNames.indexOf(currentBook)].length;
    for (let i = 1; i <= numOfChapters; i++) {
        let option = create("div", {
            className: i == chapter ? "selected" : "",
            onclick: () => selectChapter(i),
        }, [create("span", null, [`${i}`])]);
        chapterSelector.appendChild(option);
    }
    // console.log(scrollTop);
    chapterSelector.scrollTop = scrollTop;
    selectVerseNumber(1);
}
/**
 * Updates the list of verses in the verse selector to show
 * the verse specified as the currently selected one. However,
 * the function can also be used to initialize the list with
 * values since the HTML is originally empty
 *
 * ---
 * @param verse The verse which has been selected
 */
function selectVerseNumber(verse) {
    let verseSelector = document.querySelector("section.floating-elements .verse-selector .select-verse");
    let scrollTop = verseSelector.scrollTop;
    verseSelector.innerHTML = "";
    let book = document.querySelector("section.floating-elements .verse-selector .select-book").querySelector(".selected").innerText;
    let chapter = Number(document.querySelector("section.floating-elements .verse-selector .select-chapter").querySelector(".selected").innerText);
    let numOfVerses = verse_count_stats[bookNames.indexOf(book)][chapter - 1];
    for (let i = 1; i <= numOfVerses; i++) {
        let option = create("div", {
            className: i == verse ? "selected" : "",
            onclick: () => {
                selectVerseNumber(i);
                navigateTo(new Verse(book, chapter, i));
                closeOverlay();
            },
        }, [create("span", null, [`${i}`])]);
        verseSelector.appendChild(option);
    }
    // console.log(scrollTop);
    verseSelector.scrollTop = scrollTop;
}
/**
 * Hides the overlay which is used to display the main menu
 * and verse selector menu
 */
function closeOverlay() {
    let section = document.querySelector("section.floating-elements");
    section.style.display = "none";
    for (let child of Array.from(section.children)) {
        child.style.display = "none";
    }
}
/**
 * Hides the search bar if it is open or shows it otherwise
 */
function toggleSearchBar() {
    let searchBar = document.querySelector("main section.search");
    if (searchBar.style.width.startsWith("0") || searchBar.style.width == "") {
        showSearchbar();
    }
    else {
        hideSearchbar();
    }
}
function hideSearchbar() {
    let searchBar = document.querySelector("main section.search");
    document.querySelector(".search-resizer").style.width =
        "0";
    searchBar.style.width = "0";
    searchBar.style.padding = "10px 0";
    searchBar.children[0].style.display = "none";
}
function showSearchbar() {
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
/**
 * Turns dark mode on or off
 */
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
 * Takes the input from the user and uses it to search the Bible text
 */
async function search() {
    let searchText = document.querySelector("#searchBox")
        .value;
    let searchType = document.querySelector("#search-type").value;
    let from = document.querySelector("#search-from")
        .value;
    let to = document.querySelector("#search-to").value;
    let caseSensitive = document.querySelector("#case-sensitivity").checked;
    ipcRenderer.on("response", handleResponse);
    //  ipcRenderer.send("request", `search/${searchType}/${language}/${searchText}`);
    ipcRenderer.send("request", {
        type: "search",
        details: {
            type: searchType,
            language,
            searchText,
            from,
            to,
            caseSensitive,
        },
    });
    function handleResponse(event, _result) {
        if (_result.type != "search")
            return;
        let result = _result.data;
        let container = document.querySelector("main section.search .results");
        container.innerHTML = "";
        container.append(create("p", { className: "stats" }, [
            `${result.length} results found (500 max)`,
        ]));
        container.append(create("div", { className: "results-list" }, [
            ...result.map((resultVerse) => create("div", {
                className: "result",
                onclick: () => navigateTo(resultVerse),
            }, [
                create("strong", null, [
                    `${resultVerse.book} ${resultVerse.chapter}:${resultVerse.verseNumber}`,
                ]),
                create("br"),
                resultVerse.text,
            ])),
        ]));
        ipcRenderer.removeListener("response", handleResponse);
    }
}
/**
 * Displays a context menu with the specified buttons at the location where the
 * Mouse Event given occured
 *
 * ---
 * @param buttons The buttons to show in the menu
 * @param clickEvent Mouse Event which triggered the context menu
 */
function showContextMenu(buttons, clickEvent) {
    Array.from(document.querySelectorAll(".contextMenu")).forEach((element) => element.remove());
    clickEvent.stopPropagation();
    clickEvent.preventDefault();
    let contextMenu = create("div", { className: "contextMenu" }, buttons);
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
//# sourceMappingURL=domEventHandlers.js.map