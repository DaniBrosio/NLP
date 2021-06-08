
import dotenv from 'dotenv';
import Snoowrap from 'snoowrap';
import { REDDIT } from '../../helpers/constants.js';

dotenv.config();

async function getComments({ query, limit = 2, repliesLimit = 100, repliesDpth = 0 }) {
  const postIds = await this.client.getHot('wallstreetbets', { limit })
    .map(post => post.id);

  const commentsPromises = postIds.map(id => this.client.getSubmission(id).expandReplies({ limit: repliesLimit, depth: repliesDpth }))
  const commentsFromAllPosts = await Promise.all(commentsPromises);
  const bodies = commentsFromAllPosts.map(({ comments }, postIndex) => comments.filter(c => c.body.includes(query)).map((comment) => ({ postIndex, comment: comment.body })));

  return {
    batch: {
      source: REDDIT,
      comments: bodies,
      meta: { postIds, query }
    }
  };
};

function RedditManager() {
  this.client = new Snoowrap({
    userAgent: process.env.REDDIT_USER_AGENT,
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
  });
}

RedditManager.prototype.fetchServiceData = getComments;

export default RedditManager;
