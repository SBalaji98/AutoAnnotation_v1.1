const crypto = require("crypto");
const User = require("../models").User;
const nodemailer = require("nodemailer");
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const passport = require("passport");

require("dotenv").config();
const saltRound = Number(process.env.USER_SALT);

const Op = Sequelize.Op;
module.exports = {
  /**
   * @description Check for the provided email if it matches then send the reset password link to the provided email
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - contains message
   */
  sendForgotPasswordMail(req, res) {
    let email = req.body.email;
    console.log(email)
    if (email === "" || email == undefined) {
      console.log("email is required");
      res.json({ msg: "Email is required" });
    } else {
      User.findOne({
        where: {
          email: email,
        },
      }).then((user) => {
        if (user == null) {
          console.log("email is not in the db");
          res.status(403).json({ msg: "email not found" });
        } else {
          const token = crypto.randomBytes(20).toString("hex");
          user.update({
            resetPasswordToken: token,
            resetPasswordTokenExpires: Date.now() + 3600000,
          });

          const link = `${process.env.RESET_LINK}/${token}`;

          const transporter = nodemailer.createTransport({
            // service: "gmail",
            host:"smtp.zoho.com",
            Port: 465,
            auth: {
              user: process.env.SOURCE_EMAIL,
              pass: process.env.EMAIL_PASSWORD,
            },
          });

          const mailOpts = {
            from: "fluxannotations@gmial.com",
            to: user.email,
            subject: "Link to reset Password",
            text: `Dear ${user.firstName}
            You are recieving this because you (or someone else) requested the reset of the password for your account
              please click on the following link or paste this into your browser to complete the process within one hour of recieving it
              
              ${link}
              
              if you did not request this please ignore this email and your password will remain unchanged`,
          };

          transporter.sendMail(mailOpts, (err, resp) => {
            if (err) {
              console.log(err);
              res.status(400).json({ message: err });
            } else {
              console.log("here is the response: ", resp);

              res.status(200).json({ message: "recovery mail sent" });
            }
          });
        }
      });
    }
  },

  /**
   * @description Check for the provided token for reset password and validate it
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - message
   */
  resetPassword(req, res) {
    User.findOne({
      where: {
        resetPasswordToken: req.query.resetPasswordToken,
        resetPasswordTokenExpires: {
          [Op.gt]: Date.now(),
        },
      },
    })
      .then((user) => {
        if (user == null) {
          console.error("password reset link is invalid or has expired");
          res.status(403).send("password reset link is invalid or has expired");
        } else {
          res.status(200).send({
            username: user.userName,
            message: "password reset link a-ok",
          });
        }
      })
      .catch((e) => {
        console.log(e);
        res.json(e);
      });
  },

  /**
   * @description Update password with the validated token
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - message
   */
  updateForgottenPassword(req, res) {
    User.findOne({
      where: {
        userName: req.body.username,
        resetPasswordToken: req.body.resetPasswordToken,
        resetPasswordTokenExpires: {
          [Op.gt]: Date.now(),
        },
      },
    }).then((user) => {
      if (user == null) {
        console.log("password reset link is invalid or has expired");
        res.status(400).json({ message: "Password reset link is invalid" });
      } else {
        console.log("user found in db");
        bcrypt.hash(req.body.password, saltRound).then((hashPassword) => {
          user.update({
            password: hashPassword,
            resetPasswordToken: null,
            resetPasswordTokenExpires: null,
          });

          res.status(200).json({ message: "password reset successfully" });
        });
      }
    });
  },
  /**
   * @description update user password ========== YET TO BE IMPLEMENT =========
   * @param {*} req request from client
   * @param {*} res response to the request
   * @returns object - message
   */
  updatePassword(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        console.log(user);

        if (err) {
          console.log(err);
          res.status(400).json({
            message: err,
          });
        }
        if (info !== undefined) {
          console.log(info.message);
          res.status(401).json({ message: info.message });
        } else {
          User.findOne({
            where: {
              userName: user.userName,
              password: await bcrypt
                .hash(req.body.password, saltRound)
                .then((hashPassword) => hashPassword),
              isDeleted: false,
            },
          }).then((user) => console.log(user));
        }
      }
    )(req, res, next);
  },
};
