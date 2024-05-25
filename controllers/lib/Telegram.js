const { getAxiosInstance } = require("./axios");
const { errorHandler } = require("./errorhelper");
const {
  get,
} = require("../../core/services/attendanceService/attendanceService");
const { getAttendance } = require("./summaryData");
const { db } = require("../../core/database");
const message = require("../../core/status/message");
const { duplicate } = require("../../core/services/duplication");

const MY_Token = "6814546836:AAGLU_rWFnE3r4LO1AF3QaGVDnhESVXLlxk";
const BASE_URL = `https://api.telegram.org/bot${MY_Token}`;
const axiosInstance = getAxiosInstance(BASE_URL);

const helpCommandreply = `To input checkin time message with these prompts,
   'hi',
   'hello',
   'morning',
   'good morning',
   'salam'
To input checkout time message with these prompts,
   'bye',
   'tata',
   'goodbye',
   'checkout'
***** Note: Your time will get recorded with the first prompts. So say hi when you are sure 😜`;

function sendMessage(chatId, messageText) {
  console.log("inside send message,", chatId, messageText);
  return axiosInstance
    .get("sendMessage", {
      chat_id: chatId,
      text: messageText,
    })
    .catch((ex) => {
      errorHandler(ex, "sendMessage", "axios");
    });
}

async function handleMessage(messageObj) {
  const messageText = messageObj.text || "";

  if (!messageText) {
    errorHandler("No message text", "handleMessage");
    return "";
  }

  try {
    const chatId = messageObj.chat.id;

    if (messageText.charAt(0) === "/") {
      const command = messageText.substr(1);

      switch (command) {
        case "start":
          return sendMessage(chatId, "hi how can i help you");
        case "help":
          return sendMessage(chatId, helpCommandreply);
        case "attendance":
          const attendanceData = await getAttendance({
            date: new Date("2024-04-29"),
          });
          console.log(attendanceData);
          if (attendanceData.data === null) {
            return sendMessage(
              chatId,
              "There was a problem while generating Summary"
            );
          } else {
            return sendMessage(
              chatId,
              `Created attendance summary for ${new Date().toLocaleDateString(
                "en-GB"
              )}`
            );
          }
        default:
          return sendMessage(chatId, "Sorry I do not know any such command");
      }
    } else {
      return sendMessage(chatId, messageText);
    }
  } catch (error) {
    errorHandler(error, "handleMessage");
  }
}

module.exports = { sendMessage, handleMessage };
