import { post } from 'axios'
import https from 'https'
import 'dotenv/config'
import fs from 'fs/promises'

interface Beneficiario {
  id_beneficiario: string
}

interface TipoPessoa {
  codigo_tipo_pessoa: string
  numero_cadastro_pessoa_fisica?: string
  numero_cadastro_pessoa_juridica?: string
}

interface Pessoa {
  nome_pessoa: string
  tipo_pessoa: TipoPessoa
}

interface Endereco {
  nome_logradouro: string
  nome_bairro: string
  nome_cidade: string
  sigla_UF: string
  numero_CEP: string
}

interface Pagador {
  pessoa: Pessoa
  endereco: Endereco
}

interface DadosIndividuaisBoleto {
  numero_nosso_numero: string
  data_vencimento: string
  texto_uso_beneficiario: string
  valor_titulo: string
  data_limite_pagamento: string
}

interface Juros {
  data_juros: string
  codigo_tipo_juros: string
  valor_juros: string
}

interface Multa {
  codigo_tipo_multa: string
  percentual_multa: string
  data_multa: string
}

interface MensagemCobranca {
  mensagem: string
}

export interface DadoBoleto {
  tipo_boleto: string
  texto_seu_numero: string
  codigo_carteira: string
  valor_total_titulo: string
  codigo_especie: string
  data_emissao: string
  valor_abatimento: string
  pagador: Pagador
  dados_individuais_boleto: DadosIndividuaisBoleto[]
  juros: Juros
  multa: Multa
  lista_mensagem_cobranca: MensagemCobranca[]
}

interface DadosQrcode {
  chave: string
}

interface Boleto {
  etapa_processo_boleto: string
  beneficiario: Beneficiario
  dado_boleto: DadoBoleto
  dados_qrcode: DadosQrcode
}

interface TokenData {
  accessToken: string
  expiresAt: number
}

const TOKEN_FILE = 'token.json'

const httpsAgent = new https.Agent({
  cert: process.env.ITAU_CRT ?? '',
  key: process.env.ITAU_KEY ?? ''
})

const saveToken = async (tokenData: TokenData): Promise<void> => {
  await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData))
}

const loadToken = async (): Promise<TokenData | null> => {
  try {
    const data = await fs.readFile(TOKEN_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return null
  }
}

const generateNewToken = async (): Promise<TokenData> => {
  const data = new URLSearchParams()
  data.append('grant_type', 'client_credentials')
  data.append('client_id', process.env.ITAU_CLIENT_ID ?? '')
  data.append('client_secret', process.env.ITAU_SECRET ?? '')

  const response = await post('https://sts.itau.com.br/api/oauth/token', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-itau-flowID': 1,
      'x-itau-correlationID': 2
    },
    httpsAgent
  })

  const expiresIn = response.data.expires_in
  const accessToken = response.data.access_token
  const expiresAt = Date.now() + expiresIn * 1000

  const tokenData: TokenData = {
    accessToken,
    expiresAt
  }

  await saveToken(tokenData)

  return tokenData
}

export const getToken = async (): Promise<string> => {
  const tokenData = await loadToken()

  if ((tokenData != null) && tokenData.expiresAt > Date.now()) {
    return tokenData.accessToken
  }

  const newTokenData = await generateNewToken()
  return newTokenData.accessToken
}

export const generateBolecode = async (req: DadoBoleto): Promise<any> => {
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
    } satisfies Boleto)

    const response = await post('https://secure.api.itau/pix_recebimentos_conciliacoes/v2/boletos_pix', data, {
      headers: {
        'Content-Type': 'application/json',
        'x-itau-apikey': process.env.ITAU_CLIENT_ID ?? '',
        'x-itau-correlationID': 2,
        'x-itau-flowID': 1,
        Authorization: `Bearer ${await getToken()}`
      },
      httpsAgent
    })

    return response.data
  } catch (err) {
    console.error(err)
  }
}

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
