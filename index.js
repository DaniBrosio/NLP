require('dotenv').config();
var Twitter = require('twitter-v2');

async function main() {
  const client = new Twitter({
    bearer_token: process.env.TWITTER_BEARER_TOKEN
  });

  const { data: tweets, meta, errors } = await client.get(
    'tweets/search/recent',
    {
      query: 'ricardo fort',
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
    console.log('Errors:', errors);
    return;
  }
  console.log("\ntweets: \n");

  tweets.forEach((tweet, index) => {
    console.log(`${index + 1}) ${tweet.text}`);
  });
  console.log("\nmeta: \n");
  console.log(meta);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}