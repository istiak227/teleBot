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


const chkInPrompts = [
  'hi',
  'hello',
  'morning',
  'good morning',
  "salam"

]

const chkOutPrompts = [
  'bye',
  'tata',
  'goodbye',
  'checkout'
]



bot.on('message', async (msg) => {

  if (msg.text?.includes('/help')) {
    bot.sendMessage(
      msg.chat.id,
      `To input checkin time mention the @choto_bot_bot with these prompts,
      'hi',
      'hello',
      'morning',
      'good morning',
      'salam'
To input checkout time mention the @choto_bot_bot with these prompts,
      'bye',
      'tata',
      'goodbye',
      'checkout'
***** Note: Your time will get recorded with the first prompts. So say hi when you are sure 😜
      `
    );

  }

  const formatDate = (date) => {
    return date.toString().split(' GMT')[0];
  };


  //  Remove this comment for Production & Main Bot
  // if (msg.text?.includes('@choto_bot_bot')) {
  if (chkInPrompts.some(prompt => msg.text?.toLowerCase().includes(prompt))) {

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

    //console.log(`User ${msg.from.id} checked in at ${formatDate(timestamp)}`);

    await attendanceCollection.insertOne({
      userName: msg.from.first_name,
      userId: msg.from.id,
      timestamp,
      type: 'checkin',
    });

    bot.sendMessage(msg.chat.id, `Hi! 👋🏻 ${msg.from.first_name}, it's ${formatDate(timestamp)} Good Morning! It's nice to have you here!`);

  } if (chkOutPrompts.some(prompt => msg.text?.toLowerCase().includes(prompt))) {
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
      timestamp: { $gte: new Date(today) },
      type: 'checkin',
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
        userName: msg.from.first_name,
        userId: msg.from.id,
        chkInTime: checkinRecord.timestamp,
        chkOutTime: timestamp,
        totalHours: `${totalHours}.${remainingMinutes}`
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

  if (msg.text?.includes('/mysum')) {
    try {
      const userId = msg.from.id;
      const records = await attenSummeryCollection.find().toArray();
      let userArray = [];
      records.map(data => {
        data.attendance.map(finalData => {
          if (finalData.userId === userId) {
            const dateString = finalData.chkInTime;
            const date = new Date(dateString);
            const day = date.getDate();
            const month = date.getMonth() + 1; // Add 1 to the month because it is zero-indexed
            const formattedDate = `${day}/${month}`;

            const formattedData = {
              date: formattedDate,
              inTime: finalData.chkInTime ? finalData.chkInTime.toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric' }).replace(':', '') : '---',
              outTime: finalData.chkOutTime ? finalData.chkOutTime.toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric' }).replace(':', '') : '---',
              totalTime: finalData.totalHours ? finalData.totalHours : '---'
            };
            userArray.push(formattedData);
          }
        });
      });

      let message = `<b>Attendance Summary of ${msg.from.first_name}</b>\n\n`;
      message += '<b>Date | In | Out | Total</b>\n';

      userArray.forEach(data => {
        const { date, inTime, outTime, totalTime } = data;
        //const formattedDate = date.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit' }).replace('/', '-');
        const formattedDate = date;
        message += `${formattedDate} | ${inTime} | ${outTime} | ${totalTime}\n`;
      });

      bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' });

    } catch (error) {
      console.error('Failed to get attendance records:', error);
      bot.sendMessage(msg.chat.id, 'Failed to get attendance records');
    }
  }

  // }
  // Remove this comment for Production & Main Bot


});



app.get('/attendance/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const records = await attenSummeryCollection.find().toArray();
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
