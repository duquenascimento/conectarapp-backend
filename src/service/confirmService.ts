import { addDetailing, addOrder, checkOrder, confirmPremium, updateOrder, type Detailing, type Order } from '../repository/confirmRepository'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { suppliersCompletePrices, suppliersPrices } from './priceService'
import 'dotenv/config'
import { deleteCartByUser } from './cartService'
import { listByUser } from '../repository/cartRepository'
import { decode } from 'jsonwebtoken'
import { listProduct } from './productService'
import { configure, base, type FieldSet, type Record as AirtableRecord, type Records } from 'airtable'
import { type DadoBoleto, generateBolecode } from './itauService'
import { writeFileSync } from 'fs'
import QRCode from 'qrcode'
import { createCanvas } from 'canvas'
import JsBarcode from 'jsbarcode'
import { type BoletoInter, generateBolecode as generateBolecodeInter, generatePix, type PixFineAndInterestResponse, type WebhookBolecodeResponse } from './interService'
import { saveBolecode, saveTransaction, updateBolecode, updateTransaction } from '../repository/financeRepository'
import { Decimal } from '@prisma/client/runtime/library'
import { logRegister } from '../utils/logUtils'
import { addPendingRequest } from './promiseService'
import { bolecodeAndPixErrorMessage, receiptErrorMessage } from '../utils/slackUtils'
import { airtableHandler } from './airtableConfirmService'
import { createOrderTextAirtable } from '../repository/airtableOrderTextService'
import { type agendamentoPedido } from '../types/confirmTypes'
import { generateOrderId } from '../utils/generateOrderId'

export interface Supplier {
  name: string
  externalId: string
  missingItens: number
  minimumOrder: number
  hour: string
  discount: Discount
}

export interface Discount {
  orderValue: number
  discount: number
  orderWithoutTax: number
  orderWithTax: number
  tax: number
  missingItens: number
  orderValueFinish: number
  product: Product[]
}

export interface Product {
  price: number
  priceWithoutTax: number
  name: string
  sku: string
  quant: number
  orderQuant: number
  obs: string
  priceUnique: number
  priceUniqueWithTaxAndDiscount: number
  image: string[]
  orderUnit: string
  quotationUnit: string
}

export interface confirmOrderRequest {
  token: string
  supplier: Supplier
  restaurant: any
}

export interface confirmOrderPremiumRequest {
  [x: string]: any
  token: string
  selectedRestaurant: any
}

interface Pedido {
  id_pedido: string
  cliente_com_boleto: string
  data_entrega: string
  horario_minimo: string
  horario_maximo: string
  id_cliente: Cliente[]
  nome: string
  cnpj_fornecedor: string
  detalhamento_pedido: DetalhamentoPedido[]
  total_sem_descontos: string
  total_em_descontos: string
  total_conectar: string
  restaurante: string
  data_vencimento: string
  razao_social: string
  cnpj: string
  data_pedido: string
  numero_linha_digitavel: string
  url_img_pix: string
  id_beneficiario: string
  data_emissao: string
  identificador_calculado: string
  numero_nosso_numero: string
  codigo_carteira: string
  nome_logradouro: string
  numero_cep: string
  nome_bairro: string
  nome_cidade: string
  sigla_UF: string
  codigo_barras: string
  id_distribuidor: string
  nome_cliente: string
}

interface Cliente {
  bairro: string
  cidade: string
  rua: string
  numero_e_complemento: string
  cep: string
  nome: string
  razao_social: string
  cnpj: string
  inscricao_estadual: string
  resp_recebimento: string
  tel_resp_recebimento: string
  informacao_de_entrega: string
}

interface DetalhamentoPedido {
  exibir_para_cliente: string
  qtd_final_cliente: string
  unidade_cotacao: string
  custo_unidade_conectar: string
  preco_final_conectar: string
}

configure({
  apiKey: process.env.AIRTABLE_TOKEN ?? ''
})

