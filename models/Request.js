const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    fullName: {
        type: String,
        min: 2,
        required: true
    },
    contact_details: {
        district: {
            type: String,
            required: true
        },
        nextOfKinPhoneNumber: {
            type: Number,
            required: true
        },
        MSISDN: {
            type: Number,
            required: true
        },
        NIN: {
            type: String,
            required: true,
            min: 12,
            max: 12
        }
    },
    requestReference: {
        type: String,
        required: true
    }
})

module.exports = Request = mongoose.model('request', requestSchema)