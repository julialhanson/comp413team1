
import { MongoClient, ServerApiVersion } from 'mongodb';
// require("dotenv").config({path: "./config.env"})
const uri = process.env.ATLAS_URI || "";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(e) {
    console.error(e)
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);

let db = client.db("EyeSense");

export default db;

// // check database
// const collections = await client.db("EyeSense").collections()
// collections.forEach((collection) => console.log(collection.s.namespace.collection))
