import { MongoClient, Db, ServerApiVersion } from "mongodb";

let singleton: Db;

const uri_connection = process.env.MONGO_CONNECTION as string;
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
