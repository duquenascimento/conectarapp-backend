"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBolecode = exports.getToken = void 0;
const axios_1 = require("axios");
const https_1 = __importDefault(require("https"));
require("dotenv/config");
const promises_1 = __importDefault(require("fs/promises"));
const TOKEN_FILE = 'token.json';
const httpsAgent = new https_1.default.Agent({
    cert: process.env.ITAU_CRT ?? '',
    key: process.env.ITAU_KEY ?? ''
});
const saveToken = async (tokenData) => {
    await promises_1.default.writeFile(TOKEN_FILE, JSON.stringify(tokenData));
};
const loadToken = async () => {
    try {
        const data = await promises_1.default.readFile(TOKEN_FILE, 'utf-8');
        return JSON.parse(data);
    }
    catch (error) {
        return null;
    }
};
const generateNewToken = async () => {
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');
    data.append('client_id', process.env.ITAU_CLIENT_ID ?? '');
    data.append('client_secret', process.env.ITAU_SECRET ?? '');
    const response = await (0, axios_1.post)('https://sts.itau.com.br/api/oauth/token', data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-itau-flowID': 1,
            'x-itau-correlationID': 2
        },
        httpsAgent
    });
    const expiresIn = response.data.expires_in;
    const accessToken = response.data.access_token;
    const expiresAt = Date.now() + expiresIn * 1000;
    const tokenData = {
        accessToken,
        expiresAt
    };
    await saveToken(tokenData);
    return tokenData;
};
const getToken = async () => {
    const tokenData = await loadToken();
    if ((tokenData != null) && tokenData.expiresAt > Date.now()) {
        return tokenData.accessToken;
    }
    const newTokenData = await generateNewToken();
    return newTokenData.accessToken;
};
exports.getToken = getToken;
const generateBolecode = async (req) => {
    try {
        const data = JSON.stringify({
            beneficiario: {
                id_beneficiario: `${process.env.ITAU_AGENCY_ID ?? ''}00${process.env.ITAU_ACCOUNT_ID ?? ''}`
            },
            dado_boleto: req,
            dados_qrcode: {
                chave: process.env.ITAU_PIX_KEY ?? ''
            },
            etapa_processo_boleto: process.env.ITAU_ETAPA ?? ''
        });
        const response = await (0, axios_1.post)('https://secure.api.itau/pix_recebimentos_conciliacoes/v2/boletos_pix', data, {
            headers: {
                'Content-Type': 'application/json',
                'x-itau-apikey': process.env.ITAU_CLIENT_ID ?? '',
                'x-itau-correlationID': 2,
                'x-itau-flowID': 1,
                Authorization: `Bearer ${await (0, exports.getToken)()}`
            },
            httpsAgent
        });
        return response.data;
    }
    catch (err) {
        console.error(err);
    }
};
exports.generateBolecode = generateBolecode;
// void generateBolecode({
//   tipo_boleto: 'a vista',
//   texto_seu_numero: '000035',
//   codigo_carteira: '109',
//   valor_total_titulo: '000000010000',
//   codigo_especie: '01',
//   data_emissao: '2024-10-29',
//   valor_abatimento: '000000000000',
//   pagador: {
//     pessoa: {
//       nome_pessoa: 'Daniel Guedes Malafaia',
//       tipo_pessoa: {
//         codigo_tipo_pessoa: 'F',
//         numero_cadastro_pessoa_fisica: '16700952743'
//       }
//     },
//     endereco: {
//       nome_logradouro: 'Alameda da Lagoa, 160',
//       nome_bairro: 'Granja dos Cavaleiros',
//       nome_cidade: 'Macaé',
//       sigla_UF: 'RJ',
//       numero_CEP: '27930000'
//     }
//   },
//   dados_individuais_boleto: [
//     {
//       numero_nosso_numero: '00000035',
//       data_vencimento: '2024-10-30',
//       texto_uso_beneficiario: '000001',
//       valor_titulo: '000000000100',
//       data_limite_pagamento: '2024-11-15'
//     }
//   ],
//   juros: {
//     data_juros: '2024-10-31',
//     codigo_tipo_juros: '93',
//     valor_juros: '00000000000000001'
//   },
//   multa: {
//     codigo_tipo_multa: '02',
//     percentual_multa: '000000200000',
//     data_multa: '2024-10-31'
//   },
//   lista_mensagem_cobranca: [
//     {
//       mensagem: 'Boleto Conéctar'
//     }
//   ]
// })
