const statusCode = require("../../core/status/statusCode");
const attendanceService = require("../../core/services/attendanceService/index");

const createErrorMessage = (message, data) => {
  return {
    status: statusCode,
    data: data,
    message: message,
    error: true,
  };
};

module.exports = {
  async createTable(req, res) {
    try {
      // console.log("Controller", req);
      let response = await attendanceService.create(req.body);
      return res.status(200).send(response);
    } catch (err) {
      console.log(err);
      let newError = createErrorMessage();
      newError.status = statusCode.internalServerError;
      newError.message = "User Control Service Internal Server Error";
      return res.status(statusCode).send(newError);
    }
  },

  async createSummary(req, res) {
    try {
      console.log("Controller", req);
      let response = await attendanceService.crtSummary(req.body);
      return res.status(response.status).send(response);
    } catch (err) {
      console.log(err);
      let newError = createErrorMessage();
      newError.status = statusCode.internalServerError;
      newError.message = "User Control Service Internal Server Error";
      return res.status(statusCode).send(newError);
    }
  },

  async getWeeklySummary(req, res) {
    try {
      // console.log("Controller",req)
      let response = await attendanceService.getWeekly(req.body);
      return res.status(response.status).send(response);
    } catch (err) {
      console.log(err);
      let newError = createErrorMessage();
      newError.status = statusCode.internalServerError;
      newError.message = "User Control Service Internal Server Error";
      return res.status(statusCode).send(newError);
    }
  },

  async getEmployee(req, res) {
    try {
      // console.log("Controller",req)
      let response = await attendanceService.getEmp(req.body);
      return res.status(response.status).send(response);
    } catch (err) {
      console.log(err);
      let newError = createErrorMessage();
      newError.status = statusCode.internalServerError;
      newError.message = "User Control Service Internal Server Error";
      return res.status(statusCode).send(newError);
    }
  },

  async getEmpDataList(req, res) {
    try {
      console.log("Controller", req.body);
      let response = await attendanceService.getEmpData(req.body);
      return res.status(response.status).send(response);
    } catch (err) {
      console.log(err);
      let newError = createErrorMessage();
      newError.status = statusCode.internalServerError;
      newError.message = "User Control Service Internal Server Error";
      return res.status(statusCode).send(newError);
    }
  },
};
