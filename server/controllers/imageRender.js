const passport = require("passport");
const s3Controller = require("../S3-bucket/s3.controller");
const aws = require("aws-sdk");

module.exports = {
  getAllImageData(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        if (err) {
          console.log(err);
        }
        if (info !== undefined) {
          console.log(info.message);
          res.status(401).send(info.message);
        } else {
          aws.config.setPromisesDependency();
          const resp = await s3Controller.getObjectList(user.userName);
          res.json(resp.Contents);
        }
      }
    )(req, res, next);
  },
  renderImageById(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        if (err) {
          console.log(err);
          res.json({ error: err });
        }

        if (info !== undefined) {
          console.log(info.message);
          res.status(401).send(info.message);
        } else if (user) {
          try {
            await s3Controller.getListedObject(req, res);
          } catch (e) {
            throw e;
          }
        } else {
          res.send("unauthorized");
        }
      }
    )(req, res, next);
  }
};
