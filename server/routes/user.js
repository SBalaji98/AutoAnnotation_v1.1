const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const imageRenderController = require("../controllers/imageRender");
const { check, validationResult } = require("express-validator");

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

router.put("/update", (req, res, next) => {
  userController.update(req, res, next);
});

router.get("/image-data", (req, res, next) => {
  imageRenderController.getAllImageData(req, res, next);
});

router.get("/image", (req, res, next) => {
  imageRenderController.renderImageById(req, res, next);
});
router.post("/logout", (req, res, next) => {
  userController.signOut(req, res, next);
});

module.exports = router;
