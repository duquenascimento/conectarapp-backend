"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoute = void 0;
const registerService_1 = require("../service/registerService");
const registerRoute = async (server) => {
    server.post('/register/checkCnpj', async (req, res) => {
        try {
            const result = await (0, registerService_1.checkCnpj)(req.body);
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
    server.post('/register/full-register', async (req, res) => {
        try {
            await (0, registerService_1.fullRegister)(req.body);
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
};
exports.registerRoute = registerRoute;