const getPaymentDate = (paymentWay: string): string => {
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

const formatDataToBolecode = async (data: confirmOrderRequest, yourNumber: string, ourNumber: string, orderId: string, deliveryDate: DateTime): Promise<BoletoInter | DadoBoleto> => {
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

function generateBarcode (barcodeValue: string): string {
  const canvas = createCanvas(0, 0)
  JsBarcode(canvas, barcodeValue, {
    format: 'ITF',
    width: 2,
    height: 100,
    displayValue: false
  })

  return canvas.toDataURL('image/png')
}

function convertBase64ToPng (base64String: string, filePath: string): void {
  const base64Data = base64String.replace(/^data:image\/png;base64,/, '')

  const buffer = Buffer.from(base64Data, 'base64')

  writeFileSync(filePath, buffer)
}

async function generateQRCode (text: string, filePath: string): Promise<void> {
  try {
    const qrImage = await QRCode.toBuffer(text, { type: 'png', width: 100 })
    writeFileSync(filePath, qrImage)
  } catch (err) {
    console.error('Erro ao gerar o QR Code:', err)
  }
}

export const confirmOrder = async (req: confirmOrderRequest): Promise<any> => {
  const diferencaEmMilissegundos = Math.abs(DateTime.fromISO('1900-01-01', { zone: 'America/Sao_Paulo' }).toMillis() - DateTime.now().setZone('America/Sao_Paulo').toMillis())
  const milissegundosPorDia = 1000 * 60 * 60 * 24
  const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / milissegundosPorDia) + 2

  const today = DateTime.now().setZone('America/Sao_Paulo')
  const deliveryDate = today.plus({ days: 1 })

  let orderId = `${diferencaEmDias}_${req.restaurant.restaurant.externalId}`

  const checkOrderId = await checkOrder(orderId)
  if (checkOrderId !== 0) {
    orderId = `${orderId}_P${checkOrderId + 1}`
  }

  type PaymentDescriptions = Record<string, string>

  const getPaymentDescription = (paymentWay: string): string => {
    const paymentDescriptions: PaymentDescriptions = {
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
    }

    return paymentDescriptions[paymentWay] ?? ''
  }

  const calcOrderAgain = await suppliersPrices({ token: req.token, selectedRestaurant: req.restaurant.restaurant })
  const allSuppliers = await suppliersCompletePrices({ token: req.token, selectedRestaurant: req.restaurant.restaurant })

  const ourNumber = (
    Date.now().toString() +
    Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
  ).slice(-8)
  const yourNumber = (
    Date.now().toString() +
    Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
  ).slice(-10)

  const orderText = `🌱 *Pedido Conéctar* 🌱
---------------------------------------

${req.supplier.discount.product?.map((cart) => `*${String(cart.quant).replace('.', ',')}x ${cart.name}* cód. ${cart.sku}${cart.obs === '' ? '' : `\nObs.: ${cart.obs}`}`).join(', \n')}

---------------------------------------

*${req.restaurant.restaurant.name}*
${req.restaurant.restaurant.addressInfos[0].responsibleReceivingName ?? ''} - ${req.restaurant.restaurant.addressInfos[0].responsibleReceivingPhoneNumber ?? ''}

${req.restaurant.restaurant.addressInfos[0].address}, ${req.restaurant.restaurant.addressInfos[0].localNumber} ${req.restaurant.restaurant.addressInfos[0].complement}
${req.restaurant.restaurant.addressInfos[0].neighborhood}, ${req.restaurant.restaurant.addressInfos[0].city}
${req.restaurant.restaurant.addressInfos[0].zipCode} - ${req.restaurant.restaurant.addressInfos[0].deliveryInformation}


Pedido gerado às ${today.toFormat('HH:mm')} no dia ${today.toFormat('dd/MM')}

Entrega entre ${req.restaurant.restaurant.addressInfos[0].initialDeliveryTime.substring(11, 16)} e ${req.restaurant.restaurant.addressInfos[0].finalDeliveryTime.substring(11, 16)} horas

    `
  const detailing: Detailing[] = []

  req.supplier.discount.product.forEach((item) => {
    if (item.sku == null) {
      console.log(item)
    }

    const suppliersDetailing = allSuppliers.data
      .flatMap((s: any) => {
        const product = s.supplier.discount.product.find((p: any) => p.sku === item.sku)
        if (product != null) {
          return [
            {
              externalId: s.supplier.externalId,
              discount: s.supplier.discount.discount,
              priceUnique: product.priceUnique
            }
          ]
        }
        return []
      })
      .filter(Boolean)

    detailing.push({
      conectarFinalPrice: item.price,
      conectarPricePerUnid: item.priceUniqueWithTaxAndDiscount,
      id: `${orderId}_${item.sku}`,
      orderId,
      restaurantId: uuidv4(),
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
    })
  })

  let bolecodeResponse = null
  let digitableBarCode = null

  const paymentWayString = getPaymentDescription(req.restaurant.restaurant.paymentWay as string)

  const finalDeliveryTime = today.toJSDate()
  finalDeliveryTime.setHours(finalDeliveryTime.getHours() - 3)

  const initialDeliveryTime = today.toJSDate()
  initialDeliveryTime.setHours(initialDeliveryTime.getHours() - 3)

  const orderHour = today.toJSDate()
  orderHour.setHours(orderHour.getHours() - 3)

  const order: Order = {
    addressId: uuidv4(),
    deliveryDate: new Date(deliveryDate.toString().substring(0, 10)),
    finalDeliveryTime,
    id: orderId,
    initialDeliveryTime,
    orderDate: new Date(today.toString().substring(0, 10)),
    orderHour,
    paymentWay: req.restaurant.restaurant.paymentWay,
    referencePoint: req.restaurant.restaurant.addressInfos[0].deliveryReference,
    restaurantId: req.restaurant.restaurant.externalId,
    status_id: 12,
    tax: req.restaurant.restaurant.tax / 100,
    totalConectar: req.supplier.discount.orderValueFinish,
    totalSupplier: req.supplier.discount.orderWithoutTax,
    detailing: detailing.map((item) => item.id),
    supplierId: req.supplier.externalId,
    calcOrderAgain: { data: calcOrderAgain.data }
  }

  await addOrder(order)

  let barCodeImage = ''
  let pixKey = ''

  if (paymentWayString === 'Diário' || paymentWayString === 'À Vista') {
    const bolecodeData = await formatDataToBolecode(req, yourNumber, ourNumber, orderId, deliveryDate)

    const transactionData = {
      order_id: orderId,
      payment_date: new Date(getPaymentDate(req.restaurant.restaurant.paymentWay as string)),
      status_id: 8,
      payment_ways_id: paymentWayString === 'À Vista' ? 2 : 1,
      value: new Decimal(req.supplier.discount.orderValueFinish),
      transactions_type_id: 4,
      restaurant_id: req.restaurant.restaurant.id
    }

    const transaction = await saveTransaction(transactionData)

    const bolecodeDataFormatted = {
      value: new Decimal(req.supplier.discount.orderValueFinish),
      status_id: 8,
      transactions_id: transaction?.id!,
      public_id: yourNumber,
      bolecode_id: ourNumber
    }

    const bolecode = await saveBolecode(bolecodeDataFormatted)

    try {
      if ((process.env.BANK_CLIENT ?? 'INTER') === 'ITAU') {
        bolecodeResponse = await generateBolecode(bolecodeData as DadoBoleto)
        barCodeImage = generateBarcode(bolecodeResponse.data.dado_boleto.dados_individuais_boleto[0].codigo_barras as string)
        digitableBarCode = bolecodeResponse.data.dado_boleto.dados_individuais_boleto[0].numero_linha_digitavel
        pixKey = bolecodeResponse.data.dados_qrcode.emv
      }
      if ((process.env.BANK_CLIENT ?? 'INTER') === 'INTER') {
        const interData = bolecodeData as BoletoInter
        if (paymentWayString === 'Diário') {
          bolecodeResponse = await generateBolecodeInter(interData)
          if (bolecodeResponse == null) {
            await Promise.all([
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              updateTransaction({ status_id: 11 }, transaction?.id!),
              updateBolecode({ status_id: 11 }, bolecode?.id!),
              bolecodeAndPixErrorMessage({
                externalId: req.restaurant.restaurant.externalId ?? '',
                finalValue: req.supplier.discount.orderValueFinish,
                paymentWay: paymentWayString
              })
            ])
            throw new Error(`error generating bolecode, request used: ${JSON.stringify(interData)}`)
          }

          const SECONDS = Number(process.env.SECONDS_TO_REJECT_BOLECODE_PROMISE ?? 6) * 1000

          const [bolecodeDataResponse] = await Promise.all([
            Promise.race([
              addPendingRequest(bolecodeResponse.codigoSolicitacao),
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  reject(new Error(`Timeout: bolecode not generated in ${SECONDS / 1000}s`))
                }, SECONDS)
              })
            ]).catch(async (error) => {
              await Promise.all([
                updateTransaction({ status_id: 11 }, transaction?.id!),
                updateBolecode({ status_id: 11 }, bolecode?.id!),
                bolecodeAndPixErrorMessage({
                  externalId: req.restaurant.restaurant.externalId ?? '',
                  finalValue: req.supplier.discount.orderValueFinish,
                  paymentWay: paymentWayString
                })
              ])
              throw error
            }),
            updateBolecode({ transaction_gateway_id: bolecodeResponse.codigoSolicitacao }, bolecode?.id!)
          ])

          if (bolecodeDataResponse == null) {
            throw new Error(`error generating bolecode, request used: ${JSON.stringify(interData)}`)
          }

          const { codigoBarras, codigoSolicitacao, linhaDigitavel, pixCopiaECola, txid } = bolecodeDataResponse as WebhookBolecodeResponse

          barCodeImage = generateBarcode(codigoBarras)
          digitableBarCode = linhaDigitavel
          pixKey = pixCopiaECola

          await Promise.all([
            updateTransaction({ status_id: 4 }, transaction?.id!),
            updateBolecode(
              {
                codebar: codigoBarras ?? null,
                digitable_line: linhaDigitavel ?? null,
                pix_code: pixCopiaECola ?? null,
                status_id: 4,
                txId: txid ?? null,
                status_updatedAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate(),
                transaction_gateway_id: codigoSolicitacao
              },
              bolecode?.id!
            )
          ])
        } else {
          const pix = await generatePix({
            calendario: {
              dataDeVencimento: interData.dataVencimento,
              validadeAposVencimento: 60
            },
            devedor: {
              nome: interData.pagador.nome,
              cnpj: interData.pagador.cpfCnpj.length > 11 ? interData.pagador.cpfCnpj : undefined,
              cpf: interData.pagador.cpfCnpj.length <= 11 ? interData.pagador.cpfCnpj : undefined
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
              original: interData.valorNominal.toFixed(2)
            },
            solicitacaoPagador: `Pedido ${orderId} entregue em ${deliveryDate.toFormat('dd/MM/yyyy')}`,
            infoAdicionais: []
          })

          const { pixCopiaECola, txid } = pix as PixFineAndInterestResponse

          pixKey = pixCopiaECola

          await Promise.all([
            updateTransaction({ status_id: 4 }, transaction?.id!),
            updateBolecode(
              {
                pix_code: pixCopiaECola ?? null,
                status_id: 4,
                txId: txid ?? null,
                status_updatedAt: DateTime.now().setZone('America/Sao_Paulo').toJSDate()
              },
              bolecode?.id!
            )
          ])
        }
      }
    } catch (err) {
      await Promise.allSettled([
        updateTransaction({ status_id: 11 }, transaction?.id!),
        updateBolecode({ status_id: 11 }, bolecode?.id!),
        bolecodeAndPixErrorMessage({
          externalId: req.restaurant.restaurant.externalId ?? '',
          finalValue: req.supplier.discount.orderValueFinish,
          paymentWay: paymentWayString
        }),
        logRegister(err)
      ])
    }

    const qrCodePath = `C:/inetpub/wwwroot/cdn.conectarhortifruti.com.br/banco/${(process.env.BANK_CLIENT ?? 'INTER').toLowerCase()}/${orderId}-qrcode.png`
    const barCodePath = `C:/inetpub/wwwroot/cdn.conectarhortifruti.com.br/banco/${(process.env.BANK_CLIENT ?? 'INTER').toLowerCase()}/${orderId}-barcode.png`
    if (paymentWayString === 'Diário') convertBase64ToPng(barCodeImage, barCodePath)
    await generateQRCode(pixKey, qrCodePath)
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
        }
      }),
      url_img_pix: `https://cdn.conectarhortifruti.com.br/banco/${(process.env.BANK_CLIENT ?? 'INTER').toLowerCase()}/${orderId}-qrcode.png`,
      cnpj: req.restaurant.restaurant.companyRegistrationNumber,
      cnpj_fornecedor: '',
      codigo_barras: `https://cdn.conectarhortifruti.com.br/banco/${(process.env.BANK_CLIENT ?? 'INTER').toLowerCase()}/${orderId}-barcode.png`,
      codigo_carteira: '109',
      data_emissao: DateTime.now().setZone('America/Sao_Paulo').toFormat('yyy/MM/dd'),
      data_pedido: DateTime.now().toFormat('yyyy/MM/dd'),
      data_vencimento: getPaymentDate(req.restaurant.restaurant.paymentWay as string)?.replaceAll('-', '/'),
      id_beneficiario: '6030000983545',
      identificador_calculado: yourNumber,
      nome_bairro: req.restaurant.restaurant.addressInfos[0].neighborhood,
      nome_cidade: req.restaurant.restaurant.addressInfos[0].city,
      nome_logradouro: req.restaurant.restaurant.addressInfos[0].localType + ' ' + req.restaurant.restaurant.addressInfos[0].address,
      numero_cep: req.restaurant.restaurant.addressInfos[0].zipCode,
      numero_linha_digitavel: digitableBarCode ?? '',
      numero_nosso_numero: ourNumber,
      sigla_UF: 'RJ',
      cliente_com_boleto: getPaymentDescription(req.restaurant.restaurant.paymentWay as string) === 'Diário' ? '1' : '0',
      nome_cliente: req.restaurant.restaurant.name?.replaceAll(' ', ''),
      id_distribuidor: req.restaurant.restaurant.externalId === 'C757' || req.restaurant.restaurant.externalId === 'C939' || req.restaurant.restaurant.externalId === 'C940' || req.restaurant.restaurant.externalId === 'C941' ? 'F0' : req.supplier.externalId
      // id_distribuidor: req.supplier.externalId
    } satisfies Pedido)
  }).catch(async (err) => {
    await receiptErrorMessage(req.restaurant.restaurant.externalId as string)
    void logRegister(err)
  })

  const documintResponse = await documintPromise?.json()

  const myHeaders = new Headers()
  myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a')
  myHeaders.append('external-id', 'F0')
  myHeaders.append('username', 'contato@conectarhortifruti.com.br')
  myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=')
  myHeaders.append('Content-Type', 'application/json')
  myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA3LTI2VDEzOjI1OjE3IiwibmJmIjoxNzIxMTM2MzE3LCJleHAiOjE3MjIwMDAzMTcsImlhdCI6MTcyMTEzNjMxNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.Ge3ST_TCO4XLcSj-pjSFvU8Pr9H_Oeks3zTkDAhsVcE')

  const requestOptions = {
    method: 'GET',
    headers: myHeaders
  }

  const responseFile = await fetch(`https://gateway.conectarhortifruti.com.br/api/v1/system/saveFile?url=${documintResponse.url}&fileName=${documintResponse.filename?.replaceAll('/', '')}`, requestOptions)
  const resultFile = await responseFile.json()

  order.orderDocument = resultFile.data.url

  await Promise.all([updateOrder({ orderDocument: resultFile.data.url }, orderId), addDetailing(detailing.map(({ name, orderUnit, quotationUnit, ...rest }) => rest)), airtableHandler(order, detailing, yourNumber, orderText, pixKey)])

  await deleteCartByUser({
    token: req.token,
    selectedRestaurant: []
  })

  return {
    restName: req.restaurant.restaurant.name,
    address: `${req.restaurant.restaurant.addressInfos[0].localType} ${req.restaurant.restaurant.addressInfos[0].address}, ${req.restaurant.restaurant.addressInfos[0].localNumber} - ${req.restaurant.restaurant.addressInfos[0].complement}, ${req.restaurant.restaurant.addressInfos[0].neighborhood}, ${req.restaurant.restaurant.addressInfos[0].city}`,
    maxHour: req.restaurant.restaurant.addressInfos[0].finalDeliveryTime.substring(11, 16),
    minHour: req.restaurant.restaurant.addressInfos[0].initialDeliveryTime.substring(11, 16),
    deliveryDateFormated: deliveryDate.toFormat('dd/MM/yyyy'),
    paymentWay: req.restaurant.restaurant.paymentWay
  }
}

