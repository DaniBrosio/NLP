import dotenv from 'dotenv';
import fs from 'fs';
import fetch from 'node-fetch';
import { GNEWS } from '../../helpers/constants.js';

dotenv.config();

const GNEWS_API_KEY = process.env['GNEWS_API_KEY'];

if (!GNEWS_API_KEY) {
  throw new Error('GNEWS_API_KEY is not set.');
}

async function getNews({ query }) {
  console.log(query);
  const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&token=${GNEWS_API_KEY}`);
  const data = await response.json();
  const coso = data.articles.map(article => fs.appendFile('output/news2.md', `# ${article.title}\n${article.content}\n[link](${article.url})\n__________________________________\n`, () => console.log('finished')));
}

function GnewsApi() { };

GnewsApi.prototype.fetchPublicData = getNews;

export default GnewsApi;
