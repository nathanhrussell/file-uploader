const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    const existing = await prisma.user.findUnique({
        where: {
            email: email
        }
        });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    req.login(user, (err) => {
        if (err) return res.status(500).json({ error: "Login after register failed" });
        res.status(201).json({ message: "Registered and logged in"});
    });
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ error: info?.message || "Login failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }
      return res.json({ message: "Logged in successfully" });
    });
  })(req, res, next);
});


router.get("/logout", (req, res) => {
    req.logout(() => {
        res.json({ message: "Logged out"});
    });
});

router.get("/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated"});
    res.json({ user: req.user});
});

module.exports = router;