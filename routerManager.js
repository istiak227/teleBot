const attendanceRoutes = require("./routes/attendanceRoutes");

module.exports = function () {
  app.use("/home", (req, res) => {
    return res.status(200).json("runnin server");
  });
  app.use("/api/v1/summary", attendanceRoutes);
};
