import express from "express";
import homePageController from "../controllers/homePageController.js";
import registerController from "../controllers/registerController.js";
import loginController from "../controllers/loginController.js";
import auth from "../validation/authValidation.js";
import passport from "../controllers/passportGoogleController.js";
import initPassportLocal from "../controllers/passportLocalController.js";

initPassportLocal();

const router = express.Router();

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google", { successRedirect: "/", failureRedirect: "/login" }));

const initWebRoutes = (app) => {
    app.use("/", router);

    router.get("/", loginController.checkLoggedIn, homePageController.handleHelloWorld);
    router.get("/login", loginController.checkLoggedOut, loginController.getPageLogin);
    router.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        successFlash: true,
        failureFlash: true
    }));
    router.get("/register", registerController.getPageRegister);
    router.post("/register", auth.validateRegister, registerController.createNewUser);
    router.post("/logout", loginController.postLogOut);
};

export default initWebRoutes;
