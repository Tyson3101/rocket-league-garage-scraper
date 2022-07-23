import express from "express";
import cors from "cors";
import fs from "fs/promises";
const app = express();
app.use(express.json());

app.use(cors({ origin: "http://localhost:3000" }));
import puppeteer from "puppeteer";

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

async function getItems(category: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://rocket-league.com/items/" + category);
  await page.waitForSelector(".rlg-item__container");
  console.log("Start Evaluate");
  const itemsJson = await page.evaluate(() => {
    function getType(rawType: string) {
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
    const items: any[] = [];
    let ItemElements = (
      Array.from(
        document.querySelector(
          "#rlg-items-grid-" + window.location.href.split("/").pop()
        )?.children as any
      ) as HTMLDivElement[]
    ).filter(
      (it) => !Array.from(it.classList).includes("rlg-items__decal-parent")
    );
    ItemElements.shift();
    for (let item of ItemElements) {
      let name = item.querySelector("h2")?.innerText.trim();
      let image = (
        item.querySelector(".rlg-item__itemimage") as HTMLImageElement
      )?.src;
      let rarity = item
        .querySelector(".rlg-items-item-rarity")
        ?.innerHTML.trim();
      let type = getType(window.location.href.split("/").pop() as string);
      items.push({ name, image, rarity, type });
    }
    return items;
  });
  console.log("End Evaluate", itemsJson);
  await browser.close().then(() => console.log("Closed"));
  const AllItemsJson: any = {
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
