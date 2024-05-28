// app.js
const express = require("express");
const logger = require("morgan");

const mongoose = require("mongoose");

const app = express();

// MIDDLEWARE
app.use(logger("dev"));
app.use(express.static("public"));
app.use(express.json());

//connect mongosse

mongoose
  .connect("mongodb://127.0.0.1:27017/final-project-server")
  .then((x) =>
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  )
  .catch((err) => console.error("Error connecting to mongo", err));

// ROUTES
app.get("/", (req, res) => {
  console.log(req);
});

app.listen(3000, () => console.log("App listening on port 3000!"));
