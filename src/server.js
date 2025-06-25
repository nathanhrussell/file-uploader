const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const session = require("./middlewares/session");
const authRoutes = require("./auth/routes");
require("./auth/passport");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());
app.use(authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});