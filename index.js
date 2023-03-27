const express = require('express');
const { MongoClient } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const mongodbUri = process.env.MONGODB_URI;
const database = process.env.DATABASE_NAME

const bot = new TelegramBot(telegramBotToken, { polling: true });

const client = new MongoClient(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });
try {

  client.connect();

  const db = client.db(database)
  console.log("Database connected")

  const attendanceCollection = db.collection('attendance');

  bot.on('message', async (msg) => {
    if (msg.text === 'good morning' || msg.text === 'hello') {
      const timestamp = new Date(msg.date * 1000);

      console.log(`User ${msg.from.id} checked in at ${timestamp}`);

      await attendanceCollection.insertOne({
        userId: msg.from.id,
        timestamp,
        type: 'checkin',
      });

      bot.sendMessage(msg.chat.id, `Hi, ${msg.from.first_name}, Good Morning! It's nice to have you here!`,);
    } else if (msg.text === 'good bye' || msg.text === 'checkout') {
      const timestamp = new Date(msg.date * 1000);

      console.log(`User ${msg.from.id} checked out at ${timestamp}`);

      await attendanceCollection.insertOne({
        userId: msg.from.id,
        timestamp,
        type: 'checkout',
      });

      bot.sendMessage(msg.chat.id, 'Bye! See you again');
    }
  });
  

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
}
catch (e) {
  console.error(e);
}



