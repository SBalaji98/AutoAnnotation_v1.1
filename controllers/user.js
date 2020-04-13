const bcrypt = require("bcrypt");
const User = require("../models").User;
const passport = require("passport");
const jwt = require("jsonwebtoken");
const s3Controller = require("../S3-bucket/s3.controller");
const saltRound = Number(process.env.USER_SALT);
require("dotenv").config();

module.exports = {
  // Register for a new user
  async create(req, res) {
    const { username, password, firstName, lastName, email, mobile } = req.body;

    try {
      await User.findOne({
        where: { userName: username, isDeleted: false }
      })
        .then(async user => {
          if (user) {
            res.json({
              error: "User is already exist please choose a different user name"
            });
          } else {
            const userCollection = await User.create({
              email: email,
              firstName: firstName,
              lastName: lastName,
              phone: mobile,
              userName: username,
              password: await bcrypt.hash(password, saltRound).then(hash => {
                return hash;
              })
            });

            s3Controller.createFolderS3(userCollection.id);
            res.status(201).json(userCollection);
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

  // Login
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
              const token = jwt.sign(
                { sub: user.id, username: user.userName },
                process.env.JWT_SECRET,
                {
                  expiresIn: 60 * 60
                }
              );
              res.status(200).send({
                auth: true,
                username: user.userName,
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
  },

  IsUserAuthorized(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        if (err) {
          console.log(err);
          return res.json({ error: err });
        }
        if (info !== undefined) {
          console.log(info.message);
          res.status(401).json({ message: info.message });
        } else {
          try {
            if (user) {
              let data = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userName: user.userName
              };
              res.json({ user: data });
            } else {
              res.json({ user: null });
            }
          } catch (e) {
            console.log(e);
            res.json({ error: e });
          }
        }
      }
    )(req, res, next);
  },
  // get all the availble users from DB
  async getAllUsers(req, res) {
    // passport.authenticate(
    //   "jwt",
    //   { session: false },
    //   async (err, user, info) => {
    //     if (err) {
    //       console.log(err);
    //       return res.json({ error: err });
    //     }
    //     if (info !== undefined) {
    //       console.log(info.message);
    //       res.status(401).json({ message: info.message });
    //     } else {
    try {
      const userCollection = await User.findAll({
        attributes: ["id", "firstName", "lastName", "email", "phone"],
        where: {
          isDeleted: false
        }
      });
      res.json(userCollection);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
    //     }
    //   }
    // );
  },

  //Update users
  async update(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        if (err) {
          console.log(err);
          return res.json({ error: err });
        }
        if (info !== undefined) {
          console.log(info.message);
          res.status(401).json({ message: info.message });
        } else {
          try {
            const userCollection = await User.findOne({
              where: { id: user.id, isDeleted: false }
            });

            if (userCollection) {
              let userKeys = Object.keys(req.body);

              const updatedUser = userKeys.map(field => {
                if (req.body[field] && field in user) {
                  const data = {};
                  data[field] = req.body[field];
                  User.update(data, {
                    where: {
                      id: user.id,
                      isDeleted: false
                    }
                  });
                }
              });

              res.status(200).json({ message: user });
            } else {
              res.status(404).send("User Not Found");
            }
          } catch (e) {
            console.log(e);

            res.status(500).send(e);
          }
        }
      }
    )(req, res, next);
  },

  //Logging out
  signOut(req, res, next) {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
      if (err) {
        console.log(err);
        return res.json({ error: err });
      }
      if (info !== undefined) {
        console.log(info.message);
        res.status(401).json({ message: info.message });
      } else {
        try {
          if (user) {
            req.logout();
            res.status(200).send({ msg: "logging out" });
          } else {
            res.send({ msg: "no user to log out" });
          }
        } catch (e) {
          throw e;
        }
      }
    })(req, res, next);
  }
};
