"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddress = exports.findAddressByRestaurantId = exports.listByUserId = exports.updateUserWithRestaurant = exports.findRestaurantByCompanyRegistrationNumberForBilling = exports.findRestaurantByCompanyRegistrationNumber = exports.registerAddress = exports.registerRestaurant = void 0;
const client_1 = require("@prisma/client");
require("dotenv/config");
const logUtils_1 = require("../utils/logUtils");
const prisma = new client_1.PrismaClient();
const registerRestaurant = async (req) => {
    try {
        await prisma.restaurant.create({
            data: req
        });
    }
    catch (err) {
        await (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.registerRestaurant = registerRestaurant;
const registerAddress = async (req) => {
    try {
        await prisma.address.create({
            data: {
                address: req.street,
                zipCode: req.zipcode,
                neighborhood: req.neigh,
                id: req.id,
                restaurant: req.restaurantId,
                active: req.active,
                createdAt: req.createdAt,
                updatedAt: req.updatedAt,
                initialDeliveryTime: req.minHour,
                finalDeliveryTime: req.maxHour,
                deliveryInformation: req.deliveryObs,
                responsibleReceivingName: '',
                responsibleReceivingPhoneNumber: req.responsibleReceivingPhoneNumber,
                deliveryReference: '',
                closedDoorDelivery: req.closedDoorDelivery,
                localType: req.localType,
                city: req.city,
                complement: req.complement,
                localNumber: req.localNumber
            }
        });
    }
    catch (err) {
        await (0, logUtils_1.logRegister)(err);
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.registerAddress = registerAddress;
const findRestaurantByCompanyRegistrationNumber = async (companyRegistrationNumber) => {
    try {
        const result = await prisma.restaurant.findFirst({
            where: {
                companyRegistrationNumber
            }
        });
        return result;
    }
    catch (err) {
        await (0, logUtils_1.logRegister)(err);
        return null;
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.findRestaurantByCompanyRegistrationNumber = findRestaurantByCompanyRegistrationNumber;
const findRestaurantByCompanyRegistrationNumberForBilling = async (companyRegistrationNumberForBilling) => {
    try {
        const result = await prisma.restaurant.findFirst({
            where: {
                companyRegistrationNumberForBilling
            }
        });
        return result;
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
        return null;
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.findRestaurantByCompanyRegistrationNumberForBilling = findRestaurantByCompanyRegistrationNumberForBilling;
const updateUserWithRestaurant = async (userId, restaurantId, updatedAt) => {
    try {
        const result = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                role: ['registered'],
                restaurant: [restaurantId],
                updatedAt
            }
        });
        return result;
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
        return null;
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.updateUserWithRestaurant = updateUserWithRestaurant;
const listByUserId = async (userId) => {
    try {
        const result = await prisma.restaurant.findMany({
            where: {
                user: { has: userId }
            }
        });
        return result;
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
        return null;
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.listByUserId = listByUserId;
const findAddressByRestaurantId = async (restaurantId) => {
    try {
        const result = await prisma.address.findMany({
            where: {
                restaurant: { has: restaurantId }
            }
        });
        return result;
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
        return null;
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.findAddressByRestaurantId = findAddressByRestaurantId;
const updateAddress = async (addressId, data) => {
    try {
        const result = await prisma.address.update({
            where: {
                id: addressId
            },
            data
        });
        return result;
    }
    catch (err) {
        await prisma.$disconnect();
        await (0, logUtils_1.logRegister)(err);
        return null;
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.updateAddress = updateAddress;
