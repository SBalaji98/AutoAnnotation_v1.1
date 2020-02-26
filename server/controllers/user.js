const bcrypt = require("bcrypt");
const User = require("../models").User;
const s3Controller = require("../S3-bucket/s3.controller");
const passport = require("passport");
const jwt = require("jsonwebtoken");
// const jwtConfig = require("../passport/jwtConfig");

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

  userLogin(req, res, next) {
    // console.log(req);
    passport.authenticate("login", (err, user, info) => {
      console.log("pass");
      if (err) {
        console.log(err);
      }
      if (info != undefined) {
        console.log("pass");
        console.log(info.message);
        res.send(info.message);
      } else {
        console.log("pass");
        req.logIn(user, err => {
          User.findOne({
            where: {
              username: user.username
            }
          }).then(user => {
            const token = jwt.sign({ id: user.username }, jwtSecret.secret);
            res.status(200).send({
              auth: true,
              token: token,
              message: "user found & logged in"
            });
          });
        });
      }
    });
  },

  register(req, res, next) {
    passport.authenticate("register", (err, user, info) => {
      if (err) {
        console.log(err);
      }
      if (info != undefined) {
        console.log(info.message);
        res.send(info.message);
      } else {
        console.log(req);
      }
    });
  }
};
