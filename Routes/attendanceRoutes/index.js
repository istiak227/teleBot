const express = require("express");
const router = express.Router();
const {
  createSummary,
  createTable,
  getWeeklySummary,
  getEmployee,
  getEmpDataList,
} = require("../../controllers/attendacneSummary/index");

router.post("/crt", createTable);
router.post("/createSummary", createSummary);
router.post("/getWeekly", getWeeklySummary);
router.get("/getEmployee", getEmployee);
router.post("/getEmpdata", getEmpDataList);

module.exports = router;
