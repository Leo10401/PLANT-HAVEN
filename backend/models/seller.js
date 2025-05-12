const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    shopName: {
        type: String,
        required: true
    },
    gstNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                return /^[0-9A-Z]{15}$/.test(v);
            },
            message: props => `${props.value} is not a valid GST number! It must be exactly 15 alphanumeric characters.`
        }
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    mapLocation: {
        type: String,
        required: false
    },
    contactNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'seller'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Seller', sellerSchema); 