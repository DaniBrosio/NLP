
import dotenv from 'dotenv';
import MongoDB from 'mongodb';

dotenv.config();

const { MongoClient } = MongoDB;

async function getAvailableResults(coin) {
  await this.connection;
  return this.client.db("sentiment-analysis").collection("results").find({ state: 'VIRGIN', coin, source: {$ne : null}});
}

async function setResultState(_id, newState) {
  await this.connection;
  return this.client.db("sentiment-analysis").collection("results").updateOne(
    { _id },
    {
      $set: { state: newState },
      $currentDate: { lastModified: true }
    });
}

function setAsProcessed(_id) {
  return this.setResultState(_id, 'PROCESSED');
}

function setAsIgnored(_id) {
  return this.setResultState(_id, 'IGNORED');
}

function MongodbManager() {
  const uri = process.env.MONGO_DB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  this.client = client;
  this.connection = client.connect();
}

MongodbManager.prototype.getAvailableResults = getAvailableResults;
MongodbManager.prototype.setResultState = setResultState;
MongodbManager.prototype.setAsIgnored = setAsIgnored;
MongodbManager.prototype.setAsProcessed = setAsProcessed;

export default MongodbManager;
