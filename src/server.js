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
  // Only intercept GET requests to .html files
  if (req.method !== "GET") return next();

  const url = req.path === "/" ? "/index.html" : req.path;
  if (url.endsWith(".html")) {
    const fs = require("fs");
    const path = require("path");
    const filePath = path.join(__dirname, "..", "public", url);

    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) return next();

      const injected = data.replace(
        "<head>",
        `<head><meta name="user-logged-in" content="${res.locals.isLoggedIn}">`
      );
      res.send(injected);
    });
  } else {
    next();
  }
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
