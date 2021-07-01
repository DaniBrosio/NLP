
import dotenv from 'dotenv';
import Snoowrap from 'snoowrap';
import { REDDIT } from '../../helpers/constants.js';

dotenv.config();

async function getComments({ query, limit = 2, repliesLimit = 100, repliesDpth = 0 }) {
  const postIds = await this.client.getHot('wallstreetbets', { limit: 10 })
    .map(post => post.id);

  const commentsPromises = postIds.map(async id => {
    return this.client.getSubmission(id).expandReplies({ limit: 10, depth: 10 })
  });
  const commentsFromAllPosts = await Promise.all(commentsPromises);

  const bodies = commentsFromAllPosts.map(({ comments }, postIndex) => comments.filter(c => c.body.includes(query)).map((comment) => ({ postIndex, text: comment.body }))).flat();

  return {
    batch: {
      source: REDDIT,
      results: bodies,
      meta: { postIds, query }
    }
  };
};

async function getNewComments({ crypto, limit = 100 }) {
  const comments = await this.client.getNewComments(crypto.subreddit, { amount: limit });
  const parsedComments = Array.from(comments.map(({ body, ...meta }) => ({ text: body, meta })));

  return {
    batch: {
      coin: crypto.acronym,
      source: REDDIT,
      results: parsedComments,
      meta: { query: crypto }
    }
  };
}

function RedditManager() {
  this.client = new Snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });

  this.client.config({ requestDelay: 1000, continueAfterRatelimitError: true, warnings: true });
}

RedditManager.prototype.fetchServiceData = getNewComments;

export default RedditManager;
