const Annotations = require("../models").Annotation;
const passport = require("passport");
const { Parser } = require("json2csv");
const jsonxml = require("jsontoxml");
const constants = require("../lib/constants");
const model = require("../models");
const redis = require("redis");
const client = redis.createClient();
const s3Controller = require("../S3-bucket/s3.controller");

module.exports = {
  /**
   * @description authenticate the user and get all the annotaion data from the database
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns object - json object of the all data in the db
   */
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
                isMoved: false,
              },
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

  /**
   * @description Authenticate the user and get all the authorized data from the db for that user
   * @param {*} req
   * @param {*} res
   * @returns object - json object of the data for the particular user from annotations
   */
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
                isMoved: false,
              },
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

  /**
   * @description Update data into db for the user for a particular image and call the function for the next image
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  updateImageData(req, res, next) {
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
            const { annotate_mode, call_type } = req.query;
            const { annotations, image_key } = req.body;
            if (call_type === "next") {
              let updateValue = {};
              if (annotate_mode === "segmentation") {
                updateValue = {
                  segmentationData: annotations,
                  isSegmented: true,
                };
              } else {
                updateValue = {
                  objectDetectionData: annotations,
                  isObjectDetected: true,
                };
              }
              Annotations.update(updateValue, {
                where: { fileName: image_key },
              })
                .then(() => {
                  Annotations.findAll({
                    where: {
                      fileName: image_key,
                      isSegmented: true,
                      isObjectDetected: true,
                    },
                  }).then(() => {
                    Annotations.update(
                      { isAnnotated: true },
                      { where: { fileName: image_key } }
                    );
                  });
                  this.getImageData(req, res, user);
                })
                .catch((e) => {
                  console.log(e);
                  res.send(e);
                });
            } else {
              this.getImageData(req, res, user);
            }
          } catch (e) {
            console.log(e);
            res.status(400).send(e);
          }
        }
      }
    )(req, res, next);
  },

  /**
   * @description
   * @param {*} req
   * @param {*} res
   */
  async changeFormatToCSVXML(req, res) {
    const fields = [
      constants.ID,
      constants.FILENAME,
      constants.USER_ID,
      constants.SIZE,
      constants.FILE_ATTRIBUTES,
      constants.SHAPE_ATTRIBUTES,
      constants.REGION_ATTRIBUTES,
    ];
    const opts = {
      fields,
      unwind: [constants.REGIONS],
    };

    let exportType = req.query.exportType;
    let userId = req.query.userId;
    let fileName = req.query.fileName;

    try {
      const dbData = await Annotations.findOne({
        where: {
          isAnnotated: true,
          isMoved: false,
          fileName: fileName,
          userId: userId,
        },
      });
      let toBeFormatedData = {
        id: dbData.id,
        fileName: dbData.fileName,
        userId: dbData.userId,
        size: dbData.annotatedData.size,
        regions: dbData.annotatedData.regions,
        file_attributes: dbData.annotatedData.file_attributes,
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

    annotationList.map((data) => {
      let dataMap = {
        userId: data.UUID,
        fileName: data.frame_cloud,
        isDLAnnotated: true,
        dlAnnotatedData: data.annotations,
      };

      imageDataToInsert.push(dataMap);
    });

    Annotations.bulkCreate(imageDataToInsert, {
      returning: ["fileName"],
      ndividualHooks: true,
    })
      .then((result) => {
        res.json({
          msg: `${result.length} files has been uploaded`,
          files: result,
        });
      })
      .catch((e) => {
        console.log(e);
        res.json(e);
      });
  },

  getImageData(req, res, user) {
    const { call_type, curr_image_index, annotate_mode } = req.query;
    if (call_type === "first" && curr_image_index == 0) {
      /**
       * @description The stored procedure gives all the images belongs to the user as per the mode selected by the user
       * @param user_id - uuid of the user
       * @param annotation_mode - string, The mode of annotation what user has selected either object-detection or segmetation
       * @return object - which contains image_key, metadata, annotaitions(dl annotated data)
       */
      model.sequelize
        .query(
          "SELECT * FROM get_all_annotations(:user_id, :annotation_mode)",
          {
            replacements: {
              user_id: user.id,
              annotation_mode: annotate_mode,
            },
          }
        )
        .then((data) => {
          let fileNameArray = new Array();
          data[0].map((row) => {
            fileNameArray.push(row.filename);
            let rowStr = JSON.stringify(row);
            client.hmset(user.id, row.filename, rowStr, function (err, resp) {
              if (err) {
                console.log(err);
                return res.send(err);
              }
            });
          });
          client.hmset(
            user.id,
            "fileNameArray",
            JSON.stringify(fileNameArray),
            (err, result) => {
              if (err) {
                return res.error(err);
              }
            }
          );
          client.hmset(user.id, { index: 0 });
          s3Controller.getListedObject(req, res, user);
        })
        .catch((e) => {
          console.log(e);
          return res.json({ error: e });
        });
    } else {
      s3Controller.getListedObject(req, res, user);
    }
  },

  getImageDataByUser(req, res, next) {
    passport.authenticate(
      "jwt",
      { session: false },
      async (err, user, info) => {
        if (err) {
          console.log(err);
          return res.json({ error: err });
        }
        if (info !== undefined) {
          console.log(info.message);
          return res.status(401).json({ message: info.message });
        } else {
          this.getImageData(req, res, user);
        }
      }
    )(req, res, next);
  },
};
