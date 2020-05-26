const Annotations = require("../models").Annotation;
const passport = require("passport");
const { Parser } = require("json2csv");
const jsonxml = require("jsontoxml");
const constants = require("../lib/constants");
const model = require("../models");
const redis = require("redis");
const client = redis.createClient();
const s3Controller = require("../S3-bucket/s3.controller");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  /**
   * @description authenticate the user and get all the annotaion data from the database
   * @param {*} req Request from client which conatains the query parameters
   * @param {query} req dataFor - string can be (user, project file)
   * @param {query} req dataForIdName - id or name of the (project, file, user)
   * @param {*} res Response to the request
   * @returns object - json object of the all data in the db
   */
  async getAnnotations(req, res, next) {
    try {
      const { user } = req;
      const { dataFor, dataForIdName } = req.query;
      if (dataFor === "file") {
        model.sequelize
          .query("SELECT * FROM get_annotated_images_details(:filename)", {
            replacements: {
              filename: dataForIdName,
            },
          })
          .then((data) => {
            if (!data[0].length) {
              return res.status(204).json({
                error: "The file is not been annotated",
              });
            }
            return res.json(data[0]);
          })
          .catch((e) => {
            console.log(e);
            return res.status(500).json({
              error: "DB error while searching annotated data for filename",
            });
          });
      } else {
        if (dataFor != undefined && dataForIdName != undefined) {
          return res.json({
            error: "data is not available for provided keys",
          });
        }
        Annotations.findAll({
          where: {
            isAnnotated: true,
          },
        })
          .then((data) => {
            return res.json(data);
          })
          .catch((e) => {
            console.log(e);
            return res.json({
              error: "DB error while getting data for all the annotated images",
            });
          });
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: e });
    }
  },

  /**
   * @description  get all the annotaion data from the database for a project
   * @param {*} req Request from client which conatains the query parameters
   * @param {query} req id_or_name - id or name of the project
   * @param {*} res Response to the request
   * @returns object - json object of the all annotated data in the db for a project
   */
  getAnnotationsByProjectIdName(req, res) {
    const { id_or_name } = req.query;
    model.sequelize
      .query("SELECT * FROM get_annotated_images_per_proj(:proj_id)", {
        replacements: {
          proj_id: id_or_name,
        },
      })
      .then((data) => {
        if (!data[0].length) {
          return res.status(204).json({
            error: "No annotated data for this project",
          });
        }
        return res.json(data[0]);
      })
      .catch((e) => {
        return res.status(500).json({
          error: "DB error while searching annotated data for projects",
        });
      });
  },

  /**
   * @description  get all the annotaion data from the database for a user
   * @param {*} req Request from client which conatains the query parameters
   * @param {query} req id_or_name - id or name of the user
   * @param {*} res Response to the request
   * @returns object - json object of the all annotated data in the db for a user
   */
  getAnnotationsByUserIdName(req, res) {
    const { id_or_name } = req.query;
    model.sequelize
      .query("SELECT * FROM get_annotated_images_per_user(:user_id )", {
        replacements: {
          user_id: id_or_name,
        },
      })
      .then((data) => {
        if (!data[0].length) {
          return res.status(204).json({
            error: "No annotated data for this user",
          });
        }
        return res.json(data[0]);
      })
      .catch((e) => {
        return res.status(500).json({
          error: "DB error while searching annotated data for users ",
        });
      });
  },

  /**
   * @description Authenticate the user and get all the authorized data from the db for that user
   * @param {*} req Request from client
   * @param {*} res Response to the request
   * @returns object - json object of the data for the particular user from annotations
   */
  async getAnnotationsByUsers(req, res) {
    try {
      const { user } = req;
      const annotatedData = await Annotations.findAll({
        where: {
          userId: user.id,
          isMoved: false,
        },
      });
      return res.json({ data: annotatedData });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        error: "Database error in find all annotations by user",
      });
    }
  },

  /**
   * @description To change the data format from json to csv or xml
   * @param {query} req needed data in query parameter (userId, exportType, fileName)
   * @param {*} res response to the request
   * @return xml - return xml formatted data of json for exportType xml for an image
   * @return csv - return csv formatted data of json for exportType csv for an image
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
      console.log(e);
      return res.json({ error: "error while parsing to csv and xml" });
    }
  },

  /**
   * @description To bulk upload annotation data in annotation table
   * @param {object} req
   * @param {object} res
   * @return json object - object having the count of the images uploaded and all uploaded response from db
   */
  createBulkAnnotationByDLModel(req, res) {
    const annotationList = req.body;
    let imageDataToInsert = new Array();

    annotationList.map((data) => {
      if (data.isSegmented === "null") {
        console.log("null");
        data.isSegmented = null;
        console.log(data.isSegmented);
      }
      if (data.isObjectDetected === "null") {
        data.isObjectDetected = null;
      }
      if (data.annotations === "null") {
        data.annotations = null;
      }
      let dataMap = {
        userId: data.UUID,
        fileName: data.frame_cloud,
        isDLAnnotated: data.isDLAnnotated,
        dlAnnotatedData: data.annotations,
        projectId: data.project_id,
        isObjectDetected: data.isObjectDetected,
        isSegmented: data.isSegmented,
      };

      imageDataToInsert.push(dataMap);
    });

    // calling function to create bulk data in annotations table
    Annotations.bulkCreate(imageDataToInsert, {
      returning: ["fileName"],
      ndividualHooks: true,
    })
      .then((result) => {
        return res.json({
          msg: `${result.length} files has been uploaded`,
          files: result,
        });
      })
      .catch((e) => {
        console.log(e);
        return res.json({
          error: "Database error in bulk uploading annotations",
        });
      });
  },

  /**
   * @description Verify the user and call the function for getting image data
   * @param {*} req Request from client contains header body and params data for user
   * @param {*} res response to the requested client
   * @return object - error object if any
   */
  getImageDataByUser(req, res, next) {
    try {
      const { user } = req;
      this.getImageData(req, res, user);
    } catch (e) {
      console.log("error in getImageDataByUser function", e);
      return res.json({ error: e });
    }
  },

  /**
   * @description This function will check for the images alloted to a user and store all the images in redis on the first call 
                  from client and then call another function for further process
   * @param {query} req request for the data from client side having a query and body objedct with required information
   * @param {*} res response to the request
   * @param {*} user current user information
   */
  getImageData(req, res, user) {
    const { call_type, curr_image_index, annotate_mode } = req.query;
    if (call_type === "first") {
      if (curr_image_index != 0) {
        return res.json({ error: "current index should be 0 for first call" });
      }
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
          if (!data[0].length) {
            return res.json({
              message: `No data for this user for ${annotate_mode}`,
            });
          }
          let fileNameArray = new Array();
          data[0].map((row) => {
            fileNameArray.push(row.image_key);
            let rowStr = JSON.stringify(row);
            client.hmset(user.id, row.image_key, rowStr, function (err, resp) {
              if (err) {
                console.log(err);
                return res.json({
                  error: "Redis error",
                });
              }
            });
          });
          client.hmset(
            user.id,
            "fileNameArray",
            JSON.stringify(fileNameArray),
            (err, result) => {
              if (err) {
                console.log(e);
                return res.json({
                  error: "Redis error",
                });
              }
            }
          );
          client.hmset(user.id, { index: 0 });
          s3Controller.getListedObject(req, res, user);
        })
        .catch((e) => {
          console.log(e);
          return res.json({ error: "Database error" });
        });
    } else {
      s3Controller.getListedObject(req, res, user);
    }
  },

  /**
   * @description Update data into db for the user for a particular image and call the function for the next image
   * @param {*} req request from the client having required data as objects in query and body
   * @param {*} res response to the request from client
   * @return error object - all the error types as per the error occured
   */
  updateImageData(req, res, next) {
    try {
      const { user } = req;
      const { annotate_mode, call_type } = req.query;
      const { annotations, image_key, metadata, projectid } = req.body;

      if (call_type === "next") {
        let updateValue = {};
        if (annotate_mode === "segmentation") {
          updateValue = {
            segmentationData: annotations,
            metadata: metadata,
            isSegmented: true,
          };
        } else if (annotate_mode === "object_detection") {
          updateValue = {
            objectDetectionData: annotations,
            metadata: metadata,
            isObjectDetected: true,
          };
        }
        Annotations.update(updateValue, {
          where: { fileName: image_key, projectId: projectid },
        })
          .then((a) => {
            Annotations.findOne({
              where: {
                fileName: image_key,
                projectId: projectid,
                [Op.and]: [
                  {
                    [Op.or]: [
                      { isObjectDetected: true },
                      { isObjectDetected: null },
                    ],
                  },
                  {
                    [Op.or]: [{ isSegmented: true }, { isSegmented: null }],
                  },
                ],
              },
            })
              .then((resp) => {
                if (resp !== null) {
                  Annotations.update(
                    { isAnnotated: true },
                    { where: { fileName: image_key, projectId: projectid } }
                  );
                }
              })
              .catch((e) => {
                console.log(e);
                return res.json({
                  error: "Database error unable to update isAnnotated",
                });
              });

            this.getImageData(req, res, user);
          })
          .catch((e) => {
            console.log(e);
            return res.json({
              error: "Database error in update annotation for findOne",
            });
          });
      } else {
        this.getImageData(req, res, user);
      }
    } catch (e) {
      console.log(
        "Database error while update annotations and call for next image",
        e
      );
      return res.json({
        error: "Database error",
      });
    }
  },
};
