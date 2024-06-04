const { getAxiosInstance } = require("./api/axios");
const { errorHandler } = require("./api/errorhelper");
const { handleCommand } = require("./handleCommands/index");
const { handleNormalMessage } = require("./handleMessages/index");
const BOT_TOKEN = process.env.MY_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const axiosInstance = getAxiosInstance(BASE_URL);

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
      const returnedObj = await handleCommand(messageObj, chatId);
      return sendMessage(returnedObj.chatId, returnedObj.message);
    }
    const returnedObj = await handleNormalMessage(messageObj, chatId);
    return sendMessage(returnedObj.chatId, returnedObj.message);
  } catch (error) {
    errorHandler(error, "handleMessage");
  }
}

module.exports = { sendMessage, handleMessage };
