import { addDetailing, addOrder, confirmPremium, updateOrder, type Detailing, type Order } from '../repository/confirmRepository'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { suppliersCompletePrices, suppliersPrices } from './priceService'
import 'dotenv/config'
import { deleteCartByUser } from './cartService'
import { listByUser } from '../repository/cartRepository'
import { decode } from 'jsonwebtoken'
import { listProduct } from './productService'
import { configure } from 'airtable'
import { saveTransaction } from '../repository/financeRepository'
import { Decimal } from '@prisma/client/runtime/library'
import { logRegister } from '../utils/logUtils'
import { receiptErrorMessage } from '../utils/slackUtils'
import { airtableHandler } from './airtableConfirmService'
import { createOrderTextAirtable } from '../repository/airtableOrderTextService'
import { type confirmOrderPremiumRequest, type confirmOrderRequest, type agendamentoPedido, type confirmOrderPlusRequest } from '../types/confirmTypes'
import { generateOrderId } from '../utils/generateOrderId'
import { uploadPdfFileToS3 } from '../utils/uploadToS3Utils'
import { getPaymentDate, getPaymentDescription } from '../utils/confirmUtils'

configure({
  apiKey: process.env.AIRTABLE_TOKEN ?? ''
})

export const confirmOrder = async (req: confirmOrderRequest, deleteCart?: boolean): Promise<any> => {
  const shouldDeleteCart = deleteCart ?? true
  const today = DateTime.now().setZone('America/Sao_Paulo')
  const deliveryDate = today.plus({ days: 1 })

  const orderId = await generateOrderId(false, req.restaurant.restaurant.externalId as string)

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
      console.error('SKU não encontrado no item do pedido:', item)
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

  const digitableBarCode = null

  const paymentWayString = getPaymentDescription(req.restaurant.restaurant.paymentWay as string)

  if (paymentWayString === 'Diário' || paymentWayString === 'À Vista') {
    const transactionData = {
      order_id: orderId,
      payment_date: new Date(getPaymentDate(req.restaurant.restaurant.paymentWay as string)),
      status_id: 8,
      payment_ways_id: paymentWayString === 'À Vista' ? 2 : 1,
      value: new Decimal(req.supplier.discount.orderValueFinish),
      transactions_type_id: 4,
      restaurant_id: req.restaurant.restaurant.id
    }

    await saveTransaction(transactionData)
  }

  const documintPromise = await fetch('https://api.documint.me/1/templates/66c89d6350bcff4eb423c34f/content?preview=true&active=true', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      api_key: process.env.DOCUMINT_KEY ?? ''
    },
    body: JSON.stringify({
      id_pedido: orderId,
      restaurante: req.restaurant.restaurant.name,
      nome: req.supplier.name,
      razao_social: req.restaurant.restaurant.legalName,
      cnpj: req.restaurant.restaurant.companyRegistrationNumber,
      data_entrega: deliveryDate.toFormat('yyyy/MM/dd'),
      horario_maximo: req.restaurant.restaurant.addressInfos[0].finalDeliveryTime.substring(11, 16),
      horario_minimo: req.restaurant.restaurant.addressInfos[0].initialDeliveryTime.substring(11, 16),
      total_conectar: req.supplier.discount.orderValueFinish.toString(),
      total_em_descontos: '0',
      total_sem_descontos: req.supplier.discount.orderValueFinish.toString(),
      bairro: req.restaurant.restaurant.addressInfos[0].neighborhood,
      cep: req.restaurant.restaurant.addressInfos[0].zipCode,
      cidade: req.restaurant.restaurant.addressInfos[0].city,
      informacao_de_entrega: req.restaurant.restaurant.addressInfos[0].deliveryInformation,
      inscricao_estadual: req.restaurant.restaurant.stateRegistrationNumber ?? req.restaurant.restaurant.cityRegistrationNumber,
      complemento: `${req.restaurant.restaurant.addressInfos[0].localNumber} ${req.restaurant.restaurant.addressInfos[0].complement == null ? ' - ' : ''} ${req.restaurant.restaurant.addressInfos[0].complement}`,
      resp_recebimento: req.restaurant.restaurant.addressInfos[0].responsibleReceivingName,
      rua: `${req.restaurant.restaurant.addressInfos[0].localType} ${req.restaurant.restaurant.addressInfos[0].address}`,
      tel_resp_recebimento: req.restaurant.restaurant.addressInfos[0].responsibleReceivingPhoneNumber,
      id_cliente: [
        {
          cnpj: req.restaurant.restaurant.companyRegistrationNumber,
          razao_social: req.restaurant.restaurant.legalName,
          nome: req.restaurant.restaurant.name
        }
      ],
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
      cnpj_fornecedor: '',
      codigo_carteira: '109',
      data_emissao: DateTime.now().setZone('America/Sao_Paulo').toFormat('yyyy/MM/dd'),
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
    })
  }).catch(async (err) => {
    await receiptErrorMessage(req.restaurant.restaurant.externalId as string)
    void logRegister(err)
  })

  const documintResponse = await documintPromise?.json()

  const dataPedido = DateTime.now().setZone('America/Sao_Paulo').toFormat('yyyy/MM/dd').toString().replaceAll('/', '')
  const restaurant = req.restaurant.restaurant.name
  const pdfKey = `receipts/${dataPedido}-${restaurant}-${orderId}-${req.supplier.externalId}.pdf`

  let pdfUrl = ''
  if (documintResponse) {
    pdfUrl = await uploadPdfFileToS3(String(documintResponse.url), pdfKey)
    order.orderDocument = pdfUrl
  }

  await Promise.all([updateOrder({ orderDocument: pdfUrl, orderTextGuru: orderText }, orderId), addDetailing(detailing.map(({ name, orderUnit, quotationUnit, ...rest }) => rest)), airtableHandler(order, detailing, yourNumber, orderText)])

  if (shouldDeleteCart) {
    await deleteCartByUser({
      token: req.token,
      selectedRestaurant: []
    })
  }

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

    await updateOrder({ orderTextGuru: orderText }, orderId)

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
    await response.text()

    return { status: 201, message: 'Agendamento realizado com sucesso!' }
  } catch (err) {
    console.error('Erro ao realizar o agendamento:', err)
    await logRegister(err)
    throw err
  }
}

export const handleConfirmPlus = async (req: confirmOrderPlusRequest): Promise<any[]> => {
  const { token, suppliers, restaurant } = req

  const ordersRequest: confirmOrderRequest[] = suppliers.map((supplier) => ({
    token,
    supplier,
    restaurant
  }))

  const ordersResult = []

  for (const [index, order] of ordersRequest.entries()) {
    const isLastOrderRequest = index === ordersRequest.length - 1
    const orderConfirmed = await confirmOrder(order, isLastOrderRequest)
    ordersResult.push(orderConfirmed)
  }

  return ordersResult
}
