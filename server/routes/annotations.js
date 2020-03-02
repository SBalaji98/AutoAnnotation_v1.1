const express = require("express");
const router = express.Router();
const annotationController = require("../controllers/annotations");

router.post("/", async (req, res, next) => {
  annotationController.create(req, res, next);
});

router.get("/", (req, res) => {
  annotationController.getAnnotationsByUsers(req, res);
});

router.get("/admin/all-annotations", (req, res, next) => {
  annotationController.getAllAnnotations(req, res, next);
});

module.exports = router;
