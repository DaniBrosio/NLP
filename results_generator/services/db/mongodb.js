
import dotenv from 'dotenv';
import MongoDB from 'mongodb';
import { DateTime } from 'luxon';

dotenv.config();

const { MongoClient } = MongoDB;

async function insertNewBatch(batch) {
  await this.connection;
  return this.client.db("sentiment-analysis").collection("batches").insertOne(batch);
};

async function getBatches() {
  await this.connection;
  return this.client.db("sentiment-analysis").collection("batches").find({});
}

async function getAvailableBatches() {
  await this.connection;
  return this.client.db("sentiment-analysis").collection("batches").find({ state: 'VIRGIN' });
}

async function setBatchState(_id, newState) {
  await this.connection;
  return this.client.db("sentiment-analysis").collection("batches").updateOne(
    { _id },
    {
      $set: { state: newState },
      $currentDate: { lastModified: true }
    });
}

function setAsProcessed(_id) {
  return this.setBatchState(_id, 'PROCESSED');
}

function setAsIgnored(_id) {
  return this.setBatchState(_id, 'IGNORED');
}

async function getCollection(name) {
  await this.connection;
  return this.client.db("sentiment-analysis").collection(name);
}

async function watchCollection(db, coll, onUpdate) {
  console.log(`watching collection: '${coll}'`);
  const connection = await this.connection;
  connection.db(db).collection(coll).watch({ resumeAfter: this.resumeToken })
    .on('change', data => {
      onUpdate(data);
      this.resumeToken = data?._id;
    })
    .on('error', err => {
      console.log(DateTime.now().minus({ minutes: 1 }) + ' error: ' + err);
      this.watchCollection(con, coll);
    });
}

async function watchBatches(onUpdate) {
  await this.connection;
  this.watchCollection('sentiment-analysis', 'batches', onUpdate);
}

async function publishResult (result) {
  await this.connection;
  return this.client.db("sentiment-analysis").collection("results").insertOne(result);
};

function MongodbManager() {
  const uri = process.env.MONGO_DB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  this.resumeToken = null;
  this.client = client;
  this.connection = client.connect();
}

MongodbManager.prototype.insertNewBatch = insertNewBatch;
MongodbManager.prototype.getBatches = getBatches;
MongodbManager.prototype.getAvailableBatches = getAvailableBatches;
MongodbManager.prototype.getCollection = getCollection;
MongodbManager.prototype.watchCollection = watchCollection;
MongodbManager.prototype.watchBatches = watchBatches;
MongodbManager.prototype.setBatchState = setBatchState;
MongodbManager.prototype.setAsIgnored = setAsIgnored;
MongodbManager.prototype.setAsProcessed = setAsProcessed;
MongodbManager.prototype.publishResult = publishResult;

export default MongodbManager;
