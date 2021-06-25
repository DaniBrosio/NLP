import fs from 'fs';
import util from 'util';

const appendContent = util.promisify(fs.appendFile);

export const appendToFile = (path = '/', articles) => {
  console.log(`exporting ${articles.length} articles...`);
  articles.map(async (article, idx) => {
    await appendContent(path, article);
    console.log(`exported article ${idx} to output/news.md`);
  });
};
