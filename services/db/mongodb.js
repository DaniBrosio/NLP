
import dotenv from 'dotenv';
import MongoDB from 'mongodb';

dotenv.config();

const { MongoClient } = MongoDB;
// const mongoClient =
//   mongoClient.connect(async err => {
//     const docs = await mongoClient.db("rawdata").collection("batches").countDocuments();
//     console.log(docs)
//     // perform actions on the collection object
//     // mongoClient.close();
//   });

async function insertNewBatch(batch, cb) {
  this.client.connect(async err => {
    if (err) throw new Error(err);
    const { insertedCount } = await this.client.db("rawdata").collection("batches").insertOne(batch);
    if(cb) cb(insertedCount);
  });

};

function MongodbManager() {
  const uri = process.env.MONGO_DB_URI;
  this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  // this.client.connect(async err => {
  //   const docs = await mongoClient.db("rawdata").collection("batches").countDocuments();
  //   console.log(docs)
  //   // perform actions on the collection object
  //   // mongoClient.close();
  // }); 
}

MongodbManager.prototype.insertNewBatch = insertNewBatch;

export default MongodbManager;
