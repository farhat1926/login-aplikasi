import 'dotenv/config';
import express from "express";
import configViewEngine from "./configs/viewEngine.js";
import initWebRoutes from "./routes/web.js";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import session from "express-session";
import connectFlash from "connect-flash";
import passport from "passport";

const app = express();

// Middleware
app.use(cookieParser('secret'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 86400000 } // 1 day
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
configViewEngine(app);
app.use(connectFlash());
app.use(passport.initialize());
app.use(passport.session());

// Init Routes
initWebRoutes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}!`));
