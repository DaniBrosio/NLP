import dotenv from 'dotenv';
import Twitter from 'twitter-v2';
import { TWITTER } from '../../helpers/constants.js';

dotenv.config();

async function getTweets({ query, limit = 100 }) {
  console.log(`fetching (max ${limit - 1}) tweets containint "${query}"...`);
  const { data: tweets = [], meta, errors } = await this.client.get(
    'tweets/search/recent',
    {
      query: query,
      max_results: limit,
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

  return {
    batch: {
      source: TWITTER,
      tweets,
      meta: { ...meta, query }
    }
  };
};

function TwitterManager() {
  this.client = new Twitter({
    bearer_token: process.env.TWITTER_BEARER_TOKEN
  });
};

TwitterManager.prototype.fetchPublicData = getTweets;

export default TwitterManager;