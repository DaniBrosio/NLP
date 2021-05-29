import dotenv from 'dotenv';
import { response } from 'express';
import Yargs from 'yargs';
import { TWITTER, REDDIT } from './helpers/constants.js';
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

// main
const fetchPublicData = async serviceManager => {
  const { batch } = await serviceManager.fetchPublicData({ query });
  dbManager.insertNewBatch(batch, response => {
    console.log("dbResponse:", response);
  });
};

const query = args.query?.length ? args.query : undefined;

const getServiceManager = {
  [TWITTER]: twitterManager,
  [REDDIT]: redditManager
};

(() => {
  try {
    const serviceManager = getServiceManager[args.service];
    if (!serviceManager) throw new Error('no service specified');

    fetchPublicData(serviceManager);
  } catch (err) {
    console.error(err);
  }
})()

