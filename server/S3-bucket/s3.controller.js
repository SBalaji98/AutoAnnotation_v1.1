const aws = require("aws-sdk");
const jsonConfig = require("../../config.json");

const s3 = new aws.S3({
  accessKeyId: jsonConfig.aws.accessKeyId,
  secretAccessKey: jsonConfig.aws.secretAccessKey
});

module.exports = {
  getObjectList() {
    aws.config.setPromisesDependency();

    let res = s3
      .listObjectsV2({ Bucket: jsonConfig.bucket, Prefix: "fluxImg" })
      .promise();
    return res;
  },
  async getListedObject(req, res) {
    var getParams = {
      Bucket: jsonConfig.bucket,
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
      Bucket: jsonConfig.bucket,
      Key: `${folderName}/`,
      ACL: "public-read",
      Body: "body does not matter"
    };

    s3.upload(params, function(err, data) {
      if (err) {
        console.log("Error creating the folder: ", err);
      } else {
        console.log("Successfully created a folder on S3");
      }
    });
  }
};
