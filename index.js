const express = require("express");
const bodyParser = require("body-parser");
var morgan = require("morgan");
const router = require("./router/routes");

String.prototype.toCamelCase = function () {
  return this.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return "";
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
};

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

app.use(morgan("dev"));

app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.get("/", (req, res) => {
  res.json({
    mensaje: "API funcionando correctamente",
  });
});

app.use("/v1", router);

app.listen(3030, () => {
  console.log("El servidor está inicializado en el puerto 3000");
});
