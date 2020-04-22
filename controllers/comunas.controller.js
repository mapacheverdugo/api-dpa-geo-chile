const fs = require("fs");
const axios = require("axios");

const Region = require("../models/region.model");

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
        rel(area.search)[admin_level=4]["ISO3166-2"="CL-RM"] -> .relation;
        way(r.relation:"outer");
      );
      out ids geom;
    `;
    var r = await overpassQuery(query);

    var region = new Region({
      nombre: "uwu",
      codigo: "awa",
      centro: {
        lat: -23.7503,
        lng: -67.6
      },
      contorno: [
        {
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

    res.status(200).json(r);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error,
    });
  }
};

