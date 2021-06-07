import TwitterManager from "./social/twitter.js";
import RedditManager from "./social/reddit.js";
import BingManager from "./search/bing.js";
import MongodbManager from "./db/mongodb.js";
import GnewsApi from "./news/gnews.js";


function ScrapingApi() {
  this.twitterManager = new TwitterManager();
  this.redditManager = new RedditManager();
  this.bingManager = new BingManager();
  this.gnewsManager = new GnewsApi();
}

function DbApi() {
  this.mongodbManager = new MongodbManager();
}

export { ScrapingApi, DbApi };