const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const imageRenderController = require("../controllers/imageRender");

router.post("/", userController.create);

router.get("/", (req, res, next) => {
  userController.IsUserAuthorized(req, res, next);
});

router.post("/login", (req, res, next) => {
  userController.userLogin(req, res, next);
});

router.put("/update", async (req, res, next) => {
  userController.update(req, res, next);
});

router.get("/image-data", (req, res, next) => {
  imageRenderController.getAllImageData(req, res, next);
});

router.get("/image", async (req, res, next) => {
  imageRenderController.renderImageById(req, res, next);
});
router.post("/logout", (req, res, next) => {
  userController.signOut(req, res, next);
});

module.exports = router;
