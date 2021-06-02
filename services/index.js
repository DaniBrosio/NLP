import TwitterManager from "./social/twitter.js";
import RedditManager from "./social/reddit.js";
import BingManager from "./search/bing.js";
import MongodbManager from "./db/mongodb.js";


function ScrapingApi() {
  this.twitterManager = new TwitterManager();
  this.redditManager = new RedditManager();
  this.bingManager = new BingManager();
}

function DbApi() {
  this.mongodbManager = new MongodbManager();
}

export { ScrapingApi, DbApi };