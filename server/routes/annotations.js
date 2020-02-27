const express = require("express");
const router = express.Router();
const annotationController = require("../controllers/annotations");

router.get("/", async (req, res, next) => {
  try {
    if (req.user) {
      let data = await annotationController.getAnnotationsByUsers(req, res);
      return res.json({ data: data });
    } else {
      return res.json({ error: "User does not exist" });
    }
  } catch (e) {
    res.json({ error: e });
  }
});

router.get("/admin/all-annotations", async (req, res, next) => {
  try {
    if (req.user) {
      let allAnnotations = await annotationController.getAllAnnotations(
        req,
        res
      );
      return res.json({ data: allAnnotations });
    } else {
      return res.json({ error: "User does not exist" });
    }
  } catch (e) {
    res.json({ error: e });
  }
});

router.put("/", async (req, res, next) => {
  try {
    // console.log(req);
    console.log(req.user);
    if (req.user) {
      let result = await annotationController.update(req, res);
      res.send(result);
    } else {
      res.send({ msg: "please login" });
    }
  } catch (e) {
    res.send({ error: e });
  }
});

module.exports = router;
