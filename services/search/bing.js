import dotenv from 'dotenv';
import https from 'https';
import { BING } from '../../helpers/constants.js';
import { appendToFile } from '../../helpers/files.js';
import puppeteer from 'puppeteer';

dotenv.config();

// TODO: add checks for all required keys
const BING_CUSTOM_SEARCH_ENDPOINT = process.env['BING_CUSTOM_SEARCH_ENDPOINT'];
const BING_CUSTOM_SEARCH_API_KEY = process.env['BING_CUSTOM_SEARCH_API_KEY'];
const BING_CUSTOM_SEARCH_ENGINE_ID = process.env['BING_CUSTOM_SEARCH_ENGINE_ID'];

if (!BING_CUSTOM_SEARCH_ENDPOINT) {
  throw new Error('BING_CUSTOM_SEARCH_ENDPOINT is not set.');
}
if (!BING_CUSTOM_SEARCH_API_KEY) {
  throw new Error('BING_CUSTOM_SEARCH_API_KEY is not set.');
}
if (!BING_CUSTOM_SEARCH_ENGINE_ID) {
  throw new Error('BING_CUSTOM_SEARCH_ENGINE_ID is not set.');
}
// </TODO>

const outputPath = 'output/bing.md';

// const formatResult = result =>
//   `# ${result.name}\n
//   #### *${result.datePublishedDisplayText}*
//   ${result.snippet}\n
//   [link](${result.url})\n
//   __________________________________\n`;

const formatResults = async results => {
  const browser = await puppeteer.launch({ headless: true });
  const scrapeResultsPromises = results.map(async r => {
    const page = await browser.newPage();
    await page.goto(r.url, {
      waitUntil: 'domcontentloaded',
    });

    page.on('console', msg => console.log(msg.text()));

    return page.evaluate(() => {
      console.log(`url is ${location.href}`);

      // nyt -- BANNED
      // const paragraphs = Array.from(document.querySelectorAll("#story > section > div > div > p h2 h3"));
      // bloomberg -- BANNED
      // const paragraphs = Array.from(document.querySelectorAll("body > main > div.transporter-item.current > article > div > div.content-well-v2 > section > div.body-columns > div > div:nth-child(3) > div.body-copy-v2.fence-body > p"));
      const paragraphs = Array.from(document.querySelectorAll("#the-post > div.entry-content.entry.clearfix > p"));

      const plainText = paragraphs.map((p, idx) => {
        const text = p.innerHTML.replace(/<[^>]+>/g, '');
        return text;
      });

      return plainText;
    });
  });

  const scrapeResults = await Promise.all(scrapeResultsPromises);

  console.log("\n\n\n\n\n\nScrape Results:");
  console.log(scrapeResults.map((text, idx) => ({ text, link: results[idx].url })));

  await browser.close();

  return scrapeResults;
};

function bingWebSearch({ query }) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: BING_CUSTOM_SEARCH_ENDPOINT,
      path: `/v7.0/custom/search?q=${encodeURIComponent(query)}&customconfig=${BING_CUSTOM_SEARCH_ENGINE_ID}&mkt=en-US`,
      headers: { 'Ocp-Apim-Subscription-Key': BING_CUSTOM_SEARCH_API_KEY },
    }, res => {
      let body = '';
      res.on('data', part => body += part);
      res.on('end', () => {
        const { webPages, ...meta } = JSON.parse(body);
        const results = webPages?.value;

        const formattedResults = formatResults(results);
        // appendToFile(outputPath, formattedResults);

        resolve({
          batch: {
            source: 'coinpedia',
            results: formattedResults,
            meta: { ...meta, query }
          }
        });
      })
      res.on('error', e => {
        console.log('Error: ' + e.message);
        reject(e);
      })
    })
  })
}

function BingManager() { };

BingManager.prototype.fetchServiceData = bingWebSearch;

export default BingManager;
