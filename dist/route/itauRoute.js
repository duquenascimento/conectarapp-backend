"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itauRoute = void 0;
const itauRoute = async (server) => {
    server.post('/itau/pix', async (req, res) => {
        try {
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
                await res.status(409).send({
                    status: 200,
                    msg: message
                });
            }
        }
    });
};
exports.itauRoute = itauRoute;
