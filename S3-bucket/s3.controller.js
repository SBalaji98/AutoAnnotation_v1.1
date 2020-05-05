const aws = require("aws-sdk");
const fs = require("fs");
const redis = require("redis");
const client = redis.createClient();
const Annotations = require("../models").Annotation;
require("dotenv").config();

/**
 * @desc Create new s3 object with the secret Key
 */
const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

module.exports = {
  /**
   * @desc To get a list of all the objects in s3 bucket in a folder
   * @param string prefix - the folder key for s3 bucket in our case the uuid of user
   * @return list - the list of all the object keys from the s3 buckets folder
   */
  getObjectList(prefix) {
    aws.config.setPromisesDependency();
    let params = {};
    if (prefix !== null) {
      params = { Bucket: process.env.BUCKET, Prefix: prefix };
    } else {
      params = { Bucket: process.env.BUCKET };
    }

    let res = s3.listObjectsV2(params).promise();
    return res;
  },

  /**
   * @desc To send Image data stored in redis and Image from s3 bucket as per the user and the image it is asking for.
   * @param {*} req - request from the client containing body and params
   * @param {*} res - response to the request from user
   * @param {*} user - contains user's information
   * @returns Json object - containing required information of the image and image in the form of buffer and send as a response
   */
  async getListedObject(req, res, user) {
    try {
      const { call_type, curr_image_index, annotate_mode } = req.query;
      const { image_key } = req.body;

      //get all the data stored in redis for the user
      client.hgetall(user.id, async (err, result) => {
        if (err) {
          return res.error(err);
        } else {
          let fileNameArray = JSON.parse(result.fileNameArray);
          let index = Number(result.index);

          //check for index of images, it should not be greater than total number of images
          if (curr_image_index == fileNameArray.length) {
            return res.json({ message: "No more images to annotate" });
          }

          //check for the call type previous to show last indexed image data
          if (call_type === "previous") {
            if (index == 0) {
              return res.json({ error: "No more images to go previous" });
            }
            index = index - 1;
            fileName = fileNameArray[index];
            client.hmset(user.id, "index", index, (err, re) => {
              if (err) {
                return res.json({
                  error: "error in setting index for previous call",
                });
              }
            });

            client.hmset(
              user.id,
              image_key,
              JSON.stringify(req.body),
              (err, re) => {
                if (err) {
                  return res.json({
                    error:
                      "Redis error while setting annotation data in previous call",
                  });
                }
              }
            );
          }

          //setting index only for next image
          if (call_type === "next") {
            if (curr_image_index == 0) {
              return res.json({
                error: "index should be greater than 0 for next call",
              });
            }
            index = index + 1;
            client.hmset(user.id, "index", index, (err, re) => {
              if (err) {
                return res.error(err);
              }
            });

            client.hmset(
              user.id,
              image_key,
              JSON.stringify(req.body),
              (err, re) => {
                if (err) {
                  return res.json({
                    error:
                      "Redis error while setting annotation data in next call",
                  });
                }
              }
            );
          }

          /**
           * @description check for the indexes with call type if it matches with the index in redis
           * @return string, error string(if error)
           */
          if (
            (call_type === "next" && curr_image_index != index) ||
            (call_type === "previous" && curr_image_index != index)
          ) {
            return res.json({ error: "index did not match" });
          } else {
            let fileName = fileNameArray[index];
            let fileData = JSON.parse(result[`${fileName}`]);

            // To check for a review call_type and get data for image on the basis of object detection and segmentation
            if (call_type === "review") {
              fileName = req.query.image_key;
              let data = await Annotations.findOne({
                where: { fileName: fileName },
              });
              if (data === null) {
                return res.json({ error: "no data found for review" });
              }
              data = JSON.parse(JSON.stringify(data));
              fileData.image_key = fileName;
              fileData.metadata = data.metadata;
              if (annotate_mode === "object_detection") {
                fileData.annotations = data.objectDetectionData;
              }
              if (annotate_mode === "segmentation") {
                fileData.annotations = data.segmentationData;
              }
            }
            let getParams = {
              Bucket: process.env.BUCKET,
              Key: fileName,
            };

            /**
             * @desc fetch the image form S3 bucket and concat with the annotation data of the image and send as response
             */
            await s3.getObject(getParams, function (err, data) {
              if (err) {
                console.log(err);
                return res.json({ error: err.message });
              } else {
                return res.json({
                  image: data.Body,
                  image_key: fileData.image_key,
                  annotations: fileData.annotations,
                  metadata: fileData.metadata,
                });
              }
            });
          }
        }
      });
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  },

  /**
   * @description To add folder in s3 bucket
   * @param {*} folderName  string - The name of the folder to be created in s3 bucket
   */
  createFolderS3(folderName) {
    var params = {
      Bucket: process.env.BUCKET,
      Key: `${folderName}/`,
      ACL: "public-read",
      Body: "",
    };

    s3.upload(params, function (err) {
      if (err) {
        console.log("Error creating the folder: ", err);
      } else {
        console.log("Successfully created a folder on S3");
      }
    });
  },

  /**
   * @desc Upload images to s3 bucket from the local computer one by one in each folder
   */
  uploadImagesToUsers() {
    const directoryPath = "/home/abdul_rehan/Documents/Flux Data/images";

    fs.readdir(directoryPath, async (err, files) => {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }
      let res = await this.getObjectList();
      let listIndex = 0;
      files.forEach(function (file) {
        s3.putObject({
          Bucket: process.env.BUCKET,
          Body: fs.readFileSync(`${directoryPath}/${file}`),
          Key: `${res.Contents[listIndex].Key}${file}`,
        })
          .promise()
          .then((response) => {
            console.log(`done! - `, response);
          })
          .catch((err) => {
            console.log("failed:", err);
          });

        listIndex += 1;
        if (listIndex >= res.Contents.length) {
          listIndex = 0;
        }
      });
    });
  },
};
