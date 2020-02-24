const Annotations = require("../models").Annotation;
const User = require("../models").User;

module.exports = {
  async getAllAnnotations(req, res) {
    try {
      const annotatedData = await Annotations.findAll({
        where: {
          isDeleted: false
        }
      });
      console.log(annotatedData);
      return annotatedData;
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  },
  async getAnnotationsByUsers(req, res) {
    try {
      const annotatedData = await Annotations.findAll({
        where: {
          userId: req.user.id,
          isDeleted: false
        }
      });
      return annotatedData;
    } catch (e) {
      console.log(e);
      res.status(500).send(e);
    }
  },
  async create(req, res) {
    try {
      let annotation = await Annotations.findOne({
        where: {
          userId: req.user.id,
          fileName: req.body.fileName,
          isDeleted: false
        }
      });
      if (annotation) {
        console.log("already exist");
        return;
      } else {
        const addAnnotation = await Annotations.create({
          userId: req.user.id,
          fileName: req.body.fileName,
          isAnnotated: req.body.isAnnotated,
          annotatedData: req.body.annotatedData
        });
        res.status(201).send(addAnnotation);
      }
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  }
};
