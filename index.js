import fs from 'fs';
import dotenv from 'dotenv';
import Yargs from 'yargs';
import Twitter from 'twitter-v2';
import Snoowrap from 'snoowrap';
import { TWITTER, REDDIT } from './helpers/constants.js';

dotenv.config();

const args = Yargs(process.argv.slice(2))
  .argv;
// .alias('q', 'query')
// .demandOption('q')
// .default('q', 'rikar2')
// .describe('q', 'search field')
// .string('query')
// .argv;

console.log(args.service);

const getFromTwitter = async ({ query, client }) => {
  const { data: tweets, meta, errors } = await client.get(
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
};

const getFromReddit = async ({ query, client }) => {
  const postIds = await client.getHot('wallstreetbets', { limit: 2 })
    .map(post => post.id);

  const commentsPromises = postIds.map(id => client.getSubmission(id).expandReplies({ limit: 100, depth: 0 }))
  const comments = await Promise.all(commentsPromises);

  const bodies = comments[0].comments.filter(c => c.body.includes('hold')).map((comment, index) => `${index + 1}) ${comment.body}`);
  
  console.log("\ncomments:");
  console.log(bodies);

  fs.writeFile('output.txt', JSON.stringify(bodies), () => {
    console.log('archivo creado!')
  });
};

const getTwitterClient = () => new Twitter({
  bearer_token: process.env.TWITTER_BEARER_TOKEN
});

const getRedditClient = () => new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

const query = args.query?.length ? args.query : undefined;

const main = () => {
  switch (args.service) {
    case TWITTER: {
      getFromTwitter({
        query,
        client: getTwitterClient()
      }).catch(err => console.error(err));
      return;
    }
    case REDDIT: {
      getFromReddit({
        query,
        client: getRedditClient()
      }).catch(err => console.error(err));
      return;
    }
  }
};


main();

