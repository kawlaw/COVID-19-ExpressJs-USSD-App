const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
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
    reportReference: {
        type: String,
        required: true
    }
})

module.exports = Report = mongoose.model('report', reportSchema)