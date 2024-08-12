"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PwChange = exports.PwRecoveryCheckService = exports.PwRecoveryCreateService = exports.checkLogin = exports.signIn = exports.firstStepSignUp = void 0;
const authRepository_1 = require("../repository/authRepository");
const uuid_1 = require("uuid");
const authUtils_1 = require("../utils/authUtils");
const logUtils_1 = require("../utils/logUtils");
const jsonwebtoken_1 = require("jsonwebtoken");
const luxon_1 = require("luxon");
const utils_1 = require("../utils/utils");
const firstStepSignUp = async (req) => {
    try {
        if (req.email == null)
            throw Error('missing email', { cause: 'visibleError' });
        if (process.env.JWT_SECRET == null)
            throw Error('missing jwt secret', { cause: 'visibleError' });
        const user = await (0, authRepository_1.findUserByEmail)(req.email);
        if (user != null)
            throw Error('email already exists', { cause: 'visibleError' });
        if (req.password != null) {
            const hash = await (0, authUtils_1.encryptPassword)(req.password);
            if (hash != null)
                req.password = hash;
        }
        const request = {
            ...req,
            active: true,
            id: (0, uuid_1.v4)(),
            role: ['registering'],
            createdAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate()
        };
        await (0, authRepository_1.signInFirstStepUser)(request);
        const jwt = (0, jsonwebtoken_1.sign)({
            role: request.role,
            id: request.id,
            email: request.email,
            restaurant: request.restaurant,
            active: request.active,
            createdAt: request.createdAt
        }, process.env.JWT_SECRET);
        return { token: jwt, role: request.role ?? [] };
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.firstStepSignUp = firstStepSignUp;
const signIn = async (req) => {
    try {
        if (req.email == null)
            throw Error('missing email', { cause: 'visibleError' });
        if (process.env.JWT_SECRET == null)
            throw Error('missing jwt secret');
        if (req.password == null)
            throw Error('missing password', { cause: 'visibleError' });
        const user = await (0, authRepository_1.findUserByEmail)(req.email);
        if (user == null)
            throw Error('user not found', { cause: 'visibleError' });
        const valid = await (0, authUtils_1.verifyPassword)(req.password, user.password ?? '');
        if (!valid)
            throw Error('invalid password', { cause: 'visibleError' });
        const jwt = (0, jsonwebtoken_1.sign)({
            role: user.role,
            id: user.id,
            email: user.email,
            restaurant: user.restaurant,
            active: user.active,
            createdAt: user.createdAt
        }, process.env.JWT_SECRET);
        return { token: jwt, role: user.role ?? [] };
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.signIn = signIn;
const checkLogin = async (req) => {
    if (req.token == null)
        return null;
    const logged = (0, jsonwebtoken_1.verify)(req.token, process.env.JWT_SECRET ?? '');
    if (logged == null)
        return null;
    return true;
};
exports.checkLogin = checkLogin;
const PwRecoveryCreateService = async (req) => {
    try {
        const user = await (0, authRepository_1.findUserByEmail)(req.email);
        if (user == null)
            throw Error('user not exist', { cause: 'visibleError' });
        const code = (0, utils_1.generateRandomSequenceObject)();
        await (0, authRepository_1.createCode)({ code: Object.values(code).join(''), id: (0, uuid_1.v4)(), identifier: req.email, createdAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate() });
        await (0, utils_1.sendEmail)(code, req.email, process.env.SENDGRID_TEMPLATE_PASSWORD_RECOVERY ?? '');
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.PwRecoveryCreateService = PwRecoveryCreateService;
const PwRecoveryCheckService = async (req) => {
    try {
        const code = await (0, authRepository_1.checkCode)({ identifier: req.email });
        if ((code?.code ?? '') !== req.codeSent)
            throw Error('invalid code', { cause: 'visibleError' });
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.PwRecoveryCheckService = PwRecoveryCheckService;
const PwChange = async (req) => {
    try {
        await (0, exports.PwRecoveryCheckService)(req);
        const hashPassword = await (0, authUtils_1.encryptPassword)(req.newPW);
        if (hashPassword == null)
            throw Error('invalid pw', { cause: 'visibleError' });
        await (0, authRepository_1.changePassword)({ email: req.email, password: hashPassword });
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.PwChange = PwChange;
