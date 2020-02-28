const bcrypt = require("bcrypt");
const User = require("../models").User;
const s3Controller = require("../S3-bucket/s3.controller");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const jwtSecret = require("../passport/jwtConfig");

module.exports = {
  async getAllUsers(req, res) {
    try {
      const userCollection = await User.findAll({
        where: {
          isDeleted: false
        }
      });
      return userCollection;
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  // Register for a new user
  async create(req, res) {
    // console.log(req.body);
    try {
      await User.findOne({
        where: { userName: req.body.username, isDeleted: false }
      })
        .then(async user => {
          if (user) {
            res.json({
              error: "User is already exist please choose a different user name"
            });
          } else {
            const userCollection = await User.create({
              email: req.body.email,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              phone: req.body.mobile,
              userName: req.body.username,
              password: await bcrypt.hash(req.body.password, 10).then(hash => {
                return hash;
              })
            });

            s3Controller.createFolderS3(req.body.username);
            console.log(userCollection);
            res.status(201).send(userCollection);
          }
        })
        .catch(e => {
          throw e;
        });
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },

  async update(req, res) {
    try {
      const userCollection = await User.find({
        id: req.params.userId,
        isDeleted: false
      });

      if (userCollection) {
        const updatedUser = await User.update({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          phone: req.body.phone
        });

        res.status(201).send(updatedUser);
      } else {
        res.status(404).send("User Not Found");
      }
    } catch (e) {
      console.log(e);

      res.status(500).send(e);
    }
  },

  async userLogin(req, res, next) {
    try {
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({
          message: "Something is not right with your input"
        });
      }
      passport.authenticate("login", (err, users, info) => {
        if (err) {
          console.error(`error ${err}`);
        }
        if (info !== undefined) {
          console.error(info.message);
          if (info.message === "bad username") {
            res.status(401).send(info.message);
          } else {
            res.status(403).send(info.message);
          }
        } else {
          req.logIn(users, () => {
            User.findOne({
              where: {
                userName: req.body.username
              }
            }).then(user => {
              const token = jwt.sign({ id: user.id }, jwtSecret.secret, {
                expiresIn: 60 * 60
              });
              res.status(200).send({
                auth: true,
                token,
                message: "user found & logged in"
              });
            });
          });
        }
      })(req, res, next);
    } catch (err) {
      console.log(err);
    }
  }
};
