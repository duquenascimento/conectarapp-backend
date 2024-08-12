"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOrder = exports.addDetailing = exports.addOrder = void 0;
const client_1 = require("@prisma/client");
require("dotenv/config");
const logUtils_1 = require("../utils/logUtils");
const prisma = new client_1.PrismaClient();
const addOrder = async (data) => {
    try {
        const result = await prisma.order.create({
            data
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
exports.addOrder = addOrder;
const addDetailing = async (data) => {
    try {
        const result = await prisma.detailing.createMany({
            data
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
exports.addDetailing = addDetailing;
const checkOrder = async (orderId) => {
    try {
        const result = await prisma.order.count({
            where: {
                id: { contains: orderId }
            }
        });
        await prisma.$disconnect();
        return result;
    }
    catch (err) {
        await prisma.$disconnect();
        console.log(err);
        await (0, logUtils_1.logRegister)(err);
        return null;
    }
};
exports.checkOrder = checkOrder;
