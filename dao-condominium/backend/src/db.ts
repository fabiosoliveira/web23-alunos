import dotenv from "dotenv";
dotenv.config();
import { MongoClient, Db, ServerApiVersion } from "mongodb";

let singleton: Db;

const username = encodeURIComponent(process.env.MONGO_USER as string);
const password = encodeURIComponent(process.env.MONGO_PASSWORD as string);

const uri_connection = `mongodb+srv://${username}:${password}@fabioteste.7iby2.mongodb.net/?retryWrites=true&w=majority`;
const db_name = process.env.MONGO_DATABASE as string;

export default async (): Promise<Db> => {
  if (singleton) {
    return singleton;
  }

  const client = new MongoClient(uri_connection, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  singleton = client.db(db_name);

  await client.connect();

  return singleton;
};
