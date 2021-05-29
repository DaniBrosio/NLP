import TwitterManager from "./twitter.js";
import RedditManager from "./reddit.js";

function ScrapingApi() {
  this.twitterManager = new TwitterManager();
  this.redditManager = new RedditManager();
}

export default ScrapingApi;