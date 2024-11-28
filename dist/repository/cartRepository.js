"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteByUserId = exports.deleteByUserIdAndProductId = exports.listByUser = exports.findByProductAndUser = exports.addRepository = void 0;
const client_1 = require("@prisma/client");
require("dotenv/config");
const logUtils_1 = require("../utils/logUtils");
const prisma = new client_1.PrismaClient();
const addRepository = async (req) => {
    try {
        await prisma.cart.upsert({
            create: {
                amount: req.amount,
                productId: req.productId,
                id: req.id,
                restaurantId: req.restaurantId,
                obs: req.obs ?? ''
            },
            update: {
                amount: req.amount,
                obs: req.obs
            },
            where: {
                id: req.id
            }
        });
        await prisma.$disconnect();
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
    }
};
exports.addRepository = addRepository;
const findByProductAndUser = async (req) => {
    try {
        const result = await prisma.cart.findFirst({
            where: {
                AND: [{ productId: req.productId, restaurantId: req.restaurantId }]
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
const listByUser = async (req) => {
    try {
        const result = await prisma.cart.findMany({
            where: {
                AND: [{ restaurantId: req.restaurantId }]
            },
            select: {
                productId: true,
                amount: true,
                obs: true
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
const deleteByUserIdAndProductId = async (id) => {
    try {
        await prisma.cart.delete({
            where: {
                id
            }
        });
        await prisma.$disconnect();
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
    }
};
exports.deleteByUserIdAndProductId = deleteByUserIdAndProductId;
const deleteByUserId = async (id) => {
    try {
        await prisma.cart.deleteMany({
            where: {
                restaurantId: id
            }
        });
        await prisma.$disconnect();
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
    }
};
exports.deleteByUserId = deleteByUserId;
