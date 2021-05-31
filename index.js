import dotenv from 'dotenv';
import Yargs from 'yargs';
import { TWITTER, REDDIT } from './helpers/constants.js';
import { readFile } from 'fs/promises';
import { ScrapingApi, DbApi } from './services/index.js';
import https from 'https';

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

const { twitterManager, redditManager } = new ScrapingApi();
const { mongodbManager: dbManager } = new DbApi();

// arguments
const args = Yargs(process.argv.slice(2))
  .alias('q', 'query')
  .demandOption('q')
  .default('q', 'ricardo')
  .describe('q', 'search field')
  .string('query')
  .argv;

const fetchPublicData = async serviceManager => {
  const { batch } = await serviceManager.fetchPublicData({ query });
  const { insertedCount } = await dbManager.insertNewBatch(batch);
  console.log(`inserted ${insertedCount} documents`);
};

function bingWebSearch(query) {
  https.get({
    hostname: BING_CUSTOM_SEARCH_ENDPOINT,
    path: `/v7.0/custom/search?q=${encodeURIComponent(query)}&customconfig=${BING_CUSTOM_SEARCH_ENGINE_ID}&mkt=en-US`,
    headers: { 'Ocp-Apim-Subscription-Key': BING_CUSTOM_SEARCH_API_KEY },
  }, res => {
    let body = '';
    res.on('data', part => body += part);
    res.on('end', () => {
      for (var header in res.headers) {
        if (header.startsWith("bingapis-") || header.startsWith("x-msedge-")) {
          console.log(header + ": " + res.headers[header])
        }
      }
      console.log('\nJSON Response:\n');
      console.dir(JSON.parse(body), { colors: true, depth: 5 });
    })
    res.on('error', e => {
      console.log('Error: ' + e.message);
      throw e;
    })
  })
}

const query = args.query?.length ? args.query : undefined;

const getServiceManager = {
  [TWITTER]: twitterManager,
  [REDDIT]: redditManager
};

(async () => {
  try {
    const keywords = JSON.parse(await readFile(new URL('./keywords.json', import.meta.url)));
    console.log("keywords:\n", keywords);

    bingWebSearch(keywords[0].name)

    const serviceManager = getServiceManager[args.service];
    if (!serviceManager) throw new Error('no service specified');

    // fetchPublicData(serviceManager);
  } catch (err) {
    console.error(err);
  }
})();

