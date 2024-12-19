"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interRoute = void 0;
const interService_1 = require("../service/interService");
const interRoute = async (server) => {
    server.post('/inter/webhook', async (req, res) => {
        try {
            (0, interService_1.webhookInterHandler)(req.body);
            return await res.status(200).send();
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
exports.interRoute = interRoute;
