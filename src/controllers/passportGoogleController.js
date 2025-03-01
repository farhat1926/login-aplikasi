import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import loginService from "../services/loginService";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("Google Profile:", profile);
        let user = await loginService.findOrCreateUser(profile);
        return done(null, user);
    } catch (err) {
        console.error("Error in Google OAuth:", err);
        return done(err, null);
    }
}));



passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    
    if (!user.googleId) {
        console.error("Error: googleId is missing in user object");
    }
    
    done(null, {
        id: user.id || user._id,
        fullname: user.fullname,
        email: user.email,
        public_key: user.public_key,
        private_key: user.private_key,
        googleId: user.googleId || user.id  // Tambahkan fallback ke id jika googleId tidak ada
    });
});



passport.deserializeUser(async (userData, done) => {
    if (!userData.googleId) {
        console.warn("Warning: Google ID missing in session data, trying to fetch user from DB...");
    }
    try {
        let user = await loginService.findUserById(userData.id);
        if (!user) {
            console.log("User not found in database.");
            return done(null, false);
        }
        done(null, user);
    } catch (err) {
        console.error("Error in deserializing user:", err);
        return done(err, null);
    }
});

export default passport;
