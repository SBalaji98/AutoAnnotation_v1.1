const bcrypt = require("bcrypt");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JWTstrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const User = require("../models").User;

require("dotenv").config();

const saltRound = Number(process.env.USER_SALT);

passport.use(
  "register",
  new LocalStrategy((req, username, password, done) => {
    try {
      User.findOne({
        where: {
          userName: username
        }
      }).then(user => {
        if (user != null) {
          console.log("username or email already taken");
          return done(null, false, {
            message: "username or email already taken"
          });
        }
        bcrypt.hash(password, saltRound).then(hashedPassword => {
          User.create({
            username,
            password: hashedPassword,
            email: req.body.email
          }).then(user => {
            console.log("user created");
            return done(null, user);
          });
        });
      });
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  "login",
  new LocalStrategy((username, password, done) => {
    try {
      User.findOne({
        where: {
          userName: username
        }
      }).then(user => {
        if (user === null) {
          return done(null, false, { message: "bad username" });
        }
        bcrypt.compare(password, user.password).then(response => {
          if (response !== true) {
            console.log("passwords do not match");
            return done(null, false, { message: "passwords do not match" });
          }
          console.log("user found & authenticated");
          return done(null, user);
        });
      });
    } catch (err) {
      done(err);
    }
  })
);

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme("bearer"),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(
  "jwt",
  new JWTstrategy(opts, (jwt_payload, done) => {
    try {
      User.findOne({
        where: {
          id: jwt_payload.sub
        }
      }).then(user => {
        if (user) {
          console.log("user found in db in passport");
          done(null, user);
        } else {
          console.log("user not found in db");
          done(null, false);
        }
      });
    } catch (err) {
      done(err);
    }
  })
);
