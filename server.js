const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const app = express();
let { mongoose } = require("./mongodb/mongoose");
const PORT = process.env.PORT || 8080;
// Route requires
const routers = require("./routes/routers");
const cors = require("cors");
const mongo_routers = require("./routes/mongo_router");
require("./passport/passport.js");
const path = require("path");

//Static

app.use(express.static(path.join(__dirname, "client", "build")));

// enables cors
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
  })
);

// MIDDLEWARE
app.use(morgan("dev"));

app.use(
  bodyParser.urlencoded({
    limit: "1500mb",
    extended: false,
  })
);
app.use(bodyParser.json({ limit: "1500mb" }));
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));

// Passport
app.use(passport.initialize());

// Routes
app.use("/", routers);
app.use("/", mongo_routers);

// Starting Server
app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});
