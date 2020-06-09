const bcrypt = require("bcrypt");
const User = require("../models").User;
const roles = require("../models").Roles;
const passport = require("passport");
const jwt = require("jsonwebtoken");
const s3Controller = require("../S3-bucket/s3.controller");
const redis = require("redis");
const client = redis.createClient();
const saltRound = Number(process.env.USER_SALT);
require("dotenv").config();

module.exports = {
  // Register for a new user
  /**
   * @description Create a new user and create a folder of that user on its user id
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - object containing information about the user
   */
  async create(req, res) {
    const { username, password, firstName, lastName, email, mobile } = req.body;

    try {
      await User.findOne({
        where: { userName: username, isDeleted: false },
      })
        .then(async (user) => {
          if (user) {
            res.json({
              error:
                "User is already exist please choose a different user name",
            });
          } else {
            const userCollection = await User.create({
              email: email,
              firstName: firstName,
              lastName: lastName,
              phone: mobile,
              userName: username,
              password: await bcrypt.hash(password, saltRound).then((hash) => {
                return hash;
              }),
            });

            s3Controller.createFolderS3(userCollection.id);
            res.status(201).json(userCollection);
          }
        })
        .catch((e) => {
          throw e;
        });
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },

  // Login
  /**
   * @description Logging with the credentials of already created users with jwt strategy
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - sending jwt with payload and message
   */
  async userLogin(req, res, next) {
    try {
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({
          message: "Something is not right with your input",
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
                userName: req.body.username,
              },
            }).then((user) => {
              if (!JSON.parse(JSON.stringify(user)).isActive) {
                return res.json({
                  error:
                    "User is not active anymore please contact with the admin for activation",
                });
              }
              roles
                .findOne({
                  attributes: ["role"],
                  where: {
                    id: user.roleId,
                  },
                })
                .then((result) => {
                  result = JSON.parse(JSON.stringify(result));
                  user.role = result.role;
                  const token = jwt.sign(
                    {
                      sub: user.id,
                      username: user.userName,
                      isad: user.isAdmin,
                      role: user.role,
                    },
                    process.env.JWT_SECRET,
                    {
                      expiresIn: 60 * 60 * 24,
                    }
                  );
                  res.status(200).send({
                    auth: true,
                    username: user.userName,
                    token,
                    message: "user found & logged in",
                  });
                })
                .catch((e) => {
                  console.log(
                    "DB error while searching for role in auth middleware",
                    e
                  );
                  return res.json({ error: "DB error" });
                });
            });
          });
        }
      })(req, res, next);
    } catch (err) {
      console.log(err);
    }
  },

  /**
   * @description Checking for the user authorization with jwt strategy
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - object containing user data
   */
  IsUserAuthorized(req, res, next) {
    try {
      const { user } = req;

      if (user) {
        let data = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          userName: user.userName,
        };
        res.json({ user: data });
      } else {
        res.json({ user: null });
      }
    } catch (e) {
      console.log(e);
      res.json({ error: e });
    }
  },
  /**
   * @description Get all the availble users from DB
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - object containing data of all users
   */
  async getAllUsers(req, res) {
    try {
      const userCollection = await User.findAll({
        attributes: [
          "id",
          "firstName",
          "lastName",
          "userName",
          "email",
          "phone",
        ],
        where: {
          isDeleted: false,
          isActive: true,
          isAdmin: false,
        },
      });
      res.json(userCollection);
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  },

  /**
   * @description Update user information
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - object containing updated data of user
   */
  async update(req, res, next) {
    try {
      const { user } = req;
      const userCollection = await User.findOne({
        where: { id: user.id, isDeleted: false },
      });

      if (userCollection) {
        let userKeys = Object.keys(req.body);

        const updatedUser = userKeys.map((field) => {
          if (req.body[field] && field in user) {
            const data = {};
            data[field] = req.body[field];
            User.update(data, {
              where: {
                id: user.id,
                isDeleted: false,
              },
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
  },

  /**
   *@description To logout user and destroying redis data of that user
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - object of informations
   */
  signOut(req, res, next) {
    try {
      const { user } = req;
      if (user) {
        req.logout();
        client.del(user.id);
        res.status(200).send({ msg: "logging out" });
      } else {
        console.log(user);
        res.send({ msg: "no user to log out" });
      }
    } catch (e) {
      throw e;
    }
  },
};