export const confirmOrderPremium = async (req: confirmOrderPremiumRequest): Promise<any> => {
  try {
    const id = uuidv4()
    const today = DateTime.now().setZone('America/Sao_Paulo')

    const decoded = decode(req.token) as { id: string }
    const cart = await listByUser({ restaurantId: decoded.id })
    const items = await listProduct()
    const orderId = await generateOrderId(true, req.selectedRestaurant.externalId as string)
    if (cart == null || items == null) throw Error('Empty cart/items', { cause: 'visibleError' })
    const orderText = `🌱 *Pedido Conéctar* 🌱
---------------------------------------

${cart?.map((cart) => `*${String(cart.amount).replace('.', ',')}x ${items.data.find((i: { id: string | undefined, name: string }) => i.id === cart.productId).name}* cód. ${items.data.find((i: { id: string | undefined, name: string }) => i.id === cart.productId).sku}${cart.obs === '' ? '' : `\nObs.: ${cart.obs}`}`).join(', \n')}

---------------------------------------

*${req.selectedRestaurant.name}*
${req.selectedRestaurant.addressInfos[0].responsibleReceivingName ?? ''} - ${req.selectedRestaurant.addressInfos[0].responsibleReceivingPhoneNumber ?? ''}


${req.selectedRestaurant.addressInfos[0].address}, ${req.selectedRestaurant.addressInfos[0].localNumber} ${req.selectedRestaurant.addressInfos[0].complement}
${req.selectedRestaurant.addressInfos[0].neighborhood}, ${req.selectedRestaurant.addressInfos[0].city}
${req.selectedRestaurant.addressInfos[0].zipCode} - ${req.selectedRestaurant.addressInfos[0].deliveryInformation}


Pedido gerado às ${today.toFormat('HH:mm')} no dia ${today.toFormat('dd/MM')}

Entrega entre ${req.selectedRestaurant.addressInfos[0].initialDeliveryTime.substring(11, 16)} e ${req.selectedRestaurant.addressInfos[0].finalDeliveryTime.substring(11, 16)} horas

    `
    await createOrderTextAirtable({
      'Data Pedido': today.toISODate() ?? '',
      'ID Cliente': req.selectedRestaurant.externalId ?? '',
      'Texto Pedido': orderText,
      App: true,
      'Pedido Premium': true
    })

    await confirmPremium({
      cart: JSON.stringify(cart),
      Date: new Date(today.toString().substring(0, 10)),
      id,
      orderText,
      restaurantId: decoded.id,
      orderId
    })

    await deleteCartByUser({
      token: req.token,
      selectedRestaurant: []
    })
  } catch (err) {
    void logRegister(err)
  }
}

