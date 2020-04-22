const mongoose = require("mongoose");

const Coordenada = require("./coordenada.model");

module.exports = mongoose.model("Region", {
    codigo: String,
    nombre: String,
    centro: Coordenada.schema,
    contorno: [Coordenada.schema]
});