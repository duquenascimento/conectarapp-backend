import { addDetailing, addOrder, checkOrder, confirmPremium, type Detailing, type Order } from '../repository/confirmRepository'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { suppliersCompletePrices, suppliersPrices } from './priceService'
import 'dotenv/config'
import { deleteCartByUser } from './cartService'
import { listByUser } from '../repository/cartRepository'
import { decode } from 'jsonwebtoken'
import { listProduct } from './productService'
import { configure, base, type FieldSet, type Record as AirtableRecord, type Records } from 'airtable'
import { generateBolecode } from './itauService'
import { writeFileSync } from 'fs'
import QRCode from 'qrcode'
import { createCanvas } from 'canvas'
import JsBarcode from 'jsbarcode'

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

interface CreateOrderAirtable {
  ID_Pedido: string
  'Data Pedido': string
  'Data Entrega': string
  Horário: string
  'Forma de pagamento': string
  'Ponto de referência': string
  'Código operador': string
  'Total Fornecedor': number
  'Total Conéctar': number
  'Status Pedido': 'Confirmado' | 'Teste' | 'Cancelado' | 'Recusado'
  'ID Distribuidor': string[]
  'Presentes na cotação': string[]
  'Recibo original': Array<{ url: string }>
  'ID_Cliente': string[]
  'Pedido Bubble': boolean
  Identificador: string
}

interface CreateOrderTextAirtable {
  'ID Cliente': string
  'Data Pedido': string
  'Texto Pedido': string
  App: boolean
}

interface CreateOrderSupplierAppAirtable {
  'Data Entrega': string
  'ID Cliente': string[]
  'ID fornecedor': string[]
  'Status': 'Confirmado' | 'Cancelado' | 'Recusado'
  'Recibo': Array<{ url: string }>
  'Exibir pedido': true
  'Tipo de pedido': string
  'Valor auto': number
  'Chave pix'?: string
  'Código operador': string[]
}

interface CreateDetailingAirtable {
  ID_Pedido: string[]
  'ID Produto': string[]
  'Qtd Pedido': number
  'Qtd Final Distribuidor': number
  'Qtd Final Cliente': number
  'Custo / Unidade Fornecedor': number
  'Custo / Unidade Conéctar': number
  'Preço Final Distribuidor': number
  'Preço Final Conéctar': number
  'Status Detalhamento Pedido': 'Confirmado' | 'Teste' | 'Produto não disponível'
  'OBS': string
  'Aux_OBS': string
  'Custo Estimado': number
  'Custo / Unid Fornecedor BD': number
  'Custo / Unidade Conéctar BD': number
  'Taxa Cliente': number
  'Qtd Estimada': number
}

configure({
  apiKey: process.env.AIRTABLE_TOKEN ?? ''
})

const createOrderTextAirtable = async (req: CreateOrderTextAirtable): Promise<AirtableRecord<FieldSet> | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_ORDERTEXT_ID ?? '').table(process.env.AIRTABLE_TABLE_ORDERTEXT_NAME ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    console.error(err)
  }
}

const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

const findIdFromAirtable = async (tableName: string, fieldToFilter: string, valueToFilter: string, baseName: string): Promise<string> => {
  const _ = base(baseName).table(tableName)
  const filterByFormula = `{${fieldToFilter}} = "${valueToFilter}"`
  try {
    const records = await _.select({
      filterByFormula
    }).all()
    if (records.length > 0) {
      return records[0].id
    } else {
      return ''
    }
  } catch (err) {
    console.error('Error:', err)
    return ''
  }
}

const findProductsIdsFromAirtable = async (valuesToFilter: string[]): Promise<Array<{ productId: string, airtableId: string }>> => {
  const _ = base(process.env.AIRTABLE_BASE_ORDER_ID ?? '').table(process.env.AIRTABLE_TABLE_PRODUCT_NAME ?? '')
  const filterByFormula = `OR(${valuesToFilter.map(value => `{ID_Produto} = "${value}"`).join(', ')})`
  try {
    const records = await _.select({
      filterByFormula
    }).all()

    if (records.length > 0) {
      return records.map(record => { return { productId: record.fields.ID_Produto as string, airtableId: record.id } })
    } else {
      return []
    }
  } catch (err) {
    console.error('Error:', err)
    return []
  }
}

