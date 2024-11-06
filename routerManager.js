const attendanceRoutes = require("./Routes/attendanceRoutes");
const telebotRoutes = require("./Routes/telebotRoutes/index");
module.exports = function () {
  app.use("/home", (req, res) => {
    return res.status(200).json("runnin server");
  });
  app.use("/", telebotRoutes);
  app.use("/api/v1/summary", attendanceRoutes);
};
