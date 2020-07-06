const { Evaluator } = require("../mongo_models/evaluator");
const s3controller = require("../S3-bucket/s3meth.controller");
const { exists } = require("fs");

const aws = require("aws-sdk");
require("dotenv").config();

const s3 = new aws.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
});


module.exports = {
    async getImageList(req, res, next) {
        try {
            var imageList = []
            const { user } = req;
            Evaluator.find({ eval_id: user.id,is_evaluated:false }).then((result) => {
                console.log(user.id)
                console.log(result)
                result.map((image) => {
                    const { image_key } = image;
                    imageList.push(image_key)
                })
                const getParams = {
                    Bucket: process.env.BUCKET,
                    Key: result[0].image_key,
                };
                console.log(getParams.Key)
                s3.getObject(getParams)
                    .promise()
                    .then((data) => {
                        console.log("[imagedata]", data)
                        res.json({
                            image: data.Body,
                            image_key: result[0].image_key,
                            image_list: imageList,
                            annotations: {
                                "obj_annotations": result[0].obj_annotations,
                                "seg_annotations": result[0].seg_annotations
                            },
                            metadata: result[0].metadata
                        });
                    })
                    .catch((e) => {
                        // console.log(e)
                        if (e.code === "NoSuchKey") {
                            return res.send(e)
                        }
                        return res.send(e)  
                    });
            })
        } catch (error) {
            res.json(error)
        }
    },

    postImage(req,res,next){
        try {
            Evaluator.findOneAndUpdate({image_key:req.body.image_key},req.body,{new:true}).then((result)=>{
                console.log(result)
                this.getImage(req,res)
            })
        } catch (error) {
            res.send(error)
        }
    },


    getImage(req,res,next){
        try {
            Evaluator.findOne({image_key:req.query.image_key}).then((result)=>{
                const getParams = {
                    Bucket: process.env.BUCKET, 
                    Key: req.query.image_key,
                };
                s3.getObject(getParams)
                .promise()
                .then((data) => {
                    console.log("[imagedata]", data)
                    res.json({
                        image: data.Body,
                        image_key: result.image_key,
                        annotations: {
                            "obj_annotations": result.obj_annotations,
                            "seg_annotations": result.seg_annotations
                        },
                        metadata: result.metadata
                    });
                })
                .catch((e) => {
                    // console.log(e)
                    if (e.code === "NoSuchKey") {
                        return res.send(e)
                    }
                    return res.send(e)  
                });
            })
            .catch(e=>{            
                res.send(e)
            })
            
        } catch (error) {
            res.send(error)
        }
    }



}
