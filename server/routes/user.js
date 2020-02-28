const express = require("express");
const aws = require("aws-sdk");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/user");
const s3Controller = require("../S3-bucket/s3.controller");

router.post("/", userController.create);

router.post("/login", (req, res, next) => {
  userController.userLogin(req, res, next);
});

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

router.put("/update", async (req, res) => {
  try {
    if (req.user) {
      let updateUser = userController.update(req, res);
      res.json({ response: updateUser });
    }
  } catch (e) {
    res.json({ error: e });
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

router.get("/image-data", async (req, res, next) => {
  passport.authenticate("jwt", (err, user, info) => {
    if (err) {
      console.log(err);
    }
    if (info !== undefined) {
      console.log(info.message);
      res.status(401).send(info.message);
    } else {
      console.log("successfully called");

      console.log(user);

      // if (req) {
      //   console.log(req);
      //   aws.config.setPromisesDependency();
      //   const resp = await s3Controller.getObjectList(req.user.userName);
      //   res.json(resp.Contents);
      // } else {
      //   res.json({ error: "undefined user" });
      // }
    }
  })(req, res, next);
});

router.get("/image", async (req, res) => {
  try {
    await s3Controller.getListedObject(req, res);
  } catch (e) {
    throw e;
  }
});

module.exports = router;
