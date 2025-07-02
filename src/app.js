const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use((req, res, next) => {
  const url = req.path === "/" ? "/index.html" : req.path;
  if (url.endsWith(".html")) {
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


module.exports = app;
