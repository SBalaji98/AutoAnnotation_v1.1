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
    try {
      var userInfo = {
        username: req.user.username
      };
      res.send(userInfo);
    } catch (e) {
      res.send(e);
    }
  }
);

router.get("/", (req, res, next) => {
  try {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.json({ user: null });
    }
  } catch (e) {
    throw e;
  }
});

router.post("/logout", (req, res) => {
  try {
    if (req.user) {
      req.logout();
      res.send({ msg: "logging out" });
    } else {
      res.send({ msg: "no user to log out" });
    }
  } catch (e) {
    throw e;
  }
});

router.get("/image-data", async (req, res) => {
  try {
    if (req.user) {
      aws.config.setPromisesDependency();
      const resp = await s3Controller.getObjectList(req.user.userName);
      res.json(resp.Contents);
    }
  } catch (e) {
    throw e;
  }
});

router.get("/image", async (req, res) => {
  try {
    await s3Controller.getListedObject(req, res);
  } catch (e) {
    throw e;
  }
});

module.exports = router;
