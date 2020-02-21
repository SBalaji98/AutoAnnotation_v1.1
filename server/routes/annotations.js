const express = require("express");
const router = express.Router();
const annotationController = require("../controllers/annotations");

router.get("/", async (req, res, next) => {
  try {
    if (req.user) {
      let data = await annotationController.getAnnotationsByUsers(req, res);
      return res.json({ data: data });
    } else {
      return res.json({ data: null });
    }
  } catch (e) {
    res.json({ error: e });
  }
});

router.post("/", async (req, res, next) => {
  try {
    if (req.user) {
      let result = await annotationController.create(req, res);
      res.send(result);
    } else {
      res.send({ msg: "please login" });
    }
  } catch (e) {
    res.send({ error: e });
  }
});

module.exports = router;
