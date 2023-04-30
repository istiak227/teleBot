const express = require('express');
const { MongoClient } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const mongodbUri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME;

// Set up MongoDB client
const client = new MongoClient(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Set up Telegram bot
const bot = new TelegramBot(telegramBotToken, { polling: true });
const attendanceCollection = client.db(databaseName).collection('attendance');

bot.on('message', async (msg) => {
  if (msg.text === 'good morning' || msg.text === 'hello') {
    const timestamp = new Date(msg.date * 1000);
    const today = new Date().setHours(0, 0, 0, 0);

    const existingRecord = await attendanceCollection.findOne({
      userId: msg.from.id,
      timestamp: { $gte: new Date(today) },
      type: 'checkin',
    });

    if (existingRecord) {
      console.log(`User ${msg.from.id} has already checked in today at ${existingRecord.timestamp}`);
      bot.sendMessage(msg.chat.id, `Hi, ${msg.from.first_name}, you have already checked in today at ${existingRecord.timestamp}`);
      return;
    }

    console.log(`User ${msg.from.id} checked in at ${timestamp}`);

    await attendanceCollection.insertOne({
      userId: msg.from.id,
      timestamp,
      type: 'checkin',
    });

    bot.sendMessage(msg.chat.id, `Hi, ${msg.from.first_name}, it's ${timestamp} Good Morning! It's nice to have you here!`,);
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



// Start the server
async function startServer() {
  await connectToDatabase();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
