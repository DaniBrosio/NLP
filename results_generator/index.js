import dotenv from 'dotenv';
import { DateTime } from 'luxon';
import MongodbManager from './services/db/mongodb.js';
import { getCryptoPrice } from './services/market/cryptoCompare.js';

dotenv.config();

const CRYPTOCOMPARE_API_KEY = process.env['CRYPTOCOMPARE_API_KEY'];
const TIME_WINDOW_MS = process.env.TIME_WINDOW * 60 * 1000; // N minutos
// const TIME_WINDOW_MS = process.env.TIME_WINDOW * 1000; // N segundos
const dbManager = new MongodbManager();

const onUpdate = ({ fullDocument: { _id, state, summary } = {} }) => {
  if (!_id) return; // prevents feedback loop
  console.log("[UPDATE]");
  const summaryWithDocId = { state, ...summary, docId: _id };
  handleDetectedBatch(summaryWithDocId);
};

(async () => {
  // const keywords = JSON.parse(await readFile(new URL('./keywords.json', import.meta.url)));
  // const crypto = keywords[1];
  const cursor = await dbManager.getAvailableBatches();
  const docs = await cursor.toArray();
  const summaries = docs.map(({ _id, state, summary }) => ({ state, ...summary, docId: _id }));
  console.log("[INITIAL]");
  summaries.map(summaryWithDocId => {
    handleDetectedBatch(summaryWithDocId);
  });

  dbManager.watchBatches(onUpdate);
})();

const handleDetectedBatch = summary => {
  const currentTime = DateTime.now();
  const summaryTime = DateTime.fromISO(summary.timestamp);

  const diff = currentTime.diff(summaryTime);
  console.log(`Detected batch (${summary.docId}) inserted ${diff.values?.milliseconds} ms ago`);
  handleSchedule(diff, summary);
};

const handleSchedule = (diff, summary) => {
  const wait_ms = TIME_WINDOW_MS - diff.values?.milliseconds;
  if (!wait_ms || wait_ms < 0) ignoreBatch(summary.docId);
  else {
    console.log(`waiting ${wait_ms > 1000 * 60
      ? Math.trunc(wait_ms / (1000 * 60)) + ' minutes'
      : Math.trunc(wait_ms / 1000) + ' seconds'} `);
    setTimeout(() => {
      console.log("processing: ", summary.docId);
      processBatch(summary);
    }, wait_ms);
  }
};

const ignoreBatch = async id => {
  console.log("setting as ignored:", id);
  const { result: { nModified } } = await dbManager.setAsIgnored(id);
  console.log(`ignored ${nModified} batch`);
};

const processBatch = async summary => {
  console.log("setting as processed:", summary.docId);
  const timeoutPrice = await getCryptoPrice(summary.coin);
  const toPublish = { timeoutPrice, ...summary };
  const { insertedCount } = await dbManager.publishResult(toPublish);
  console.log(`published ${insertedCount} result`);
  const { result: { nModified } } = await dbManager.setAsProcessed(summary.docId);
  console.log(`processed ${nModified} batch`);

};
