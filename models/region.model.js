const mongoose = require("mongoose");

const CoordenadaSchema = require("./coordenada.schema");

var schema = new mongoose.Schema({
    codigo: {
        type: String,
        unique: true
    },
    "ISO3166-2": {
        type: String,
        unique: true
    },
    nombre: String,
    centro: CoordenadaSchema,
    contorno: [CoordenadaSchema]
});

module.exports = mongoose.model("Region", schema);