export const AgendamentoGuru = async (req: agendamentoPedido): Promise<any> => {
  try {
    // Decodificar o token para obter o ID do usuário/restaurante
    const decoded = decode(req.token) as { id: string }
    if (!decoded?.id) throw new Error('Token inválido ou ausente')

    // Recuperar o carrinho e os produtos
    const cart = await listByUser({ restaurantId: decoded.id })
    const items = await listProduct()

    if (cart == null || items == null) {
      console.error('Erro: Carrinho ou lista de produtos está vazio')
      throw new Error('Empty cart/items', { cause: 'visibleError' })
    }

    // Validar e formatar o número de telefone
    let phoneNumber = req.selectedRestaurant.addressInfos[0].phoneNumber ?? ''
    phoneNumber = phoneNumber.replace(/\D/g, '') // Remover caracteres não numéricos
    if (!phoneNumber.startsWith('55') && phoneNumber.length < 12) {
      phoneNumber = `55${phoneNumber}` // Adicionar DDI se necessário
    }

    // Codificar a mensagem
    const msg = encodeURIComponent(req.message).replace('!', '%21').replace('\'', '%27').replace('(', '%28').replace(')', '%29').replace('*', '%2A')

    // Validar e formatar a data/hora agendada
    const [year, month, day] = req.sendDate.split('-').map(Number)
    const [hours, minutes] = req.sendTime.split(':').map(Number)
    const sendDate = new Date(year, month - 1, day, hours, minutes)

    if (isNaN(sendDate.getTime())) {
      throw new Error('Data ou horário inválido')
    }

    const formattedSendDate = `${sendDate.toISOString().split('T')[0]} ${String(sendDate.getHours()).padStart(2, '0')}:${String(sendDate.getMinutes()).padStart(2, '0')}`

    // Configurações da API do ChatGuru
    const url = `https://s16.chatguru.app/api/v1?key=${process.env.CG_API_KEY}&account_id=${process.env.CG_ACCOUNT_ID}&phone_id=${process.env.CG_PHONE_ID}&action=message_send&text=${msg}&send_date=${formattedSendDate}&chat_number=${phoneNumber}`

    // Fazer a chamada à API usando `fetch`
    const response = await fetch(url, { method: 'POST' })
    const result = await response.text()

    return { status: 201, message: 'Agendamento realizado com sucesso!' }
  } catch (err) {
    console.error('Erro ao realizar o agendamento:', err)
    await logRegister(err)
    throw err
  }
}
