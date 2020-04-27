require("dotenv").config();

const axios = require("axios");
const simplify = require("simplify-js");

var regionesJson = require("../static/regiones.json");
//var regionesGeoJson = require("../../regiones.json");

exports.getAll = async (req, res) => {
  try {
    var regionesSubset = regionesJson.map((region) =>
      getRegionSubset(region, req.query)
    );

    res.status(200).json(regionesSubset);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    var coincidencias = regionesJson.filter(
      (r) => r.codigo == req.params.codigoRegion
    );

    if (coincidencias.length) {
      var region = coincidencias[0];

      var regionSubset = getRegionSubset(region, req.query);
      res.status(200).json(regionSubset);
    } else {
      res.status(500).json({
        error: `No se econtró región con código ${req.params.codigoRegion}`,
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
  var regionesDpa = await getRegionesDeDpa();
  for (const region of regionesDpa) {
    let coincidencias = local.filter((c) => c.codigo == region.codigo);
    if (!coincidencias.length) {
      console.log(region.codigo, region.nombre);
    }
  }
};

exports.generar = async (req, res) => {
  req.setTimeout(1000 * 60 * 10);
  try {
    var regionesOverpass = await getRegionesDeOverpass();
    var regionesDpa = await getRegionesDeDpa();

    /*var jsonContent = JSON.stringify(regiones);

    fs.writeFile("./static/regiones.json", jsonContent, "utf8", (error) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          error,
        });
      }

      res.status(200).json(regiones);
    });*/
    var regiones = [];

    for (const regionDpa of regionesDpa) {
      var region = {
        codigo: regionDpa.codigo,
        centro: {
          coordenadas: [regionDpa.lat, regionDpa.lng],
        },
      };

      var regionGeoJson =
        regionesGeoJson.features.filter(
          (c) => c.properties.codregion == parseInt(regionDpa.codigo)
        )[0] || null;
      var regionOverpass =
        regionesOverpass.elements.filter(
          (c) => c.tags["dpachile:id"] == regionDpa.codigo
        )[0] || null;

      if (regionOverpass) {
        region.nombre = regionOverpass.tags.name;
        region["ISO3166-2"] = regionOverpass.tags["ISO3166-2"];
        region.referencia = regionOverpass.tags.ref;
      } else {
        region.nombre = regionDpa.nombre;
      }

      if (regionGeoJson) {
        if (regionGeoJson.geometry.type == "MultiPolygon") {
          let multipoligono = [];
          for (const arreglo of regionGeoJson.geometry.coordinates) {
            multipoligono.push(arreglo[0]);
          }
          multipoligono = multipoligono.map((poligono) => {
            return poligono.map((coordenadas) => {
              return [coordenadas[1], coordenadas[0]];
            });
          });
          region.poligono = multipoligono;
        } else {
          let multipoligono = regionGeoJson.geometry.coordinate.map(
            (poligono) => {
              return poligono.map((coordenadas) => {
                return [coordenadas[1], coordenadas[0]];
              });
            }
          );
          region.poligono = multipoligono;
        }
      } else {
        region.poligono = null;
      }
      regiones.push(region);
    }

    res.status(200).json(regiones);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

getRegionSubset = (region, query) => {
  var mostrarCentro = true;
  var mostrarPoligono = false;
  var mostrarLimites = false;
  var tolerancia = 0;

  comparar(regionesJson);

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

  var regionSubset = {
    nombre: region.nombre,
    codigo: region.codigo,
    "ISO3166-2": region["ISO3166-2"],
    referencia: region.referencia,
  };

  if (mostrarCentro) {
    regionSubset.centro = region.centro;
  }

  if (mostrarLimites) {
    var minLat, minLng, maxLat, maxLng;
    for (const poligono of region.poligono) {
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
    regionSubset.limites = [
      [minLat, minLng],
      [maxLat, maxLng],
    ];
  }

  if (mostrarPoligono) {
    if (tolerancia > 0 && region.poligono) {
      var poligonosSimplificados = region.poligono.map((poligono) => {
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
      regionSubset.poligono = poligonosSimplificados.filter(
        (p) => p.length > 2
      );
    } else {
      regionSubset.poligono = region.poligono;
    }
  }
  return regionSubset;
};

getRegionesDeDpa = () => {
  return new Promise(async (resolve, reject) => {
    try {
      axios
        .get(`https://apis.digital.gob.cl/dpa/regiones`, {
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

getRegionesDeOverpass = () => {
  return new Promise(async (resolve, reject) => {
    try {
      var query = `
        rel(id: 167454);
        rel(r)[admin_level = 4];

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