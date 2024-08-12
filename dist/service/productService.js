"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProduct = void 0;
const logUtils_1 = require("../utils/logUtils");
const listProduct = async () => {
    try {
        const myHeaders = new Headers();
        myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a');
        myHeaders.append('external-id', 'F0');
        myHeaders.append('username', 'contato@conectarhortifruti.com.br');
        myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTE5VDIzOjIyOjAwIiwibmJmIjoxNzE3OTc1MzIwLCJleHAiOjE3MTg4MzkzMjAsImlhdCI6MTcxNzk3NTMyMCwiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.nl50gt-jNOxwjwyeppew1Fmz6okVS95-TwRNwhwD4Js');
        myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=');
        const requestOptions = {
            method: 'GET',
            headers: myHeaders
        };
        const result = await fetch('https://gateway.conectarhortifruti.com.br/api/v1/system/listProductToApp', requestOptions);
        const json = await result.json();
        const temp = json.data.filter((item) => {
            return item.sku === '2';
        });
        console.log(temp);
        return json;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.listProduct = listProduct;
