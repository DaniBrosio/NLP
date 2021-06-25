
import dotenv from 'dotenv';
import MongoDB from 'mongodb';

dotenv.config();

const { MongoClient } = MongoDB;

async function insertNewBatch(batch) {
  await this.client.connect();
  return this.client.db("sentiment-analysis").collection("batches").insertOne(batch);
};

function MongodbManager() {
  const uri = process.env.MONGO_DB_URI;
  this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

MongodbManager.prototype.insertNewBatch = insertNewBatch;

export default MongodbManager;
