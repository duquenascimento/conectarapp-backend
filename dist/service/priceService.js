"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.suppliersCompletePrices = exports.suppliersPrices = void 0;
const luxon_1 = require("luxon");
const cartService_1 = require("./cartService");
const library_1 = require("@prisma/client/runtime/library");
const suppliersPrices = async (req) => {
    try {
        const products = await (0, cartService_1.listCartComplete)(req);
        const Product = products?.map(item => { return { Qtd: item.amount ?? new library_1.Decimal(0), Obs: item.obs ?? '', Sku: item.sku ?? '' }; });
        const request = {
            neighborhood: req.selectedRestaurant.addressInfos[0].neighborhood,
            minimumTime: `0001-01-01T${req.selectedRestaurant.addressInfos[0].initialDeliveryTime.substring(11, 16)}:00.00000+00:00`,
            maximumTime: `0001-01-01T${req.selectedRestaurant.addressInfos[0].finalDeliveryTime.substring(11, 16)}:00.00000+00:00`,
            externalId: 'F0',
            createdBy: 'system',
            DiaEntrega: '',
            Product,
            tax: req.selectedRestaurant.tax / 100 + 1,
            SupplierToExclude: [],
            ActualDayWeek: '',
            ActualHour: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate().toISOString()
        };
        const myHeaders = new Headers();
        myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a');
        myHeaders.append('external-id', 'F0');
        myHeaders.append('username', 'contato@conectarhortifruti.com.br');
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=');
        myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTIwVDAzOjQwOjM3IiwibmJmIjoxNzE3OTkwODM3LCJleHAiOjE3MTg4NTQ4MzcsImlhdCI6MTcxNzk5MDgzNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.RBX5whQIqwtRJOnjTX622qvwCFQJxcgVXQKTyUoVFys');
        const raw = JSON.stringify(request);
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw
        };
        const res = await fetch('https://gateway.conectarhortifruti.com.br/api/v1/system/list-available-supplier-new', requestOptions);
        const data = await res.json();
        return data;
    }
    catch (err) {
        return {};
    }
};
exports.suppliersPrices = suppliersPrices;
const suppliersCompletePrices = async (req) => {
    try {
        const products = await (0, cartService_1.listCartComplete)(req);
        const Product = products?.map(item => { return { Qtd: item.amount ?? new library_1.Decimal(0), Obs: item.obs ?? '', Sku: item.sku ?? '' }; });
        const request = {
            neighborhood: req.selectedRestaurant.addressInfos[0].neighborhood,
            minimumTime: `0001-01-01T${req.selectedRestaurant.addressInfos[0].initialDeliveryTime.substring(11, 16)}:00.00000+00:00`,
            maximumTime: `0001-01-01T${req.selectedRestaurant.addressInfos[0].finalDeliveryTime.substring(11, 16)}:00.00000+00:00`,
            externalId: 'F0',
            createdBy: 'system',
            DiaEntrega: '',
            Product,
            tax: req.selectedRestaurant.tax / 100 + 1,
            SupplierToExclude: [],
            ActualDayWeek: '',
            ActualHour: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate().toISOString()
        };
        const myHeaders = new Headers();
        myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a');
        myHeaders.append('external-id', 'F0');
        myHeaders.append('username', 'contato@conectarhortifruti.com.br');
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=');
        myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTIwVDAzOjQwOjM3IiwibmJmIjoxNzE3OTkwODM3LCJleHAiOjE3MTg4NTQ4MzcsImlhdCI6MTcxNzk5MDgzNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.RBX5whQIqwtRJOnjTX622qvwCFQJxcgVXQKTyUoVFys');
        const raw = JSON.stringify(request);
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw
        };
        const res = await fetch('https://gateway.conectarhortifruti.com.br/api/v1/system/list-all-prices-of-suppliers', requestOptions);
        const data = await res.json();
        return data;
    }
    catch (err) {
        return {};
    }
};
exports.suppliersCompletePrices = suppliersCompletePrices;
