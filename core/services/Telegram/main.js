// const {
//   handleMessage,
// } = require("./lib/Telegram Utility/messageSender/Telegram");

// module.exports = {
//   async handler(msg, mehtod) {
//     try {
//       console.log("inside handler", req.body);
//       const { body } = req;
//       if (body) {
//         const messageObj = body.message;
//         await handleMessage(messageObj);
//       }
//       return;
//     } catch (error) {
//       console.log(error, "error in main js");
//       return {
//         status: 500,
//         error: true,
//         message: "Internal handler method error",
//         data: error,
//       };
//     }
//   },
// };

const { handleCommand } = require("./lib/Telegram Utility/handleCommands/index");
const { handleNormalMessage } = require("./lib/Telegram Utility/handleMessages/index");

module.exports = {
  async handler(messageObj) {
    try {
      const messageText = messageObj.text || "";
      const chatId = messageObj.chat.id;
      if (messageText.startsWith("/")) {
        const commandResponse = await handleCommand(messageObj, chatId);
        return { message: commandResponse };
      }
      const messageResponse = await handleNormalMessage(messageObj, chatId);
      return { message: messageResponse };
    } catch (error) {
      console.error("Error in handler:", error);
      return {
        message: "An internal error occurred. Please try again later."
      };
    }
  },
};

