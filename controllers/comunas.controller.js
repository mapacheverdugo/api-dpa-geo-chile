require("dotenv").config();

const axios = require("axios");
const simplify = require("simplify-js");

var comunasJson = require("../static/comunas.json");
//var comunasGeoJson = require("../../comunas.json");

exports.getAll = async (req, res) => {
  try {
    var comunasSubset = comunasJson.map((comuna) =>
      getComunaSubset(comuna, req.query)
    );

    res.status(200).json(comunasSubset);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    var coincidencias = comunasJson.filter(
      (r) => r.codigo == req.params.codigoComuna
    );

    if (coincidencias.length) {
      var comuna = coincidencias[0];

      var comunaSubset = getComunaSubset(
        comuna,
        req.query
      );
      res.status(200).json(comunaSubset);
    } else {
      res.status(500).json({
        error: `No se econtró comuna con código ${req.params.codigoComuna}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getAllByProvincia = async (req, res) => {
  try {
    var comunasSubset = comunasJson.filter(c => c.padre.codigo == req.params.codigoProvincia).map((comuna) =>
      getComunaSubset(comuna, req.query)
    );

    res.status(200).json(comunasSubset);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getOneByProvincia = async (req, res) => {
  try {
    var coincidencias = comunasJson.filter(
      (r) => r.codigo == req.params.codigoComuna && c.padre.codigo == req.params.codigoProvincia
    );

    if (coincidencias.length) {
      var comuna = coincidencias[0];

      var comunaSubset = getComunaSubset(
        comuna,
        req.query
      );
      res.status(200).json(comunaSubset);
    } else {
      res.status(500).json({
        error: `No se econtró comuna con código ${req.params.codigoComuna} en la provincia ${req.params.codigoProvincia}`,
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


    var comunasSubset = comunasJson.filter(c => c.padre.codigo.startsWith(req.params.codigoRegion)).map((comuna) =>
      getComunaSubset(comuna, req.query)
    );

    res.status(200).json(comunasSubset);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getOneByRegion = async (req, res) => {
  try {
    var coincidencias = comunasJson.filter(
      (r) => r.codigo == req.params.codigoComuna && r.padre.codigo.startsWith(req.params.codigoRegion)
    );

    if (coincidencias.length) {
      var comuna = coincidencias[0];

      var comunaSubset = getComunaSubset(
        comuna,
        req.query
      );
      res.status(200).json(comunaSubset);
    } else {
      res.status(500).json({
        error: `No se econtró comuna con código ${req.params.codigoComuna} en la región ${req.params.codigoRegion}`,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getAllByRegionAndProvincia = async (req, res) => {
  try {
    var comunasSubset = comunasJson.filter(c => c.padre.codigo.startsWith(req.params.codigoRegion) && c.padre.codigo == req.params.codigoProvincia).map((comuna) =>
      getComunaSubset(comuna, req.query)
    );

    res.status(200).json(comunasSubset);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getOneByRegionAndProvincia = async (req, res) => {
  try {
    var coincidencias = comunasJson.filter(
      (r) => r.codigo == req.params.codigoComuna && r.padre.codigo.startsWith(req.params.codigoRegion) && c.padre.codigo == req.params.codigoProvincia
    );

    if (coincidencias.length) {
      var comuna = coincidencias[0];

      var comunaSubset = getComunaSubset(
        comuna,
        req.query
      );
      res.status(200).json(comunaSubset);
    } else {
      res.status(500).json({
        error: `No se econtró comuna con código ${req.params.codigoComuna} en la región ${req.params.codigoRegion} y provincia ${req.params.codigoProvincia}`,
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
  var comunasDpa = await getComunasDeDpa();
  for (const comuna of comunasDpa) {
    let coincidencias = local.filter((c) => c.codigo == comuna.codigo);
    if (!coincidencias.length) {
      console.log(comuna.codigo, comuna.nombre);
    }
  }
};

exports.generar = async (req, res) => {
  req.setTimeout(1000 * 60 * 10);
  try {
    var comunasOverpass = await getComunasDeOverpass();
    var comunasDpa = await getComunasDeDpa();

    /*var jsonContent = JSON.stringify(comunas);

    fs.writeFile("./static/comunas.json", jsonContent, "utf8", (error) => {
      if (error) {
        console.log(error);
        res.status(500).json({
          error,
        });
      }

      res.status(200).json(comunas);
    });*/
    var comunas = [];

    for (const comunaDpa of comunasDpa) {
      var comuna = {
        codigo: comunaDpa.codigo,
        nombre: comunaDpa.nombre,
        centro: {
          coordenadas: [comunaDpa.lat, comunaDpa.lng]
        },
        padre: {
          codigo: comunaDpa.codigo_padre,
          href: `/provincias/${comunaDpa.codigo_padre}`
        }
      }

      var comunaGeoJson =
        comunasGeoJson.features.filter(
          (c) =>
          c.properties.cod_comuna == parseInt(comunaDpa.codigo)
        )[0] || null;
      var comunaOverpass = comunasOverpass.elements.filter(
        (c) =>
        c.tags["dpachile:id"] == comunaDpa.codigo
      )[0] || null;

      if (comunaGeoJson) {
        if (comunaGeoJson.geometry.type == "MultiPolygon") {
          let multipoligono = [];
          for (const arreglo of comunaGeoJson.geometry.coordinates) {
            multipoligono.push(arreglo[0]);
          }
          multipoligono = multipoligono.map(poligono => {
            return poligono.map(coordenadas => {
              return [coordenadas[1], coordenadas[0]];
            });
          });
          comuna.poligono = multipoligono;
        } else {
          let multipoligono = comunaGeoJson.geometry.coordinate.map(poligono => {
            return poligono.map(coordenadas => {
              return [coordenadas[1], coordenadas[0]];
            });
          });
          comuna.poligono = multipoligono;
        }
      } else {
        comuna.poligono = null;
      }
      comunas.push(comuna);
    }

    res.status(200).json(comunas);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

getComunaSubset = (comuna, query) => {
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

  var comunaSubset = {
    nombre: comuna.nombre,
    codigo: comuna.codigo,
    padre: comuna.padre
  };

  if (mostrarCentro) {
    comunaSubset.centro = comuna.centro;
  }

  if (mostrarLimites) {
    var minLat, minLng, maxLat, maxLng;
    for (const poligono of comuna.poligono) {
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
    comunaSubset.limites = [
      [minLat, minLng],
      [maxLat, maxLng],
    ];
  }

  if (mostrarPoligono) {
    if (tolerancia > 0 && comuna.poligono) {
      var poligonosSimplificados = comuna.poligono.map(
        (poligono) => {
          var poligonoParseado = poligono.map((coordenadas) => {
            return {
              x: coordenadas[0],
              y: coordenadas[1],
            };
          });

          var puntosSimplificados = simplify(
            poligonoParseado,
            tolerancia,
            true
          );
          return puntosSimplificados.map((coordenadas) => {
            return [coordenadas.x, coordenadas.y];
          });
        }
      );
      comunaSubset.poligono = poligonosSimplificados.filter(
        (p) => p.length > 2
      );
    } else {
      comunaSubset.poligono = comuna.poligono;
    }
  }
  return comunaSubset;
};

getComunasDeDpa = () => {
  return new Promise(async (resolve, reject) => {
    try {
      axios
        .get(`https://apis.digital.gob.cl/dpa/comunas`, {
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

getComunasDeOverpass = () => {
  return new Promise(async (resolve, reject) => {
    try {
      var query = `
        rel(id: 167454);
        rel(r);
        rel(r);
        rel(r)[admin_level = 8];

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