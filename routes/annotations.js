const express = require("express");
const router = express.Router();
const annotationController = require("../controllers/annotations");

router.get("/", (req, res) => {
  annotationController.getAnnotationsByUsers(req, res);
});

router.post("/update-get-image-data-by-user", (req, res, next) => {
  annotationController.updateImageData(req, res, next);
});

router.get("/get-image-data-by-user", (req, res) => {
  annotationController.getImageDataByUser(req, res);
});

router.get("/admin/all-annotations", (req, res, next) => {
  annotationController.getAllAnnotations(req, res, next);
});

router.get("/admin/all-annotations-csv", (req, res, next) => {
  annotationController.changeFormatToCSVXML(req, res, next);
});

router.post("/admin/upload-dl-model-annotations", (req, res) => {
  annotationController.createBulkAnnotationByDLModel(req, res);
});

module.exports = router;
