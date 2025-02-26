import crypto from "crypto";
import DBConnection from "../configs/DBConnection";
import bcrypt from "bcryptjs";

export const generateRSAKeys = () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    return { publicKey, privateKey };
};

const encryptWithPublicKey = (publicKey, data) => {
    return crypto.publicEncrypt(
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(data)
    ).toString("base64");
};

const decryptWithPrivateKey = (privateKey, encryptedData) => {
    return crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(encryptedData, "base64")
    ).toString();
};

let createNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        let isEmailExist = await checkExistEmail(data.email);
        if (isEmailExist) {
            reject(`This email ${data.email} already exists. Please choose another email.`);
        } else {
            let salt = bcrypt.genSaltSync(10);
            console.log(typeof generateRSAKeys); // Harusnya output: 'function'
            let { publicKey, privateKey } = generateRSAKeys();
            let encryptedPassword = encryptWithPublicKey(publicKey, data.password);
            
            let userItem = {
                fullname: data.fullname,
                email: data.email,
                password: bcrypt.hashSync(encryptedPassword, salt),
                public_key: publicKey,
                private_key: privateKey,
            };

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

let handleLogin = async (email, password) => {
    try {
        const user = await findUserByEmail(email);
        if (user) {
            const decryptedPassword = decryptWithPrivateKey(user.private_key, user.password);
            const isMatch = await bcrypt.compare(password, bcrypt.hashSync(decryptedPassword, 10));
            if (isMatch) {
                return true;
            } else {
                throw new Error(`The password entered is incorrect`);
            }
        } else {
            throw new Error(`User with email "${email}" does not exist`);
        }
    } catch (error) {
        throw error;
    }
};

module.exports = {
    generateRSAKeys }
