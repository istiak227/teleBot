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
const attenSummeryCollection = client.db(databaseName).collection('attenSummery');


bot.on('message', async (msg) => {

  const formatDate = (date) => {
    return date.toString().split(' GMT')[0];
  };

  if (msg.text === 'good morning' || msg.text === 'hello') {
    // check-in logic // ----------------->
    const timestamp = new Date(msg.date * 1000);
    const today = new Date().setHours(0, 0, 0, 0);

    const existingRecord = await attendanceCollection.findOne({
      userName: msg.from.first_name,
      userId: msg.from.id,
      timestamp: { $gte: new Date(today) },
      type: 'checkin',
    });

    if (existingRecord) {
      bot.sendMessage(msg.chat.id, `Hi, ${msg.from.first_name}, you have already checked in today at ${formatDate(existingRecord.timestamp)}.`);
      return;
    }

    console.log(`User ${msg.from.id} checked in at ${formatDate(timestamp)}`);

    await attendanceCollection.insertOne({
      userName: msg.from.first_name,
      userId: msg.from.id,
      timestamp,
      type: 'checkin',
    });

    bot.sendMessage(msg.chat.id, `Hi! 👋🏻 ${msg.from.first_name}, it's ${formatDate(timestamp)} Good Morning! It's nice to have you here!`);

  } else if (msg.text === 'good bye' || msg.text === 'checkout' || msg.text === 'bye') {
    // check-out login // ------------------->
    const timestamp = new Date(msg.date * 1000);
    const today = new Date().setHours(0, 0, 0, 0);

    const existingCheckOutRecord = await attendanceCollection.findOne({
      userName: msg.from.first_name,
      userId: msg.from.id,
      timestamp: { $gte: new Date(today) },
      type: "checkout"
    })

    const checkinRecord = await attendanceCollection.findOne({
      userName: msg.from.first_name,
      userId: msg.from.id,
      timestamp: { $lt: timestamp },
      type: "checkin",
    })

    if (existingCheckOutRecord) {
      bot.sendMessage(msg.chat.id, `Hi, ${msg.from.first_name}, You have already checked out today at ${formatDate(existingCheckOutRecord.timestamp)}.`)
      return
    }

    if (!checkinRecord) {
      bot.sendMessage(msg.chat.id, `Hi, ${msg.from.first_name}, you have not checked in yet today!`);
      return
    }

    if (checkinRecord) {
      const totalMillis = timestamp.getTime() - checkinRecord.timestamp.getTime();
      const totalMinutes = Math.round(totalMillis / (1000 * 60));
      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      const totalTime = `${totalHours} hours ${remainingMinutes} minutes`;

      await attendanceCollection.insertOne({
        userName: msg.from.first_name,
        userId: msg.from.id,
        timestamp,
        type: 'checkout',
      });

      const userSummery = {
        userId: msg.from.id,
        chkInTime: checkinRecord.timestamp,
        chkOutTime: timestamp,
        totalHours: totalHours
      }

      const existingSummary = await attenSummeryCollection.findOne({ date: today })

      if (existingSummary) {
        const existingUserIndex = existingSummary.attendance.findIndex(
          (attendance) => attendance.userId === msg.from.id
        );
        if (existingUserIndex === -1) {
          existingSummary.attendance.push(userSummery);
        } else {
          existingSummary.attendance[existingUserIndex] = userSummery;
        }
        await attenSummeryCollection.updateOne(
          { _id: existingSummary._id },
          { $set: { attendance: existingSummary.attendance } }
        )
      } else {
        const newSummary = {
          date: today,
          attendance: [userSummery],
        };
        await attenSummeryCollection.insertOne(newSummary);
      }



      bot.sendMessage(msg.chat.id, `Bye! 👋🏻 ${msg.from.first_name}, You checked in at ${formatDate(checkinRecord.timestamp)} and checked out at ${formatDate(timestamp)}. Your total time today is ${totalTime}.`);

    }




  }
});


// Helper functions to format date and time
function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatTime(date) {
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  return date.toLocaleTimeString('en-US', options);
}



app.get('/attendance/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log(userId)
    // Find all the documents that contain attendance records for the given user
    const records = await attenSummeryCollection.find().toArray();
    // console.log(records.length)
    let userArray = []
    records.map(data => {
      data.attendance.map(finalData => {
        if (finalData.userId === userId) {
          userArray.push(finalData)
        }
      }
      )
    })

    res.send(userArray);
  } catch (error) {
    console.error('Failed to get attendance records:', error);
    res.status(500).send('Failed to get attendance records');
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
