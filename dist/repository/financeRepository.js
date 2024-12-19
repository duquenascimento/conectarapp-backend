"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPaymentWay = exports.findTransactionType = exports.updateBolecode = exports.updateTransaction = exports.saveBolecode = exports.saveTransaction = void 0;
const client_1 = require("@prisma/client");
const logUtils_1 = require("../utils/logUtils");
const prisma = new client_1.PrismaClient();
const saveTransaction = async (data) => {
    try {
        return await prisma.transactions.create({
            data,
            select: { id: true }
        });
    }
    catch (err) {
        (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.saveTransaction = saveTransaction;
const saveBolecode = async (data) => {
    try {
        return await prisma.bolecode.create({
            data,
            select: { id: true }
        });
    }
    catch (err) {
        (0, exports.updateTransaction)({ status_id: 11 }, data.transactions_id);
        (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.saveBolecode = saveBolecode;
const updateTransaction = async (data, id) => {
    try {
        await prisma.transactions.update({
            data,
            where: { id }
        });
    }
    catch (err) {
        (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.updateTransaction = updateTransaction;
const updateBolecode = async (data, id) => {
    try {
        await prisma.bolecode.update({
            data,
            where: { id }
        });
    }
    catch (err) {
        (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.updateBolecode = updateBolecode;
const findTransactionType = async (id) => {
    try {
        return await prisma.transactions_type.findUnique({ where: { id } });
    }
    catch (err) {
        (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.findTransactionType = findTransactionType;
const findPaymentWay = async (id) => {
    try {
        return await prisma.payment_ways.findUnique({ where: { id } });
    }
    catch (err) {
        (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.findPaymentWay = findPaymentWay;
