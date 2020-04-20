const aws = require("aws-sdk");
const fs = require("fs");
const redis = require("redis");
const client = redis.createClient();
const Annotations = require("../models").Annotation;
require("dotenv").config();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

module.exports = {
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

  //get image bffer with data related to image
  async getListedObject(req, res, user) {
    try {
      const { call_type, curr_image_index, annotate_mode } = req.query;
      client.hgetall(user.id, async (err, result) => {
        if (err) {
          return res.error(err);
        } else {
          let index = Number(result.index);
          let fileName = JSON.parse(result.fileNameArray)[index];
          let fileData = JSON.parse(result[`${fileName}`]);

          if (call_type === "previous") {
            index = index - 1;
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

            //Fetch or read data from aws s3
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
