import puppeteer from "puppeteer";
import { mkdir, writeFile } from "node:fs/promises";
import fs from "node:fs";
import https from "node:https";
import { DownloaderHelper } from "node-downloader-helper";

const browser = await puppeteer.launch({
  headless: true,
  defaultViewport: false,
  userDataDir: "./techinn",
});
const page = await browser.newPage();
await page.goto(
  "https://www.tradeinn.com/techinn/en/gaming/11497/lf#fq=id_familia=11497&sort=v30_sum;desc@tm16;asc&fe=&pf=@atributos=1154_5485_1&start=0",
  {
    waitUntil: "networkidle0",
  }
);

// get the id of items
const items = await page.$$(".items_listado");

// const title = await page.evaluate((el) => el.getElementById("items").innerText, page);

// console.log(items);

for (const item of items) {
  const product_handles = await page.$$(".li_position_p");
  for (const product_handle of product_handles) {
    // product title
    const title = await page.evaluate(
      (el) =>
        el.querySelector("div > div.BoxPrice.precio_listado > h3 > a")
          .textContent,
      product_handle
    );

    // product image
    const image = await page.evaluate(
      (el) => el.querySelector("div > a.prod_list > img").src,
      product_handle
    );

    console.log(title);
    console.log(image);

    // clean title from special characters and spaces
    const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, "_");

    // create a folder for each product and save image and a text file with the title
    const dir_m = `products/${cleanTitle}`;
    await mkdir("products", { recursive: true });
    await mkdir(dir_m, { recursive: true });

    await writeFile(`${dir_m}/title.txt`, title, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });

    // download the image link
    console.log(image);

    const dl = new DownloaderHelper(image, dir_m);
    dl.on("end", () => console.log("Download Completed"));
    dl.on("error", (err) => console.log("Download Failed", err));
    dl.start().catch((err) => console.error(err));

    // await writeFile(`${dir_m}/image.jpg`, image, (err) => {
    //   if (err) throw err;
    //   console.log("The file has been saved!");
    // });
  }

  //   console.log(product_handles);
  //   //   console.log(product_handles.length);
  //   console.log(typeof product_handles);
  //   //   console.log(item);
}

// await page.screenshot({ path: "example.png" });

// await browser.close();
