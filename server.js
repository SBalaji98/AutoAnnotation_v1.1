const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const passport = require("passport");
const app = express();
const PORT = process.env.PORT || 8080;
// Route requires
const routers = require("./routes/routers");

require("./passport/passport.js");

// MIDDLEWARE
app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// Passport
app.use(passport.initialize());

// Routes
app.use("/", routers);

// Starting Server
app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});
