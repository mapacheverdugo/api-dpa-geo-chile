require("dotenv").config();

const axios = require("axios");

const regionesJson = require("../static/regiones.json");

const RegionModel = require("../models/region.model");

exports.test = async (req, res) => {
  try {
    var regiones = parseOverpassRegiones(regionesJson.elements);

    for (const region of regiones) {
      var nuevaRegion = new Region(region);
      await nuevaRegion.save();
    }

    res.status(200).json(regiones);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    var regiones = await RegionModel.findOne(
      {},
      "nombre codigo ISO3166-2 contorno"
    ).exec();
    console.log("Ya lo obtuvo pero no se ah");

    res.status(200).json(regiones);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

getRegionesFromOverpass = () => {
  return new Promise(async (resolve, reject) => {
    try {
      var query = `
        rel(id: 167454);
        rel(r)[admin_level = 4] -> .regiones;
        foreach.regiones -> .region(
          (
            .region;
            way(r.region: "outer");
            node(r.region: "admin_centre");
            make sep;
          );
          out tags geom;
        );
      `;

      var r = await overpassQuery(query);

      var regiones = [];
      for (const region of regionesIncompletas) {
        var regionCompleta = await getRegion(region);
        regiones.push(regionCompleta);
      }

      resolve(parseOverpassRegiones(r.elements));
    } catch (error) {
      reject(error);
    }
  });
};

parseOverpassRegiones = (elementos) => {
  var regiones = [];
  var regionActual = {};
  for (const elemento of elementos) {
    if (elemento.type == "node") {
      regionActual.centro = {
        lat: elemento.lat,
        lng: elemento.lon,
      };
    } else if (elemento.type == "way") {
      if (!regionActual.hasOwnProperty("contorno")) {
        regionActual.contorno = [];
      }
      var coordenadas = [];
      for (const coordenada of elemento.geometry) {
        coordenadas.push({
          lat: coordenada.lat,
          lng: coordenada.lon,
        });
      }
      regionActual.contorno.push(coordenadas);
    } else if (elemento.type == "relation") {
      regionActual.codigo = elemento.tags["dpachile:id"];
      regionActual.nombre = elemento.tags.name;
      regionActual["ISO3166-2"] = elemento.tags["ISO3166-2"];
    } else {
      regionActual.contorno = ordenarCaminos(regionActual.contorno).flat(1);
      regiones.push(regionActual);
      regionActual = {};
    }
  }
  return regiones;
};

distanciaEntreCoordenadas = (coord1, coord2) => {
  var lat1 = coord1.lat;
  var lon1 = coord1.lng;
  var lat2 = coord2.lat;
  var lon2 = coord2.lng;

  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344;

  if (!dist) {
    dist = 0;
  }
  return dist;
};

ordenarCaminos = (caminos) => {
  let copiaCaminos = caminos.slice();
  let caminosOrdenados = [];
  let caminoActual = copiaCaminos.pop();

  while (copiaCaminos.length) {
    let distancias = [];
    caminosOrdenados.push(caminoActual);

    let primeroActual = caminoActual[0];
    let ultimoActual = caminoActual.slice().pop();

    for (const c of copiaCaminos) {
      let primero = c[0];
      let ultimo = c.slice().pop();

      let distanciaConPrimero = distanciaEntreCoordenadas(
        ultimoActual,
        primero
      );
      let distanciaConUltimo = distanciaEntreCoordenadas(ultimoActual, ultimo);

      if (distanciaConPrimero < distanciaConUltimo) {
        distancias.push({
          d: distanciaConPrimero,
          i: false,
        });
      } else {
        distancias.push({
          d: distanciaConUltimo,
          i: true,
        });
      }
    }

    let soloDistancias = [];
    for (const distancia of distancias) {
      soloDistancias.push(distancia.d);
    }
    let indice = soloDistancias.indexOf(Math.min.apply(null, soloDistancias));
    if (indice < 0) {
      console.log(Math.min.apply(null, soloDistancias));
    }

    if (distancias[indice].i) {
      copiaCaminos[indice] = copiaCaminos[indice].reverse();
    }

    caminoActual = copiaCaminos[indice];
    copiaCaminos.splice(indice, 1);
  }

  caminosOrdenados.push(caminoActual);

  return caminosOrdenados;
};

overpassQuery = (query) => {
  query.replace(/\n|\r/g, "");
  var q = "[out: json][timeout: 600];" + query;
  q = encodeURI(q);

  return new Promise((resolve, reject) => {
    axios
      .get(`${process.env.OVERPASS_URL}/interpreter?data=${q}`)
      .then(async (r) => {
        resolve(r.data);
      })
      .catch((e) => {
        reject(e);
      });
  });
};
