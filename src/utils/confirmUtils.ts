import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import JsBarcode from 'jsbarcode'
import { DateTime } from 'luxon'
import { type BoletoInter } from '../service/interService'
import { type DadoBoleto } from '../service/itauService'
import { type confirmOrderRequest } from '../types/confirmTypes'
import QRCode from 'qrcode'

export const getPaymentDate = (paymentWay: string): string => {
  const today = DateTime.now().setZone('America/Sao_Paulo')
  const deliveryDay = today.plus({ days: 1 })

  const calculateNextWeekday = (date: DateTime, day: number): DateTime => {
    return date.plus({ days: (day + (7 - date.weekday)) % 7 })
  }

  const calculateNextBimonthly = (date: DateTime, day1: number, day2: number): DateTime => {
    const day = date.day
    if (day < day1) {
      return date.set({ day: day1 })
    } else if (day < day2) {
      return date.set({ day: day2 })
    } else {
      return date.plus({ months: 1 }).set({ day: day1 })
    }
  }

  const calculateNextMonthly = (date: DateTime, day: number): DateTime => {
    const nextDate = date.set({ day }).plus({ months: date.day >= day ? 1 : 0 })
    return nextDate.day === day ? nextDate : nextDate.endOf('month')
  }

  const paymentDescriptions: Record<string, string | null> = {
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
  }

  return paymentDescriptions[paymentWay] ?? ''
}

export const formatDataToBolecode = async (data: confirmOrderRequest, yourNumber: string, ourNumber: string, orderId: string, deliveryDate: DateTime): Promise<BoletoInter | DadoBoleto> => {
  const bankClient = process.env.BANK_CLIENT ?? 'INTER'
  if (bankClient === 'ITAU') {
    const itauData = {
      tipo_boleto: 'a vista',
      texto_seu_numero: yourNumber,
      codigo_carteira: '109',
      valor_total_titulo: data.supplier.discount.orderValueFinish.toFixed(2).replace('.', '').padStart(12, '0'),
      codigo_especie: '01',
      data_emissao: DateTime.now().setZone('America/Sao_Paulo').toISODate() ?? '',
      valor_abatimento: '000000000000',
      pagador: {
        pessoa: {
          nome_pessoa: data.restaurant.restaurant.legalName,
          tipo_pessoa: {
            codigo_tipo_pessoa: data.restaurant.restaurant.companyRegistrationNumber > 11 ? 'J' : 'F',
            numero_cadastro_nacional_pessoa_juridica: undefined as string | undefined,
            numero_cadastro_pessoa_fisica: undefined as string | undefined
          }
        },
        endereco: {
          nome_logradouro: `${data.restaurant.restaurant.addressInfos[0].localType} ${data.restaurant.restaurant.addressInfos[0].address}`,
          nome_bairro: data.restaurant.restaurant.addressInfos[0].neighborhood,
          nome_cidade: data.restaurant.restaurant.addressInfos[0].city,
          sigla_UF: 'RJ',
          numero_CEP: data.restaurant.restaurant.addressInfos[0].zipCode.replace('-', '')
        }
      },
      dados_individuais_boleto: [
        {
          numero_nosso_numero: ourNumber,
          data_vencimento: getPaymentDate(data.restaurant.restaurant.paymentWay as string),
          texto_uso_beneficiario: '000001',
          valor_titulo: data.supplier.discount.orderValueFinish.toFixed(2).replace('.', '').padStart(12, '0'),
          data_limite_pagamento: DateTime.now()
            .set({ month: DateTime.now().get('month') + 2 })
            .toISODate()
        }
      ],
      juros: {
        data_juros:
          DateTime.fromISO(getPaymentDate(data.restaurant.restaurant.paymentWay as string))
            .set({ day: DateTime.fromISO(getPaymentDate(data.restaurant.restaurant.paymentWay as string)).get('day') + 1 })
            .toISODate() ?? '',
        codigo_tipo_juros: '93',
        valor_juros: ((data.supplier.discount.orderValueFinish * 0.01) / 30).toFixed(2).replace('.', '').padStart(17, '0')
      },
      multa: {
        codigo_tipo_multa: '02',
        percentual_multa: '000000200000',
        data_multa:
          DateTime.fromISO(getPaymentDate(data.restaurant.restaurant.paymentWay as string))
            .set({ day: DateTime.fromISO(getPaymentDate(data.restaurant.restaurant.paymentWay as string)).get('day') + 1 })
            .toISODate() ?? ''
      },
      lista_mensagem_cobranca: [
        {
          mensagem: `${orderId} - Pedido entregue em ${deliveryDate.toFormat('dd/MM/yyyy')}`
        }
      ]
    }
    if (itauData.pagador.pessoa.tipo_pessoa.codigo_tipo_pessoa === 'J') {
      itauData.pagador.pessoa.tipo_pessoa.numero_cadastro_nacional_pessoa_juridica = data.restaurant.restaurant.companyRegistrationNumber
    } else {
      itauData.pagador.pessoa.tipo_pessoa.numero_cadastro_pessoa_fisica = data.restaurant.restaurant.companyRegistrationNumber
    }
    return itauData
  }
  const interData: BoletoInter = {
    seuNumero: yourNumber,
    valorNominal: data.supplier.discount.orderValueFinish,
    dataVencimento: getPaymentDate(data.restaurant.restaurant.paymentWay as string),
    numDiasAgenda: 60,
    pagador: {
      cpfCnpj: data.restaurant.restaurant.companyRegistrationNumber,
      tipoPessoa: data.restaurant.restaurant.companyRegistrationNumber > 11 ? 'JURIDICA' : 'FISICA',
      nome: data.restaurant.restaurant.legalName,
      endereco: `${data.restaurant.restaurant.addressInfos[0].localType} ${data.restaurant.restaurant.addressInfos[0].address}, ${data.restaurant.restaurant.addressInfos[0].localNumber}`,
      cidade: data.restaurant.restaurant.addressInfos[0].city,
      uf: 'RJ',
      cep: data.restaurant.restaurant.addressInfos[0].zipCode.replace('-', '')
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
      linha1: `Pedido Conéctar ${orderId} entregue em ${deliveryDate.toFormat('dd/MM/yyyy')}`
    },
    formasRecebimento: ['BOLETO', 'PIX']
  }
  return interData
}

export function generateBarcode(barcodeValue: string): string {
  const canvas = createCanvas(0, 0)
  JsBarcode(canvas, barcodeValue, {
    format: 'ITF',
    width: 2,
    height: 100,
    displayValue: false
  })

  return canvas.toDataURL('image/png')
}

export function convertBase64ToPng(base64String: string, filePath: string): void {
  const base64Data = base64String.replace(/^data:image\/png;base64,/, '')

  const buffer = Buffer.from(base64Data, 'base64')

  writeFileSync(filePath, buffer)
}

export async function generateQRCode(text: string, filePath: string): Promise<void> {
  try {
    const qrImage = await QRCode.toBuffer(text, { type: 'png', width: 100 })
    writeFileSync(filePath, qrImage)
  } catch (err) {
    console.error('Erro ao gerar o QR Code:', err)
  }
}
