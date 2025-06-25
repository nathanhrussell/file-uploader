const express = require("express");
const passport = require("passport");
const cors = require("cors");
const session = require("./middlewares/session");
const authRoutes = require("./auth/routes");
require("./auth/passport");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);

module.exports = app;