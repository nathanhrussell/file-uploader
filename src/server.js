require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const passport = require("passport");
require("./auth/passport");
const authRoutes = require("./auth/routes");
const fileRoutes = require("./files/routes");
const folderRoutes = require("./folders/routes");

const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");

const app = require("./app");
const prisma = new PrismaClient();

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.user;
  next();
});

app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true
  })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);
app.use(fileRoutes);
app.use(folderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
