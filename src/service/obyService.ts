import { logRegister } from '../utils/logUtils'

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

export const generateBilling = async (req: Cobranca): Promise<any> => {
  try {
    const request = req
    const orderId = req.orderId.split('_')
    request.valorMulta = request.valorCobranca * 0.02
    request.valorJurosDiarios = request.valorCobranca * 0.033333
    request.nossoNumero = `10${orderId[0]}${orderId[1]}${orderId.length > 2 ? orderId[2].replace('P', '') : '1'}1`
    request.nossoNumero = ''
    await fetch('https://api.integracao.obypagamentos.com.br/api/Cobrancas/QrCodeComVencimento', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(request)
    })
  } catch (err) {
    if ((err as any).cause !== 'visibleError') await logRegister(err)
    throw Error((err as Error).message)
  }
}
