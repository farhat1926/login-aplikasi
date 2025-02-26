import DBConnection from "../configs/DBConnection";
import bcrypt from "bcryptjs";

let handleLogin = async (email, password) => {
    try {
        const user = await findUserByEmail(email);
        if (user) {
            console.log("Stored Hashed Password:", user.password); // Debug
            
            const isMatch = await bcrypt.compare(password, user.password); // Bandingkan langsung
            if (isMatch) {
                console.log("Login Success");
                return true;
            } else {
                console.error("Login Failed: Wrong password");
                throw new Error(`The password entered is incorrect`);
            }
        } else {
            console.error("Login Failed: User not found");
            throw new Error(`User with email "${email}" does not exist`);
        }
    } catch (error) {
        console.error("Login Error:", error);
        throw error;
    }
};

let findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        try {
            DBConnection.query(
                'SELECT * FROM `users` WHERE `email` = ?',
                email,
                (err, rows) => {
                    if (err) {
                        reject(new Error(`Database query error: ${err.message}`));
                    }
                    if (rows.length > 0) {
                        resolve(rows[0]);  // user ditemukan
                    } else {
                        reject(`User with email "${email}" not found.`);
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};

let findOrCreateUser = (profile) => {
    return new Promise((resolve, reject) => {
        try {
            DBConnection.query(
                'SELECT * FROM `users` WHERE `googleId` = ?', 
                [profile.id], 
                async (err, rows) => {
                    if (err) {
                        reject(new Error(`Database query error: ${err.message}`));
                    }
                    
                    if (rows.length > 0) {
                        // Jika user sudah ada, kembalikan data user
                        resolve(rows[0]);
                    } else {
                        // Jika user belum ada, buat user baru
                        let newUser = {
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            name: profile.displayName
                        };

                        DBConnection.query(
                            'INSERT INTO `users` (`googleId`, `email`, `name`) VALUES (?, ?, ?)', 
                            [newUser.googleId, newUser.email, newUser.name], 
                            (insertErr, result) => {
                                if (insertErr) {
                                    reject(new Error(`Database insert error: ${insertErr.message}`));
                                }

                                newUser.id = result.insertId; // Dapatkan ID dari database
                                resolve(newUser);
                            }
                        );
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};



let findUserById = (id) => {
    return new Promise((resolve, reject) => {
        try {
            DBConnection.query(
                ' SELECT * FROM `users` WHERE `id` = ?  ', id,
                function(err, rows) {
                    if (err) {
                        reject(err)
                    }
                    let user = rows[0];
                    resolve(user);
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};

let comparePassword = async (password, userObject) => {
    try {
        const isMatch = await bcrypt.compare(password, userObject.password);
        if (isMatch) {
            return true;
        } else {
            return `The password that you've entered is incorrect`;
        }
    } catch (e) {
        throw e;  // pastikan untuk melempar error yang ditemukan
    }
};

module.exports = {
    handleLogin: handleLogin,
    findUserByEmail: findUserByEmail,
    findUserById: findUserById,
    comparePassword: comparePassword,
    findOrCreateUser: findOrCreateUser
};