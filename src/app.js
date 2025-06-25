const express = require("express");
const cors = require("cors");
const authRoutes = require("./auth/routes");
const fileRoutes = require("../src/files/routes");
const folderRoutes = require("../src/folders/routes");
const path = require("path");
require("./auth/passport");

const app = express();

app.use(express.static(path.join(__dirname, "../public")));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authRoutes);
app.use(fileRoutes);
app.use(folderRoutes);

module.exports = app;
