var mongoose = require("mongoose");

const Schema = mongoose.Schema;
let evaluatorSchema = new Schema({
    eval_id: String,
    image_key: { type: String, required: true },    
    is_evaluated: Boolean,
    obj_annotations: {},
    seg_annotations: {},
    metadata: {},
    comments: { type: String, maxlength: 200 },
    obj_is_accepted: { type: Boolean, default: null },
    seg_is_accepted: { type: Boolean, default: null },
    created_date: { type: Date, default: Date.now }
});
let Evaluator = mongoose.model("evaluator_index", evaluatorSchema,"evaluator_index");

module.exports = { Evaluator };
