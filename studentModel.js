const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    userName :{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true
    },
    phoneNumber:{
        type : Number,
        required : true
    },
    rollNumber:{
        type : Number,
        required : true
    },
    address:{
        type: String,
        required: true
    },
    gender:{
        type : String,
        required: true
    },
    dob:{
        type:String,
        required: true
    },
    userId:{
       type: Number
    },
    image:{
        type:Object
    } 
})
const student = mongoose.model('student', studentSchema);
module.exports = student