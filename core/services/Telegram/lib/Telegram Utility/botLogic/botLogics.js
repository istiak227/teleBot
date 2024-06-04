const { getGreeting } = require("../botUtility/index");
const { db } = require("../../../../../database/index");
const { formatDate } = require("../botUtility/index");

//bot logics for a custom command/or message can be written here
module.exports = {
  //logic for check in

  async handleCheckIn(messageObj, chatId) {
    try {
      const currentTime = new Date();
      const currentHour = currentTime.getHours();
      const greeting = getGreeting(currentHour);

      const timestamp = new Date(messageObj.date * 1000);
      const today = new Date().setHours(0, 0, 0, 0);

      const existingRecord = await db.collection("attendance").findOne({
        userName: messageObj.from.first_name,
        userId: messageObj.from.id,
        timestamp: { $gte: new Date(today) },
        type: "checkin",
      });
      console.log("inside message object", messageObj, chatId);

      if (existingRecord && Object.keys(existingRecord.data).length > 0) {
        return {
          chatId,
          message: `Hi, ${
            messageObj.from.first_name
          }, you have already checked in today at ${formatDate(
            existingRecord.data?.timestamp
          )}.`,
        };
      }

      await db.collection("attendance").insert({
        userName: messageObj.from.first_name,
        userId: messageObj.from.id,
        timestamp,
        type: "checkin",
      });

      return {
        chatId,
        message: `Hi! 👋🏻 ${messageObj.from.first_name}, it's ${formatDate(
          timestamp
        )} ${greeting} It's nice to have you here!`,
      };
    } catch (error) {
      console.log("error", error);
    }
  },
  async handleCheckOut(messageObj, chatId) {
    try {
      const timestamp = new Date(messageObj.date * 1000);
      const today = new Date().setHours(0, 0, 0, 0);

      const existingCheckOutRecord = await db.collection("attendance").findOne({
        userName: messageObj.from.first_name,
        userId: messageObj.from.id,
        timestamp: { $gte: new Date(today) },
        type: "checkout",
      });

      const checkinRecord = await db.collection("attendance").findOne({
        userName: messageObj.from.first_name,
        userId: messageObj.from.id,
        timestamp: { $gte: new Date(today) },
        type: "checkin",
      });

      if (
        existingCheckOutRecord &&
        Object.keys(existingCheckOutRecord.data).length > 0
      ) {
        return {
          chatId,
          message: `Hi, ${
            messageObj.from.first_name
          }, You have already checked out today at ${formatDate(
            existingCheckOutRecord.data.timestamp
          )}.`,
        };
      }

      if (!checkinRecord || Object.keys(checkinRecord.data).length <= 0) {
        return {
          chatId,
          message: `Hi, ${messageObj.from.first_name}, you have not checked in yet today!`,
        };
      }

      const totalMillis =
        timestamp.getTime() - new Date(checkinRecord.data.timestamp).getTime();
      const totalMinutes = Math.round(totalMillis / (1000 * 60));
      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      const totalTime = `${totalHours} hours ${remainingMinutes} minutes`;

      await db.collection("attendance").insert({
        userName: messageObj.from.first_name,
        userId: messageObj.from.id,
        timestamp,
        type: "checkout",
      });

      const userSummary = {
        userName: messageObj.from.first_name,
        userId: messageObj.from.id,
        chkInTime: checkinRecord.data.timestamp,
        chkOutTime: timestamp,
        totalHours: `${totalHours}.${remainingMinutes}`,
      };

      const existingSummary = await db.collection("attendance").findOne({
        date: today,
      });

      if (existingSummary && Object.keys(existingSummary.data).length > 0) {
        const existingUserIndex = existingSummary.attendance.findIndex(
          (attendance) => attendance.userId === messageObj.from.id
        );
        if (existingUserIndex === -1) {
          existingSummary.attendance.push(userSummary);
        } else {
          existingSummary.attendance[existingUserIndex] = userSummary;
        }
        await db
          .collection("attenSummery")
          .updateOne(
            { _id: existingSummary._id },
            { $set: { attendance: existingSummary.attendance } }
          );
      } else {
        const newSummary = {
          date: today,
          attendance: [userSummary],
        };
        await db.collection("attenSummery").insert(newSummary);
      }
      return {
        chatId,
        message: `Bye! 👋🏻 ${
          messageObj.from.first_name
        }, You checked in at ${formatDate(
          checkinRecord.data.timestamp
        )} and checked out at ${formatDate(
          timestamp
        )}. Your total time today is ${totalTime}.`,
      };
    } catch (error) {
      console.log(error);
    }
  },
};