const createOrderAirtable = async (req: CreateOrderAirtable): Promise<AirtableRecord<FieldSet> | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_ORDER_ID ?? '').table(process.env.AIRTABLE_TABLE_ORDER_NAME ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    console.error(err)
  }
}

const createDetailingAirtable = async (req: CreateDetailingAirtable[]): Promise<Records<FieldSet> | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_ORDER_ID ?? '').table(process.env.AIRTABLE_TABLE_DETAILING_NAME ?? '')
    const detailing = await _.create(
      req.map(record => ({ fields: record as unknown as Partial<FieldSet> }))
    )
    return detailing
  } catch (err) {
    console.error(err)
    return undefined
  }
}

const createOrderSupplierAppAirtable = async (req: CreateOrderSupplierAppAirtable): Promise<AirtableRecord<FieldSet> | undefined> => {
  try {
    const _ = base(process.env.AIRTABLE_BASE_SUPPLIERAPP_ID ?? '').table(process.env.AIRTABLE_TABLE_ORDERSUPPLIERAPP_NAME ?? '')
    const create = await _.create(req as unknown as Partial<FieldSet>)
    return create
  } catch (err) {
    console.error(err)
  }
}

const airtableHandler = async (_order: Order, _detailing: Detailing[], yourNumber: string, orderText: string): Promise<void> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [supplierId, restId, productsId, restIdInSupplierApp, supplierIdInSupplierApp] = await Promise.all([
      findIdFromAirtable(process.env.AIRTABLE_TABLE_SUPPLIER_NAME ?? '', 'ID Fornecedor', _order.supplierId, process.env.AIRTABLE_BASE_ORDER_ID ?? ''),
      findIdFromAirtable(process.env.AIRTABLE_TABLE_REST_NAME ?? '', 'ID_Cliente', _order.restaurantId, process.env.AIRTABLE_BASE_ORDER_ID ?? ''),
      findProductsIdsFromAirtable(_detailing.map(item => item.productId)),
      findIdFromAirtable(process.env.AIRTABLE_TABLE_RESTSUPPLIERAPP_NAME ?? '', 'ID_Cliente', _order.restaurantId, process.env.AIRTABLE_BASE_SUPPLIERAPP_ID ?? ''),
      findIdFromAirtable(process.env.AIRTABLE_TABLE_SUPPLIERSUPPLIERAPP_NAME ?? '', 'ID Fornecedor', _order.supplierId, process.env.AIRTABLE_BASE_SUPPLIERAPP_ID ?? '')
    ])

    const productsMap = productsId.reduce((obj: Record<string, string>, product) => {
      obj[product.productId] = product.airtableId
      return obj
    }, {})

    const order = await createOrderAirtable({
      'Código operador': 'APP',
      'Data Entrega': _order.deliveryDate.toISOString().substring(0, 10),
      'Data Pedido': _order.orderDate.toISOString().substring(0, 10),
      'Forma de pagamento': _order.paymentWay ?? '',
      'ID Distribuidor': (_order.restaurantId !== 'PF324' && _order.restaurantId !== 'C186') ? ['rec1YouX20iXGOB5G'] : [supplierId],
      'Pedido Bubble': true,
      'Ponto de referência': _order.referencePoint ?? '',
      'Presentes na cotação': _order.calcOrderAgain.data.map((item: any) => item.supplier.externalId),
      ID_Pedido: _order.id,
      Horário: _order.orderHour.toISOString().substring(11, 16),
      'Total Fornecedor': _order.totalSupplier,
      'Total Conéctar': _order.totalConectar,
      'Status Pedido': _order.status as 'Confirmado' | 'Teste' | 'Cancelado' | 'Recusado',
      'Recibo original': [{
        url: _order.orderDocument
      }],
      ID_Cliente: [restId],
      Identificador: yourNumber
    })

    const batchedDetails = chunkArray(
      _detailing.map(item => ({
        ID_Pedido: [order?.id ?? ''],
        'ID Produto': [productsMap[item.productId]],
        'Qtd Pedido': item.orderAmount,
        'Qtd Final Distribuidor': item.supplierFinalAmount,
        'Qtd Final Cliente': item.restaurantFinalAmount,
        'Custo / Unidade Fornecedor': item.supplierPricePerUnid,
        'Custo / Unidade Conéctar': item.conectarPricePerUnid,
        'Preço Final Distribuidor': item.supplierFinalPrice,
        'Preço Final Conéctar': item.conectarFinalPrice,
        'Status Detalhamento Pedido': item.status as 'Confirmado' | 'Teste' | 'Produto não disponível',
        OBS: item.obs,
        Aux_OBS: item.obs,
        'Custo Estimado': item.conectarFinalPrice,
        'Custo / Unid Fornecedor BD': item.supplierPricePerUnid,
        'Custo / Unidade Conéctar BD': item.conectarPricePerUnid,
        'Taxa Cliente': _order.tax,
        'Qtd Estimada': item.supplierFinalAmount
      })),
      10
    )

    for (const batch of batchedDetails) {
      await createDetailingAirtable(batch)
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
    })

    await createOrderTextAirtable({
      App: true,
      'Data Pedido': _order.orderDate.toISOString().substring(0, 10),
      'ID Cliente': _order.restaurantId,
      'Texto Pedido': orderText
    })
  } catch (err) {
    console.error(err)
  }
}

