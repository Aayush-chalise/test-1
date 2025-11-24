const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs"); //  for creating json file

const url = "https://ekantipur.com/news";

const NewsData = {};

async function getHTML() {
  const { data: html } = await axios.get(url);
  return html;
}

getHTML().then((res) => {
  const $ = cheerio.load(res);
  $(".teaser.offset").each((index, news) => {
    const title = $(news).find("font").first().text().trim();
    const description = $(news).find("font").eq(1).text().trim();
    NewsData[title] = description;
  });
  fs.writeFile("NewsData.json", JSON.stringify(NewsData), (err) => {
    if (err) throw err;
    console.log("News Data saved to NewsData.json");
  });
});
