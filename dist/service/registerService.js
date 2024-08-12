"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullRegister = exports.checkCnpj = void 0;
const logUtils_1 = require("../utils/logUtils");
const restaurantRepository_1 = require("../repository/restaurantRepository");
const restaurantService_1 = require("./restaurantService");
const uuid_1 = require("uuid");
const luxon_1 = require("luxon");
const jsonwebtoken_1 = require("jsonwebtoken");
const checkCnpj = async ({ cnpj }) => {
    try {
        const cnpjFormated = cnpj.toLowerCase().trim();
        if (cnpjFormated == null)
            throw Error('cnpj is missing', { cause: 'visibleError' });
        if (cnpjFormated.length > 14)
            throw Error('invalid cnpj', { cause: 'visibleError' });
        const cnpjExists = await (0, restaurantRepository_1.findRestaurantByCompanyRegistrationNumber)(cnpjFormated);
        if (cnpjExists != null)
            throw Error('already exists', { cause: 'visibleError' });
        const result = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjFormated}`);
        if (!result.ok)
            throw Error('invalid cnpj', { cause: 'visibleError' });
        const resultFormated = await result.json();
        return resultFormated;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.checkCnpj = checkCnpj;
const fullRegister = async (req) => {
    const decoded = (0, jsonwebtoken_1.decode)(req.token);
    const restaurantId = (0, uuid_1.v4)();
    const addressId = (0, uuid_1.v4)();
    const maxHourF = luxon_1.DateTime.fromFormat(req.maxHour, 'HH:mm');
    const maxHourFormated = maxHourF.toISOTime();
    const minHourF = luxon_1.DateTime.fromFormat(req.minHour, 'HH:mm');
    const minHourFormated = minHourF.toISOTime();
    const isoFormattedTimeMax = `2024-01-01T${maxHourFormated?.substring(0, 12)}000Z`;
    const isoFormattedTimeMin = `2024-01-01T${minHourFormated?.substring(0, 12)}000Z`;
    console.log(isoFormattedTimeMax);
    console.log(isoFormattedTimeMin);
    await (0, restaurantRepository_1.registerAddress)({
        active: true,
        complement: req.complement,
        createdAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
        updatedAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
        deliveryObs: req.deliveryObs,
        id: addressId,
        localNumber: req.localNumber,
        maxHour: isoFormattedTimeMax ?? '',
        minHour: isoFormattedTimeMin ?? '',
        neigh: req.neigh,
        street: req.street,
        zipcode: req.zipcode,
        restaurantId: [restaurantId],
        responsibleReceivingName: '',
        responsibleReceivingPhoneNumber: req.phone,
        localType: req.localType,
        city: req.city,
        closedDoorDelivery: req.closeDoor
    });
    await (0, restaurantService_1.createRestaurant)({
        companyRegistrationNumber: req.cnpj,
        name: req.restaurantName,
        companyRegistrationNumberForBilling: req.cnpj,
        stateRegistrationNumber: req.stateNumberId,
        active: true,
        alternativeEmail: req.alternativeEmail,
        email: req.email,
        alternativePhone: req.alternativePhone,
        closeDoor: req.closeDoor,
        phone: req.phone,
        cityRegistrationNumber: req.cityNumberId,
        id: restaurantId,
        orderValue: Number(req.orderValue),
        weeklyOrderAmount: Number(req.weeklyOrderAmount),
        legalName: req.legalRestaurantName,
        createdAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
        updatedAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
        user: [decoded.id],
        address: [addressId],
        favorite: [],
        paymentWay: req.paymentWay
    });
    await (0, restaurantRepository_1.updateUserWithRestaurant)(decoded.id, restaurantId, luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate());
};
exports.fullRegister = fullRegister;
