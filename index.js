const express = require("express");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const cors = require("cors");
require("dotenv").config();
const app = express();
const mongoDB = require("./database/mongoDB")();
const dataPipe = require("./middleware/mongodb.middleware")(mongoDB);
const router = require("./routerManager");
const dbHelper = require("./helpers/dbHelper");
const port = process.env.PORT || 8000;
const cookieParser = require("cookie-parser");

app.use(cors({ origin: "*" }));
app.use(cookieParser());

app.use(express.json());

//bot start
const TelegramBot = require("node-telegram-bot-api");
const botServices = require("./core/services/Telegram/main");

const Bot_Token = process.env.TRAIDEASCHOTO_BOT;
const bot = new TelegramBot(Bot_Token, { polling: true });


bot.on("message", async (msg) => {
  try {
    const response = await botServices.handler(msg);
    console.log("response",response)
    if (response && response.message) {
      bot.sendMessage(response.message.chatId, response.message.message);
    }
  } catch (err) {
    console.error("Error processing message:", err);
    bot.sendMessage(msg.chat.id, "An error occurred. Please try again later.");
  }
});

//bot end

async function run() {
  try {
    this.app = app;
    this.dbCall = "databaseCall";
    app.on(this.dbCall, async (...args) => {
      return await dbHelper(dataPipe, ...args);
    });

    // app.use(authenticateToken)
    router();
  } finally {
  }
}

run().catch();

app.listen(port, () => {
  console.log(port);
});
