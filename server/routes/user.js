const express = require("express");
const aws = require("aws-sdk");
const router = express.Router();
const userController = require("../controllers/user");
const passport = require("../passport");
const s3Controller = require("../S3-bucket/s3.controller");

router.post("/", userController.create);

router.post(
  "/login",
  (req, res, next) => {
    next();
  },
  passport.authenticate("local"),
  (req, res) => {
    var userInfo = {
      username: req.user.username
    };
    res.send(userInfo);
  }
);

router.get("/", (req, res, next) => {
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
  if (req.user) {
    aws.config.setPromisesDependency();

    const resp = await s3Controller.getObjectList(req.user.username);
    res.json(resp.Contents);
  }
});

router.get("/image", async (req, res) => {
  await s3Controller.getListedObject(req, res);
});

module.exports = router;
