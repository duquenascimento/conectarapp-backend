"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBilling = void 0;
const logUtils_1 = require("../utils/logUtils");
const luxon_1 = require("luxon");
const generateBilling = async (req, type, discount, renegotiation) => {
    try {
        const request = req;
        const orderId = req.orderId.split('_');
        const billingType = type === 'Diário' ? '1' : type === 'Acumulado' ? '2' : '3';
        const date = luxon_1.DateTime.fromJSDate(request.dataVencimento ?? new Date()).toFormat('ddMMyy');
        request.valorMulta = request.valorCobranca * 0.02;
        request.valorJurosDiarios = request.valorCobranca * 0.033333;
        request.nossoNumero = `${billingType}${billingType === '1' ? `${discount ? '1' : '0'}${orderId[0]}` : date}${orderId[1].replace('C', '').padStart(4, '0')}${billingType === '1' ? orderId.length > 2 ? orderId[2].replace('P', '') : '1' : renegotiation ? '0' : '9'}`;
        request.nossoNumero = '';
        const resultPromise = await fetch('https://api.integracao.obypagamentos.com.br/api/Cobrancas/QrCodeComVencimento', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(request)
        });
        const result = await resultPromise.json();
        return result;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.generateBilling = generateBilling;
