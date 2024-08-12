"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoute = void 0;
const productService_1 = require("../service/productService");
const productRoute = async (server) => {
    server.post('/product/list', async (req, res) => {
        try {
            const result = await (0, productService_1.listProduct)();
            if (result == null)
                throw Error(process.env.INTERNAL_ERROR_MSG);
            return await res.status(201).send({
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
};
exports.productRoute = productRoute;
