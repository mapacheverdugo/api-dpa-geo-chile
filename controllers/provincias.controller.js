require("dotenv").config();

const axios = require("axios");
const simplify = require("simplify-js");

var provinciasJson = require("../static/provincias.json");
var provinciasGeoJson = require("../../provincias.json");

exports.getAll = async (req, res) => {
  try {
    var provinciasSubset = provinciasJson.map((provincia) =>
      getProvinciaSubset(provincia, req.query)
    );

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
    var coincidencias = provinciasJson.filter(
      (r) => r.codigo == req.params.codigoProvincia
    );

    if (coincidencias.length) {
      var provincia = coincidencias[0];

      var provinciaSubset = getProvinciaSubset(provincia, req.query);
      res.status(200).json(provinciaSubset);
    } else {
      res.status(500).json({
        error: `No se econtró provincia con código ${req.params.codigoProvincia}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getAllByRegion = async (req, res) => {
  try {
    var provinciasSubset = provinciasJson
      .filter((c) => c.padre.codigo == req.params.codigoRegion)
      .map((provincia) => getProvinciaSubset(provincia, req.query));

    res.status(200).json(provinciasSubset);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getOneByRegion = async (req, res) => {
  try {
    var coincidencias = provinciasJson.filter(
      (r) =>
      r.codigo == req.params.codigoProvincia &&
      r.padre.codigo == req.params.codigoRegion
    );

    if (coincidencias.length) {
      var provincia = coincidencias[0];

      var provinciaSubset = getProvinciaSubset(provincia, req.query);
      res.status(200).json(provinciaSubset);
    } else {
      res.status(500).json({
        error: `No se econtró provincia con código ${req.params.codigoProvincia} en la región ${req.params.codigoRegion}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

comparar = async (local) => {
  var provinciasDpa = await getProvinciasDeDpa();
  for (const provincia of provinciasDpa) {
    let coincidencias = local.filter((c) => c.codigo == provincia.codigo);
    if (!coincidencias.length) {
      console.log(provincia.codigo, provincia.nombre);
    }
  }
};

exports.generar = async (req, res) => {
  req.setTimeout(1000 * 60 * 10);
  try {
    var provinciasOverpass = await getProvinciasDeOverpass();
    var provinciasDpa = await getProvinciasDeDpa();

    /*var jsonContent = JSON.stringify(provincias);

        fs.writeFile("./static/provincias.json", jsonContent, "utf8", (error) => {
          if (error) {
            console.log(error);
            res.status(500).json({
              error,
            });
          }

          res.status(200).json(provincias);
        });*/
    var provincias = [];

    for (const provinciaDpa of provinciasDpa) {
      var provincia = {
        codigo: provinciaDpa.codigo,
        nombre: provinciaDpa.nombre,
        centro: {
          coordenadas: [provinciaDpa.lat, provinciaDpa.lng],
        },
        padre: {
          codigo: provinciaDpa.codigo_padre,
          href: `/regiones/${provinciaDpa.codigo_padre}`,
        },
      };

      var provinciaGeoJson =
        provinciasGeoJson.features.filter(
          (c) => c.properties.cod_prov == parseInt(provinciaDpa.codigo)
        )[0] || null;
      var provinciaOverpass =
        provinciasOverpass.elements.filter(
          (c) => c.tags["dpachile:id"] == provinciaDpa.codigo
        )[0] || null;

      if (provinciaOverpass) {
        provincia.nombreCompleto = provinciaOverpass.tags.name;
      }

      if (provinciaGeoJson) {
        if (provinciaGeoJson.geometry.type == "MultiPolygon") {
          let multipoligono = [];
          for (const arreglo of provinciaGeoJson.geometry.coordinates) {
            multipoligono.push(arreglo[0]);
          }
          multipoligono = multipoligono.map((poligono) => {
            return poligono.map((coordenadas) => {
              return [coordenadas[1], coordenadas[0]];
            });
          });
          provincia.poligono = multipoligono;
        } else {
          let multipoligono = provinciaGeoJson.geometry.coordinate.map(
            (poligono) => {
              return poligono.map((coordenadas) => {
                return [coordenadas[1], coordenadas[0]];
              });
            }
          );
          provincia.poligono = multipoligono;
        }
      } else {
        provincia.poligono = null;
      }
      provincias.push(provincia);
    }

    res.status(200).json(provincias);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

getProvinciaSubset = (provincia, query) => {
  var mostrarCentro = true;
  var mostrarPoligono = false;
  var mostrarLimites = false;
  var tolerancia = 0;

  if (query && query.poligono == "true") {
    if (
      query.tolerancia &&
      parseFloat(query.tolerancia) &&
      parseFloat(query.tolerancia) > 0
    ) {
      tolerancia = parseFloat(query.tolerancia);
    }

    mostrarPoligono = true;
  }

  if (query && query.centro == "false") {
    mostrarCentro = false;
  }

  if (query && query.limites == "true") {
    mostrarLimites = true;
  }

  var provinciaSubset = {
    nombre: provincia.nombre,
    nombreCompleto: provincia.nombreCompleto,
    codigo: provincia.codigo,
    padre: provincia.padre,
  };

  if (mostrarCentro) {
    provinciaSubset.centro = provincia.centro;
  }

  if (mostrarLimites) {
    var minLat, minLng, maxLat, maxLng;
    for (const poligono of provincia.poligono) {
      for (const parCoordenadas of poligono) {
        if (minLat == null) minLat = parCoordenadas[0];
        if (maxLat == null) maxLat = parCoordenadas[0];
        if (minLng == null) minLng = parCoordenadas[1];
        if (maxLng == null) maxLng = parCoordenadas[1];

        if (minLat > parCoordenadas[0]) minLat = parCoordenadas[0];
        if (maxLat < parCoordenadas[0]) maxLat = parCoordenadas[0];
        if (minLng > parCoordenadas[1]) minLng = parCoordenadas[1];
        if (maxLng < parCoordenadas[1]) maxLng = parCoordenadas[1];
      }
    }
    provinciaSubset.limites = [
      [minLat, minLng],
      [maxLat, maxLng],
    ];
  }

  if (mostrarPoligono) {
    if (tolerancia > 0 && provincia.poligono) {
      var poligonosSimplificados = provincia.poligono.map((poligono) => {
        var poligonoParseado = poligono.map((coordenadas) => {
          return {
            x: coordenadas[0],
            y: coordenadas[1],
          };
        });

        var puntosSimplificados = simplify(poligonoParseado, tolerancia, true);
        return puntosSimplificados.map((coordenadas) => {
          return [coordenadas.x, coordenadas.y];
        });
      });
      provinciaSubset.poligono = poligonosSimplificados.filter(
        (p) => p.length > 2
      );
    } else {
      provinciaSubset.poligono = provincia.poligono;
    }
  }
  return provinciaSubset;
};

getProvinciasDeDpa = () => {
  return new Promise(async (resolve, reject) => {
    try {
      axios
        .get(`https://apis.digital.gob.cl/dpa/provincias`, {
          timeout: 1000 * 60 * 10,
        })
        .then((r) => {
          resolve(r.data);
        })
        .catch((e) => {
          reject(e);
        });
    } catch (error) {
      reject(error);
    }
  });
};

getProvinciasDeOverpass = () => {
  return new Promise(async (resolve, reject) => {
    try {
      var query = `
        rel(id: 167454);
        rel(r);
        rel(r)[admin_level = 6];

        out tags;
      `;

      var r = await overpassQuery(query);

      resolve(r);
    } catch (error) {
      reject(error);
    }
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