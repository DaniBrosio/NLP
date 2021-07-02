
import dotenv from 'dotenv';
import MongoDB from 'mongodb';

dotenv.config();

const { MongoClient } = MongoDB;

async function insertNewBatch(batch) {
  await this.connection;
  return this.client.db("sentiment-analysis").collection("batches").insertOne(batch);
};

function MongodbManager() {
  const uri = process.env.MONGO_DB_URI;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  this.client = client;
  this.connection = client.connect();
}

MongodbManager.prototype.insertNewBatch = insertNewBatch;

export default MongodbManager;
