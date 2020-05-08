let mongoose = require('mongoose');
require("dotenv").config();


mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DATABASE}`,{useNewUrlParser: true});
console.log(process.env.MONGO_USER)
module.exports ={mongoose} 