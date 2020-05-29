"use strict";

var express = require("express");

var bodyParser = require("body-parser");

var morgan = require("morgan");

var passport = require("passport");

var app = express();

var _require = require("./mongodb/mongoose"),
    mongoose = _require.mongoose;

var PORT = process.env.PORT || 8080; // Route requires

var routers = require("./routes/routers");

var cors = require("cors");

var mongo_routers = require("./routes/mongo_router");

require("./passport/passport.js");

var path = require("path"); //Static


app.use(express["static"](path.join(__dirname, "client", "build"))); // enables cors

app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false
})); // MIDDLEWARE

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({
  limit: "1500mb",
  extended: false
}));
app.use(bodyParser.json({
  limit: "1500mb"
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
