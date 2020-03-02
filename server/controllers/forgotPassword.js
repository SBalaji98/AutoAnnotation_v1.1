const crypto = require("crypto");
const User = require("../models").User;
const nodemailer = require("nodemailer");

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
            resetPasswordExpires: Date.now() + 3600000
          });

          const link = `htttps://localhost:3000/reset/${token}`;

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "fluxannotation@gmail.com",
              pass: "Flux@ut0"
            }
          });

          const mailOpts = {
            from: "fluxannotations@gmial.com",
            to: user.email,
            subject: "Link to reset Password",
            text: `You are recieving this becausw you (or someone else) requested the reset of the password for your account
              please click on the following link or paste this into your browser to complete the process within one hour of recieving it
              ${link}
              if you did not request this please ignore this email and your password will remain unchanged`
          };

          console.log("Sending Mail");

          transporter.sendMail(mailOpts, (err, res) => {
            if (err) {
              console.log(err);
            } else {
              console.log(`response is ${res}`);
              res.status(200).json({ msg: "mail sent" });
            }
          });
        }
      });
    }
  }
};
