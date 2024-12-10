"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.encryptPassword = void 0;
require("dotenv/config");
const bcrypt_1 = require("bcrypt");
const encryptPassword = async (password) => {
    if (password == null) {
        Error('missing password');
        return null;
    }
    const saltNumber = process.env.SALT ?? 12;
    const salt = await (0, bcrypt_1.genSalt)(Number(saltNumber));
    const result = await (0, bcrypt_1.hash)(password, salt);
    return result;
};
exports.encryptPassword = encryptPassword;
const verifyPassword = async (password, hashPassword) => {
    if (password == null) {
        Error('missing password');
        return false;
    }
    if (hashPassword == null) {
        Error('missing password');
        return false;
    }
    const valid = await (0, bcrypt_1.compare)(password, hashPassword);
    return valid;
};
exports.verifyPassword = verifyPassword;
