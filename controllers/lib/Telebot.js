
// const dotenv = require('dotenv');
// dotenv.config();
// const { db } = require('../../database')
// const { getAxiosInstance } = require("../../../middleware/axios");
// const { errorHandler } = require("../../../helper/helper");
// const message = require("../../status/message");
// const { duplicate } = require("../duplication");
// const publicView = require("./publicView");
// const summaryView = require("./summeryView");

// const { getWeeklyAttendanceSummary,getMonthlyAttendanceSummary} = require("../utils/attendanceSummary");
// const { ObjectId } = require('mongodb');



// const url = process.env.BASE_URL
// const token = process.env.TELEGRAM_BOT_TOKEN
// databaseName = process.env.DATABASE_NAME

// let attendanceCollection = "attendance";
// let attenSummeryCollection = "attenSummery";



// const telegram_url = ${url}/bot${token}
// //  const telegram_url = "https://api.telegram.org/bot6814546836:AAGLU_rWFnE3r4LO1AF3QaGVDnhESVXLlxk"


// const axiosInstance = getAxiosInstance(telegram_url);
// // console.log("axios",axiosInstance)


// // function sendMessage(chatId, messageText) {

// //   return axiosInstance.get("sendMessage", {
// //     chat_id: chatId,
// //     text: messageText
// //   }, { timeout: 5000 })



// //     .catch((ex) => {
// //       errorHandler(ex, "sendMessage", "axios");
// //     });
// // }



// // function formatWeeklyMessage(weeklySummary) {
// //   if (weeklySummary.totalCheckIns === 0) {
// //     return "No attendance records found for the past week.";
// //   }

// //   let message = "<b>Weekly Attendance Summary:</b>\n\n";
// //   message += "<b>Date | Check-in | Check-out | Total Hours</b>\n";

// //   const { checkInTime, checkOutTime, totalHours } = weeklySummary;
// //   const startDate = checkInTime.toLocaleDateString('en-US');
// //   const endDate = checkOutTime.toLocaleDateString('en-US');

// //   message += ${startDate} - ${endDate} | ${formatTime(checkInTime)} | ${formatTime(checkOutTime)} | ${totalHours}\n;

// //   return message;
// // }





// // send message start


// function sendMessage(chatId, messageText, retryCount = 3) {
//   return new Promise((resolve, reject) => {
//     function sendMessageAttempt(attempt) {
//       axiosInstance.get("sendMessage", {
//         chat_id: chatId,
//         text: messageText
//       }, { timeout: 5000 })
//         .then(response => resolve(response))
//         .catch(error => {
//           errorHandler(error, "sendMessage", "axios");
//           if (attempt < retryCount) {
//             console.log(Retrying... Attempt ${attempt + 1});
//             sendMessageAttempt(attempt + 1);
//           } else {
//             reject(error);
//           }
//         });
//     }

//     sendMessageAttempt(0);
//   });
// }


// /// send message end 



// async function handleMessage(messageObj) {


//   const messageText = messageObj.text || "";

//   if (!messageText) {
//     errorHandler("No message text", "handleMessage");
//     return "";
//   }


//   try {

//     const chatId = messageObj.chat.id;
//     const first_name = messageObj.from.first_name
//     const last_name = messageObj.from.last_name
//     const location = messageObj.location

//     const time = messageObj.date

//     const date = new Date(time * 1000);
//     const local = date.toLocaleString()

//     const formatDate = (date) => {
//       return date ? date.toString().split(' GMT')[0] : '';
//     };
//     // special command logic  start 

//     if (messageText.charAt(0) === "/") {
//       const command = messageText.substr(1);
//       switch (command) {
//         case "weekly":
        
//             try {
//                 let weeklySummary = await getWeeklyAttendanceSummary(chatId);
//               return sendMessage(chatId,Hi, ${first_name} , This week you worked ${weeklySummary} hours. 👏);

//             } catch (error) {
//               return sendMessage(chatId,Sorry!! ${first_name} ,Failed to retrieve weekly attendance summary.);
//             }

//         case "monthly":
//           try {
//             let monthlySummary = await getMonthlyAttendanceSummary(chatId);
//           return sendMessage(chatId,Hi, ${first_name} , This month you worked ${monthlySummary} hours. 👏);

