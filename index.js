import dotenv from 'dotenv';
import Yargs from 'yargs';
import MongoDB from 'mongodb';
import { TWITTER, REDDIT } from './helpers/constants.js';
import ScrapingApi from './services/index.js';

dotenv.config();
const { twitterManager, redditManager } = new ScrapingApi();

// arguments
const args = Yargs(process.argv.slice(2))
  .alias('q', 'query')
  .demandOption('q')
  .default('q', 'ricardo')
  .describe('q', 'search field')
  .string('query')
  .argv;

// db
const { MongoClient } = MongoDB;
const uri = process.env.MONGO_DB_URI;
const mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
mongoClient.connect(async err => {
  const docs = await mongoClient.db("rawdata").collection("batches").countDocuments();
  console.log(docs)
  // perform actions on the collection object
  // mongoClient.close();
});

const storeNewBatch = batch => mongoClient.db("rawdata").collection("batches").insertOne(batch);

// main
const query = args.query?.length ? args.query : undefined;

(() => {
  try {
    switch (args.service) {
      case TWITTER: return twitterManager.getTweets({ query })
      case REDDIT: return redditManager.getComments({ query })
      default: {
        console.log('Main program not implemented yet. Please try running one of the commands specified in the README.md')
      }
    }
  } catch (err) {
    console.error(err);
  }
})()

