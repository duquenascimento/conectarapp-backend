"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmRoute = void 0;
const confirmService_1 = require("../service/confirmService");
const confirmRoute = async (server) => {
    server.post('/confirm', async (req, res) => {
        try {
            const result = await (0, confirmService_1.confirmOrder)(req.body);
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
                await res.status(409).send({
                    status: 200,
                    msg: message
                });
            }
        }
    });
};
exports.confirmRoute = confirmRoute;
