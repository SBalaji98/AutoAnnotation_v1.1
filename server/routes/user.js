const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const imageRenderController = require("../controllers/imageRender");
const { check, validationResult } = require("express-validator");
const passwordController = require("../controllers/password.controller");

router.post(
  "/",
  [
    check("username").notEmpty(),
    check("email")
      .isEmail()
      .notEmpty(),
    check("mobile").isMobilePhone(),
    check("password")
      .notEmpty()
      .isLength({ min: 5 })
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    userController.create(req, res);
  }
);

router.get("/", (req, res, next) => {
  userController.IsUserAuthorized(req, res, next);
});

router.post("/login", (req, res, next) => {
  userController.userLogin(req, res, next);
});

//Update controller is not proper will have to have a look before using it
router.put("/update", (req, res, next) => {
  userController.update(req, res, next);
});

// router.put("/update-password", (req, res, next) => {
//   passwordController.updatePassword(req, res, next);
// });

router.get("/image-data", (req, res, next) => {
  imageRenderController.getAllImageData(req, res, next);
});

router.get("/image", (req, res, next) => {
  imageRenderController.renderImageById(req, res, next);
});
router.post("/logout", (req, res, next) => {
  userController.signOut(req, res, next);
});

router.post("/forgot-password", (req, res) => {
  passwordController.sendForgotPasswordMail(req, res);
});

router.get("/reset/:token", (req, res) => {
  passwordController.resetPassword(req, res);
});

router.put("/forgot-password-update", (req, res) => {
  passwordController.updateForgottenPassword(req, res);
});

module.exports = router;
