const User = require("../models").User;
const LocalStrategy = require("passport-local").Strategy;
const bCrypt = require("bcrypt");

const strategy = new LocalStrategy(
  {
    usernameField: "username" // not necessary, DEFAULT
  },
  async function(username, password, done) {
    var isValidPassword = function(userpass, password) {
      return bCrypt.compareSync(password, userpass);
    };

    await User.findOne({ where: { userName: username } })
      .then(user => {
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        if (!isValidPassword(user.password, password)) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      })
      .catch(e => {
        console.log(e);
        return e;
      });
  }
);

module.exports = strategy;
