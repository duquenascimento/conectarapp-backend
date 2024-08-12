"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listByUser = exports.deleteFavorite = exports.findByProductAndUser = exports.saveFavorite = void 0;
const client_1 = require("@prisma/client");
require("dotenv/config");
const logUtils_1 = require("../utils/logUtils");
const prisma = new client_1.PrismaClient();
const saveFavorite = async (req) => {
    try {
        const result = await prisma.favorite.upsert({
            create: req,
            update: {},
            where: {
                id: req.id
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
exports.saveFavorite = saveFavorite;
const findByProductAndUser = async (req) => {
    try {
        const result = await prisma.favorite.findFirst({
            where: {
                productId: req.productId,
                restaurantId: req.restaurantId
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
exports.findByProductAndUser = findByProductAndUser;
const deleteFavorite = async (id) => {
    try {
        const result = await prisma.favorite.delete({
            where: {
                id
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
exports.deleteFavorite = deleteFavorite;
const listByUser = async (id) => {
    try {
        const result = await prisma.favorite.findMany({
            where: {
                restaurantId: id
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
exports.listByUser = listByUser;
