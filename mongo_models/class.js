var mongoose=require('mongoose')

Schema = mongoose.Schema
let classSchema = new Schema({
    project:String,
    obj_class:[],
    seg_class:[],
    meta_data:{
          road:[],
              climate:[],
                  time_of_day:[],
              area:[]
          }
  
  }); 
  let Classes=mongoose.model('classes', classSchema)
  
  module.exports ={Classes} 

