const mongoose = require("mongoose");

const Coordenada = require("./coordenada.model");

export default mongoose.model("Region", {
    codigo: String,
    nombre: String,
    "ISO3166-2": String,
    centro: Coordenada,
    contorno: [Coordenada]
});