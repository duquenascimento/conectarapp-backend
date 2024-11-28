"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmOrderPremium = exports.confirmOrder = void 0;
const confirmRepository_1 = require("../repository/confirmRepository");
const luxon_1 = require("luxon");
const uuid_1 = require("uuid");
const priceService_1 = require("./priceService");
require("dotenv/config");
const cartService_1 = require("./cartService");
const cartRepository_1 = require("../repository/cartRepository");
const jsonwebtoken_1 = require("jsonwebtoken");
const productService_1 = require("./productService");
const airtable_1 = require("airtable");
const itauService_1 = require("./itauService");
const fs_1 = require("fs");
const qrcode_1 = __importDefault(require("qrcode"));
const canvas_1 = require("canvas");
const jsbarcode_1 = __importDefault(require("jsbarcode"));
(0, airtable_1.configure)({
    apiKey: process.env.AIRTABLE_TOKEN ?? ''
});
const createOrderTextAirtable = async (req) => {
    try {
        const _ = (0, airtable_1.base)(process.env.AIRTABLE_BASE_ORDERTEXT_ID ?? '').table(process.env.AIRTABLE_TABLE_ORDERTEXT_NAME ?? '');
        const create = await _.create(req);
        return create;
    }
    catch (err) {
        console.error(err);
    }
};
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};
const findIdFromAirtable = async (tableName, fieldToFilter, valueToFilter, baseName) => {
    const _ = (0, airtable_1.base)(baseName).table(tableName);
    const filterByFormula = `{${fieldToFilter}} = "${valueToFilter}"`;
    try {
        const records = await _.select({
            filterByFormula
        }).all();
        if (records.length > 0) {
            return records[0].id;
        }
        else {
            return '';
        }
    }
    catch (err) {
        console.error('Error:', err);
        return '';
    }
};
const findProductsIdsFromAirtable = async (valuesToFilter) => {
    const _ = (0, airtable_1.base)(process.env.AIRTABLE_BASE_ORDER_ID ?? '').table(process.env.AIRTABLE_TABLE_PRODUCT_NAME ?? '');
    const filterByFormula = `OR(${valuesToFilter.map(value => `{ID_Produto} = "${value}"`).join(', ')})`;
    try {
        const records = await _.select({
            filterByFormula
        }).all();
        if (records.length > 0) {
            return records.map(record => { return { productId: record.fields.ID_Produto, airtableId: record.id }; });
        }
        else {
            return [];
        }
    }
    catch (err) {
        console.error('Error:', err);
        return [];
    }
};
const createOrderAirtable = async (req) => {
    try {
        const _ = (0, airtable_1.base)(process.env.AIRTABLE_BASE_ORDER_ID ?? '').table(process.env.AIRTABLE_TABLE_ORDER_NAME ?? '');
        const create = await _.create(req);
        return create;
    }
    catch (err) {
        console.error(err);
    }
};
const createDetailingAirtable = async (req) => {
    try {
        const _ = (0, airtable_1.base)(process.env.AIRTABLE_BASE_ORDER_ID ?? '').table(process.env.AIRTABLE_TABLE_DETAILING_NAME ?? '');
        const detailing = await _.create(req.map(record => ({ fields: record })));
        return detailing;
    }
    catch (err) {
        console.error(err);
        return undefined;
    }
};
const createOrderSupplierAppAirtable = async (req) => {
    try {
        const _ = (0, airtable_1.base)(process.env.AIRTABLE_BASE_SUPPLIERAPP_ID ?? '').table(process.env.AIRTABLE_TABLE_ORDERSUPPLIERAPP_NAME ?? '');
        const create = await _.create(req);
        return create;
    }
    catch (err) {
        console.error(err);
    }
};
const airtableHandler = async (_order, _detailing, yourNumber, orderText) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [supplierId, restId, productsId, restIdInSupplierApp, supplierIdInSupplierApp] = await Promise.all([
            findIdFromAirtable(process.env.AIRTABLE_TABLE_SUPPLIER_NAME ?? '', 'ID Fornecedor', _order.supplierId, process.env.AIRTABLE_BASE_ORDER_ID ?? ''),
            findIdFromAirtable(process.env.AIRTABLE_TABLE_REST_NAME ?? '', 'ID_Cliente', _order.restaurantId, process.env.AIRTABLE_BASE_ORDER_ID ?? ''),
            findProductsIdsFromAirtable(_detailing.map(item => item.productId)),
            findIdFromAirtable(process.env.AIRTABLE_TABLE_RESTSUPPLIERAPP_NAME ?? '', 'ID_Cliente', _order.restaurantId, process.env.AIRTABLE_BASE_SUPPLIERAPP_ID ?? ''),
            findIdFromAirtable(process.env.AIRTABLE_TABLE_SUPPLIERSUPPLIERAPP_NAME ?? '', 'ID Fornecedor', _order.supplierId, process.env.AIRTABLE_BASE_SUPPLIERAPP_ID ?? '')
        ]);
        const productsMap = productsId.reduce((obj, product) => {
            obj[product.productId] = product.airtableId;
            return obj;
        }, {});
        const order = await createOrderAirtable({
            'Código operador': 'APP',
            'Data Entrega': _order.deliveryDate.toISOString().substring(0, 10),
            'Data Pedido': _order.orderDate.toISOString().substring(0, 10),
            'Forma de pagamento': _order.paymentWay ?? '',
            'ID Distribuidor': (_order.restaurantId !== 'PF324' && _order.restaurantId !== 'C186') ? ['rec1YouX20iXGOB5G'] : [supplierId],
            'Pedido Bubble': true,
            'Ponto de referência': _order.referencePoint ?? '',
            'Presentes na cotação': _order.calcOrderAgain.data.map((item) => item.supplier.externalId),
            ID_Pedido: _order.id,
            Horário: _order.orderHour.toISOString().substring(11, 16),
            'Total Fornecedor': _order.totalSupplier,
            'Total Conéctar': _order.totalConectar,
            'Status Pedido': _order.status,
            'Recibo original': [{
                    url: _order.orderDocument
                }],
            ID_Cliente: [restId],
            Identificador: yourNumber
        });
        const batchedDetails = chunkArray(_detailing.map(item => ({
            ID_Pedido: [order?.id ?? ''],
            'ID Produto': [productsMap[item.productId]],
            'Qtd Pedido': item.orderAmount,
            'Qtd Final Distribuidor': item.supplierFinalAmount,
            'Qtd Final Cliente': item.restaurantFinalAmount,
            'Custo / Unidade Fornecedor': item.supplierPricePerUnid,
            'Custo / Unidade Conéctar': item.conectarPricePerUnid,
            'Preço Final Distribuidor': item.supplierFinalPrice,
            'Preço Final Conéctar': item.conectarFinalPrice,
            'Status Detalhamento Pedido': item.status,
            OBS: item.obs,
            Aux_OBS: item.obs,
            'Custo Estimado': item.conectarFinalPrice,
            'Custo / Unid Fornecedor BD': item.supplierPricePerUnid,
            'Custo / Unidade Conéctar BD': item.conectarPricePerUnid,
            'Taxa Cliente': _order.tax,
            'Qtd Estimada': item.supplierFinalAmount
        })), 10);
        for (const batch of batchedDetails) {
            await createDetailingAirtable(batch);
        }
        await createOrderSupplierAppAirtable({
            'Data Entrega': _order.deliveryDate.toISOString().substring(0, 10),
            'Exibir pedido': true,
            'ID Cliente': [restIdInSupplierApp],
            'ID fornecedor': (_order.restaurantId !== 'PF324' && _order.restaurantId !== 'C186') ? ['recM5Rdmh8oxjdOrC'] : [supplierIdInSupplierApp],
            'Tipo de pedido': _order.id.split('_').length > 2 ? _order.id.split('_')[2] : 'P1',
            'Valor auto': _order.totalConectar,
            Recibo: [{ url: _order.orderDocument }],
            Status: 'Confirmado',
            'Código operador': ['rec2NPFiWR9r7mxfn']
        });
        await createOrderTextAirtable({
            App: true,
            'Data Pedido': _order.orderDate.toISOString().substring(0, 10),
            'ID Cliente': _order.restaurantId,
            'Texto Pedido': orderText
        });
    }
    catch (err) {
        console.error(err);
    }
};
const confirmOrder = async (req) => {
    try {
        const diferencaEmMilissegundos = Math.abs(luxon_1.DateTime.fromISO('1900-01-01', { zone: 'America/Sao_Paulo' }).toMillis() -
            luxon_1.DateTime.now().setZone('America/Sao_Paulo').toMillis());
        const milissegundosPorDia = 1000 * 60 * 60 * 24;
        const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / milissegundosPorDia) + 2;
        const today = luxon_1.DateTime.now().setZone('America/Sao_Paulo');
        const deliveryDate = today.plus({ days: 1 });
        let orderId = `${diferencaEmDias}_${req.restaurant.restaurant.externalId}`;
        function generateBarcode(barcodeValue) {
            const canvas = (0, canvas_1.createCanvas)(0, 0);
            (0, jsbarcode_1.default)(canvas, barcodeValue, {
                format: 'ITF',
                width: 2,
                height: 100,
                displayValue: false
            });
            return canvas.toDataURL('image/png');
        }
        function convertBase64ToPng(base64String, filePath) {
            const base64Data = base64String.replace(/^data:image\/png;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            (0, fs_1.writeFileSync)(filePath, buffer);
        }
        async function generateQRCode(text, filePath) {
            try {
                const qrImage = await qrcode_1.default.toBuffer(text, { type: 'png', width: 100 });
                (0, fs_1.writeFileSync)(filePath, qrImage);
            }
            catch (err) {
                console.error('Erro ao gerar o QR Code:', err);
            }
        }
        const getPaymentDate = (paymentWay) => {
            const today = luxon_1.DateTime.now().setZone('America/Sao_Paulo');
            const deliveryDay = today.plus({ days: 1 }); // Definir o dia da entrega como 1 dia após o dia atual
            console.log(today);
            const calculateNextWeekday = (date, day) => {
                return date.plus({ days: (day + (7 - date.weekday)) % 7 });
            };
            const calculateNextBimonthly = (date, day1, day2) => {
                const day = date.day;
                if (day < day1) {
                    return date.set({ day: day1 });
                }
                else if (day < day2) {
                    return date.set({ day: day2 });
                }
                else {
                    return date.plus({ months: 1 }).set({ day: day1 });
                }
            };
            const calculateNextMonthly = (date, day) => {
                const nextDate = date.set({ day }).plus({ months: date.day >= day ? 1 : 0 });
                return nextDate.day === day ? nextDate : nextDate.endOf('month'); // Ajusta para o último dia do mês, se necessário
            };
            const paymentDescriptions = {
                DI00: deliveryDay.toISODate(),
                DI01: deliveryDay.plus({ days: 1 }).toISODate(),
                DI02: deliveryDay.plus({ days: 2 }).toISODate(),
                DI07: deliveryDay.plus({ days: 7 }).toISODate(),
                DI10: deliveryDay.plus({ days: 10 }).toISODate(),
                DI14: deliveryDay.plus({ days: 14 }).toISODate(),
                DI15: deliveryDay.plus({ days: 15 }).toISODate(),
                DI28: deliveryDay.plus({ days: 28 }).toISODate(),
                US08: calculateNextWeekday(deliveryDay, 1).toISODate(),
                UQ10: calculateNextWeekday(deliveryDay, 3).toISODate(),
                UX12: calculateNextWeekday(deliveryDay, 5).toISODate(),
                BX10: calculateNextBimonthly(deliveryDay, 10, 25).toISODate(),
                BX12: calculateNextBimonthly(deliveryDay, 12, 26).toISODate(),
                BX16: calculateNextBimonthly(deliveryDay, 16, 30).toISODate(),
                ME01: calculateNextMonthly(deliveryDay, 1).toISODate(),
                ME05: calculateNextMonthly(deliveryDay, 5).toISODate(),
                ME10: calculateNextMonthly(deliveryDay, 10).toISODate(),
                ME15: calculateNextMonthly(deliveryDay, 15).toISODate(),
                AV01: deliveryDay.minus({ days: 1 }).toISODate(),
                AV00: deliveryDay.toISODate()
            };
            return paymentDescriptions[paymentWay] ?? '';
        };
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
        const ourNumber = (Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')).slice(-8);
        const yourNumber = (Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')).slice(-10);
        const orderText = `🌱 *Pedido Conéctar* 🌱
---------------------------------------

${req.supplier.discount.product?.map(cart => `*${String(cart.quant).replace('.', ',')}x ${cart.name}* cód. ${cart.sku}${(cart.obs === '') ? '' : `\nObs.: ${cart.obs}`}`).join(', \n')}

---------------------------------------

*${req.restaurant.restaurant.name}*
${req.restaurant.restaurant.addressInfos[0].responsibleReceivingName ?? ''} - ${req.restaurant.restaurant.addressInfos[0].responsibleReceivingPhoneNumber ?? ''}

${req.restaurant.restaurant.addressInfos[0].address}, ${req.restaurant.restaurant.addressInfos[0].localNumber} ${req.restaurant.restaurant.addressInfos[0].complement}
${req.restaurant.restaurant.addressInfos[0].neighborhood}, ${req.restaurant.restaurant.addressInfos[0].city}
${req.restaurant.restaurant.addressInfos[0].zipCode}

Pedido gerado às ${today.toFormat('HH:mm')} no dia ${today.toFormat('dd/MM')}
    `;
        const detailing = [];
        req.supplier.discount.product.forEach(item => {
            if (item.sku == null) {
                console.log(item);
            }
            const suppliersDetailing = allSuppliers.data.flatMap((s) => {
                const product = s.supplier.discount.product.find((p) => p.sku === item.sku);
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
                quotationUnit: item.quotationUnit,
                restaurantFinalAmount: item.quant,
                supplierFinalAmount: item.quant,
                obs: item.obs,
                supplierPricePerUnid: item.priceUnique,
                status: item.price === 0 ? 'Produto não disponível' : 'Confirmado',
                supplierFinalPrice: item.priceWithoutTax,
                suppliersDetailing: { data: suppliersDetailing }
            });
        });
        let bolecode = null;
        let digitableBarCode = null;
        const paymentWayString = getPaymentDescription(req.restaurant.restaurant.paymentWay);
        if (paymentWayString === 'Diário' || paymentWayString === 'À Vista') {
            const data = {
                tipo_boleto: 'a vista',
                texto_seu_numero: yourNumber,
                codigo_carteira: '109',
                valor_total_titulo: req.supplier.discount.orderValueFinish.toFixed(2).replace('.', '').padStart(12, '0'),
                codigo_especie: '01',
                data_emissao: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toISODate() ?? '',
                valor_abatimento: '000000000000',
                pagador: {
                    pessoa: {
                        nome_pessoa: req.restaurant.restaurant.legalName,
                        tipo_pessoa: {
                            codigo_tipo_pessoa: req.restaurant.restaurant.companyRegistrationNumber > 11 ? 'J' : 'F',
                            numero_cadastro_nacional_pessoa_juridica: undefined,
                            numero_cadastro_pessoa_fisica: undefined
                        }
                    },
                    endereco: {
                        nome_logradouro: `${req.restaurant.restaurant.addressInfos[0].localType} ${req.restaurant.restaurant.addressInfos[0].address}`,
                        nome_bairro: req.restaurant.restaurant.addressInfos[0].neighborhood,
                        nome_cidade: req.restaurant.restaurant.addressInfos[0].city,
                        sigla_UF: 'RJ',
                        numero_CEP: req.restaurant.restaurant.addressInfos[0].zipCode.replace('-', '')
                    }
                },
                dados_individuais_boleto: [
                    {
                        numero_nosso_numero: ourNumber,
                        data_vencimento: getPaymentDate(req.restaurant.restaurant.paymentWay),
                        texto_uso_beneficiario: '000001',
                        valor_titulo: req.supplier.discount.orderValueFinish.toFixed(2).replace('.', '').padStart(12, '0'),
                        data_limite_pagamento: luxon_1.DateTime.now().set({ month: luxon_1.DateTime.now().get('month') + 2 }).toISODate()
                    }
                ],
                juros: {
                    data_juros: luxon_1.DateTime.fromISO(getPaymentDate(req.restaurant.restaurant.paymentWay)).set({ day: luxon_1.DateTime.fromISO(getPaymentDate(req.restaurant.restaurant.paymentWay)).get('day') + 1 }).toISODate() ?? '',
                    codigo_tipo_juros: '93',
                    valor_juros: ((req.supplier.discount.orderValueFinish * 0.01) / 30).toFixed(2).replace('.', '').padStart(17, '0')
                },
                multa: {
                    codigo_tipo_multa: '02',
                    percentual_multa: '000000200000',
                    data_multa: luxon_1.DateTime.fromISO(getPaymentDate(req.restaurant.restaurant.paymentWay)).set({ day: luxon_1.DateTime.fromISO(getPaymentDate(req.restaurant.restaurant.paymentWay)).get('day') + 1 }).toISODate() ?? ''
                },
                lista_mensagem_cobranca: [
                    {
                        mensagem: `${orderId} - Pedido entregue em ${deliveryDate.toFormat('dd/MM/yyyy')}`
                    }
                ]
            };
            if (data.pagador.pessoa.tipo_pessoa.codigo_tipo_pessoa === 'J') {
                data.pagador.pessoa.tipo_pessoa.numero_cadastro_nacional_pessoa_juridica = req.restaurant.restaurant.companyRegistrationNumber;
            }
            else {
                data.pagador.pessoa.tipo_pessoa.numero_cadastro_pessoa_fisica = req.restaurant.restaurant.companyRegistrationNumber;
            }
            bolecode = await (0, itauService_1.generateBolecode)(data);
            const barCodeImage = generateBarcode(bolecode.data.dado_boleto.dados_individuais_boleto[0].codigo_barras);
            digitableBarCode = bolecode.data.dado_boleto.dados_individuais_boleto[0].numero_linha_digitavel;
            const pixKey = bolecode.data.dados_qrcode.emv;
            const qrCodePath = `C:/inetpub/wwwroot/cdn.conectarhortifruti.com.br/banco/itau/${orderId}-qrcode.png`;
            const barCodePath = `C:/inetpub/wwwroot/cdn.conectarhortifruti.com.br/banco/itau/${orderId}-barcode.png`;
            convertBase64ToPng(barCodeImage, barCodePath);
            await generateQRCode(pixKey, qrCodePath);
        }
        const documintPromise = await fetch('https://api.documint.me/1/templates/66d9f1cbc55000285de75733/content?preview=true&active=true', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                api_key: process.env.DOCUMINT_KEY ?? ''
            },
            body: JSON.stringify({
                id_cliente: [
                    {
                        bairro: req.restaurant.restaurant.addressInfos[0].neighborhood,
                        cep: req.restaurant.restaurant.addressInfos[0].zipCode,
                        cidade: req.restaurant.restaurant.addressInfos[0].city,
                        cnpj: req.restaurant.restaurant.companyRegistrationNumber,
                        informacao_de_entrega: req.restaurant.restaurant.addressInfos[0].deliveryInformation,
                        inscricao_estadual: req.restaurant.restaurant.stateRegistrationNumber ?? req.restaurant.restaurant.cityRegistrationNumber,
                        nome: req.restaurant.restaurant.name,
                        numero_e_complemento: `${req.restaurant.restaurant.addressInfos[0].localNumber}${req.restaurant.restaurant.addressInfos[0].complement == null ? ' - ' : ''}${req.restaurant.restaurant.addressInfos[0].complement}`,
                        razao_social: req.restaurant.restaurant.legalName,
                        resp_recebimento: req.restaurant.restaurant.addressInfos[0].responsibleReceivingName,
                        rua: `${req.restaurant.restaurant.addressInfos[0].localType} ${req.restaurant.restaurant.addressInfos[0].address}`,
                        tel_resp_recebimento: req.restaurant.restaurant.addressInfos[0].responsibleReceivingPhoneNumber
                    }
                ],
                data_entrega: deliveryDate.toFormat('yyyy/MM/dd'),
                horario_maximo: req.restaurant.restaurant.addressInfos[0].finalDeliveryTime.substring(11, 16),
                horario_minimo: req.restaurant.restaurant.addressInfos[0].initialDeliveryTime.substring(11, 16),
                id_pedido: orderId,
                restaurante: req.restaurant.restaurant.name,
                razao_social: req.restaurant.restaurant.legalName,
                total_conectar: req.supplier.discount.orderValueFinish.toString(),
                nome: req.supplier.name,
                total_em_descontos: '0',
                total_sem_descontos: req.supplier.discount.orderValueFinish.toString(),
                detalhamento_pedido: detailing.map((item) => {
                    return {
                        aux_obs: item.obs,
                        custo_unidade_conectar: item.conectarPricePerUnid.toString(),
                        exibir_para_cliente: item.conectarFinalPrice !== 0 ? '✔️' : '✖️',
                        preco_final_conectar: item.conectarFinalPrice.toString(),
                        qtd_final_cliente: item.supplierFinalAmount.toString(),
                        qtd_pedido: item.orderAmount.toString(),
                        unidade_cotacao: item.quotationUnit ?? '',
                        unidade_pedido: item.orderUnit ?? '',
                        produto_descricao: item.name ?? ''
                    };
                }),
                url_img_pix: `https://cdn.conectarhortifruti.com.br/banco/itau/${orderId}-qrcode.png`,
                cnpj: req.restaurant.restaurant.companyRegistrationNumber,
                cnpj_fornecedor: '',
                codigo_barras: `https://cdn.conectarhortifruti.com.br/banco/itau/${orderId}-barcode.png`,
                codigo_carteira: '109',
                data_emissao: luxon_1.DateTime.now().setZone('America/Sao_Paulo').toFormat('yyy/MM/dd'),
                data_pedido: luxon_1.DateTime.now().toFormat('yyyy/MM/dd'),
                data_vencimento: getPaymentDate(req.restaurant.restaurant.paymentWay).replaceAll('-', '/'),
                id_beneficiario: '6030000983545',
                identificador_calculado: yourNumber,
                nome_bairro: req.restaurant.restaurant.addressInfos[0].neighborhood,
                nome_cidade: req.restaurant.restaurant.addressInfos[0].city,
                nome_logradouro: req.restaurant.restaurant.addressInfos[0].localType + ' ' + req.restaurant.restaurant.addressInfos[0].address,
                numero_cep: req.restaurant.restaurant.addressInfos[0].zipCode,
                numero_linha_digitavel: digitableBarCode ?? '',
                numero_nosso_numero: ourNumber,
                sigla_UF: 'RJ',
                cliente_com_boleto: (getPaymentDescription(req.restaurant.restaurant.paymentWay) === 'Diário' || getPaymentDescription(req.restaurant.restaurant.paymentWay) === 'À Vista') ? '1' : '0',
                nome_cliente: req.restaurant.restaurant.name.replaceAll(' ', ''),
                id_distribuidor: (req.restaurant.restaurant.externalId !== 'PF324' && req.restaurant.restaurant.externalId !== 'C186') ? 'F0' : req.supplier.externalId
            })
        });
        const documintResponse = await documintPromise.json();
        const myHeaders = new Headers();
        myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a');
        myHeaders.append('external-id', 'F0');
        myHeaders.append('username', 'contato@conectarhortifruti.com.br');
        myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=');
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA3LTI2VDEzOjI1OjE3IiwibmJmIjoxNzIxMTM2MzE3LCJleHAiOjE3MjIwMDAzMTcsImlhdCI6MTcyMTEzNjMxNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.Ge3ST_TCO4XLcSj-pjSFvU8Pr9H_Oeks3zTkDAhsVcE');
        const requestOptions = {
            method: 'GET',
            headers: myHeaders
        };
        const responseFile = await fetch(`https://gateway.conectarhortifruti.com.br/api/v1/system/saveFile?url=${documintResponse.url}&fileName=${documintResponse.filename.replaceAll('/', '')}`, requestOptions);
        const resultFile = await responseFile.json();
        const finalDeliveryTime = today.toJSDate();
        finalDeliveryTime.setHours(finalDeliveryTime.getHours() - 3);
        const initialDeliveryTime = today.toJSDate();
        initialDeliveryTime.setHours(initialDeliveryTime.getHours() - 3);
        const orderHour = today.toJSDate();
        orderHour.setHours(orderHour.getHours() - 3);
        const order = {
            addressId: (0, uuid_1.v4)(),
            deliveryDate: new Date(deliveryDate.toString().substring(0, 10)),
            finalDeliveryTime,
            id: orderId,
            initialDeliveryTime,
            orderDate: new Date(today.toString().substring(0, 10)),
            orderHour,
            paymentWay: req.restaurant.restaurant.paymentWay,
            referencePoint: req.restaurant.restaurant.addressInfos[0].deliveryReference,
            restaurantId: req.restaurant.restaurant.externalId,
            status: 'Confirmado',
            tax: req.restaurant.restaurant.tax / 100,
            totalConectar: req.supplier.discount.orderValueFinish,
            totalSupplier: req.supplier.discount.orderWithoutTax,
            detailing: detailing.map(item => item.id),
            supplierId: req.supplier.externalId,
            calcOrderAgain: { data: calcOrderAgain.data },
            orderDocument: resultFile.data.url
        };
        await Promise.all([
            (0, confirmRepository_1.addOrder)(order),
            (0, confirmRepository_1.addDetailing)(detailing.map(({ name, orderUnit, quotationUnit, ...rest }) => rest)),
            airtableHandler(order, detailing, yourNumber, orderText)
        ]);
        await (0, cartService_1.deleteCartByUser)({
            token: req.token,
            selectedRestaurant: []
        });
        return {
            restName: req.restaurant.restaurant.name,
            address: `${req.restaurant.restaurant.addressInfos[0].localType} ${req.restaurant.restaurant.addressInfos[0].address}, ${req.restaurant.restaurant.addressInfos[0].localNumber} - ${req.restaurant.restaurant.addressInfos[0].complement}, ${req.restaurant.restaurant.addressInfos[0].neighborhood}, ${req.restaurant.restaurant.addressInfos[0].city}`,
            maxHour: req.restaurant.restaurant.addressInfos[0].finalDeliveryTime.substring(11, 16),
            minHour: req.restaurant.restaurant.addressInfos[0].initialDeliveryTime.substring(11, 16),
            deliveryDateFormated: deliveryDate.toFormat('dd/MM/yyyy'),
            paymentWay: req.restaurant.restaurant.paymentWay
        };
    }
    catch (err) {
        console.log(err);
    }
};
exports.confirmOrder = confirmOrder;
const confirmOrderPremium = async (req) => {
    try {
        const id = (0, uuid_1.v4)();
        const today = luxon_1.DateTime.now().setZone('America/Sao_Paulo');
        const decoded = (0, jsonwebtoken_1.decode)(req.token);
        const cart = await (0, cartRepository_1.listByUser)({ restaurantId: decoded.id });
        const items = await (0, productService_1.listProduct)();
        if (cart == null || items == null)
            throw Error('Empty cart/items', { cause: 'visibleError' });
        const orderText = `🌱 *Pedido Conéctar* 🌱
---------------------------------------

${cart?.map(cart => `*${String(cart.amount).replace('.', ',')}x ${(items.data.find(((i) => i.id === cart.productId))).name}* cód. ${(items.data.find(((i) => i.id === cart.productId))).sku}${(cart.obs === '') ? '' : `\nObs.: ${cart.obs}`}`).join(', \n')}

---------------------------------------

*${req.selectedRestaurant.name}*
${req.selectedRestaurant.addressInfos[0].responsibleReceivingName ?? ''} - ${req.selectedRestaurant.responsibleReceivingPhoneNumber ?? ''}

${req.selectedRestaurant.addressInfos[0].address}, ${req.selectedRestaurant.addressInfos[0].localNumber} ${req.selectedRestaurant.addressInfos[0].complement}
${req.selectedRestaurant.addressInfos[0].neighborhood}, ${req.selectedRestaurant.addressInfos[0].city}
${req.selectedRestaurant.addressInfos[0].zipCode}

Pedido gerado às ${today.toFormat('HH:mm')} no dia ${today.toFormat('dd/MM')}
    `;
        await createOrderTextAirtable({
            'Data Pedido': today.toISODate() ?? '',
            'ID Cliente': req.selectedRestaurant.externalId ?? '',
            'Texto Pedido': orderText,
            App: true
        });
        await (0, confirmRepository_1.confirmPremium)({
            cart: JSON.stringify(cart),
            Date: new Date(today.toString().substring(0, 10)),
            id,
            orderText,
            restaurantId: decoded.id
        });
        await (0, cartService_1.deleteCartByUser)({
            token: req.token,
            selectedRestaurant: []
        });
        console.log();
    }
    catch (err) {
        console.log(err);
    }
};
exports.confirmOrderPremium = confirmOrderPremium;
