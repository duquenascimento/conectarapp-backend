import { addDetailing, addOrder, checkOrder, type Detailing, type Order } from '../repository/confirmRepository'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { suppliersCompletePrices, suppliersPrices } from './priceService'
import 'dotenv/config'
import { deleteCartByUser } from './cartService'

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
  products: Product[]
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
}

export interface confirmOrderRequest {
  token: string
  supplier: Supplier
  restaurant: any
}

interface DetalhamentoPedidoItem {
  exibir_para_cliente: string
  produto_descricao: string
  aux_obs: string
  qtd_pedido: string
  unidade_pedido: string
  qtd_final_cliente: string
  unidade_cotacao: string
  custo_unidade_conectar: string
  preco_final_conectar: string
}

interface Pedido {
  id_pedido: string
  restaurante: string
  rua: string
  complemento: string
  cep: string
  bairro: string
  razao_social: string
  cnpj: string
  inscricao_estadual: string
  nome: string
  data_entrega: string
  resp_recebimento: string
  tel_resp_recebimento: string
  horario_minimo: string
  horario_maximo: string
  periodicidade_pagamento: string
  informacao_de_entrega: string
  tipo_de_pag: string
  url_img_pix: string
  chave_pix: string
  img_barcode: string
  url_barcode: string
  detalhamento_pedido: DetalhamentoPedidoItem[]
  total_em_descontos: string
  total_sem_descontos: string
  total_conectar: string
  data_entrega_arquivo_string: string
  nome_cliente_string: string
  id_distribuidor_string: string
}

export const confirmOrder = async (req: confirmOrderRequest): Promise<any> => {
  try {
    const diferencaEmMilissegundos = Math.abs(DateTime.fromJSDate(new Date('1900-01-01')).setZone('America/Sao_Paulo').toJSDate().getTime() - DateTime.now().setZone('America/Sao_Paulo').toJSDate().getTime())
    const milissegundosPorDia = 1000 * 60 * 60 * 24
    const diferencaEmDias = Math.ceil(diferencaEmMilissegundos / milissegundosPorDia) + 2
    const today = DateTime.now().setZone('America/Sao_Paulo').toJSDate()
    const deliveryDate = DateTime.now().setZone('America/Sao_Paulo').toJSDate()
    let deliveryDateFormated = DateTime.now().setZone('America/Sao_Paulo')
    deliveryDateFormated = deliveryDateFormated.set({ day: today.getDate() + 1 })
    deliveryDate.setDate(today.getDate() + 1)
    let orderId = `${diferencaEmDias}_C1`

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

    const detailing: Detailing[] = []

    req.supplier.discount.products.forEach(item => {
      if (item.sku == null) {
        console.log(item)
      }

      const suppliersDetailing = allSuppliers.data.flatMap((s: any) => {
        const product = s.supplier.discount.products.find((p: any) => p.sku === item.sku)
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
        restaurantFinalAmount: item.quant,
        supplierFinalAmount: item.quant,
        obs: item.obs,
        supplierPricePerUnid: item.priceUnique,
        status: item.price === 0 ? 'Indisponível' : 'Confirmado',
        supplierFinalPrice: item.priceWithoutTax,
        suppliersDetailing: { data: suppliersDetailing }
      })
    })

    const documintPromise = await fetch('https://api.documint.me/1/templates/64b96c15f093e4fd8d4b39f1/content?preview=true&active=true', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        api_key: process.env.DOCUMINT_KEY ?? ''
      },
      body: JSON.stringify({
        bairro: req.restaurant.restaurant.addressInfos[0].neighborhood as string,
        cep: req.restaurant.restaurant.addressInfos[0].zipCode as string,
        cnpj: req.restaurant.restaurant.companyRegistrationNumber as string,
        complemento: req.restaurant.restaurant.addressInfos[0].cõmplement as string,
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
        periodicidade_pagamento: getPaymentDescription(req.restaurant.restaurant.paymentWay as string),
        tipo_de_pag: getPaymentDescription(req.restaurant.restaurant.paymentWay as string),
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
          }
        }),
        img_barcode: '',
        url_barcode: '',
        url_img_pix: ''
      } satisfies Pedido)
    })

    const documintResponse = await documintPromise.json()

    const order: Order = {
      addressId: uuidv4(),
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
    }

    console.log(req.token)

    await Promise.all([
      addOrder(order),
      deleteCartByUser({
        token: req.token,
        selectedRestaurant: []
      }),
      addDetailing(detailing.map(({ name, orderUnit, ...rest }) => rest)),
      fetch('https://hooks.airtable.com/workflows/v1/genericWebhook/appH7QQsEghVD7iTO/wflMrmLegBDqDNF6U/wtrvetFTovtyTInYM', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ ...order, detailing })
      })
    ])

    return {
      restName: req.restaurant.restaurant.name,
      address: `${req.restaurant.restaurant.addressInfos[0].localType} ${req.restaurant.restaurant.addressInfos[0].address}, ${req.restaurant.restaurant.addressInfos[0].complement}`,
      maxHour: req.restaurant.restaurant.addressInfos[0].finalDeliveryTime.substring(11, 16),
      minHour: req.restaurant.restaurant.addressInfos[0].initialDeliveryTime.substring(11, 16),
      deliveryDateFormated,
      paymentWay: req.restaurant.restaurant.paymentWay
    }
  } catch (err) {
    console.log(err)
  }
}
