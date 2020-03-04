const aws = require("aws-sdk");
const fs = require("fs");

require("dotenv").config();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
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
  async getListedObject(req, res) {
    var getParams = {
      Bucket: process.env.BUCKET,
      Key: req.query.key
    };

    //Fetch or read data from aws s3
    await s3.getObject(getParams, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        res.write(data.Body, "binary");
        res.end(null, "binary");
      }
    });
  },

  createFolderS3(folderName) {
    var params = {
      Bucket: process.env.BUCKET,
      Key: `${folderName}/`,
      ACL: "public-read",
      Body: ""
    };

    s3.upload(params, function(err) {
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
      files.forEach(function(file) {
        s3.putObject({
          Bucket: process.env.BUCKET,
          Body: fs.readFileSync(`${directoryPath}/${file}`),
          Key: `${res.Contents[listIndex].Key}${file}`
        })
          .promise()
          .then(response => {
            console.log(`done! - `, response);
          })
          .catch(err => {
            console.log("failed:", err);
          });

        listIndex += 1;
        if (listIndex >= res.Contents.length) {
          listIndex = 0;
        }
      });
    });
  }
};
