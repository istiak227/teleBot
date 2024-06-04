const {
  handleMessage,
} = require("./lib/Telegram Utility/messageSender/Telegram");

module.exports = {
  async handler(req, mehtod) {
    try {
      // console.log("inside handler", req.body);
      const { body } = req;
      if (body) {
        const messageObj = body.message;
        await handleMessage(messageObj);
      }
      return;
    } catch (error) {
      console.log(error, "error in main js");
    }
  },
};
