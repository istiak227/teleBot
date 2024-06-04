const { errorHandler } = require("../api/errorhelper");
const { handleCommand } = require("../handleCommands/index");
const { handleNormalMessage } = require("../handleMessages/index");
const { sendMessage } = require("./sender");

async function handleMessage(messageObj) {
  const messageText = messageObj.text || "";
  if (!messageText) {
    errorHandler("No message text", "handleMessage");
    return "";
  }
  try {
    const chatId = messageObj.chat.id;

    if (messageText.charAt(0) === "/") {
      //calling commands for handling commands
      const returnedObj = await handleCommand(messageObj, chatId);
      return sendMessage(returnedObj.chatId, returnedObj.message);
    }
    //calling normal messages for handling normal messages
    const returnedObj = await handleNormalMessage(messageObj, chatId);
    return sendMessage(returnedObj.chatId, returnedObj.message);
  } catch (error) {
    errorHandler(error, "handleMessage");
    return {
      status: 500,
      error: true,
      message: "error inside handle message method",
      data: error,
    };
  }
}

module.exports = { sendMessage, handleMessage };
