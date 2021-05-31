import dotenv from 'dotenv';
import Yargs from 'yargs';
import { TWITTER, REDDIT } from './helpers/constants.js';
import { readFile } from 'fs/promises';
import { ScrapingApi, DbApi } from './services/index.js';

dotenv.config();

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

const query = args.query?.length ? args.query : undefined;

const getServiceManager = {
  [TWITTER]: twitterManager,
  [REDDIT]: redditManager
};

(async () => {
  try {
    const keywords = JSON.parse(await readFile(new URL('./keywords.json', import.meta.url)));
    console.log("keywords:\n",keywords);

    const serviceManager = getServiceManager[args.service];
    if (!serviceManager) throw new Error('no service specified');

    fetchPublicData(serviceManager);
  } catch (err) {
    console.error(err);
  }
})();

