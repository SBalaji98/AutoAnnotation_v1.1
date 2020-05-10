"use strict";

var express = require("express");

var bodyParser = require("body-parser");

var morgan = require("morgan");

var passport = require("passport");

var app = express();

var _require = require('./mongodb/mongoose'),
    mongoose = _require.mongoose;

var PORT = process.env.PORT || 8080; // Route requires

var routers = require("./routes/routers");

var mongo_routers = require("./routes/mongo_router");

require("./passport/passport.js"); // MIDDLEWARE


app.use(morgan("dev"));
app.use(bodyParser.urlencoded({
  limit: "50mb",
  extended: false
}));
app.use(bodyParser.json({
  limit: "50mb"
}));
app.use(bodyParser.raw({
  type: "application/vnd.custom-type"
})); // Passport

app.use(passport.initialize()); // Routes

app.use("/", routers);
app.use("/", mongo_routers); // Starting Server

app.listen(PORT, function () {
  console.log("App listening on PORT: ".concat(PORT));
});
