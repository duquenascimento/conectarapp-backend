"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressService = exports.listRestaurantsByUserId = exports.createRestaurant = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const restaurantRepository_1 = require("../repository/restaurantRepository");
const logUtils_1 = require("../utils/logUtils");
const createRestaurant = async (req) => {
    try {
        await (0, restaurantRepository_1.registerRestaurant)(req);
        return true;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.createRestaurant = createRestaurant;
const listRestaurantsByUserId = async (req) => {
    try {
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        const restaurants = await (0, restaurantRepository_1.listByUserId)(decoded.id);
        const newRestaurant = await Promise.all(restaurants.map(async (restaurant) => {
            const rest = { ...restaurant, addressInfos: [] };
            const address = await (0, restaurantRepository_1.findAddressByRestaurantId)(restaurant.id);
            rest.addressInfos = address;
            return rest;
        }));
        return newRestaurant;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.listRestaurantsByUserId = listRestaurantsByUserId;
const updateAddressService = async (rest) => {
    try {
        const data = rest.addressInfos[0];
        await (0, restaurantRepository_1.updateAddress)(data.id, data);
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.updateAddressService = updateAddressService;