export const confirmOrder = async (req: confirmOrderRequest): Promise<any> => {
  try {
    const diferencaEmMilissegundos = Math.abs(
      DateTime.fromISO('1900-01-01', { zone: 'America/Sao_Paulo' }).toMillis() -
      DateTime.now().setZone('America/Sao_Paulo').toMillis()
    )
    const milissegundosPorDia = 1000 * 60 * 60 * 24
    const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / milissegundosPorDia) + 2

    const today = DateTime.now().setZone('America/Sao_Paulo')
    const deliveryDate = today.plus({ days: 1 })

    let orderId = `${diferencaEmDias}_${req.restaurant.restaurant.externalId}`

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

    const getPaymentDate = (paymentWay: string): string => {
      const today = DateTime.now().setZone('America/Sao_Paulo')
      const deliveryDay = today.plus({ days: 1 }) // Definir o dia da entrega como 1 dia após o dia atual

      console.log(today)

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
        return nextDate.day === day ? nextDate : nextDate.endOf('month') // Ajusta para o último dia do mês, se necessário
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

    const ourNumber = (Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')).slice(-8)
    const yourNumber = (Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, '0')).slice(-10)

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
    `

    const detailing: Detailing[] = []

    req.supplier.discount.product.forEach(item => {
      if (item.sku == null) {
        console.log(item)
      }

      const suppliersDetailing = allSuppliers.data.flatMap((s: any) => {
        const product = s.supplier.discount.product.find((p: any) => p.sku === item.sku)
        if (product != null) {
          return [{
            externalId: s.supplier.externalId,
            discount: s.supplier.discount.discount,
            priceUnique: product.priceUnique
          }]
        }
        return []
      }).filter(Boolean)

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

    let bolecode = null
    let digitableBarCode = null

    const paymentWayString = getPaymentDescription(req.restaurant.restaurant.paymentWay as string)

    if (paymentWayString === 'Diário' || paymentWayString === 'À Vista') {
      const data = {
        tipo_boleto: 'a vista',
        texto_seu_numero: yourNumber,
        codigo_carteira: '109',
        valor_total_titulo: req.supplier.discount.orderValueFinish.toFixed(2).replace('.', '').padStart(12, '0'),
        codigo_especie: '01',
        data_emissao: DateTime.now().setZone('America/Sao_Paulo').toISODate() ?? '',
        valor_abatimento: '000000000000',
        pagador: {
          pessoa: {
            nome_pessoa: req.restaurant.restaurant.legalName,
            tipo_pessoa: {
              codigo_tipo_pessoa: req.restaurant.restaurant.companyRegistrationNumber > 11 ? 'J' : 'F',
              numero_cadastro_nacional_pessoa_juridica: undefined as string | undefined,
              numero_cadastro_pessoa_fisica: undefined as string | undefined
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
            data_vencimento: getPaymentDate(req.restaurant.restaurant.paymentWay as string),
            texto_uso_beneficiario: '000001',
            valor_titulo: req.supplier.discount.orderValueFinish.toFixed(2).replace('.', '').padStart(12, '0'),
            data_limite_pagamento: DateTime.now().set({ month: DateTime.now().get('month') + 2 }).toISODate()
          }
        ],
        juros: {
          data_juros: DateTime.fromISO(getPaymentDate(req.restaurant.restaurant.paymentWay as string)).set({ day: DateTime.fromISO(getPaymentDate(req.restaurant.restaurant.paymentWay as string)).get('day') + 1 }).toISODate() ?? '',
          codigo_tipo_juros: '93',
          valor_juros: ((req.supplier.discount.orderValueFinish * 0.01) / 30).toFixed(2).replace('.', '').padStart(17, '0')
        },
        multa: {
          codigo_tipo_multa: '02',
          percentual_multa: '000000200000',
          data_multa: DateTime.fromISO(getPaymentDate(req.restaurant.restaurant.paymentWay as string)).set({ day: DateTime.fromISO(getPaymentDate(req.restaurant.restaurant.paymentWay as string)).get('day') + 1 }).toISODate() ?? ''
        },
        lista_mensagem_cobranca: [
          {
            mensagem: `${orderId} - Pedido entregue em ${deliveryDate.toFormat('dd/MM/yyyy')}`
          }
        ]
      }
      if (data.pagador.pessoa.tipo_pessoa.codigo_tipo_pessoa === 'J') {
        data.pagador.pessoa.tipo_pessoa.numero_cadastro_nacional_pessoa_juridica = req.restaurant.restaurant.companyRegistrationNumber
      } else {
        data.pagador.pessoa.tipo_pessoa.numero_cadastro_pessoa_fisica = req.restaurant.restaurant.companyRegistrationNumber
      }
      bolecode = await generateBolecode(data)
      const barCodeImage = generateBarcode(bolecode.data.dado_boleto.dados_individuais_boleto[0].codigo_barras as string)
      digitableBarCode = bolecode.data.dado_boleto.dados_individuais_boleto[0].numero_linha_digitavel
      const pixKey = bolecode.data.dados_qrcode.emv
      const qrCodePath = `C:/inetpub/wwwroot/cdn.conectarhortifruti.com.br/banco/itau/${orderId}-qrcode.png`
      const barCodePath = `C:/inetpub/wwwroot/cdn.conectarhortifruti.com.br/banco/itau/${orderId}-barcode.png`
      convertBase64ToPng(barCodeImage, barCodePath)
      await generateQRCode(pixKey as string, qrCodePath)
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
        url_img_pix: `https://cdn.conectarhortifruti.com.br/banco/itau/${orderId}-qrcode.png`,
        cnpj: req.restaurant.restaurant.companyRegistrationNumber,
        cnpj_fornecedor: '',
        codigo_barras: `https://cdn.conectarhortifruti.com.br/banco/itau/${orderId}-barcode.png`,
        codigo_carteira: '109',
        data_emissao: DateTime.now().setZone('America/Sao_Paulo').toFormat('yyy/MM/dd'),
        data_pedido: DateTime.now().toFormat('yyyy/MM/dd'),
        data_vencimento: getPaymentDate(req.restaurant.restaurant.paymentWay as string).replaceAll('-', '/'),
        id_beneficiario: '6030000983545',
        identificador_calculado: yourNumber,
        nome_bairro: req.restaurant.restaurant.addressInfos[0].neighborhood,
        nome_cidade: req.restaurant.restaurant.addressInfos[0].city,
        nome_logradouro: req.restaurant.restaurant.addressInfos[0].localType + ' ' + req.restaurant.restaurant.addressInfos[0].address,
        numero_cep: req.restaurant.restaurant.addressInfos[0].zipCode,
        numero_linha_digitavel: digitableBarCode ?? '',
        numero_nosso_numero: ourNumber,
        sigla_UF: 'RJ',
        cliente_com_boleto: (getPaymentDescription(req.restaurant.restaurant.paymentWay as string) === 'Diário' || getPaymentDescription(req.restaurant.restaurant.paymentWay as string) === 'À Vista') ? '1' : '0',
        nome_cliente: req.restaurant.restaurant.name.replaceAll(' ', ''),
        id_distribuidor: (req.restaurant.restaurant.externalId !== 'PF324' && req.restaurant.restaurant.externalId !== 'C186') ? 'F0' : req.supplier.externalId
      } satisfies Pedido)
    })

    const documintResponse = await documintPromise.json()

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

    const responseFile = await fetch(`https://gateway.conectarhortifruti.com.br/api/v1/system/saveFile?url=${documintResponse.url}&fileName=${documintResponse.filename.replaceAll('/', '')}`, requestOptions)
    const resultFile = await responseFile.json()

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
      status: 'Confirmado',
      tax: req.restaurant.restaurant.tax / 100,
      totalConectar: req.supplier.discount.orderValueFinish,
      totalSupplier: req.supplier.discount.orderWithoutTax,
      detailing: detailing.map(item => item.id),
      supplierId: req.supplier.externalId,
      calcOrderAgain: { data: calcOrderAgain.data },
      orderDocument: resultFile.data.url
    }

    await Promise.all([
      addOrder(order),
      addDetailing(detailing.map(({ name, orderUnit, quotationUnit, ...rest }) => rest)),
      airtableHandler(order, detailing, yourNumber, orderText)
    ])

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
  } catch (err) {
    console.log(err)
  }
}

