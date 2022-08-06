const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName :{
        type : String,
        required : true
    },
    lastName:{
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
    password:{
        type : String,
        required:true
    },
    userId:{
        type: Number
    }
})

const user = mongoose.model('user', userSchema);
module.exports = user