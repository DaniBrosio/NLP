import dotenv from 'dotenv';
import https from 'https';
import { BING } from '../../helpers/constants.js';
import { appendToFile } from '../../helpers/files.js';

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

const formatResult = result =>
  `# ${result.name}\n
  #### *${result.datePublishedDisplayText}*
  ${result.snippet}\n
  [link](${result.url})\n
  __________________________________\n`;

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

        const formattedResults = results.map(formatResult);
        appendToFile(outputPath, formattedResults);

        resolve({
          batch: {
            source: BING,
            results,
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
