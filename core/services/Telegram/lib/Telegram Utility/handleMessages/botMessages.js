const { handleCheckIn, handleCheckOut } = require("../botLogic");
const { chkInPrompts, chkOutPrompts } = require("../botUtility/index");

module.exports = {
  async handleNormalMessage(messageObj, chatId) {
    try {
      const messageText = messageObj.text.toLowerCase();

      if (chkInPrompts.some((prompt) => messageText.includes(prompt))) {
        const returnedObj = await handleCheckIn(messageObj, chatId);
        return { chatId: returnedObj.chatId, message: returnedObj.message };
      }

      if (chkOutPrompts.some((prompt) => messageText.includes(prompt))) {
        const returnedObj = await handleCheckOut(messageObj, chatId);
        return { chatId: returnedObj.chatId, message: returnedObj.message };
      }
    } catch (error) {
      console.error("Error handling normal message:", error);
      return { chatId: chatId, message: "There was a problem while " };
    }
  },
};
