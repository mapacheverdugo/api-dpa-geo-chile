const mongoose = require("mongoose");

export default mongoose.model("Coordenada", {
    lat: Number,
    lng: Number
});