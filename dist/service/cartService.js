"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCartByUser = exports.listCartComplete = exports.listCart = exports.addService = exports.deleteItem = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const cartRepository_1 = require("../repository/cartRepository");
const logUtils_1 = require("../utils/logUtils");
const uuid_1 = require("uuid");
const library_1 = require("@prisma/client/runtime/library");
;
const addToCart = async (req, id) => {
    const request = {
        ...req,
        id: (0, uuid_1.v4)(),
        restaurantId: id
    };
    const result = await (0, cartRepository_1.findByProductAndUser)({ productId: req.productId, restaurantId: request.restaurantId });
    if (result != null)
        request.id = result.id;
    if (request.amount === 0) {
        await (0, cartRepository_1.deleteByUserIdAndProductId)(request.id);
    }
    await (0, cartRepository_1.addRepository)(request);
};
const deleteItens = async (req, id) => {
    const result = await (0, cartRepository_1.findByProductAndUser)({ productId: req.productId, restaurantId: id });
    if (result == null)
        return;
    await (0, cartRepository_1.deleteByUserIdAndProductId)(result.id);
};
const deleteItem = async (req) => {
    const decoded = (0, jsonwebtoken_1.decode)(req.token);
    const result = await (0, cartRepository_1.findByProductAndUser)({ productId: req.productId, restaurantId: decoded.id });
    if (result == null)
        return;
    await (0, cartRepository_1.deleteByUserIdAndProductId)(result.id);
};
exports.deleteItem = deleteItem;
const addService = async (req) => {
    try {
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        await Promise.all(req.carts.map(async (cart) => {
            await addToCart(cart, decoded.id);
        }));
        await Promise.all(req.cartToExclude.map(async (cartToDelete) => { await deleteItens(cartToDelete, decoded.id); }));
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.addService = addService;
const listCart = async (req) => {
    try {
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        const result = await (0, cartRepository_1.listByUser)({ restaurantId: decoded.id });
        if (result == null)
            return null;
        return result;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.listCart = listCart;
const listCartComplete = async (req) => {
    try {
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        const result = await (0, cartRepository_1.listByUser)({ restaurantId: decoded.id });
        if (result == null)
            return null;
        const myHeaders = new Headers();
        myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a');
        myHeaders.append('external-id', 'F0');
        myHeaders.append('username', 'contato@conectarhortifruti.com.br');
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=');
        myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTIwVDAzOjQwOjM3IiwibmJmIjoxNzE3OTkwODM3LCJleHAiOjE3MTg4NTQ4MzcsImlhdCI6MTcxNzk5MDgzNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.RBX5whQIqwtRJOnjTX622qvwCFQJxcgVXQKTyUoVFys');
        const raw = JSON.stringify({
            ids: result?.map(item => item.productId)
        });
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw
        };
        const res = await fetch('https://gateway.conectarhortifruti.com.br/api/v1/system/listFavoriteProductToApp', requestOptions);
        let data = await res.json();
        data = (data.data).map((item) => {
            const produto = result.find(x => x.productId === item.id);
            return {
                id: item.id,
                image: item.image,
                class: item.class,
                active: item.active,
                changedBy: item.changedBy,
                mediumWeight: item.mediumWeight,
                firstUnit: item.firstUnit,
                secondUnit: item.secondUnit,
                thirdUnit: item.thirdUnit,
                convertedWeight: item.convertedWeight,
                createdAt: item.createdAt,
                createdBy: item.createdBy,
                name: item.name,
                orderUnit: item.orderUnit,
                quotationUnit: item.quotationUnit,
                sku: item.sku,
                updatedAt: item.updatedAt,
                amount: produto?.amount ?? new library_1.Decimal(0),
                obs: produto?.obs ?? ''
            };
        });
        return data;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.listCartComplete = listCartComplete;
const deleteCartByUser = async (req) => {
    try {
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        await (0, cartRepository_1.deleteByUserId)(decoded.id);
    }
    catch (err) {
        if ((err).cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.deleteCartByUser = deleteCartByUser;
