const { getAxiosInstance } = require("./axios");
const { errorHandler } = require("./errorhelper");
const { handleCommand } = require("./handleCommands/index");
const { handleCheckIn, handleCheckOut } = require("./botLogic/index");
const { botMessages } = require("./handleMessages/index");
const BOT_TOKEN = process.env.MY_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const axiosInstance = getAxiosInstance(BASE_URL);

const chkInPrompts = ["hi", "hello", "morning", "good morning", "salam"];
const chkOutPrompts = ["bye", "tata", "goodbye", "checkout"];

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
      console.log("commanding");

      const returnedObj = await handleCommand(messageObj, chatId);
      return sendMessage(returnedObj.chatId, returnedObj.message);
    }

    // const returnedObj = await botMessages(messageObj, chatId);
    // return sendMessage(returnedObj.chatId, returnedObj.message);
    if (
      chkInPrompts.some((prompt) => messageText?.toLowerCase().includes(prompt))
    ) {
      const returnedObj = await handleCheckIn(messageObj, chatId);
      return sendMessage(returnedObj.chatId, returnedObj.message);
    }

    if (chkOutPrompts.some((prompt) => messageText.includes(prompt))) {
      console.log("checkout");
      const returnedObj = await handleCheckOut(messageObj, chatId);
      return sendMessage(returnedObj.chatId, returnedObj.message);
    }
  } catch (error) {
    errorHandler(error, "handleMessage");
  }
}

module.exports = { sendMessage, handleMessage };
