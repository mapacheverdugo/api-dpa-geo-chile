const mongoose = require("mongoose");

module.exports = new mongoose.Schema({
    lat: Number,
    lng: Number
}, {
    _id: false
});