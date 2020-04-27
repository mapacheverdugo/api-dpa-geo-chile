require("dotenv").config();

const fs = require("fs");
const axios = require("axios");
const simplify = require("simplify-js");

var provincias = require("../static/provincias.json");

exports.getAll = async (req, res) => {
    try {
        var mostrarFrontera = false;
        var tolerancia = 0;
        var mostrarCentro = true;

        if (req.query && req.query.frontera == "true") {
            if (req.query.tolerancia && parseFloat(req.query.tolerancia) && parseFloat(req.query.tolerancia) > 0) {
                tolerancia = parseFloat(req.query.tolerancia);
            }

            mostrarFrontera = true;
        }

        if (req.query && req.query.centro == "false") {
            mostrarCentro = false;
        }

        var provinciasSubset = provincias.map((provincia) => getProvinciaSubset(provincia, mostrarCentro, mostrarFrontera, tolerancia));

        res.status(200).json(provinciasSubset);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error,
        });
    }
};

exports.getOne = async (req, res) => {
    try {
        var mostrarFrontera = false;
        var tolerancia = 0;
        var mostrarCentro = true;

        if (req.query && req.query.frontera == "true") {
            if (req.query.tolerancia && parseFloat(req.query.tolerancia) && parseFloat(req.query.tolerancia) > 0) {
                tolerancia = parseFloat(req.query.tolerancia);
            }

            mostrarFrontera = true;
        }

        if (req.query && req.query.centro == "false") {
            mostrarCentro = false;
        }

        var coincidencias = provincias.filter((r) => r.codigo == req.params.codigoProvincia);

        if (coincidencias.length) {
            var provincia = coincidencias[0];

            var provinciaSubset = getProvinciaSubset(provincia, mostrarCentro, mostrarFrontera, tolerancia);
            res.status(200).json(provinciaSubset);
        } else {
            res.status(500).json({
                error: `No se econtró región con código ${req.params.codigoProvincia}`,
            });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({
            error,
        });
    }
};

exports.generar = async (req, res) => {
    req.setTimeout(1000 * 60 * 10);
    try {
        var provincias = await getProvinciasFromOverpass();
        var jsonContent = JSON.stringify(provincias);

        fs.writeFile("./static/provincias.json", jsonContent, "utf8", (error) => {
            if (error) {
                console.log(error);
                res.status(500).json({
                    error,
                });
            }

            res.status(200).json(provincias);
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error,
        });
    }
};

getProvinciaSubset = (provincia, mostrarCentro, mostrarFrontera, tolerancia) => {
    var provinciaSubset = {
        nombre: provincia.nombre,
        codigo: provincia.codigo,
        "ISO3166-2": provincia["ISO3166-2"],
        cardinalidad: provincia.cardinalidad
    };

    if (mostrarCentro) {
        //provinciaSubset.centro = provincia.centro;
    }

    if (mostrarFrontera) {
        if (tolerancia > 0) {
            var poligonosSimplificados = provincia.fronteraAdministrativa.map(poligono => {
                var poligonoParseado = poligono.map(coordenadas => {
                    return {
                        x: coordenadas[0],
                        y: coordenadas[1],
                    };
                });

                var puntosSimplificados = simplify(poligonoParseado, tolerancia, true);
                return puntosSimplificados.map((coordenadas) => {
                    return [
                        coordenadas.x,
                        coordenadas.y,
                    ];
                });
            });
            provinciaSubset.fronteraAdministrativa = poligonosSimplificados.filter(p => p.length > 2);
        } else {
            provinciaSubset.fronteraAdministrativa = provincia.fronteraAdministrativa;
        }
    }
    return provinciaSubset;
}

getProvinciasFromOverpass = () => {
    return new Promise(async (resolve, reject) => {
        try {
            var query = `
        rel(id: 167454);
        rel(r);
        rel(r)[admin_level = 6];

        out tags;
      `;

            var r = await overpassQuery(query);
            var provincias = [];

            for (const provincia of r.elements) {
                let multipoligono = await obtenerPoligono(provincia.id);
                provincias.push({
                    codigo: provincia.tags["dpachile:id"],
                    nombre: provincia.tags.name,
                    fronteraAdministrativa: multipoligono.map(poligono => {
                        return poligono[0];
                    })
                });
            }

            resolve(provincias);
        } catch (error) {
            reject(error);
        }
    });
};

obtenerPoligono = (id) => {
    return new Promise((resolve, reject) => {
        axios
            .get(`http://polygons.openstreetmap.fr/get_geojson.py?id=${id}&params=0`, {
                timeout: 1000 * 60 * 10,
            })
            .then((r) => {
                console.log(id);
                resolve(r.data.geometries[0].coordinates);
            })
            .catch((e) => {
                reject(e);
            });
    });
};

overpassQuery = (query) => {
    query.replace(/\n|\r/g, "");
    var q = "[out: json][timeout: 600];" + query;
    q = encodeURI(q);

    return new Promise((resolve, reject) => {
        axios
            .get(`${process.env.OVERPASS_URL}/interpreter?data=${q}`, {
                timeout: 1000 * 60 * 10,
            })
            .then((r) => {
                resolve(r.data);
            })
            .catch((e) => {
                reject(e);
            });
    });
};