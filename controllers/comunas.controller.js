const fs = require("fs");
const axios = require("axios");

var coordenadasGlobal = require("../static/comunas.json");

exports.getAll = async (req, res) => {
  try {
    var registros = await getRegistrosIncremental();
    res.status(200).json(registros);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.test = async (req, res) => {
  try {
    //var comuna = await getComuna(168297);
    var query = `
      area[admin_level=2]["ISO3166-1"="CL"] -> .search;
      (
        rel(area.search)[admin_level=4] -> .relation;
        way(r.relation:"outer");
      );
      out ids geom;
    `;
    var r = await overpassQuery(query);

    res.status(200).json(r);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

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
      .get(`https://lz4.overpass-api.de/api/interpreter?data=${q}`)
      .then(async (r) => {
        resolve(r.data);
      })
      .catch((e) => {
        reject(e)
      });
  });
}

