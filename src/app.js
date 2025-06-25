const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app;
