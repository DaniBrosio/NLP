import dotenv from 'dotenv';
import Yargs from 'yargs';
import Twitter from 'twitter-v2';

dotenv.config();

const args = Yargs(process.argv.slice(2))
  .alias('q', 'query')
  .demandOption('q')
  .default('q', 'rikar2')
  .describe('q', 'search field')
  .string('query')
  .argv;

console.log(args);

const main = async ({ query, client = Twitter }) => {
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
    console.log('Errors:', errors);
    return;
  }
  console.log("\ntweets:");

  tweets.forEach((tweet, index) => {
    console.log(`${index + 1}) ${tweet.text}`);
  });
  console.log("\nmeta:");
  console.log(meta);
}

const getClient = () => {
  switch (args.service) {
    case 'twitter': return new Twitter({
      bearer_token: process.env.TWITTER_BEARER_TOKEN
    });
    default: return new Twitter({
      bearer_token: process.env.TWITTER_BEARER_TOKEN
    });
  }
}

const getQuery = () => args.query.length ? args.query : undefined;


main({
  query: getQuery(),
  client: getClient()
}).catch(err => console.error(err));