import { Agent } from 'https'
import { get, post, put } from 'axios'
import 'dotenv/config'
import fs from 'fs/promises'
import { resolvePendingRequest } from './promiseService'
import { logRegister } from '../utils/logUtils'

interface TokenData {
  'accessToken': string
  'expiresAt': number
}

interface PagadorInter {
  email?: string
  ddd?: string
  telefone?: string
  numero?: string
  complemento?: string
  cpfCnpj: string
  tipoPessoa: 'FISICA' | 'JURIDICA'
  nome: string
  endereco: string
  bairro?: string
  cidade: string
  uf: string
  cep: string
}

interface DescontoInter {
  taxa: number
  codigo: string
  quantidadeDias: number
}

interface MultaInter {
  taxa: number
  codigo: string
}

interface MoraInter {
  taxa: number
  codigo: string
}

interface MensagemInter {
  linha1?: string
  linha2?: string
  linha3?: string
  linha4?: string
  linha5?: string
}

interface BeneficiarioFinalInter {
  cpfCnpj: string
  tipoPessoa: 'FISICA' | 'JURIDICA'
  nome: string
  endereco: string
  bairro: string
  cidade: string
  uf: string
  cep: string
}

export interface BoletoInter {
  seuNumero: string
  valorNominal: number
  dataVencimento: string
  numDiasAgenda: number
  pagador: PagadorInter
  desconto?: DescontoInter
  multa: MultaInter
  mora: MoraInter
  mensagem: MensagemInter
  beneficiarioFinal?: BeneficiarioFinalInter
  formasRecebimento: ['BOLETO'] | ['BOLETO', 'PIX']
}

interface Calendario {
  expiracao: number
}

interface Devedor {
  cnpj?: string
  cpf?: string
  nome?: string
}

interface Valor {
  original: string
  modalidadeAlteracao: number
}

interface MultaPixFineAndInterest {
  modalidade: 1 | 2
  valorPerc: string
}

interface JurosPixFineAndInterest {
  modalidade: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
  valorPerc: string
}

interface ValorPixFineAndInterest {
  original: string
  multa: MultaPixFineAndInterest
  juros: JurosPixFineAndInterest
}

interface CalendarioPixFineAndInterest {
  dataDeVencimento: string
  validadeAposVencimento: number
}

interface InfoAdicional {
  nome: string
  valor: string
}

export interface PixFineAndInterestResponse {
  calendario: {
    criacao: string
    dataDeVencimento: string
    validadeAposVencimento: number
  };
  txid: string
  revisao: number
  loc: {
    id: number
    location: string
    tipoCob: string
  }
  status: string
  devedor: {
    cnpj?: string
    cpf?: string
    nome: string
  }
  recebedor: {
    logradouro: string
    cidade: string
    uf: string
    cep: string
    cnpj: string
    nome: string
  }
  valor: {
    original: string
  }
  chave: string
  solicitacaoPagador: string
  pixCopiaECola: string
}


interface PixRequest {
  calendario: CalendarioPixFineAndInterest
  devedor?: Devedor
  valor: ValorPixFineAndInterest
  chave?: string
  solicitacaoPagador: string
  infoAdicionais: InfoAdicional[]
}

interface InterInitialBolecodeResponse {
  codigoSolicitacao: string
}

export interface WebhookBolecodeResponse {
  codigoSolicitacao: string
  seuNumero: string
  situacao: string
  dataHoraSituacao: string
  valorTotalRecebido: string
  origemRecebimento: string
  nossoNumero: string
  codigoBarras: string
  linhaDigitavel: string
  txid: string
  pixCopiaECola: string
}

const httpsAgent = new Agent({
  cert: process.env.INTER_CERT ?? '',
  key: process.env.INTER_KEY ?? ''
})

const TOKEN_FILE = 'token.json'

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

const generateNewToken = async (): Promise<TokenData | undefined> => {
  try {
    const data = new URLSearchParams()
    data.append('client_id', process.env.INTER_CLIENT_ID ?? '')
    data.append('client_secret', process.env.INTER_CLIENT_SECRET ?? '')
    data.append('scope', process.env.INTER_SCOPE ?? '')
    data.append('grant_type', process.env.INTER_GRANT_TYPE ?? '')

    const options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      httpsAgent
    }

    const response = await post(
      `${process.env.INTER_HOST}/${process.env.INTER_PATH_AUTH}`,
      data,
      options
    )

    const expiresIn = response.data.expires_in
    const accessToken = response.data.access_token
    const expiresAt = Date.now() + expiresIn * 1000

    const tokenData: TokenData = {
      accessToken,
      expiresAt
    }

    await saveToken(tokenData)

    return tokenData
  } catch (err) {
    console.error(err)
    return undefined
  }
}

