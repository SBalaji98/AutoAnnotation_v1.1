const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("express-session");

const passport = require("passport");
const app = express();
const PORT = 8080;
// Route requires
const user = require("./routes/user");
const annotation = require("./routes/annotations");

require("./passport/passport.js");

// MIDDLEWARE
app.use(morgan("dev"));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// Sessions
// app.use(
//   session({
//     secret: "annotationapplication", //pick a random string to make the hash that is generated secure
//     resave: false, //required
//     saveUninitialized: false //required
//   })
// );

// Passport
app.use(passport.initialize());
// app.use(passport.session()); // calls the deserializeUser

// Routes
app.use("/user", user);
app.use("/annotations", annotation);

// Starting Server
app.listen(PORT, () => {
  console.log(`App listening on PORT: ${PORT}`);
});
