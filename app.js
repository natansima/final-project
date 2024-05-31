require("dotenv").config();
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/error-handler");

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
const commentRoutes = require("./routes/comment.routes");
const themeRoutes = require("./routes/theme.routes");
const activeThemeRoutes = require("./routes/active-theme.routes");

// USAR ROTAS
app.use("/auth", authRoutes);
app.use("/comments", commentRoutes);
app.use("/themes", themeRoutes);
app.use("/active-themes", activeThemeRoutes);

// ROTA PRINCIPAL
app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

// Middleware de tratamento de erros
app.use(errorHandler);

app.listen(3000, () => console.log("App listening on port 3000!"));
