import dotenv from 'dotenv';
import Twitter from 'twitter-v2';

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

  // mongoClient.connect(err => {
  //   if (err) throw err;

  //   storeNewBatch({ source: args.service, tweets, meta: { ...meta, query } })
  //     .then(result => {
  //       console.log(result);
  //     });
  // });
};

function TwitterManager() {
  this.client = new Twitter({
    bearer_token: process.env.TWITTER_BEARER_TOKEN
  });
};

TwitterManager.prototype.getTweets = getTweets;

export default TwitterManager;