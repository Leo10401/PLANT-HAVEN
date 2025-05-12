const { Schema, model } = require('../connection');

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: String,
    avatar: { type: String },
    role: { type: String, default: 'user'},
    createdAt: { type: Date, default: Date.now },
    description:{type: String},
    shipping: {
        address: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String },
        phoneNumber: { type: String }
    },
    paymentMethod: { type: String }
});

module.exports = model('user', userSchema);