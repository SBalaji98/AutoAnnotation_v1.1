const passport = require("passport");
const LocalStrategy = require("./localStrategy");
const User = require("../models").User;

// called on login, saves the id to session req.session.passport.user = {id:'..'}
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// user object attaches to the request as req.user
passport.deserializeUser(function(id, done) {
  User.findOne({ where: { id: id } }).then(function(user) {
    if (user) {
      done(null, user.get());
    } else {
      done(user.errors, null);
    }
  });
});

//  Use Strategies
passport.use(LocalStrategy);

module.exports = passport;
