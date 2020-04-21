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

      //get all the data stored in redis for the user
      client.hgetall(user.id, async (err, result) => {
        if (err) {
          return res.error(err);
        } else {
          let index = Number(result.index);
          let fileName = JSON.parse(result.fileNameArray)[index];
          let fileData = JSON.parse(result[`${fileName}`]);

          //check for the call type previous to show last indexed image data
          if (call_type === "previous") {
            index = index - 1;
            client.hmset(user.id, "index", index - 1, (err, re) => {
              if (err) {
                return res.error(err);
              }
            });

            fileName = JSON.parse(result.fileNameArray)[index - 1];
            Annotations.findOne({
              attributes: [
                ["fileName", "filename"],
                ["objectDetectionData", "objectdetectiondata"],
                ["segmentationData", "segmentationdata"],
                ["dlAnnotatedData", "dlannotateddata"],
                "metadata",
              ],
              where: {
                userId: user.id,
                fileName: fileName,
                isMoved: false,
              },
            })
              .then((resp) => {
                resp = JSON.stringify(resp);
                fileData = JSON.parse(resp);
              })
              .catch((e) => {
                res.json({ error: e });
              });
          }

          if (
            (call_type === "next" && curr_image_index != index) ||
            (call_type === "previous" && curr_image_index != index)
          ) {
            return res.json({ error: "index did not match" });
          } else {
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
                return res.error(err);
              } else {
                let newIndex = index + 1;
                client.hmset(user.id, "index", newIndex, (err, re) => {
                  if (err) {
                    return res.error(err);
                  }
                });
                const {
                  filename,
                  metadata,
                  dlannotateddata,
                  objectdetectiondata,
                  segmentationdata,
                } = fileData;
                let annotations = dlannotateddata;
                if (
                  call_type === "previous" &&
                  annotate_mode === "segmentation"
                ) {
                  annotations = segmentationdata;
                } else if (
                  call_type === "previous" &&
                  annotate_mode === "object_detection"
                ) {
                  annotations = objectdetectiondata;
                }
                return res.json({
                  image: data.Body,
                  image_key: filename,
                  metadata: metadata,
                  annotations: annotations,
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
