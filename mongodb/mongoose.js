let mongoose = require('mongoose');
require("dotenv").config();


mongoose.Promise = global.Promise;
// mongoose.connect(`mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:27017/${process.env.MONGO_DATABASE}`,{useNewUrlParser: true});
mongoose.connect('mongodb+srv://m001-student:m001-mongodb-basics@cluster0-pkj8t.mongodb.net/Trial2?retryWrites=true&w=majority');
console.log(process.env.MONGO_USER)
module.exports ={mongoose} 