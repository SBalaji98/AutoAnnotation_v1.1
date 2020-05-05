const passport = require("passport");
const roles = require("../models").Roles;

module.exports = {
  initialize: function () {
    return passport.initialize();
  },
  authenticate: function (req, res, next) {
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
};
