module.exports = {
  async getAttendance(data) {
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
};
