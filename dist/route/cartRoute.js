"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRoute = void 0;
const cartService_1 = require("../service/cartService");
const cartRoute = async (server) => {
    server.post('/cart/add', async (req, res) => {
        try {
            // Adiciona a requisição na fila
            await (0, cartService_1.addService)(req.body);
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
                await res.status(400).send({
                    status: 400,
                    msg: message
                });
            }
        }
    });
    server.post('/cart/list', async (req, res) => {
        try {
            // Adiciona a requisição na fila
            const result = await (0, cartService_1.listCart)(req.body);
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
                await res.status(400).send({
                    status: 400,
                    msg: message
                });
            }
        }
    });
    server.post('/cart/full-list', async (req, res) => {
        try {
            // Adiciona a requisição na fila
            const result = await (0, cartService_1.listCartComplete)(req.body);
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
                await res.status(400).send({
                    status: 400,
                    msg: message
                });
            }
        }
    });
    server.post('/cart/delete-by-id', async (req, res) => {
        try {
            // Adiciona a requisição na fila
            await (0, cartService_1.deleteCartByUser)(req.body);
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
                await res.status(400).send({
                    status: 400,
                    msg: message
                });
            }
        }
    });
    server.post('/cart/delete-item', async (req, res) => {
        try {
            // Adiciona a requisição na fila
            await (0, cartService_1.deleteItem)(req.body);
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
                await res.status(400).send({
                    status: 400,
                    msg: message
                });
            }
        }
    });
};
exports.cartRoute = cartRoute;
