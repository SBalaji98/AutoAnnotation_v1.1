const Annotations = require("../models").Annotation;
const passport = require("passport");
const User = require("../models").User;
const csvjson = require("csvjson");
const { Parser } = require("json2csv");

module.exports = {
  //get all data from annotation table
  async getAllAnnotations(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        if (err) {
          console.log(err);
          res.json({ error: err });
        }
        if (info !== undefined) {
          console.log(info.message);
          res.status(401).json({ message: info.message });
        } else if (user) {
          try {
            const annotatedData = await Annotations.findAll({
              where: {
                isDeleted: false
              }
            });
            res.status(200).json({ data: annotatedData });
          } catch (e) {
            console.log(e);
            res.status(500).send(e);
          }
        }
      }
    )(req, res, next);
  },

  //get all the data of annotations by user
  getAnnotationsByUsers(req, res) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        if (err) {
          console.log(err);
          res.json({ error: err });
        }
        if (info !== undefined) {
          console.log(info.message);
          res.status(401).json({ message: info.message });
        } else {
          console.log(user);
          try {
            const annotatedData = await Annotations.findAll({
              where: {
                userId: user.id,
                isDeleted: false
              }
            });
            res.status(200).json({ data: annotatedData });
          } catch (e) {
            console.log(e);
            res.status(500).send(e);
          }
        }
      }
    )(req, res);
  },

  //adding images for annotations in the table
  create(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        if (err) {
          console.log(err);
          res.json({ error: err });
        }
        if (info !== undefined) {
          console.log(info.message);
          res.status(401).json({ message: info.message });
        } else {
          try {
            let annotation = await Annotations.findOne({
              where: {
                userId: user.id,
                fileName: req.body.fileName,
                isDeleted: false
              }
            });
            if (annotation) {
              res.status(200).json({ message: "File is already exist" });
            } else {
              const addAnnotation = await Annotations.create({
                userId: user.id,
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
      }
    )(req, res, next);
  },
  async changeFormatToCSV(req, res, next) {
    const fields = [
      "id",
      "fileName",
      "userId",
      "size",
      "file_attributes",
      "regions.shape_attributes",
      "regions.region_attributes"
    ];
    const opts = {
      fields,
      unwind: ["regions"]
    };

    // const data = await Annotations.findAll({ where: { isDeleted: false } });

    try {
      const parser = new Parser(opts);

      const dbData = await Annotations.findOne({
        where: {
          isAnnotated: true,
          isDeleted: false,
          fileName: req.query.fileName,
          userId: req.query.userId
        }
      });

      let toBeFormatedData = {
        id: dbData.id,
        fileName: dbData.fileName,
        userId: dbData.userId,
        size: dbData.annotatedData.size,
        regions: dbData.annotatedData.regions,
        file_attributes: dbData.annotatedData.file_attributes
      };

      const csv = parser.parse(toBeFormatedData);
      res.send(csv);
    } catch (e) {
      res.json(e);
    }
  }
};
