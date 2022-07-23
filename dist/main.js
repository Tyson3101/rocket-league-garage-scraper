"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = express_1.default();
app.use(express_1.default.json());
app.use(cors_1.default({ origin: "http://localhost:3000" }));
const puppeteer_1 = __importDefault(require("puppeteer"));
app.get("/", (req, res) => {
    res.send("Available Items: /cars /decals /boosts /wheels /explosions");
});
app.get("/cars", async (req, res) => {
    res.json(await getItems("bodies"));
});
app.get("/decals", async (req, res) => {
    res.json(await getItems("decals"));
});
app.get("/boosts", async (req, res) => {
    res.json(await getItems("boosts"));
});
app.get("/explosions", async (req, res) => {
    res.json(await getItems("explosions"));
});
app.get("/wheels", async (req, res) => {
    res.json(await getItems("wheels"));
});
async function getItems(category) {
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    await page.goto("https://rocket-league.com/items/" + category);
    await page.waitForSelector(".rlg-item__container");
    console.log("Start Evaluate");
    const itemsJson = await page.evaluate(() => {
        var _a, _b, _c, _d;
        function getType(rawType) {
            switch (rawType) {
                case "bodies":
                    return "car";
                case "explosions":
                    return "goalexplosion";
                case "wheels":
                    return "wheel";
                case "boosts":
                    return "boost";
                case "decals":
                    return "decal";
            }
        }
        const items = [];
        let ItemElements = Array.from((_a = document.querySelector("#rlg-items-grid-" + window.location.href.split("/").pop())) === null || _a === void 0 ? void 0 : _a.children).filter((it) => !Array.from(it.classList).includes("rlg-items__decal-parent"));
        ItemElements.shift();
        for (let item of ItemElements) {
            let name = (_b = item.querySelector("h2")) === null || _b === void 0 ? void 0 : _b.innerText.trim();
            let image = (_c = item.querySelector(".rlg-item__itemimage")) === null || _c === void 0 ? void 0 : _c.src;
            let rarity = (_d = item
                .querySelector(".rlg-items-item-rarity")) === null || _d === void 0 ? void 0 : _d.innerHTML.trim();
            let type = getType(window.location.href.split("/").pop());
            items.push({ name, image, rarity, type });
        }
        return items;
    });
    console.log("End Evaluate", itemsJson);
    await browser.close().then(() => console.log("Closed"));
    const AllItemsJson = {
        common: [],
        limited: [],
        import: [],
        exotic: [],
        blackmarket: [],
        rare: [],
        veryrare: [],
        premium: [],
        uncommon: [],
    };
    for (let item of itemsJson) {
        if (item.rarity.toLowerCase().trim(" ") === "common")
            AllItemsJson.common.push(item);
        else if (item.rarity.toLowerCase().trim(" ") === "limited")
            AllItemsJson.limited.push(item);
        else if (item.rarity.toLowerCase().trim(" ") === "import")
            AllItemsJson.import.push(item);
        else if (item.rarity.toLowerCase().trim(" ") === "exotic")
            AllItemsJson.exotic.push(item);
        else if (item.rarity.toLowerCase().trim(" ") === "blackmarket")
            AllItemsJson.blackmarket.push(item);
        else if (item.rarity.toLowerCase().trim(" ") === "rare")
            AllItemsJson.rare.push(item);
        else if (item.rarity.toLowerCase().trim(" ") === "veryrare")
            AllItemsJson.veryrare.push(item);
        else if (item.rarity.toLowerCase().trim(" ") === "premium")
            AllItemsJson.premium.push(item);
        else if (item.rarity.toLowerCase().trim(" ") === "uncommon")
            AllItemsJson.uncommon.push(item);
    }
    console.log(AllItemsJson);
    return AllItemsJson;
}
app.listen(3000, () => console.log("Listening on http://localhost:3000"));
