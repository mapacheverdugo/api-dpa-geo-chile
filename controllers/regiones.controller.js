require('dotenv').config();

const axios = require("axios");

const Region = require("../models/region.model");

exports.test = async (req, res) => {
  try {
    //var comuna = await getComuna(168297);
    var query = `
        area[admin_level=2]["ISO3166-1"="CL"] -> .search;
        (
          rel(area.search)[admin_level=4]["ISO3166-2"="CL-RM"] -> .relation;
          way(r.relation:"outer");
        );
        out ids geom;
      `;

    var region = new Region({
      nombre: "uwu",
      codigo: "awa",
      centro: {
        lat: -23.7503,
        lng: -67.6
      },
      contorno: [{
          lat: -21.7503,
          lng: -68.6
        },
        {
          lat: -22.7503,
          lng: -69.6
        },
        {
          lat: -20.7503,
          lng: -66.6
        },
      ]
    });
    //var result = await region.save();

    var regiones = await getRegiones();
    res.status(200).json(regiones);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

getRegiones = () => {
  return new Promise(async (resolve, reject) => {
    try {
      var query = `
        rel(id: 167454);
        rel(r)[admin_level = 4];
        out tags;
      `;


      var r = await overpassQuery(query);
      var regionesIncompletas = parseRegiones(r.elements);

      var promesas = regionesIncompletas.map(region => getRegion(region));
      var regiones = Promise.all(promesas);

      /*
      var regiones = [];
      for (const region of regionesIncompletas) {
        var regionCompleta = await getRegion(region);
        regiones.push(regionCompleta);
      }
      */

      resolve(regiones);
    } catch (error) {
      reject(error);
    }
  });
}

getRegion = (region) => {
  return new Promise(async (resolve, reject) => {
    try {
      var query = `
        (
          rel(id: ${region.osmId}) -> .relation;
          way(r.relation: "outer");
          node(r.relation: "admin_centre");
        );
        out ids geom;
      `;

      var regionCopia = {
        ...region
      }
      var r = await overpassQuery(query);

      var nodos = r.elements.filter(e => e.type == "node");
      var nodoCentral = nodos[0];

      regionCopia.centro = {
        lat: nodoCentral.lat,
        lng: nodoCentral.lon
      };

      var bordes = r.elements.filter(e => e.type == "way");
      var bordesFinales = [];
      for (const borde of bordes) {
        var coordenadas = [];
        for (const coordenada of borde.geometry) {
          coordenadas.push({
            lat: coordenada.lat,
            lng: coordenada.lon
          });
        }
        bordesFinales.push(coordenadas);
      }

      regionCopia.contorno = bordesFinales;

      resolve(regionCopia);
    } catch (error) {
      reject(error);
    }
  });

}

parseRegiones = (regiones) => {
  var regionesParseadas = [];
  for (const region of regiones) {
    var regionParseada = parseRegion(region);
    regionesParseadas.push(regionParseada);
  }
  return regionesParseadas;
}

parseRegion = (region) => {
  return {
    osmId: region.id,
    codigo: region.tags["dpachile:id"],
    nombre: region.tags.name,
    "ISO3166-2": region.tags["ISO3166-2"]
  }
}

overpassQuery = (query) => {
  query.replace(/\n|\r/g, "");
  var q = "[out:json];" + query;
  q = encodeURI(q);

  return new Promise((resolve, reject) => {
    axios
      .get(`${process.env.OVERPASS_URL}/interpreter?data=${q}`)
      .then(async (r) => {
        resolve(r.data);
      })
      .catch((e) => {
        reject(e)
      });
  });
}