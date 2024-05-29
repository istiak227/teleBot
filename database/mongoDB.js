const { MongoClient } = require("mongodb");
const {
  setupWebhook,
} = require("../core/services/Telegram/lib/TelegramWebHookSetup/botConnection");
require("dotenv").config();

const uri = process.env.DB_CONNECTION;
const database = process.env.DATABASE_NAME;

module.exports = function () {
  console.log(uri, "uri");

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    client.connect();

    const data = client.db(database);
    console.log("Database connected");
    setupWebhook();
    return data;
    // return await client
  } catch (e) {
    console.error(e);
  }
};
