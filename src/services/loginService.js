import DBConnection from "../configs/DBConnection";
import bcrypt from "bcryptjs";
import {User} from '../controllers/passportGoogleController'

let handleLogin = async (email, password) => {
    try {
        const user = await findUserByEmail(email);
        if (!user) {
            console.error("Login Failed: User not found");
            throw new Error(`User with email "${email}" does not exist`);
        }

        console.log("Stored Hashed Password:", user.password); // Debug
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error("Login Failed: Wrong password");
            throw new Error("The password entered is incorrect");
        }

        console.log("Login Success");
        return user;  // Kembalikan objek user
    } catch (error) {
        console.error("Login Error:", error.message);
        throw error;
    }
};

let findUserByEmail = async (email) => {
    return new Promise((resolve, reject) => {
        DBConnection.query(
            "SELECT * FROM `users` WHERE `email` = ?", [email],
            (err, rows) => {
                if (err) return reject(new Error(`Database query error: ${err.message}`));
                resolve(rows.length > 0 ? rows[0] : null);
            }
        );
    });
};

const findOrCreateUser = async (profile) => {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
        user = new User({
            googleId: profile.id,  // Pastikan googleId disimpan
            fullname: profile.displayName,
            email: profile.emails[0].value,
            public_key: generatePublicKey(),
            private_key: generatePrivateKey()
        });

        await user.save();
    }

    return user;
};

let findUserById = async (id) => {
    return new Promise((resolve, reject) => {
        DBConnection.query(
            "SELECT * FROM `users` WHERE `id` = ?", [id],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows.length > 0 ? rows[0] : null);
            }
        );
    });
};

let comparePassword = async (password, userObject) => {
    try {
        const isMatch = await bcrypt.compare(password, userObject.password);
        return isMatch ? true : "The password that you've entered is incorrect";
    } catch (error) {
        throw error;
    }
};

module.exports = {
    handleLogin,
    findUserByEmail,
    findUserById,
    comparePassword,
    findOrCreateUser
};
