"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullRegister = exports.checkCnpj = void 0;
const logUtils_1 = require("../utils/logUtils");
const restaurantRepository_1 = require("../repository/restaurantRepository");
const restaurantService_1 = require("./restaurantService");
const uuid_1 = require("uuid");
const luxon_1 = require("luxon");
const airtable_1 = require("airtable");
const jsonwebtoken_1 = require("jsonwebtoken");
const checkCnpj = async ({ cnpj }) => {
    try {
        const cnpjFormated = cnpj.toLowerCase().trim();
        if (cnpjFormated == null)
            throw Error('cnpj is missing', { cause: 'visibleError' });
        if (cnpjFormated.length > 14)
            throw Error('invalid cnpj', { cause: 'visibleError' });
        const cnpjExists = await (0, restaurantRepository_1.findRestaurantByCompanyRegistrationNumber)(cnpjFormated);
        if (cnpjExists != null)
            throw Error('already exists', { cause: 'visibleError' });
        const result = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjFormated}`);
        if (!result.ok)
            throw Error('invalid cnpj', { cause: 'visibleError' });
        const resultFormated = await result.json();
        return resultFormated;
    }
    catch (err) {
        if (err.cause !== 'visibleError')
            await (0, logUtils_1.logRegister)(err);
        throw Error(err.message);
    }
};
exports.checkCnpj = checkCnpj;
(0, airtable_1.configure)({
    apiKey: process.env.AIRTABLE_TOKEN ?? ''
});
const createRegisterAirtable = async (req) => {
    try {
        const _ = (0, airtable_1.base)(process.env.AIRTABLE_BASE_REGISTER_ID ?? '').table(process.env.AIRTABLE_TABLE_REGISTER_NAME ?? '');
        const create = await _.create(req);
        return create;
    }
    catch (err) {
        console.error(err);
    }
};
const fullRegister = async (req) => {
    try {
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        const restaurantId = (0, uuid_1.v4)();
        const addressId = (0, uuid_1.v4)();
        const maxHourF = luxon_1.DateTime.fromFormat(req.maxHour, 'HH:mm');
        const maxHourFormated = maxHourF.toISOTime();
        const minHourF = luxon_1.DateTime.fromFormat(req.minHour, 'HH:mm');
        const minHourFormated = minHourF.toISOTime();
        const isoFormattedTimeMax = `2024-01-01T${maxHourFormated?.substring(0, 12)}000Z`;
        const isoFormattedTimeMin = `2024-01-01T${minHourFormated?.substring(0, 12)}000Z`;
        console.log(isoFormattedTimeMax);
        console.log(isoFormattedTimeMin);
        const addressData = {
            active: true,
            complement: req.complement,
            createdAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
            updatedAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
            deliveryObs: req.deliveryObs,
            id: addressId,
            localNumber: req.localNumber,
            maxHour: isoFormattedTimeMax ?? '',
            minHour: isoFormattedTimeMin ?? '',
            neigh: req.neigh,
            street: req.street,
            zipcode: req.zipcode,
            restaurantId: [restaurantId],
            responsibleReceivingName: '',
            responsibleReceivingPhoneNumber: req.phone,
            localType: req.localType,
            city: req.city,
            closedDoorDelivery: req.closeDoor
        };
        await (0, restaurantRepository_1.registerAddress)(addressData);
        let count = await (0, restaurantRepository_1.checkClientCount)();
        if (count == null) {
            count = { externalId: 1 };
        }
        count.externalId++;
        const restData = {
            companyRegistrationNumber: req.cnpj,
            name: req.restaurantName,
            externalId: `C${count.externalId}`,
            companyRegistrationNumberForBilling: req.cnpj,
            stateRegistrationNumber: req.stateNumberId,
            active: true,
            alternativeEmail: req.alternativeEmail,
            email: req.email,
            alternativePhone: req.alternativePhone,
            closeDoor: req.closeDoor,
            phone: req.phone,
            cityRegistrationNumber: req.cityNumberId,
            id: restaurantId,
            orderValue: Number(req.orderValue),
            weeklyOrderAmount: Number(req.weeklyOrderAmount),
            legalName: req.legalRestaurantName,
            createdAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
            updatedAt: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
            user: [decoded.id],
            address: [addressId],
            favorite: [],
            paymentWay: req.paymentWay,
            premium: Number(req.orderValue) >= 400
        };
        await (0, restaurantService_1.createRestaurant)(restData);
        await (0, restaurantRepository_1.removeClientCount)();
        await (0, restaurantRepository_1.addClientCount)(count.externalId);
        function capitalizeWithExceptions(text) {
            const prepositions = ['da', 'do', 'de', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos', 'a', 'o'];
            return text
                .toLowerCase()
                .split(' ')
                .map((word, index) => {
                if (index > 0 && prepositions.includes(word)) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
                .join(' ');
        }
        await (0, restaurantRepository_1.updateUserWithRestaurant)(decoded.id, restaurantId, luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate());
        await createRegisterAirtable({
            'A partir de que horas seu estabelecimento está disponível para recebimento de hortifrúti?': req.minHour,
            'ID pagamento': req.paymentWay,
            'Nome do estabelecimento': req.restaurantName,
            CNPJ: req.cnpj,
            'Inscrição estadual': req.noStateNumberId ? req.cityNumberId : req.stateNumberId,
            Rua: `${req.localType} ${req.street}`,
            Número: req.localNumber,
            Complemento: req.complement,
            'CEP de entrega': req.zipcode,
            Bairro: capitalizeWithExceptions(req.neigh),
            Cidade: req.city,
            'Portas fechadas': req.closeDoor,
            'Razão social': req.legalRestaurantName,
            Premium: Number(req.orderValue) >= 400,
            'Ticket médio cadastrado': req.orderValue.toString(),
            'Telefone para contato com DDD': req.phone,
            'Até que horas o seu estabelecimento pode receber o pedido?': req.maxHour,
            'PJ ou PF': 'Pessoa Jurídica',
            'Termos e condições': 'Li e aceito',
            'E-mail para comunicados': req.email,
            'Código Promotor': req.inviteCode ?? '',
            'Quantas vezes em média na semana você faz pedidos?': req.weeklyOrderAmount,
            'Cadastrado por': 'App'
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.fullRegister = fullRegister;
