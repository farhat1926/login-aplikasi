import DBConnection from "./../configs/DBConnection";
import bcrypt from "bcryptjs";
import { generateRSAKeys } from "../utils/cryptoUtils.js"; // Pastikan path benar


let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        let isEmailExist = await checkExistEmail(data.email);
        if (isEmailExist) {
            reject(`This email ${data.email} already exists. Please choose another email.`);
        } else {
            let salt = bcrypt.genSaltSync(10);
            let hashedPassword = bcrypt.hashSync(data.password, salt); // HASH langsung, tanpa RSA

            let { publicKey, privateKey } = generateRSAKeys();
            
            let userItem = {
                fullname: data.fullname,
                email: data.email,
                password: hashedPassword, // Simpan hasil hash langsung
                public_key: publicKey, 
                private_key: privateKey,
            };

            console.log("User Data to be Saved:", userItem); // Debug

            DBConnection.query(
                'INSERT INTO users SET ?', userItem,
                function(err, rows) {
                    if (err) {
                        reject(err);
                    }
                    resolve("User registration successful");
                }
            );
        }
    });
};


let checkExistEmail = (email) => {
    return new Promise( (resolve, reject) => {
        try {
            DBConnection.query(
                ' SELECT * FROM `users` WHERE `email` = ?  ', email,
                function(err, rows) {
                    if (err) {
                        reject(err)
                    }
                    if (rows.length > 0) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
};
module.exports = {
    createNewUser: createNewUser
};