// > Arafat 17th Cse:
// } catch (error) {
//           return sendMessage(chatId,Sorry!! ${first_name} ,Failed to retrieve weekly attendance summary.);
//         }

//         case "help":
//           const helpMessage = Hi ${first_name}! Here are some commands you can use:\n\n +
//           "/weekly - Get your weekly working hours.\n" +
//           "/monthly - Get your monthly working hours.\n" +
//           "Hi/Hello/Salam/morning/good morning/checkin - Check-in for office.\n" +
//           "Bye/tata/checkout/goodbye - Check-out from office.\n" +
//           "***** Note: Your time will get recorded with the first prompts. So say hi when you are sure 😜"
          
      
//          return sendMessage(chatId, helpMessage);



//         default:
//           return sendMessage(chatId, "hey hi,i don't know that command.plz type agian !");
//       }
//     }



//     // special command logic  end




//     // checkin logic start 

//     if (message.chkInPrompts.some(prompt => messageText?.toLowerCase().includes(prompt))) {

//       const currentTime = new Date();
//       const currentHour = currentTime.getHours();
//       let greeting = '';

//       if (currentHour >= 5 && currentHour < 12) {
//         greeting = message.morning;
//       } else if (currentHour >= 12 && currentHour < 17) {
//         greeting = message.afternoon;
//       } else {
//         greeting = message.evening;
//       }

//       const timestamp = new Date(messageObj.date * 1000);
//       const today = new Date().setHours(0, 0, 0, 0);

  


      

//       let existingRecord = await duplicate.has(attendanceCollection, {
//         userName: first_name,
//         userId: chatId,
//         checkInTime: { $gte: new Date(today) },
        
//       });
//       // console.log("a", existingRecord);



//       if (existingRecord) {

//         let test={
//           userName: first_name,
//           userId: chatId,
//           checkInTime: { $gte: new Date(today) },
//           checkIn: true,
//         checkOut:false
//         }
        
//         // console.log("test",test);
//         let result = await db.collection(attendanceCollection).findOne(test,publicView);
  
//         if (result.data.checkIn==true && result.data.checkOut==false){

//           return sendMessage(chatId, Hi, ${first_name}, you have already checked in today at ${formatDate(result.data.checkInTime)}.);
//         }else{

//           return sendMessage(chatId, Sorry  ${first_name}, You already  checked in at ${formatDate(result.data.checkInTime)} and checked out at ${formatDate(result.data.checkOutTime)}.);

//         }
          


//         }
       




//     let  insertData = {
//         userName: first_name,
//         userId: chatId,
//         checkInTime: timestamp,
//         checkOutTime:"",
//         checkIn: true,
//         checkOut:false,
//         totalHours:0
//       }


//       await db
//         .collection(attendanceCollection)
//         .insert(insertData, publicView);
//       return sendMessage(chatId, Hi! 👋🏻 ${first_name}, it's ${formatDate(timestamp)} ${greeting} It's nice to have you here!);
//     }




//     // checkin logic end  

//     // checkout logic start 

//     if (message.chkOutPrompts.some(prompt => messageText?.toLowerCase().includes(prompt))) {
//       const timestamp = new Date(messageObj.date * 1000);
//       const today = new Date().setHours(0, 0, 0, 0);
      

//       let checkinRecord  = await duplicate.has(attendanceCollection, {
          
//          userName: first_name,
//         userId: chatId,
//         checkInTime: { $gte: new Date(today) },

//       });

//       // console.log("checking",checkinRecord);

//       if (!checkinRecord) {
//         return sendMessage(chatId, Hi, ${first_name}, you have not checked in yet today!);
        
//       }





//       if (checkinRecord) {

//         let key={
//           userName: first_name,
//           userId: chatId,
//           checkInTime: { $gte: new Date(today) },
//           checkIn: true,
//           checkOut:false
//         }
        
//         // console.log(key,"key")
//         let result = await db
//         .collection(attendanceCollection)
//         .findOne(key, publicView);

//         let checkingData=result.data
//         console.log("checking",checkingData)


//       if(checkingData.checkInTime){
