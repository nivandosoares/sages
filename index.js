const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const routes = require("./routes");
// Carregar variáveis de ambiente
dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI;
const app = express();
// Configurar o middleware bodyParsers
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(__dirname + "/public"));
const PORT = process.env.PORT || 4000;

// Configurar o mecanismo de visualização EJS
app.set("view engine", "ejs");

// Conectar ao MongoDB
mongoose.connect(MONGODB_URI);

app.use(routes);

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`started on port:${PORT}`);
});
