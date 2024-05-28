const helpCommandReply = `To input checkin time message with these prompts,
   'hi',
   'hello',
   'morning',
   'good morning',
   'salam'
To input checkout time message with these prompts,
   'bye',
   'tata',
   'goodbye',
   'checkout'
***** Note: Your time will get recorded with the first prompts. So say hi when you are sure 😜`;

const chkInPrompts = ["hi", "hello", "morning", "good morning", "salam"];
const chkOutPrompts = ["bye", "tata", "goodbye", "checkout"];

module.exports = {
  formatDate(date) {
    return date.toString().split(" GMT")[0];
  },
  getGreeting(currentHour) {
    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning!";
    } else if (currentHour >= 12 && currentHour < 17) {
      return "Good afternoon!";
    } else {
      return "Good evening!";
    }
  },
  helpCommandReply,
  chkInPrompts,
  chkOutPrompts,
};