export const confirmOrderPremium = async (req: confirmOrderPremiumRequest): Promise<any> => {
  try {
    const id = uuidv4()
    const today = DateTime.now().setZone('America/Sao_Paulo')

    const decoded = decode(req.token) as { id: string }
    const cart = await listByUser({ restaurantId: decoded.id })
    const items = await listProduct()
    if (cart == null || items == null) throw Error('Empty cart/items', { cause: 'visibleError' })

    const orderText = `🌱 *Pedido Conéctar* 🌱
---------------------------------------

${cart?.map(cart => `*${String(cart.amount).replace('.', ',')}x ${(items.data.find(((i: { id: string | undefined, name: string }) => i.id === cart.productId))).name}* cód. ${(items.data.find(((i: { id: string | undefined, name: string }) => i.id === cart.productId))).sku}${(cart.obs === '') ? '' : `\nObs.: ${cart.obs}`}`).join(', \n')}

---------------------------------------

*${req.selectedRestaurant.name}*
${req.selectedRestaurant.addressInfos[0].responsibleReceivingName ?? ''} - ${req.selectedRestaurant.responsibleReceivingPhoneNumber ?? ''}

${req.selectedRestaurant.addressInfos[0].address}, ${req.selectedRestaurant.addressInfos[0].localNumber} ${req.selectedRestaurant.addressInfos[0].complement}
${req.selectedRestaurant.addressInfos[0].neighborhood}, ${req.selectedRestaurant.addressInfos[0].city}
${req.selectedRestaurant.addressInfos[0].zipCode}

Pedido gerado às ${today.toFormat('HH:mm')} no dia ${today.toFormat('dd/MM')}
    `

    await createOrderTextAirtable({
      'Data Pedido': today.toISODate() ?? '',
      'ID Cliente': req.selectedRestaurant.externalId ?? '',
      'Texto Pedido': orderText,
      App: true
    })

    await confirmPremium({
      cart: JSON.stringify(cart),
      Date: new Date(today.toString().substring(0, 10)),
      id,
      orderText,
      restaurantId: decoded.id
    })

    await deleteCartByUser({
      token: req.token,
      selectedRestaurant: []
    })

    console.log()
  } catch (err) {
    console.log(err)
  }
}
