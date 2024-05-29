require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const app = express();

// MIDDLEWARE
app.use(logger("dev"));
app.use(express.static("public"));
app.use(express.json());

// Conectar ao MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/final-project-server")
  .then((x) =>
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  )
  .catch((err) => console.error("Error connecting to mongo", err));

// IMPORTAR ROTAS
const authRoutes = require("./routes/auth.routes");

// USAR ROTAS
app.use("/auth", authRoutes);

// ROTA PRINCIPAL
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

app.listen(3000, () => console.log("App listening on port 3000!"));
