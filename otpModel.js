const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type : String,
        expires : 360
    },
    otp: {
        type : String,
        expires : 360
    },
    createdAt: { type: Date, expires: '2m', default: Date.now }
})
const otp =  mongoose.model('otp', otpSchema)
module.exports = otp