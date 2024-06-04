const { createSummary } = require("../commandServices/summaryData");
const { helpCommandReply } = require("../botUtility/index");

module.exports = {
  async handleCommand(command, chatId) {
    const Botcommand = command.text.substr(1);
    switch (Botcommand) {
      case "start":
        return { chatId, message: "hi how can i help you" };
      case "help":
        console.log("help log");
        return { chatId, message: `${helpCommandReply}` };
      case "attendance":
        //if not from istiak vai /limon vai or/ sakib vai
        if (
          command.from.id === 1401694380 ||
          command.from.id === 1446184753 ||
          command.from.id === 1446184753
        ) {
          const attendanceData = await createSummary({
            date: new Date(),
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
        } else {
          return {
            chatId,
            message: `you dont have the authority to use this command`,
          };
        }

        break;
      default:
        return { chatId, message: "hi how can i help you" };
    }
  },
};
