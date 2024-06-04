const express = require("express");
const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const cors = require("cors");
require("dotenv").config();
const app = express();
const mongoDB = require("./database/mongoDB")();
const dataPipe = require("./middleware/mongodb.middleware")(mongoDB);
const router = require("./routerManager");
const dbHelper = require("./helpers/dbHelper");
const port = process.env.PORT || 8000;
const cookieParser = require("cookie-parser");

app.use(cors({ origin: "*" }));
app.use(cookieParser());

app.use(express.json());

async function run() {
  try {
    this.app = app;
    this.dbCall = "databaseCall";
    app.on(this.dbCall, async (...args) => {
      return await dbHelper(dataPipe, ...args);
    });

    // app.use(authenticateToken)
    router();
  } finally {
  }
}

run().catch();

app.listen(port, () => {
  console.log(port);
});
