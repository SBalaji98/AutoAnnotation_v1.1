const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const app = express();
let { mongoose } = require("./mongodb/mongoose");
const PORT = process.env.PORT || 8080;
// Route requires
const routers = require("./routes/routers");
const mongo_routers = require("./routes/mongo_router");
require("./passport/passport.js");
const path = require("path");

//Static

app.use(express.static(path.join(__dirname, "client", "build")));
res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));

// MIDDLEWARE
app.use(morgan("dev"));

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
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
