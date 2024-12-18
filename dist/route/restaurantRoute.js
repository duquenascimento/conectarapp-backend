"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurantRoute = void 0;
const restaurantService_1 = require("../service/restaurantService");
const restaurantRoute = async (server) => {
    server.post('/restaurant/list', async (req, res) => {
        try {
            const result = await (0, restaurantService_1.listRestaurantsByUserId)(req.body);
            if (result == null)
                throw Error(process.env.INTERNAL_ERROR_MSG);
            return await res.status(201).send({
                status: 200,
                data: result
            });
        }
        catch (err) {
            const message = err.message;
            if (message === process.env.INTERNAL_ERROR_MSG) {
                await res.status(500).send({
                    status: 500,
                    msg: message
                });
            }
            else {
                await res.status(404).send({
                    status: 404,
                    msg: message
                });
            }
        }
    });
    server.post('/address/update', async (req, res) => {
        try {
            await (0, restaurantService_1.updateAddressService)(req.body);
            return await res.status(201).send({
                status: 200
            });
        }
        catch (err) {
            const message = err.message;
            if (message === process.env.INTERNAL_ERROR_MSG) {
                await res.status(500).send({
                    status: 500,
                    msg: message
                });
            }
            else {
                await res.status(404).send({
                    status: 404,
                    msg: message
                });
            }
        }
    });
    server.post('/rest/updateComercialBlock', async (req, res) => {
        try {
            await (0, restaurantService_1.updateComercialBlock)(req.body);
            return await res.status(200).send({
                status: 200
            });
        }
        catch (err) {
            const message = err.message;
            if (message === process.env.INTERNAL_ERROR_MSG) {
                await res.status(500).send({
                    status: 500,
                    msg: message
                });
            }
            else {
                await res.status(404).send({
                    status: 404,
                    msg: message
                });
            }
        }
    });
    server.post('/rest/updateFinanceBlock', async (req, res) => {
        try {
            await (0, restaurantService_1.updateFinanceBlock)(req.body);
            return await res.status(200).send({
                status: 200
            });
        }
        catch (err) {
            const message = err.message;
            if (message === process.env.INTERNAL_ERROR_MSG) {
                await res.status(500).send({
                    status: 500,
                    msg: message
                });
            }
            else {
                await res.status(404).send({
                    status: 404,
                    msg: message
                });
            }
        }
    });
    server.post('/rest/addClientCount', async (req, res) => {
        try {
            await (0, restaurantService_1.AddClientCount)(req.body);
            return await res.status(200).send({
                status: 200
            });
        }
        catch (err) {
            const message = err.message;
            if (message === process.env.INTERNAL_ERROR_MSG) {
                await res.status(500).send({
                    status: 500,
                    msg: message
                });
            }
            else {
                await res.status(404).send({
                    status: 404,
                    msg: message
                });
            }
        }
    });
};
exports.restaurantRoute = restaurantRoute;
