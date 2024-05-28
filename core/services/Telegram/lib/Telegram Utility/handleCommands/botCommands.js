const { createSummary } = require("../summaryData");
const { helpCommandReply } = require("../botUtility/index");

module.exports = {
  async handleCommand(command, chatId) {
    console.log("before i start saying hi, ", command, chatId);
    switch (command) {
      case "start":
        return { chatId, message: "hi how can i help you" };
      case "help":
        console.log("help log");
        return { chatId, message: `${helpCommandReply}` };
      case "attendance":
        const attendanceData = await createSummary({
          date: new Date("2024-05-28"),
        });
        console.log(attendanceData);
        if (attendanceData.status === 409) {
          return {
            chatId,
            message: `Already generated attendance summary for ${new Date().toLocaleDateString(
              "en-GB"
            )}`,
          };
        } else if (attendanceData.status === 404) {
          return { chatId, message: `Not enough data to create Summary` };
        } else if (attendanceData.status === 200) {
          return {
            chatId,
            message: `Created attendance summary for ${new Date().toLocaleDateString(
              "en-GB"
            )}`,
          };
        }
        break;
      default:
        return { chatId, message: "hi how can i help you" };
    }
  },
};
