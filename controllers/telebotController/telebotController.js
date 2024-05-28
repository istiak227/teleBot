const statusCode = require("../../core/status/statusCode");
const botServices = require("../../core/services/Telegram/main");

const createErrorMessage = (message, data) => {
  return {
    status: statusCode,
    data: data,
    message: message,
    error: true,
  };
};

module.exports = {
  async botController(req, res) {
    try {
      // console.log("Controller", req);
      let response = await botServices.handler(req);
      return res.status(200).send(response);
    } catch (err) {
      console.log(err);
      let newError = createErrorMessage();
      newError.status = statusCode.internalServerError;
      newError.message = "User Control Service Internal Server Error";
      return res.status(statusCode).send(newError);
    }
  },
};
