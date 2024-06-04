const { getAxiosInstance } = require("../api/axios");
const { errorHandler } = require("../api/errorhelper");

const BOT_TOKEN = process.env.MY_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const axiosInstance = getAxiosInstance(BASE_URL);

module.exports = {
  sendMessage(chatId, messageText) {
    console.log("inside send message,", chatId, messageText);
    return axiosInstance
      .get("sendMessage", {
        chat_id: chatId,
        text: messageText,
      })
      .catch((ex) => {
        errorHandler(ex, "sendMessage", "axios");
      });
  },
};