const getToken = async (): Promise<string | undefined> => {
  const tokenData = await loadToken()

  if ((tokenData != null) && tokenData.expiresAt > Date.now()) {
    return tokenData.accessToken
  }

  const newTokenData = await generateNewToken()

  return newTokenData?.accessToken
}

const generateTxId = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const length = Math.floor(Math.random() * (35 - 26 + 1)) + 26
  let txId = ''
  for (let i = 0; i < length; i++) {
    txId += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return txId.toUpperCase()
}

export const generateBolecode = async (req: BoletoInter): Promise<InterInitialBolecodeResponse | undefined> => {
  try {
    const data = JSON.stringify(req)

    const response = await post(`${process.env.INTER_HOST}/${process.env.INTER_PATH_GENERATE_BOLECODE}`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getToken()}`
      },
      httpsAgent
    })
    return response.data
  } catch (err) {
    console.error(err)
  }
}

export const generatePix = async (req: PixRequest): Promise<any> => {
  try {
    req.chave = process.env.INTER_PIX_KEY ?? ''
    const data = JSON.stringify(req)

    const responseFineAndInterestPix = await put(`${process.env.INTER_HOST}/${process.env.INTER_PATH_GENERATE_FINE_AND_INTEREST_PIX}/${generateTxId()}`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getToken()}`
      },
      httpsAgent
    })
    return responseFineAndInterestPix.data
  } catch (err: any) {
    console.error(err.response.data)
  }
}

const createOrEditWebhook = async () => {
  const data = JSON.stringify({
    "webhookUrl": "https://api.conectarhortifruti.com.br/inter/webhook"
  })

  const options = {
    httpsAgent,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getToken()}`
    },
  }

  const response = await put(`${process.env.INTER_HOST}/${process.env.INTER_PATH_WEBHOOK}`, data, options)
}

const getWebhooks = async () => {
  const options = {
    httpsAgent,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getToken()}`
    }
  }

  const response = await get(`${process.env.INTER_HOST}/${process.env.INTER_PATH_WEBHOOK}`, options)
}

export const webhookInterHandler = async (req: WebhookBolecodeResponse[]) => {
  const { codigoSolicitacao, ...bolecodeData } = req[0]
  if (codigoSolicitacao) {
    resolvePendingRequest(codigoSolicitacao, bolecodeData)
  }
  return
}

const dataTestBolecode = {
  seuNumero: '00120',
  valorNominal: 15,
  dataVencimento: '2024-12-25',
  numDiasAgenda: 60,
  pagador: {
    cpfCnpj: '16700952743',
    tipoPessoa: 'FISICA',
    nome: 'Daniel Guedes Malafaia',
    endereco: 'Alameda da Lagoa, 160',
    cidade: 'Macaé',
    uf: 'RJ',
    cep: '27930000'
  },
  multa: {
    taxa: 2,
    codigo: 'PERCENTUAL'
  },
  mora: {
    taxa: 1,
    codigo: 'TAXAMENSAL'
  },
  mensagem: {
    linha1: 'Teste'
  },
  formasRecebimento: ['BOLETO', 'PIX']
} satisfies BoletoInter

const dataTestPix = {
  calendario: {
    dataDeVencimento: '2024-12-27',
    validadeAposVencimento: 60
  },
  devedor: {
    cpf: '16700952743',
    nome: 'Daniel Guedes Malafaia'
  },
  valor: {
    juros: {
      modalidade: 3,
      valorPerc: '2.00'
    },
    multa: {
      modalidade: 2,
      valorPerc: '1.00'
    },
    original: (25).toFixed(2)
  },
  chave: process.env.INTER_PIX_KEY ?? '',
  solicitacaoPagador: 'Pedido ABCDEFG',
  infoAdicionais: []
} satisfies PixRequest

// void generateBolecode(data)
// void generatePix(dataTestPix)
// void createOrEditWebhook()
// void getWebhooks()
