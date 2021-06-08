import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { GNEWS } from '../../helpers/constants.js';
import { appendToFile } from '../../helpers/files.js';

dotenv.config();

const GNEWS_API_KEY = process.env['GNEWS_API_KEY'];

if (!GNEWS_API_KEY) {
  throw new Error('GNEWS_API_KEY is not set.');
}

const outputPath = 'output/news.md';

const formatArticle = article =>
  `# ${article.title}\n
  #### *${article.publishedAt}*\n
  ${article.content}\n
  [link](${article.url})\n
  __________________________________\n`;

async function getNews({ query }) {
  const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&token=${GNEWS_API_KEY}`);
  const { articles, ...meta} = await response.json();
  const formattedArticles = articles.map(formatArticle);
  appendToFile(outputPath, formattedArticles);
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
