"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRegister = void 0;
const promises_1 = require("fs/promises");
require("dotenv/config");
const logRegister = async (err) => {
    await (0, promises_1.appendFile)(`${process.env.LOG_PATH}`, `${Date()} - ERROR: ${err}\n`);
    throw Error(process.env.INTERNAL_ERROR_MSG ?? 'internal error, try later.');
};
exports.logRegister = logRegister;
