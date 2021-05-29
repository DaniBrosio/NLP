import fs from 'fs';
import dotenv from 'dotenv';
import Yargs from 'yargs';
import Twitter from 'twitter-v2';
import Snoowrap from 'snoowrap';
import MongoDB from 'mongodb';
import { TWITTER, REDDIT } from './helpers/constants.js';

dotenv.config();

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

// twitter
const getFromTwitter = async ({ query, client }) => {
  console.log(`fetching tweets containint "${query}"...`);
  const { data: tweets = [], meta, errors } = await client.get(
    'tweets/search/recent',
    {
      query: query,
      max_results: 100,
      tweet: {
        fields: [
          'created_at',
          'entities',
          'in_reply_to_user_id',
          'public_metrics',
          'referenced_tweets',
          'source',
          'author_id',
        ],
      },
    }
  );

  console.log(`fetched ${tweets.length} tweets`);

  if (errors) {
    console.error('Errors:', errors);
    return;
  }

  console.log("\ntweets:");

  tweets.forEach((tweet, index) => {
    console.log(`${index + 1}) ${tweet.text}`);
  });
  console.log("\nmeta:");
  console.log(meta);

  mongoClient.connect(err => {
    if (err) throw err;

    storeNewBatch({ source: args.service, tweets, meta: { ...meta, query } })
      .then(result => {
        console.log(result);
      });
  });
};

const getTwitterClient = () => new Twitter({
  bearer_token: process.env.TWITTER_BEARER_TOKEN
});

// reddit
const getFromReddit = async ({ query, client }) => {
  const postIds = await client.getHot('wallstreetbets', { limit: 2 })
    .map(post => post.id);

  const commentsPromises = postIds.map(id => client.getSubmission(id).expandReplies({ limit: 100, depth: 0 }))
  const comments = await Promise.all(commentsPromises);

  const bodies = comments[0].comments.filter(c => c.body.includes(query)).map((comment, index) => `${index + 1}) ${comment.body}`);

  console.log("\ncomments:");
  console.log(bodies);

  fs.writeFile('output.txt', JSON.stringify(bodies), () => {
    console.log('archivo creado!')
  });
};

const getRedditClient = () => new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

// main
const query = args.query?.length ? args.query : undefined;

(() => {
  switch (args.service) {
    case TWITTER: {
      return getFromTwitter({
        query,
        client: getTwitterClient()
      }).catch(err => console.error(err));
    }
    case REDDIT: {
      return getFromReddit({
        query,
        client: getRedditClient()
      }).catch(err => console.error(err));
    }
    default: {
      console.log('Main program not implemented yet. Please try running one of the commands specified in the README.md')
    }
  }
})();

