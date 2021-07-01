import dotenv from 'dotenv';
import Yargs from 'yargs';
import { HOSTED_URLS, TWITTER, REDDIT, BING, GNEWS } from './helpers/constants.js';
import { readFile } from 'fs/promises';
import { ScrapingApi, DbApi } from './services/index.js';
import SentimentPredictor from './services/sentiment/sentiment.js';
import { DateTime } from 'luxon';
import { getCryptoPrice } from './services/market/cryptoCompare.js';
import cron from 'node-cron';

dotenv.config();

const { twitterManager, redditManager, bingManager, gnewsManager } = new ScrapingApi();
const { mongodbManager: dbManager } = new DbApi();

// arguments
const args = Yargs(process.argv.slice(2))
  .alias('c', 'coin-index')
  .demandOption('c')
  .default('c', 0)
  .describe('c', 'coin # 0-19')
  .number('coin-index')
  .argv;

/**
 * Loads the pretrained model and metadata, and registers the predict
 * function with the UI.
 */
const setupSentiment = async () => {
  console.log('Model available: ' + HOSTED_URLS.model);
  return new SentimentPredictor().init(HOSTED_URLS);
};

const fetchServiceData = async (crypto, serviceManager) => {
  const { batch } = await serviceManager.fetchServiceData({ crypto });

  const analyzedBatch = await performSentimentAnalysis(batch);
  const { summary, coin, source, meta, state, ..._rest } = analyzedBatch || {};
  const compressedBatch = { summary, coin, source, meta, state };

  try {
    const { insertedCount } = await dbManager.insertNewBatch(compressedBatch);
    console.log(`inserted ${insertedCount} documents`);
  } catch (error) {
    console.error('failed inserting batch', error);
  }
};

const getPrediction = score => {
  if (score < 0.25) return 'NEGATIVE';
  if (score < 0.75) return 'NEUTRAL';
  return 'POSITIVE';
};

const performSentimentAnalysis = async ({ results, ...batch }) => {
  try {
    const predictor = await setupSentiment();
    const analyzedResults = await results.map(
      result => ({
        ...batch,
        rawSource: result.text,
        analysis: predictor.predict(result.text),
      }));

    const averageScore = analyzedResults.reduce((acc, r) => acc + r.analysis.score, 0) / results.length;
    const prediction = getPrediction(averageScore);
    const batchTimePrice = await getCryptoPrice(batch.coin);
    const analyzedBatch = {
      summary: {
        source: batch.source,
        coin: batch.coin,
        averageScore,
        prediction,
        batchTimePrice,
        timestamp: DateTime.now().toISO()
      },
      ...batch,
      state: 'VIRGIN',
      results
    };
    return analyzedBatch;
  } catch (error) {
    console.error('failed predicting', error);
  }
};

const getServiceManager = {
  [TWITTER]: twitterManager,
  [REDDIT]: redditManager,
  [BING]: bingManager,
  [GNEWS]: gnewsManager
};

var coinIterator = 0;

console.log(`setting up schedule`);
const interval = process.env.TIME_WINDOW;
console.log("interval", interval)
const task = cron.schedule(`*/${interval} * * * *`, async () => {
  const keywords = JSON.parse(await readFile(new URL('./keywords.json', import.meta.url)));
  for (let coinIterator = 0; coinIterator <= keywords.length; coinIterator++) {
    console.log(`browsing opinions for ${keywords[coinIterator].name}...`);

    await launch(TWITTER, keywords[coinIterator]);
    await launch(REDDIT, keywords[coinIterator]);
    await launch(BING, keywords[coinIterator]);

    if (coinIterator >= keywords.length) coinIterator = 0;
    await delay(10000);
  }
}, {
  scheduled: true,
  timezone: "America/Argentina/Buenos_Aires"
});

const launch = async (service, keyword) => {
  try {

    const serviceManager = getServiceManager[service];
    if (!serviceManager) throw new Error('no service specified');

    return fetchServiceData(keyword, serviceManager);
  } catch (err) {
    console.error(err);
  }
}