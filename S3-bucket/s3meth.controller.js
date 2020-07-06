const aws = require("aws-sdk");
require("dotenv").config();


/**
 * @desc Create new s3 object with the secret Key
 */
const s3 = new aws.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});


module.exports = {
    async getImageData(fileName) {
        const getParams = {
            Bucket: process.env.BUCKET,
            Key: fileName,
        };
        s3.getObject(getParams)
            .promise()
            .then((data) => {
                return data
            })
            .catch((e) => {
                if (e.code === "NoSuchKey"){
                    return e
                }
            });
    }


}

