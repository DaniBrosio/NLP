import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'node-fetch';
import util from 'util';
import { GNEWS } from '../../helpers/constants.js';

dotenv.config();

const GNEWS_API_KEY = process.env['GNEWS_API_KEY'];

if (!GNEWS_API_KEY) {
  throw new Error('GNEWS_API_KEY is not set.');
}

const outputPath = 'output/news.md';

const appendContent = util.promisify(fs.appendFile);

const formatArticle = article =>
  `# ${article.title}\n
  ${article.content}\n
  [link](${article.url})\n
  __________________________________\n`;

const appendArticlesToFile = (articles, path = '/') => {
  console.log(`exporting ${articles.length} articles...`);
  articles.map(async (article, idx) => {
    await appendContent(path, formatArticle(article));
    console.log(`exported article ${idx} to output/news.md`);
  });
};

async function getNews({ query }) {
  console.log(query);
  const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&token=${GNEWS_API_KEY}`);
  const { articles, ...meta} = await response.json();
  appendArticlesToFile(articles, outputPath);
  return {
    batch: {
      source: GNEWS,
      articles,
      meta: { ...meta, query }
    }
  }
}

function GnewsApi() { };

GnewsApi.prototype.fetchServiceData = getNews;

export default GnewsApi;
