const TelegramBot = require("node-telegram-bot-api");
const botServices = require("../../core/services/Telegram/main");

const Bot_Token = process.env.TRAIDEASCHOTO_BOT;
const bot = new TelegramBot(Bot_Token, { polling: true });

// Listen for all types of messages
bot.on("message", async (msg) => {
  try {
    console.log("messege",msg)
    // Process the message
    const response = await botServices.handler(msg);

    // Check if the response contains a message to send back
    if (response && response.message) {
      bot.sendMessage(msg.chat.id, response.message);
    }
  } catch (err) {
    console.error("Error processing message:", err);
    bot.sendMessage(msg.chat.id, "An error occurred. Please try again later.");
  }
});
