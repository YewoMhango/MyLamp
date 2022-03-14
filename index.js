const electron = require("electron");
const url = require("url");
const path = require("path");
const { app, BrowserWindow, ipcMain } = electron;

handleSquirrelEvent();

function handleSquirrelEvent() {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require("child_process");
    const path = require("path");

    const appFolder = path.resolve(process.execPath, "..");
    const rootAtomFolder = path.resolve(appFolder, "..");
    const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
    const exeName = path.basename(process.execPath);

    const spawn = function (command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true,
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function (args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case "--squirrel-install":
        case "--squirrel-updated":
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(["--createShortcut", exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case "--squirrel-uninstall":
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(["--removeShortcut", exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case "--squirrel-obsolete":
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated
            app.quit();
            return true;
    }
}

app.on("ready", () => {
    let win = new BrowserWindow({
        title: "Bible",
        // frame: false,
        // titleBarStyle: "hidden",
        icon: "Bible.png",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        },
    });

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, "public", "index.html"),
            protocol: "file",
            slashes: true,
        })
    );

    // win.removeMenu();

    win.on("closed", () => {
        app.quit();
    });

    ipcMain.on("request", (e, request) => {
        // console.log(request);
        win.webContents.send("response", requestHandler(request));
    });
});

const handlers = require("./handlers");

function requestHandler(request) {
    if (request.type == "chapterText") {
        // console.log("Being handled as chapter text request...");
        return handlers.handleChapterTextRequest(request.details);
    } else if (request.type == "chapterJson") {
        // console.log("Being handled as chapter json request...");
        return handlers.handleChapterJsonRequest(request.details);
    } else if (request.type == "search") {
        // console.log("Being handled as search request...");
        return handlers.handleSearchRequest(request.details);
    }
}
