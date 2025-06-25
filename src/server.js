const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("./middlewares/session");
const authRoutes = require("./auth/routes");
const app = require("./app");
require("./auth/passport");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(authRoutes);

const dotenv = require("dotenv");
dotenv.config();



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});
