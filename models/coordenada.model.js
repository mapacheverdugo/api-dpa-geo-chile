const mongoose = require("mongoose");

module.exports = mongoose.model("Coordenada", {
    lat: Number,
    lng: Number
});