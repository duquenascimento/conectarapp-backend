"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findStatus = void 0;
const client_1 = require("@prisma/client");
const logUtils_1 = require("../utils/logUtils");
const prisma = new client_1.PrismaClient();
const findStatus = async (id) => {
    try {
        return await prisma.status.findUnique({ where: { id } });
    }
    catch (err) {
        (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.findStatus = findStatus;
