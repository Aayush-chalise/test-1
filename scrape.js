// npm i axios cheerio

import axios from "axios";
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const BASE = "https://ekantipur.com";
const INDEX = BASE + "/news";

async function fetchHtml(url) {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0 (NewsManiaBot)" },
      timeout: 20000,
    });
    return res.data;
  } catch (err) {
    console.error("fetchHtml error:", url, err.message);
    return null;
  }
}

function absolute(u) {
  if (!u) return null;
  if (u.startsWith("http")) return u;
  if (u.startsWith("/")) return BASE + u;
  return BASE + "/" + u;
}

async function scrapeIndex() {
  const html = await fetchHtml(INDEX);
  if (!html) throw new Error("Failed to fetch index page");

  const $ = cheerio.load(html);

  // DEBUG: show some html snippet so you can inspect locally
  // console.log(html.slice(0, 2000));

  // Strategy: pick links that look like article links
  const links = new Set();
  $("a[href]").each((i, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    // common ekantipur pattern: /news/... or /news/<slug>-<id> or links that contain '/news/'
    if (href.includes("/news/") || /^\/news(\/|$)/.test(href)) {
      links.add(absolute(href));
    }
    // alternative: some articles may be under /page/... adapt if you see different patterns
  });

  const arr = Array.from(links);
  console.log(
    "Found",
    arr.length,
    "candidate article links (sample 10):",
    arr.slice(0, 10)
  );
  return arr;
}

async function parseArticle(url) {
  const html = await fetchHtml(url);
  if (!html) return null;
  const $ = cheerio.load(html);

  // Try many fallbacks — websites vary
  const title =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("h1").first().text().trim() ||
    $("h2").first().text().trim() ||
    null;

  // summary: meta description or first paragraph
  let summary =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    $(".teaser").first().text().trim() ||
    $("article p").first().text().trim() ||
    null;

  // main image
  const image =
    $('meta[property="og:image"]').attr("content") ||
    $("article img").first().attr("src") ||
    null;

  // fallback body extraction (trim to reasonable length)
  const paragraphs = $("article p")
    .map((i, p) => $(p).text().trim())
    .get()
    .filter(Boolean);
  const body = paragraphs.join("\n\n").slice(0, 20000) || null;

  // If nothing useful found, return null so caller can skip it
  if (!title && !summary && !body) {
    console.warn("No useful content parsed for", url);
    return null;
  }

  return {
    url,
    title,
    summary,
    image: image ? (image.startsWith("http") ? image : absolute(image)) : null,
    body,
    scraped_at: new Date().toISOString(),
  };
}

(async () => {
  try {
    const articleLinks = await scrapeIndex();

    // limit while developing
    const limit = 20;
    const results = [];

    for (let i = 0; i < Math.min(limit, articleLinks.length); i++) {
      const u = articleLinks[i];
      console.log(
        `Parsing (${i + 1}/${Math.min(limit, articleLinks.length)}):`,
        u
      );
      const art = await parseArticle(u);
      if (art) {
        results.push(art);
        console.log(
          " -> got:",
          art.title ? art.title.slice(0, 80) : "(no title)"
        );
      } else {
        console.log(" -> skipped (empty content)");
      }
      // polite delay
      await new Promise((r) => setTimeout(r, 300));
    }

    const outPath = path.join(__dirname, "EkantipurNews.json");
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2), "utf8");
    console.log("Saved", results.length, "articles to", outPath);
  } catch (err) {
    console.error(err);
  }
})();
