const { getAxiosInstance } = require("../api/axios");
const { errorHandler } = require("../api/errorhelper");

const Bot_Token = process.env.TRAIDEASCHOTO_BOT;
const Telegram_URL=process.env.TELEGRAM_URL;
const BASE_URL = `${Telegram_URL}${Bot_Token}`;
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
