const BOT_TOKEN = process.env.MY_BOT_TOKEN;
const LOCAL_PORT = process.env.PORT || 8000;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?`;
const axios = require("axios");
const ngrok = require("ngrok");
module.exports = {
  async setupWebhook() {
    try {
      // Step 1: Start ngrok and get the public URL
      const url = await ngrok.connect(LOCAL_PORT);
      console.log(`ngrok tunnel "${url}" -> "http://localhost:${LOCAL_PORT}"`);

      const response = await axios.get(`${TELEGRAM_API_URL}url=${url}`);

      if (response.data.ok) {
        console.log("Webhook set successfully.");
      } else {
        console.log(`Failed to set webhook: ${response.data.description}`);
      }
    } catch (error) {
      console.error("Error setting up webhook:", error);
      throw error;
    }
  },
};
