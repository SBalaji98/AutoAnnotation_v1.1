const express = require("express");
const aws = require("aws-sdk");
const router = express.Router();
const User = require("../database/models/user");
const passport = require("../passport");
const jsonConfig = require("../../config.json");

//create a s3 Object with s3 User ID and Key
const s3 = new aws.S3({
  accessKeyId: jsonConfig.aws.accessKeyId,
  secretAccessKey: jsonConfig.aws.secretAccessKey
});

router.post("/", (req, res) => {
  console.log("user signup");

  const { username, password } = req.body;
  console.log(username);
  // ADD VALIDATION
  User.findOne({ username: username }, (err, user) => {
    // console.log(user);
    if (err) {
      console.log("User.js post error: ", err);
    } else if (user) {
      res.json({
        error: `Sorry, already a user with the username: ${username}`
      });
    } else {
      console.log("new");
      const newUser = new User({
        username: username,
        password: password
      });
      newUser.save((err, savedUser) => {
        if (err) return res.json(err);
        res.json(savedUser);
      });
    }
  });
});

router.post(
  "/login",
  function(req, res, next) {
    console.log("routes/user.js, login, req.body: ");
    console.log(req.body);
    next();
  },
  passport.authenticate("local"),
  (req, res) => {
    console.log("logged in", req.user);
    var userInfo = {
      username: req.user.username
    };
    res.send(userInfo);
  }
);

router.get("/", (req, res, next) => {
  console.log("===== user!!======");
  console.log(req.user);
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

router.post("/logout", (req, res) => {
  if (req.user) {
    req.logout();
    res.send({ msg: "logging out" });
  } else {
    res.send({ msg: "no user to log out" });
  }
});

router.get("/image-data", async (req, res) => {
  aws.config.setPromisesDependency();

  const resp = await s3
    .listObjectsV2({ Bucket: "annotation-app-images" })
    .promise();

  res.json(resp.Contents);
});

router.get("/image", async (req, res) => {
  var getParams = {
    Bucket: "annotation-app-images",
    Key: req.query.key
  };

  //Fetch or read data from aws s3
  await s3.getObject(getParams, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      res.write(data.Body, "binary");
      res.end(null, "binary");
    }
  });
});

debugger;

module.exports = router;
