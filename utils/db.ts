import { MongoClient, Collection, Db, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

if (!uri) console.error('[db] no "MONGODB_URI" environment variable found ;-;');

const client: MongoClient = new MongoClient(uri!, options);
await client.connect();
const db: Db = client.db(process.env.MONGODB_DB);
const userCollection: Collection = db.collection('users');
export default userCollection;