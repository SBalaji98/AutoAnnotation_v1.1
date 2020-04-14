const Annotations = require("../models").Annotation;
const passport = require("passport");
const { Parser } = require("json2csv");
const jsonxml = require("jsontoxml");
const constants = require("../lib/constants");

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

  async changeFormatToCSVXML(req, res, next) {
    const fields = [
      constants.ID,
      constants.FILENAME,
      constants.USER_ID,
      constants.SIZE,
      constants.FILE_ATTRIBUTES,
      constants.SHAPE_ATTRIBUTES,
      constants.REGION_ATTRIBUTES
    ];
    const opts = {
      fields,
      unwind: [constants.REGIONS]
    };

    let exportType = req.query.exportType;
    let userId = req.query.userId;
    let fileName = req.query.fileName;

    try {
      const dbData = await Annotations.findOne({
        where: {
          isAnnotated: true,
          isDeleted: false,
          fileName: fileName,
          userId: userId
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

      if (exportType === constants.CSV) {
        const parser = new Parser(opts);
        const csv = parser.parse(toBeFormatedData);
        res.send(csv);
      } else {
        let xml = jsonxml(toBeFormatedData);
        res.send(xml);
      }
    } catch (e) {
      res.json(e);
    }
  },
  createBulkAnnotationByDLModel(req, res) {
    const annotationList = req.body;
    let imageDataToInsert = new Array();
    const uploadedImageList = new Array();
    let errList = new Array();

    annotationList.map(data => {
      let dataMap = {
        userId: data.UUID,
        fileName: data.frame_cloud,
        isDLAnnotated: true,
        dlAnnotatedData: data.annotations
      };

      imageDataToInsert.push(dataMap);
    });

    Annotations.bulkCreate(imageDataToInsert, {
      returning: ["fileName"],
      ndividualHooks: true
    })
      .then(result => {
        res.json({
          msg: `${result.length} files has been uploaded`,
          files: result
        });
      })
      .catch(e => {
        console.log(e);
        res.json(e);
      });
  }
};
