const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    rollNumber:{
        type:Number,
        required:true
    },
    subject:{
        type: String,
        required: true
    },
    pdfData:{
        type: String
    },
    userId:{
        type:Number,
        required:true
    }
})

const assignmentModel = mongoose.model('assignment', assignmentSchema)
module.exports = assignmentModel