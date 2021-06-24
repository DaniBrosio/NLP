import dotenv from 'dotenv';
import Yargs from 'yargs';
import { HOSTED_URLS, TWITTER, REDDIT, BING, GNEWS } from './helpers/constants.js';
import { readFile } from 'fs/promises';
import { ScrapingApi, DbApi } from './services/index.js';
import SentimentPredictor from './services/sentiment/sentiment.js';

dotenv.config();

const { twitterManager, redditManager, bingManager, gnewsManager } = new ScrapingApi();
const { mongodbManager: dbManager } = new DbApi();

// arguments
const args = Yargs(process.argv.slice(2))
  .alias('q', 'query')
  .demandOption('q')
  .default('q', 'ricardo')
  .describe('q', 'search field')
  .string('query')
  .argv;

/**
 * Loads the pretrained model and metadata, and registers the predict
 * function with the UI.
 */
async function setupSentiment() {
  console.log('Model available: ' + HOSTED_URLS.model);
  return new SentimentPredictor().init(HOSTED_URLS);
}

const fetchServiceData = async (crypto, serviceManager) => {
  const { batch } = await serviceManager.fetchServiceData({ crypto, limit: 10 });

  const analyzedBatch = await performSentimentAnalysis(batch);
  console.log(JSON.stringify(analyzedBatch, null, 2));
  try {
    const { insertedCount } = await dbManager.insertNewBatch(analyzedBatch);
    console.log(`inserted ${insertedCount} documents`);
  } catch (error) {
    console.error('failed inserting batch', error);
  }
};

const performSentimentAnalysis = async ({ results, ...batch }) => {
  try {
    const predictor = await setupSentiment();
    const analyzedBatch = {
      ...batch,
      results: results.map(
        result => ({
          ...batch,
          rawSource: result.text,
          analysis: predictor.predict(result.text)
        }))
    };
    analyzedBatch.results.map(r => console.log("\n\n[ANALYSIS]: ", r.analysis, "\n[RAW_SOURCE]: ", r.rawSource));
    return analyzedBatch;
  } catch (error) {
    console.error('failed predicting', error);
  }
}

const getServiceManager = {
  [TWITTER]: twitterManager,
  [REDDIT]: redditManager,
  [BING]: bingManager,
  [GNEWS]: gnewsManager
};

(async () => {
  try {
    const keywords = JSON.parse(await readFile(new URL('./keywords.json', import.meta.url)));

    const serviceManager = getServiceManager[args.service];
    if (!serviceManager) throw new Error('no service specified');

    fetchServiceData(keywords[3], serviceManager);
  } catch (err) {
    console.error(err);
  }
})();

