const Annotations = require("../models").Annotation;
const User = require("../models").User;

module.exports = {
  async getAnnotationsByUsers(req, res) {
    try {
      const annotatedData = await Annotations.findAll({
        where: {
          userId: req.user.id
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
        where: { userId: req.user.id, fileName: req.body.fileName }
      });
      if (annotation) {
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
