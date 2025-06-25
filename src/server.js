const express = require("express");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaSessionStore } = require("connect-prisma");

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));