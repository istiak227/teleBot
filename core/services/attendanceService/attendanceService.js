const status = require("../../status/statusCode");
const { db } = require("../../database");
const statusCode = require("../../status/statusCode");
// const { attempt } = require("lodash/fp");
// const { stat } = require("fs");

// function formatTimeTo12Hour(timestamp) {
//   const time = new Date(timestamp);
//   const hours = time.getHours();
//   const minutes = time.getMinutes();

//   const hours12 = hours % 12 || 12;
//   const amPm = hours < 12 ? 'am' : 'pm';

//   const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

//   return `${hours12}:${formattedMinutes} ${amPm}`;
// }

function formatTimeDifference(checkinTime, checkoutTime) {
  const inTime = new Date(checkinTime);
  const outTime = new Date(checkoutTime);
  const timeDifferenceInMilliseconds = outTime.getTime() - inTime.getTime();
  const totalMinutes = Math.floor(timeDifferenceInMilliseconds / (1000 * 60));
  console.log(totalMinutes, "minutes");
  return totalMinutes;
}

module.exports = {
  //service for getting employee list
  async getEmp(data) {
    try {
      const empList = await db.collection("Employee").find({});
      if (empList.data.length === 0) {
        return {
          status: statusCode.notFound,
          error: false,
          message: "data not found",
          data: null,
        };
      }
      return {
        status: statusCode.accepted,
        error: false,
        message: "getting employee list",
        data: empList,
      };
    } catch (error) {
      console.log("Create employye Service Error", error);
      return {
        status: 500,
        error: true,
        message: "create employee error",
        data: error,
      };
    }
  },

  //service for getting employee data
  async getEmpData(data) {
    try {
      // console.log("inside single employee summary creation service");
      // console.log(data, "data inside service");

      let startDate = new Date(data.date.startDate);
      // console.log(startDate);

      startDate.setHours(0, 0, 0, 0);
      let endDate = new Date(data.date.endDate);
      endDate.setHours(23, 59, 59, 999);
      // console.log(endDate, "end date");

      // const employees= await db.collection('Employee').find({})
      let userId = parseInt(data.userId);
      console.log(userId, "id");
      const weeksData = await db.collection("dailyAttendanceSummary").find(
        {
          date: { $gte: startDate, $lte: endDate },
          userId: userId,
        },
        {},
        0,
        0,
        {
          date: 1,
        }
      );

      if (weeksData.data.length === 0) {
        return {
          status: 404,
          message: "no data found",
          error: true,
          data: null,
        };
      }

      let weeklyData = weeksData.data;
      console.log("weeks data", weeklyData);

      let summaryMap = new Map();

      for (let i = 0; i < weeklyData.length; i++) {
        let temp = {
          userId: null,
          userName: null,
          dateList: [],
          attendanceStatus: false,
          timestamp: 0,
        };
        // let temp ={}

        if (summaryMap.has(weeklyData[i].userId)) {
          temp = summaryMap.get(weeklyData[i].userId);

          if (temp.dateList[i] !== weeklyData[i].date) {
            temp.dateList.push({
              date: weeklyData[i].date,
              checkin: weeklyData[i].checkin,
              checkout: weeklyData[i].checkout,
              absent: weeklyData[i].absent,
              spentTime: formatTimeDifference(
                weeklyData[i].checkin,
                weeklyData[i].checkout
              ),
            });
          }
        }

        temp.userId = weeklyData[i].userId;
        temp.userName = weeklyData[i].userName;
        temp.date = weeklyData[i].date;
        summaryMap.set(weeklyData[i].userId, temp);
        console.log("initi data", summaryMap);
      }

      console.log("mapper with id", summaryMap);
      console.log("whats up", summaryMap.get(965867231));

      return {
        status: statusCode.success,
        error: false,
        message: "sending daily data mmmm",
        data: Array.from(summaryMap.values())[0],
      };
    } catch (error) {
      console.log("Create employye Service Error", error);
      return {
        status: 500,
        error: true,
        message: "create employee error",
        data: error,
      };
    }
  },

  //creating employee list
  async create(data) {
    try {
      console.log(data);
      let existingEmployee = db.collection("Employee").find({});

      for (let i = 0; i < data.userId.length; i++) {
        let employeeData = {
          firstName: null,
          lastName: null,
          joinDate: null,
          userName: null,
          userId: null,
          designation: null,
          emplyeeCode: null,
          contactNum: null,
          emergencyNum: null,
          bloodGroup: null,
          address: null,
          district: null,
          division: null,
        };
        let emp = await db
          .collection("attendance")
          .findOne({ userId: data.userId[i] });
        // console.log(emp,"console emp");
        let empData = emp.data;
        employeeData.userId = empData.userId;
        employeeData.userName = empData.userName;
        // console.log(employeeData,"employee data");
        let getEmp = await db
          .collection("Employee")
          .findOne({ userId: data.userId[i] });
        if (Object.keys(getEmp.data).length > 0) {
          return {
            status: 409,
            error: true,
            message: "employee already exists",
            data: null,
          };
        } else {
          let createEmployee = await db
            .collection("Employee")
            .insert(employeeData);
        }
      }
      return {
        status: statusCode.success,
        error: false,
        message: "sending employee data",
        data: [],
      };
    } catch (error) {
      console.log("Create employye Service Error", error);
      return {
        status: 500,
        error: true,
        message: "create employee error",
        data: error,
      };
    }
  },

  async crtSummary(data) {
    try {
      console.log("inside summary get service");
      console.log(data);

      if (!data) {
        return {
          status: 404,
          message: "no data found",
          error: true,
          data: null,
        };
      }

      const startDate = new Date(data.date);
      console.log("startdate", startDate);

      startDate.setHours(6, 0, 0, 0);
      const endDate = new Date(data.date);
      endDate.setHours(23, 59, 59, 999);
      console.log("endDate", endDate);

      const employees = await db.collection("Employee").find({});

      // const dily = await db.collection("attendance");

      const dailyData = await db
        .collection("attendance")
        .find({ timestamp: { $gte: startDate, $lte: endDate } });

      // if (dailyData.data.length === 0) {
      //   return {
      //     status: 404,
      //     error: true,
      //     message: "No data found in daily data",
      //     data: null,
      //   };
      // }

      let regularData = dailyData.data;
      // let employeeMap = new Map();
      let summaryMap = new Map();
      let checkinTimestamp = null;
      let checkoutTimestamp = null;
      console.log(regularData, "regular data");

      for (let i = 0; i < employees.data.length; i++) {
        let newSummary = {
          userId: employees.data[i].userId,
          userName: employees.data[i].userName,
          date: endDate,
          checkin: null,
          checkout: null,
          attendanceStatus: false,
          // timestamp: 0,
          absent: true,
        };
        summaryMap.set(employees.data[i].userId, newSummary);
        // console.log(summaryMap,"init map")
      }

      for (let i = 0; i < regularData.length; i++) {
        // let temp={
        //   userId:null,
        //   userName:null,
        //   date:null,
        //   checkin:null,
        //   checkout:null,
        //   attendanceStatus:false,
        //   absent:false,
        //   timestamp: 0
        // }
        let temp = {};

        if (summaryMap.has(regularData[i].userId)) {
          temp = summaryMap.get(regularData[i].userId);
        }

        temp.userId = regularData[i].userId;
        temp.userName = regularData[i].userName;
        // temp.date = regularData[i].timestamp;
        // temp.attendanceStatus = false;

        if (regularData[i].type === "checkin") {
          // checkinTimestamp = regularData[i].timestamp
          // console.log(regularData[i].timestamp ,"checkin timestamp");
          temp.checkin = regularData[i].timestamp;
          temp.timestamp = temp.checkin;
          temp.spentTime = 0;
          temp.absent = false;
        }

        if (regularData[i].type === "checkout") {
          // checkoutTimestamp = regularData[i].timestamp
          temp.checkout = regularData[i].timestamp
            ? regularData[i].timestamp
            : "";
        }

        // console.log(temp.checkin,temp.checkout,"consoling checing checkout")
        if (temp.checkin && temp.checkout) {
          temp.attendanceStatus = true;
          temp.spentTime = formatTimeDifference(temp.checkin, temp.checkout);
        }
        summaryMap.set(regularData[i].userId, temp);
      }

      const existingSummary = await db
        .collection("dailyAttendanceSummary")
        .find({ timestamp: { $gte: startDate, $lte: endDate } });

      // console.log(existingSummary,"summary is here here here")

      let newSummaryList = [];
      let existingSummaryMap = new Map();

      for (let datum of existingSummary.data) {
        existingSummaryMap.set(datum.userId, datum);
      }

      for (let [userId, summary] of summaryMap.entries()) {
        if (!existingSummaryMap.has(userId)) {
          newSummaryList.push(summary);
        }
      }

      for (let datum of newSummaryList) {
        await db.collection("dailyAttendanceSummary").insert(datum);
      }

      // console.log(existingSummary,"summary is here here here");
      for (let datum of existingSummary.data) {
        let summary = summaryMap.get(datum.userId);
        console.log("Checking Datum", datum);
        let createSummary = {
          userId: summary.userId,
          userName: summary.userName,
          checkin: summary.checkin,
          checkout: summary.checkout,
          spentTime: summary.spentTime,
          timestamp: summary.date,
          attendanceStatus: summary.attendanceStatus,
        };
        console.log("Checking Status", createSummary);
        if (datum.attendanceStatus == false)
          await db
            .collection("dailyAttendanceSummary")
            .update(datum._id.toString(), createSummary);
      }

      return {
        status: statusCode.success,
        error: false,
        message: "sending daily data",
        data: Array.from(summaryMap.values()),
      };
    } catch (error) {
      console.log("get employye Service Error", error);
      return {
        status: 500,
        error: true,
        message: "get employee service error",
        data: error,
      };
    }
  },

  async getWeekly(data) {
    try {
      console.log("inside summary creation service");
      console.log(data);

      let startDate = new Date(data.startDate);
      console.log(startDate);

      startDate.setHours(0, 0, 0, 0);
      let endDate = new Date(data.endDate);
      endDate.setHours(23, 59, 59, 999);
      console.log(endDate, "end date");

      // const employees= await db.collection('Employee').find({})

      const weeksData = await db
        .collection("dailyAttendanceSummary")
        .find({ date: { $gte: startDate, $lte: endDate } }, {}, 0, 0, {
          date: 1,
        });

      if (weeksData.data.length === 0) {
        return {
          status: 404,
          message: "no data found",
          error: true,
          data: null,
        };
      }

      let weeklyData = weeksData.data;
      let summaryMap = new Map();

      for (let i = 0; i < weeklyData.length; i++) {
        let temp = {
          userId: null,
          userName: null,
          dateList: [],
          attendanceStatus: false,
          timestamp: 0,
        };
        // let temp ={}

        if (summaryMap.has(weeklyData[i].userId)) {
          temp = summaryMap.get(weeklyData[i].userId);

          if (temp.dateList[i] !== weeklyData[i].date) {
            temp.dateList.push({
              date: weeklyData[i].date,
              checkin: weeklyData[i].checkin,
              checkout: weeklyData[i].checkout,
              absent: weeklyData[i].absent,
            });
          }
        }

        temp.userId = weeklyData[i].userId;
        temp.userName = weeklyData[i].userName;
        temp.date = weeklyData[i].date;
        summaryMap.set(weeklyData[i].userId, temp);
      }

      console.log(summaryMap, "mapper with id");
      console.log(summaryMap.get(6983190593), "map");

      return {
        status: statusCode.success,
        error: false,
        message: "sending daily data mmmm",
        data: Array.from(summaryMap.values()),
      };
    } catch (error) {
      console.log("get employye Service Error", error);
      return {
        status: 500,
        error: true,
        message: "get employee service error",
        data: error,
      };
    }
  },
};
