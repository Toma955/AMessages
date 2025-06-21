const keypress = require("keypress");
const os = require("os");
const path = require("path");
const fs = require("fs");

const localesPath = path.join(__dirname, "..", "locales");

const locales = {
    Hrvatski: JSON.parse(fs.readFileSync(path.join(localesPath, "hr.json"), "utf-8")),
    English: JSON.parse(fs.readFileSync(path.join(localesPath, "en.json"), "utf-8"))
};

let languages = ["Hrvatski", "English"];
let currentLangIndex = 0;
let currentLang = languages[currentLangIndex];

// Funkcija za rewrite jedne linije u konzoli
function rewriteLine(text) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(text);
}

function updateLanguageLine() {
    rewriteLine(`Dobrodošli u Amessages Preloader | Odaberite jezik: SPACE za promjenu, ENTER za potvrdu. (${currentLang}) `);
}

console.log("Dobrodošli u Amessages Preloader");
updateLanguageLine();

function checkMemory() {
    const totalMemMB = Math.round(os.totalmem() / (1024 * 1024));
    const freeMemMB = Math.round(os.freemem() / (1024 * 1024));
    console.log();
    console.log(
        locales[currentLang].ramMessage
            .replace("{{total}}", totalMemMB)
            .replace("{{free}}", freeMemMB)
    );
}

function checkContinue() {
    console.log();
    console.log(locales[currentLang].continueMessage);
    // Ovdje možeš dodati logiku da pitaš nastaviti ili ne
}

keypress(process.stdin);

process.stdin.setRawMode(true);
process.stdin.resume();

process.stdin.on("keypress", function (ch, key) {
    if (!key) return;

    if (key.name === "space") {
        currentLangIndex = (currentLangIndex + 1) % languages.length;
        currentLang = languages[currentLangIndex];
        updateLanguageLine();
    } else if (key.name === "return") {
        console.log("\n");
        checkMemory();
        checkContinue();
        process.stdin.setRawMode(false);
        process.stdin.pause();
    } else if (key.name === "escape" || (key.ctrl && key.name === "c")) {
        process.exit();
    }
});
