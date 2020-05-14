const passport = require("passport");
const roles = require("../models").Roles;
const User = require("../models").User;
const bcrypt = require("bcrypt");

module.exports = {
  initialize: function () {
    return passport.initialize();
  },
  jwtAuthenticate: function (req, res, next) {
    return passport.authenticate(
      "jwt",
      {
        session: false,
      },
      (err, user, info) => {
        if (err) {
          console.log(err);
          return res.json({ error: err });
        }
        if (info !== undefined) {
          console.log(info.message);
          return res.json({ error: info.message });
        } else if (user) {
          user = JSON.parse(JSON.stringify(user));

          // Forward user information to the next middleware
          if (user.roleId === null) {
            return res.json({ error: "user does not assigned to any role" });
          } else {
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
                req.user = user;
                next();
              })
              .catch((e) => {
                console.log(
                  "DB error while searching for role in auth middleware",
                  e
                );
                return res.json({ error: "DB error" });
              });
          }
        }
      }
    )(req, res, next);
  },
  basicAuth: async (req, res, next) => {
    if (
      !req.headers.authorization ||
      req.headers.authorization.indexOf("Basic ") === -1
    ) {
      return res.status(401).json({ message: "Missing Authorization Header" });
    }

    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");
    User.findOne({
      where: {
        userName: username,
      },
    }).then((user) => {
      if (user === null) {
        return res.send("user not found");
      }
      bcrypt.compare(password, user.password).then((response) => {
        if (response !== true) {
          console.log("passwords do not match");
          return res.send("incorrect password");
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
            req.user = user;
            next();
          })
          .catch((e) => {
            console.log(
              "DB error while searching for role in auth middleware",
              e
            );
            return res.json({ error: "DB error" });
          });
        console.log("user found & authenticated");
      });
    });
  },
};
