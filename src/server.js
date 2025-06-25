const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("./middlewares/session");
const authRoutes = require("./auth/routes");
const app = require("./app");
require("./auth/passport");

const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

const prisma = new PrismaClient();

const session = require("express-session");

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  },
  store: new PrismaSessionStore(
    prisma, //
    {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined
    }
  )
}));

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