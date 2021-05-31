import TwitterManager from "./social/twitter.js";
import RedditManager from "./social/reddit.js";
import MongodbManager from "./db/mongodb.js";


function ScrapingApi() {
  this.twitterManager = new TwitterManager();
  this.redditManager = new RedditManager();
}

function DbApi() {
  this.mongodbManager = new MongodbManager();
}

export { ScrapingApi, DbApi };