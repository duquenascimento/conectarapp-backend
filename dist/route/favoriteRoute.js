"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.favoriteRoute = void 0;
const favoriteService_1 = require("../service/favoriteService");
const favoriteRoute = async (server) => {
    server.post('/favorite/save', async (req, res) => {
        try {
            const result = await (0, favoriteService_1.save)(req.body);
            if (result == null)
                throw Error(process.env.INTERNAL_ERROR_MSG);
            return await res.status(200).send({
                status: 200,
                data: result.data
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
                await res.status(409).send({
                    status: 200,
                    msg: message
                });
            }
        }
    });
    server.post('/favorite/del', async (req, res) => {
        try {
            const result = await (0, favoriteService_1.del)(req.body);
            if (result == null)
                throw Error(process.env.INTERNAL_ERROR_MSG);
            return await res.status(200).send({
                status: 200,
                data: result.data
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
                await res.status(409).send({
                    status: 200,
                    msg: message
                });
            }
        }
    });
    server.post('/favorite/list', async (req, res) => {
        try {
            const result = await (0, favoriteService_1.list)(req.body);
            if (result == null)
                throw Error(process.env.INTERNAL_ERROR_MSG);
            return await res.status(200).send({
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
                await res.status(409).send({
                    status: 200,
                    msg: message
                });
            }
        }
    });
};
exports.favoriteRoute = favoriteRoute;
