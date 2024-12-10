"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = exports.del = exports.save = void 0;
const favoriteRepository_1 = require("../repository/favoriteRepository");
const logUtils_1 = require("../utils/logUtils");
const uuid_1 = require("uuid");
const jsonwebtoken_1 = require("jsonwebtoken");
const save = async (req) => {
    try {
        if (req.token == null)
            throw Error('missing token', { cause: 'visibleError' });
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        const request = {
            id: (0, uuid_1.v4)(),
            productId: req.productId,
            restaurantId: decoded.id
        };
        const result = await (0, favoriteRepository_1.findByProductAndUser)(request);
        if (result != null)
            return null;
        await (0, favoriteRepository_1.saveFavorite)(request);
        return true;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.save = save;
const del = async (req) => {
    try {
        if (req.token == null)
            throw Error('missing token', { cause: 'visibleError' });
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        const request = {
            productId: req.productId,
            restaurantId: decoded.id
        };
        const result = await (0, favoriteRepository_1.findByProductAndUser)(request);
        if (result == null)
            return null;
        await (0, favoriteRepository_1.deleteFavorite)(result.id);
        return true;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.del = del;
const list = async (req) => {
    try {
        if (req.token == null)
            throw Error('missing token', { cause: 'visibleError' });
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        const result = await (0, favoriteRepository_1.listByUser)(decoded.id);
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
        const data = await res.json();
        return data.data;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.list = list;
