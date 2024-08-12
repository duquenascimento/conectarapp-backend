"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.checkCode = exports.createCode = exports.signInFirstStepUser = exports.findUserByEmail = void 0;
const client_1 = require("@prisma/client");
require("dotenv/config");
const logUtils_1 = require("../utils/logUtils");
const prisma = new client_1.PrismaClient();
const findUserByEmail = async (email) => {
    try {
        const result = await prisma.user.findUnique({
            where: {
                email
            },
            select: {
                email: true,
                active: true,
                id: true,
                restaurant: true,
                role: true,
                password: true,
                createdAt: true
            }
        });
        await prisma.$disconnect();
        return result;
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
        return null;
    }
};
exports.findUserByEmail = findUserByEmail;
const signInFirstStepUser = async (req) => {
    try {
        await prisma.user.create({
            data: req
        });
        await prisma.$disconnect();
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
    }
};
exports.signInFirstStepUser = signInFirstStepUser;
const createCode = async (data) => {
    try {
        await prisma.confirmCode.deleteMany({
            where: {
                identifier: data.identifier
            }
        });
        await prisma.confirmCode.create({
            data
        });
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.createCode = createCode;
const checkCode = async (data) => {
    try {
        return await prisma.confirmCode.findFirst({
            where: {
                identifier: data.identifier
            }
        });
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.checkCode = checkCode;
const changePassword = async (data) => {
    try {
        await prisma.user.update({
            where: {
                email: data.email
            },
            data: {
                password: data.password
            }
        });
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.changePassword = changePassword;
