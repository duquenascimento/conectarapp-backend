"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoute = void 0;
const authService_1 = require("../service/authService");
const authRoute = async (server) => {
    server.post('/auth/signup', async (req, res) => {
        try {
            const result = await (0, authService_1.firstStepSignUp)(req.body);
            if (result == null)
                throw Error('first step of signUp failed');
            return await res.status(201).send({
                status: 201,
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
                    status: 409,
                    msg: message
                });
            }
        }
    });
    server.post('/auth/signin', async (req, res) => {
        try {
            const result = await (0, authService_1.signIn)(req.body);
            if (result == null)
                throw Error('signIn failed');
            return await res.status(201).send({
                status: 201,
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
                    status: 401,
                    msg: message
                });
            }
        }
    });
    server.post('/auth/checkLogin', async (req, res) => {
        try {
            const result = await (0, authService_1.checkLogin)(req.body);
            if (result == null)
                throw Error('not logged');
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
                await res.status(401).send({
                    status: 401,
                    msg: message
                });
            }
        }
    });
    server.post('/auth/recovery', async (req, res) => {
        try {
            await (0, authService_1.PwRecoveryCreateService)(req.body);
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
                await res.status(401).send({
                    status: 401,
                    msg: message
                });
            }
        }
    });
    server.post('/auth/recoveryCheck', async (req, res) => {
        try {
            await (0, authService_1.PwRecoveryCheckService)(req.body);
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
                await res.status(401).send({
                    status: 401,
                    msg: message
                });
            }
        }
    });
    server.post('/auth/pwChange', async (req, res) => {
        try {
            await (0, authService_1.PwChange)(req.body);
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
                await res.status(401).send({
                    status: 401,
                    msg: message
                });
            }
        }
    });
};
exports.authRoute = authRoute;
