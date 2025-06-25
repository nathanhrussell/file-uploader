const express = require("express");
const passport = require("passport");
const cors = require("cors");
const session = require("./middlewares/session");
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
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);
app.use(fileRoutes);
app.use(folderRoutes);

module.exports = app;