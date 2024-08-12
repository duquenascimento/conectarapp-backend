import { logRegister } from '../utils/logUtils'
import { DateTime } from 'luxon'

interface ClienteContato {
  email: string
  telefoneFixo: string
  telefoneCelular: string
}

interface Cliente {
  nome: string
  cpfCnpj: string
  logradouro?: string | null
  bairro?: string | null
  cidade?: string | null
  uf?: string | null
  cep?: string | null
  complemento?: string | null
  numero?: string | null
  pais?: string | null
  contato?: ClienteContato | null
}

interface Cobranca {
  valorCobranca: number
  nossoNumero?: string
  instrucaoBoletoQrCode?: string
  valorJurosDiarios?: number | null
  valorMulta?: number | null
  valorDesconto?: number | null
  dataVencimento?: Date | null
  cliente: Cliente
  orderId: string
}

export const generateBilling = async (req: Cobranca, type: string, discount: boolean, renegotiation: boolean): Promise<any> => {
  try {
    const request = req
    const orderId = req.orderId.split('_')
    const billingType = type === 'Diário' ? '1' : type === 'Acumulado' ? '2' : '3'
    const date = DateTime.fromJSDate(request.dataVencimento ?? new Date()).toFormat('ddMMyy')
    request.valorMulta = request.valorCobranca * 0.02
    request.valorJurosDiarios = request.valorCobranca * 0.033333
    request.nossoNumero = `${billingType}${billingType === '1' ? `${discount ? '1' : '0'}${orderId[0]}` : date}${orderId[1].replace('C', '').padStart(4, '0')}${billingType === '1' ? orderId.length > 2 ? orderId[2].replace('P', '') : '1' : renegotiation ? '0' : '9'}`
    request.nossoNumero = ''
    const resultPromise = await fetch('https://api.integracao.obypagamentos.com.br/api/Cobrancas/QrCodeComVencimento', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(request)
    })
    const result = await resultPromise.json()
    return result
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
