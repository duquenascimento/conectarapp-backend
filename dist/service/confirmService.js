"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmOrder = void 0;
const confirmRepository_1 = require("../repository/confirmRepository");
const luxon_1 = require("luxon");
const uuid_1 = require("uuid");
const priceService_1 = require("./priceService");
require("dotenv/config");
const cartService_1 = require("./cartService");
const confirmOrder = async (req) => {
    try {
        const diferencaEmMilissegundos = Math.abs(luxon_1.DateTime.fromJSDate(new Date('1900-01-01')).setZone('America/Sao_Paulo').toJSDate().getTime() - luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate().getTime());
        const milissegundosPorDia = 1000 * 60 * 60 * 24;
        const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / milissegundosPorDia) + 2;
        const today = luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate();
        const deliveryDate = luxon_1.DateTime.now().setZone('America/Sao_Paulo').toJSDate();
        let deliveryDateFormated = luxon_1.DateTime.now().setZone('America/Sao_Paulo');
        deliveryDateFormated = deliveryDateFormated.set({ day: today.getDate() + 1 });
        deliveryDate.setDate(today.getDate() + 1);
        let orderId = `${diferencaEmDias}_C1`;
        const checkOrderId = await (0, confirmRepository_1.checkOrder)(orderId);
        if (checkOrderId !== 0) {
            orderId = `${orderId}_P${checkOrderId + 1}`;
        }
        const getPaymentDescription = (paymentWay) => {
            const paymentDescriptions = {
                DI00: 'Diário',
                DI01: 'Diário',
                DI02: 'Diário',
                DI07: 'Diário',
                DI10: 'Diário',
                DI14: 'Diário',
                DI15: 'Diário',
                DI28: 'Diário',
                US08: 'Semanal',
                UQ10: 'Semanal',
                UX12: 'Semanal',
                BX10: 'Bissemanal',
                BX12: 'Bissemanal',
                BX16: 'Bissemanal',
                ME01: 'Mensal',
                ME05: 'Mensal',
                ME10: 'Mensal',
                ME15: 'Mensal',
                AV01: 'À Vista',
                AV00: 'À Vista'
            };
            return paymentDescriptions[paymentWay] ?? '';
        };
        const calcOrderAgain = await (0, priceService_1.suppliersPrices)({ token: req.token, selectedRestaurant: req.restaurant.restaurant });
        const allSuppliers = await (0, priceService_1.suppliersCompletePrices)({ token: req.token, selectedRestaurant: req.restaurant.restaurant });
        const detailing = [];
        req.supplier.discount.products.forEach(item => {
            if (item.sku == null) {
                console.log(item);
            }
            const suppliersDetailing = allSuppliers.data.flatMap((s) => {
                const product = s.supplier.discount.products.find((p) => p.sku === item.sku);
                if (product != null) {
                    return [{
                            externalId: s.supplier.externalId,
                            discount: s.supplier.discount.discount,
                            priceUnique: product.priceUnique
                        }];
                }
                return [];
            }).filter(Boolean);
            detailing.push({
                conectarFinalPrice: item.price,
                conectarPricePerUnid: item.priceUniqueWithTaxAndDiscount,
                id: `${orderId}_${item.sku}`,
                orderId,
                restaurantId: (0, uuid_1.v4)(),
                productId: item.sku,
                orderAmount: item.orderQuant,
                name: item.name,
                orderUnit: item.orderUnit,
                restaurantFinalAmount: item.quant,
                supplierFinalAmount: item.quant,
                obs: item.obs,
                supplierPricePerUnid: item.priceUnique,
                status: item.price === 0 ? 'Indisponível' : 'Confirmado',
                supplierFinalPrice: item.priceWithoutTax,
                suppliersDetailing: { data: suppliersDetailing }
            });
        });
        const documintPromise = await fetch('https://api.documint.me/1/templates/64b96c15f093e4fd8d4b39f1/content?preview=true&active=true', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                api_key: process.env.DOCUMINT_KEY ?? ''
            },
            body: JSON.stringify({
                bairro: req.restaurant.restaurant.addressInfos[0].neighborhood,
                cep: req.restaurant.restaurant.addressInfos[0].zipCode,
                cnpj: req.restaurant.restaurant.companyRegistrationNumber,
                complemento: req.restaurant.restaurant.addressInfos[0].cõmplement,
                data_entrega: deliveryDateFormated.toFormat('yyyy/MM/dd'),
                data_entrega_arquivo_string: deliveryDateFormated.toFormat('yyyy/MM/dd'),
                horario_maximo: req.restaurant.restaurant.addressInfos[0].finalDeliveryTime.substring(11, 16),
                horario_minimo: req.restaurant.restaurant.addressInfos[0].initialDeliveryTime.substring(11, 16),
                id_distribuidor_string: req.supplier.externalId,
                id_pedido: orderId,
                restaurante: req.restaurant.restaurant.name,
                informacao_de_entrega: req.restaurant.restaurant.addressInfos[0].deliveryInformation,
                inscricao_estadual: req.restaurant.restaurant.stateRegistrationNumber ?? req.restaurant.restaurant.cityRegistrationNumber,
                razao_social: req.restaurant.restaurant.legalName,
                nome_cliente_string: req.restaurant.restaurant.name,
                rua: `${req.restaurant.restaurant.addressInfos[0].localType} ${req.restaurant.restaurant.addressInfos[0].address}`,
                total_conectar: req.supplier.discount.orderValueFinish.toString(),
                nome: req.supplier.name,
                chave_pix: '',
                total_em_descontos: '0',
                total_sem_descontos: req.supplier.discount.orderValueFinish.toString(),
                tel_resp_recebimento: req.restaurant.restaurant.addressInfos[0].responsibleReceivingPhoneNumber,
                resp_recebimento: req.restaurant.restaurant.addressInfos[0].responsibleReceivingName,
                periodicidade_pagamento: getPaymentDescription(req.restaurant.restaurant.paymentWay),
                tipo_de_pag: getPaymentDescription(req.restaurant.restaurant.paymentWay),
                detalhamento_pedido: detailing.map((item) => {
                    return {
                        aux_obs: item.obs,
                        custo_unidade_conectar: item.conectarPricePerUnid.toString(),
                        exibir_para_cliente: item.conectarFinalPrice !== 0 ? '✔️' : '✖️',
                        preco_final_conectar: item.conectarFinalPrice.toString(),
                        qtd_final_cliente: item.supplierFinalAmount.toString(),
                        qtd_pedido: item.orderAmount.toString(),
                        unidade_cotacao: 'Kg',
                        unidade_pedido: item.orderUnit ?? '',
                        produto_descricao: item.name ?? ''
                    };
                }),
                img_barcode: '',
                url_barcode: '',
                url_img_pix: ''
            })
        });
        const documintResponse = await documintPromise.json();
        const order = {
            addressId: (0, uuid_1.v4)(),
            deliveryDate,
            finalDeliveryTime: today,
            id: orderId,
            initialDeliveryTime: today,
            orderDate: today,
            orderHour: today,
            paymentWay: req.restaurant.restaurant.paymentWay,
            referencePoint: req.restaurant.restaurant.addressInfos[0].deliveryReference,
            restaurantId: 'C1',
            status: 'Teste',
            tax: req.restaurant.restaurant.tax / 100,
            totalConectar: req.supplier.discount.orderValueFinish,
            totalSupplier: req.supplier.discount.orderWithoutTax,
            detailing: detailing.map(item => item.id),
            supplierId: req.supplier.externalId,
            calcOrderAgain: { data: calcOrderAgain.data },
            orderDocument: documintResponse.url
        };
        console.log(req.token);
        await Promise.all([
            (0, confirmRepository_1.addOrder)(order),
            (0, cartService_1.deleteCartByUser)({
                token: req.token,
                selectedRestaurant: []
            }),
            (0, confirmRepository_1.addDetailing)(detailing.map(({ name, orderUnit, ...rest }) => rest)),
            fetch('https://hooks.airtable.com/workflows/v1/genericWebhook/appH7QQsEghVD7iTO/wflMrmLegBDqDNF6U/wtrvetFTovtyTInYM', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ ...order, detailing })
            })
        ]);
        return {
            restName: req.restaurant.restaurant.name,
            address: `${req.restaurant.restaurant.addressInfos[0].localType} ${req.restaurant.restaurant.addressInfos[0].address}, ${req.restaurant.restaurant.addressInfos[0].complement}`,
            maxHour: req.restaurant.restaurant.addressInfos[0].finalDeliveryTime.substring(11, 16),
            minHour: req.restaurant.restaurant.addressInfos[0].initialDeliveryTime.substring(11, 16),
            deliveryDateFormated,
            paymentWay: req.restaurant.restaurant.paymentWay
        };
    }
    catch (err) {
        console.log(err);
    }
};
exports.confirmOrder = confirmOrder;
