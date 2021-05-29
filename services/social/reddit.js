
import dotenv from 'dotenv';
import fs from 'fs';
import Snoowrap from 'snoowrap';

dotenv.config();

async function getComments({ query, limit = 2, repliesLimit = 100, repliesDpth = 0 }) {
  const postIds = await this.client.getHot('wallstreetbets', { limit })
    .map(post => post.id);

  const commentsPromises = postIds.map(id => this.client.getSubmission(id).expandReplies({ limit: repliesLimit, depth: repliesDpth }))
  const comments = await Promise.all(commentsPromises);

  const bodies = comments[0].comments.filter(c => c.body.includes(query)).map((comment, index) => `${index + 1}) ${comment.body}`);

  console.log("\ncomments:");
  console.log(bodies);

  fs.writeFile('output.txt', JSON.stringify(bodies), () => {
    console.log('archivo creado!')
  });
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

RedditManager.prototype.getComments = getComments;

export default RedditManager;
