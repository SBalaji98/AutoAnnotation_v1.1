const crypto = require("crypto");
const User = require("../models").User;
const nodemailer = require("nodemailer");
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const salt = 10;

const Op = Sequelize.Op;
module.exports = {
  sendForgotPasswordMail(req, res) {
    let email = req.body.email;

    if (email === "" || email == undefined) {
      console.log("email is required");
      res.status(400).json({ msg: "Email is required" });
    } else {
      User.findOne({
        where: {
          email: email
        }
      }).then(user => {
        if (user == null) {
          console.log("email is not in the db");
          res.status(403).json({ msg: "email not found" });
        } else {
          const token = crypto.randomBytes(20).toString("hex");
          user.update({
            resetPasswordToken: token,
            resetPasswordTokenExpires: Date.now() + 3600000
          });

          const link = `http://localhost:8080/user/reset/${token}`;

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "fluxannotations@gmail.com",
              pass: "Flux@ut0"
            }
          });

          const mailOpts = {
            from: "fluxannotations@gmial.com",
            to: user.email,
            subject: "Link to reset Password",
            text: `Dear ${user.firstName}
            You are recieving this because you (or someone else) requested the reset of the password for your account
              please click on the following link or paste this into your browser to complete the process within one hour of recieving it
              
              ${link}
              
              if you did not request this please ignore this email and your password will remain unchanged`
          };

          console.log("Sending Mail");

          transporter.sendMail(mailOpts, (err, resp) => {
            if (err) {
              console.log(err);
            } else {
              // console.log("here is the res: ", resp);
              console.log(Date.now());
              res.status(200).json(mailOpts);
            }
          });
        }
      });
    }
  },
  resetPassword(req, res) {
    User.findOne({
      where: {
        resetPasswordToken: req.params.token,
        resetPasswordTokenExpires: {
          [Op.gt]: Date.now()
        }
      }
    })
      .then(user => {
        console.log(user);
        if (user == null) {
          console.error("password reset link is invalid or has expired");
          res.status(403).send("password reset link is invalid or has expired");
        } else {
          res.status(200).send({
            username: user.userName,
            message: "password reset link a-ok"
          });
        }
      })
      .catch(e => {
        console.log(e);
        res.json(e);
      });
  },

  updateForgottenPassword(req, res) {
    User.findOne({
      where: {
        userName: req.body.userName,
        resetPasswordToken: req.body.resetPasswordToken,
        resetPasswordTokenExpires: {
          [Op.gt]: Date.now()
        }
      }
    }).then(user => {
      if (user == null) {
        console.log("password reset link is invalid or has expired");
        res.status(400).json({ message: "Password reset link is invalid" });
      } else {
        console.log("user found in db");
        bcrypt.hash(req.body.password, salt).then(hashPassword => {
          user.update({
            password: hashPassword,
            resetPasswordToken: null,
            resetPasswordTokenExpires: null
          });

          res.status(200).json({ message: "password reset successfully" });
        });
      }
    });
  }
};
