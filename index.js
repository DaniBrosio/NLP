import dotenv from 'dotenv';
import Yargs from 'yargs';
import { TWITTER, REDDIT, BING, GNEWS } from './helpers/constants.js';
import { readFile } from 'fs/promises';
import { ScrapingApi, DbApi } from './services/index.js';

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

const fetchServiceData = async serviceManager => {
  const keywords = JSON.parse(await readFile(new URL('./keywords.json', import.meta.url)));
  const query = args.query?.length ? args.query : keywords[0].name;

  const { batch } = await serviceManager.fetchServiceData({ query });

  try {
    const { insertedCount } = await dbManager.insertNewBatch(batch);
    console.log(`inserted ${insertedCount} documents`);
  } catch (error) {
    console.error('failed inserting batch', error);
  }
};

const getServiceManager = {
  [TWITTER]: twitterManager,
  [REDDIT]: redditManager,
  [BING]: bingManager,
  [GNEWS]: gnewsManager
};

(async () => {
  try {
    const serviceManager = getServiceManager[args.service];
    if (!serviceManager) throw new Error('no service specified');

    fetchServiceData(serviceManager);
  } catch (err) {
    console.error(err);
  }
})();

