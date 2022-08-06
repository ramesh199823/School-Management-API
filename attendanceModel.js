const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
    userName:{
        type:String,
        required: true
    },
    rollNumber: {
        type: Number,
        required: true,
    },
    attendanceDetails: {
        type: String,
        required: true
    },
    userId:{
        type: Number,
        required: true
    },
    date:{
        type: String,
        required: true,
        unique: true
    }
})
const attendance = mongoose.model('attendance', attendanceSchema);
module.exports = attendance