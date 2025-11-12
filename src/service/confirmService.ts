import { Decimal } from '@prisma/client/runtime/library';
import { configure } from 'airtable';
import 'dotenv/config';
import { decode } from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import { createOrderTextAirtable } from '../repository/airtableOrderTextService';
import { listByUser } from '../repository/cartRepository';
import {
  addDetailing,
  addOrder,
  confirmPremium,
  updateOrder,
  type Detailing,
  type Order,
} from '../repository/confirmRepository';
import { saveTransaction } from '../repository/financeRepository';
import {
  type AgendamentoPedido,
  type ConfirmOrderPlusRequest,
  type ConfirmOrderPremiumRequest,
  type ConfirmOrderRequest,
} from '../types/confirmTypes';
import { getPaymentDate, getPaymentDescription } from '../utils/confirmUtils';
import { ConfirmOrderTemplateData, sendConfirmOrderTemplate } from '../utils/documint.utils';
import { generateOrderId } from '../utils/generateOrderId';
import { logRegister } from '../utils/logUtils';
import { airtableOrderErrorMessage } from '../utils/slackUtils';
import { isTestRestaurant } from '../utils/testRestaurantUtils';
import { uploadPdfFileToS3 } from '../utils/uploadToS3Utils';
import { airtableHandler } from './airtableConfirmService';
import { deleteCartByUser } from './cartService';
import { suppliersCompletePrices, suppliersPrices } from './priceService';
import { listProduct } from './productService';

configure({ apiKey: process.env.AIRTABLE_TOKEN ?? '' });

export const confirmOrder = async (
  req: ConfirmOrderRequest,
  deleteCart?: boolean,
): Promise<any> => {
  const shouldDeleteCart = deleteCart ?? true;
  const today = DateTime.now().setZone('America/Sao_Paulo');

  const { token, supplier, restaurant, deliveryDate } = req;

  const deliveryDateTime = DateTime.fromISO(deliveryDate);

  const orderId = await generateOrderId(false, restaurant.restaurant.externalId as string);

  const calcOrderAgain = await suppliersPrices({
    token,
    selectedRestaurant: restaurant.restaurant,
  });
  const allSuppliers = await suppliersCompletePrices({
    token,
    selectedRestaurant: restaurant.restaurant,
  });

  const ourNumber = (
    Date.now().toString() +
    Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
  ).slice(-8);
  const yourNumber = (
    Date.now().toString() +
    Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')
  ).slice(-10);

  const addressInfo = restaurant.restaurant.addressInfos[0];

  const orderText = `🌱 *Pedido Conéctar* 🌱
---------------------------------------

${supplier.discount.product
  ?.map(
    (cart) =>
      `*${String(cart.quant).replace('.', ',')}x ${cart.name}* cód. ${
        cart.sku
      }${cart.obs === '' ? '' : `\nObs.: ${cart.obs}`}`,
  )
  .join(', \n')}

---------------------------------------

*${restaurant.restaurant.name}*
${addressInfo.responsibleReceivingName ?? ''} - ${
    addressInfo.responsibleReceivingPhoneNumber ?? ''
  }\n\n

${addressInfo.address}, ${addressInfo.localNumber} ${addressInfo.complement}
${addressInfo.neighborhood}, ${addressInfo.city}
${addressInfo.zipCode} - ${addressInfo.deliveryInformation}


Pedido gerado às ${today.toFormat('HH:mm')} no dia ${today.toFormat('dd/MM')}

Entrega entre ${addressInfo.initialDeliveryTime.substring(
    11,
    16,
  )} e ${addressInfo.finalDeliveryTime.substring(11, 16)} horas

    `;
  const detailing: Detailing[] = [];

  supplier.discount.product.forEach((item) => {
    if (item.sku == null) {
      console.error('SKU não encontrado no item do pedido:', item);
    }

    const suppliersDetailing = allSuppliers.data
      .flatMap((s: any) => {
        const product = s.supplier.discount.product.find((p: any) => p.sku === item.sku);
        if (product != null) {
          return [
            {
              externalId: s.supplier.externalId,
              discount: s.supplier.discount.discount,
              priceUnique: product.priceUnique,
            },
          ];
        }
        return [];
      })
      .filter(Boolean);

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
      suppliersDetailing: { data: suppliersDetailing },
    });
  });

  const finalDeliveryTime = today.toJSDate();
  finalDeliveryTime.setHours(finalDeliveryTime.getHours() - 3);

  const initialDeliveryTime = today.toJSDate();
  initialDeliveryTime.setHours(initialDeliveryTime.getHours() - 3);

  const orderHour = today.toJSDate();
  orderHour.setHours(orderHour.getHours() - 3);

  const testRestaurantFlag = isTestRestaurant(token);

  const order: Order = {
    addressId: uuidv4(),
    deliveryDate: new Date(deliveryDate.substring(0, 10)),
    finalDeliveryTime,
    id: orderId,
    initialDeliveryTime,
    orderDate: new Date(today.toString().substring(0, 10)),
    orderHour,
    paymentWay: restaurant.restaurant.paymentWay,
    referencePoint: addressInfo.deliveryReference,
    restaurantId: restaurant.restaurant.externalId,
    status_id: testRestaurantFlag ? 13 : 12,
    tax: restaurant.restaurant.tax / 100,
    totalConectar: supplier.discount.orderValueFinish,
    totalSupplier: supplier.discount.orderWithoutTax,
    detailing: detailing.map((item) => item.id),
    supplierId: supplier.externalId,
    calcOrderAgain: { data: calcOrderAgain.data },
  };

  await addOrder(order);

  const digitableBarCode = null;

  const paymentWayString = getPaymentDescription(restaurant.restaurant.paymentWay as string);

  if (paymentWayString === 'Diário' || paymentWayString === 'À Vista') {
    const transactionData = {
      order_id: orderId,
      payment_date: new Date(getPaymentDate(restaurant.restaurant.paymentWay as string)),
      status_id: 8,
      payment_ways_id: paymentWayString === 'À Vista' ? 2 : 1,
      value: new Decimal(supplier.discount.orderValueFinish),
      transactions_type_id: 4,
      restaurant_id: restaurant.restaurant.id,
    };

    await saveTransaction(transactionData);
  }

  const confirmOrderTemplateData: ConfirmOrderTemplateData = {
    id_pedido: orderId,
    restaurante: restaurant.restaurant.name,
    nome: supplier.name,
    razao_social: restaurant.restaurant.legalName,
    cnpj: restaurant.restaurant.companyRegistrationNumber,
    data_entrega: deliveryDateTime.toFormat('yyyy/MM/dd'),
    horario_maximo: addressInfo.finalDeliveryTime.substring(11, 16),
    horario_minimo: addressInfo.initialDeliveryTime.substring(11, 16),
    total_conectar: supplier.discount.orderValueFinish.toString(),
    total_em_descontos: '0',
    total_sem_descontos: supplier.discount.orderValueFinish.toString(),
    bairro: addressInfo.neighborhood,
    cep: addressInfo.zipCode,
    cidade: addressInfo.city,
    informacao_de_entrega: addressInfo.deliveryInformation,
    inscricao_estadual:
      restaurant.restaurant.stateRegistrationNumber ?? restaurant.restaurant.cityRegistrationNumber,
    complemento: `${addressInfo.localNumber} ${
      addressInfo.complement == null ? ' - ' : ''
    } ${addressInfo.complement}`,
    resp_recebimento: addressInfo.responsibleReceivingName,
    rua: `${addressInfo.localType} ${addressInfo.address}`,
    tel_resp_recebimento: addressInfo.responsibleReceivingPhoneNumber,
    id_cliente: [
      {
        cnpj: restaurant.restaurant.companyRegistrationNumber,
        razao_social: restaurant.restaurant.legalName,
        nome: restaurant.restaurant.name,
      },
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
        unidade_pedido: item.orderUnit ?? 'N/A',
        produto_descricao: item.name ?? '',
      };
    }),
    cnpj_fornecedor: '',
    codigo_carteira: '109',
    data_emissao: DateTime.now().setZone('America/Sao_Paulo').toFormat('yyyy/MM/dd'),
    data_pedido: DateTime.now().toFormat('yyyy/MM/dd'),
    data_vencimento: getPaymentDate(restaurant.restaurant.paymentWay as string)?.replaceAll(
      '-',
      '/',
    ),
    id_beneficiario: '6030000983545',
    identificador_calculado: yourNumber,
    nome_bairro: addressInfo.neighborhood,
    nome_cidade: addressInfo.city,
    nome_logradouro: `${addressInfo.localType} ${addressInfo.address}`,
    numero_cep: addressInfo.zipCode,
    numero_linha_digitavel: digitableBarCode ?? '',
    numero_nosso_numero: ourNumber,
    sigla_UF: 'RJ',
    cliente_com_boleto:
      getPaymentDescription(restaurant.restaurant.paymentWay as string) === 'Diário' ? '1' : '0',
    nome_cliente: restaurant.restaurant.name?.replaceAll(' ', ''),
    id_distribuidor: testRestaurantFlag ? 'F0' : supplier.externalId,
  };

  const documintPromise = await sendConfirmOrderTemplate(
    restaurant.restaurant.externalId,
    confirmOrderTemplateData,
  );

  const documintResponse = await documintPromise?.json();

  const dataPedido = DateTime.now()
    .setZone('America/Sao_Paulo')
    .toFormat('yyyy/MM/dd')
    .toString()
    .replaceAll('/', '');
  const restaurantName = restaurant.restaurant.name;
  const pdfKey = `receipts/${dataPedido}-${restaurantName}-${orderId}-${supplier.externalId}.pdf`;

  let pdfUrl = '';
  if (documintResponse) {
    pdfUrl = await uploadPdfFileToS3(String(documintResponse.url), pdfKey);
    order.orderDocument = pdfUrl;
  }
  await Promise.all([
    updateOrder({ orderDocument: pdfUrl, orderTextGuru: orderText }, orderId),
    addDetailing(detailing.map(({ name, orderUnit, quotationUnit, ...rest }) => rest)),
  ]);

  try {
    await airtableHandler(order, detailing, yourNumber, orderText);
  } catch (error: any) {
    const detailingMessage = `Houve uma falha ao criar o detalhamento do pedido.
Confira se os dados dos fornecedores na tabela de detalhamento do airTable estão corretos 
e estão de acordo a base de dados do app.\n\n
${error.message}\n\n`;

    const orderMessage = `${orderText}
*************************************
Fornecedor: ${order.supplierId}
Valor Total: R$ ${supplier.discount.orderValueFinish.toFixed(2).replace('.', ',')}
`;
    const message = error.statusCode === 422 ? detailingMessage + orderMessage : orderMessage;
    await airtableOrderErrorMessage(order.id, message);
  }
  if (shouldDeleteCart) {
    await deleteCartByUser({
      token,
      selectedRestaurant: [],
    });
  }
  return {
    orderId,
    externalId: supplier.externalId,
    restName: restaurant.restaurant.name,
    address: `${addressInfo.localType} ${addressInfo.address}, ${addressInfo.localNumber} - ${addressInfo.complement}, ${addressInfo.neighborhood}, ${addressInfo.city}`,
    maxHour: addressInfo.finalDeliveryTime.substring(11, 16),
    minHour: addressInfo.initialDeliveryTime.substring(11, 16),
    deliveryDateFormated: deliveryDateTime.toFormat('dd/MM/yyyy'),
    paymentWay: restaurant.restaurant.paymentWay,
  };
};

export const confirmOrderPremium = async (req: ConfirmOrderPremiumRequest): Promise<any> => {
  try {
    const { token, selectedRestaurant, deliveryDate } = req;

    const id = uuidv4();
    const today = DateTime.now().setZone('America/Sao_Paulo');

    const decoded = decode(token) as { id: string };
    const cart = await listByUser({ restaurantId: decoded.id });
    const items = await listProduct();
    const orderId = await generateOrderId(true, selectedRestaurant.externalId as string);
    if (cart == null || items == null) {
      throw Error('Empty cart/items', { cause: 'visibleError' });
    }

    const addressInfos = selectedRestaurant.addressInfos[0];

    const orderText = `🌱 *Pedido Conéctar* 🌱
---------------------------------------

${cart
  ?.map(
    (cartItem) =>
      `*${String(cartItem.amount).replace('.', ',')}x ${
        items.data.find(
          (i: { id: string | undefined; name: string }) => i.id === cartItem.productId,
        ).name
      }* cód. ${
        items.data.find(
          (i: { id: string | undefined; name: string }) => i.id === cartItem.productId,
        ).sku
      }${cartItem.obs === '' ? '' : `\nObs.: ${cartItem.obs}`}`,
  )
  .join(', \n')}

---------------------------------------

*${selectedRestaurant.name}*
${addressInfos.responsibleReceivingName ?? ''} - ${
      addressInfos.responsibleReceivingPhoneNumber ?? ''
    }\n\n


${addressInfos.address}, ${addressInfos.localNumber} ${addressInfos.complement}
${addressInfos.neighborhood}, ${addressInfos.city}
${addressInfos.zipCode} - ${addressInfos.deliveryInformation}


Pedido gerado às ${today.toFormat('HH:mm')} no dia ${today.toFormat('dd/MM')}

Entrega entre ${addressInfos.initialDeliveryTime.substring(
      11,
      16,
    )} e ${addressInfos.finalDeliveryTime.substring(11, 16)} horas

    `;

    await createOrderTextAirtable({
      'Data Pedido': deliveryDate ?? '',
      'ID Cliente': selectedRestaurant.externalId ?? '',
      'Texto Pedido': orderText,
      App: true,
      'Pedido Premium': true,
    });

    await confirmPremium({
      cart: JSON.stringify(cart),
      Date: new Date(deliveryDate.substring(0, 10)),
      id,
      orderText,
      restaurantId: decoded.id,
      orderId,
    });

    await updateOrder({ orderTextGuru: orderText }, orderId);

    await deleteCartByUser({
      token,
      selectedRestaurant: [],
    });
  } catch (err) {
    logRegister(err);
  }
};

export const AgendamentoGuru = async (req: AgendamentoPedido): Promise<any> => {
  try {
    const { token, selectedRestaurant, sendDate, sendTime, message } = req;

    const decoded = decode(token) as { id: string };
    if (!decoded?.id) throw new Error('Token inválido ou ausente');

    const cart = await listByUser({ restaurantId: decoded.id });
    const items = await listProduct();

    if (cart == null || items == null) {
      console.error('Erro: Carrinho ou lista de produtos está vazio');
      throw new Error('Empty cart/items', { cause: 'visibleError' });
    }

    let phoneNumber = selectedRestaurant.addressInfos[0].phoneNumber ?? '';
    phoneNumber = phoneNumber.replace(/\D/g, '');
    if (!phoneNumber.startsWith('55') && phoneNumber.length < 12) {
      phoneNumber = `55${phoneNumber}`;
    }

    const msg = encodeURIComponent(message)
      .replace('!', '%21')
      .replace("'", '%27')
      .replace('(', '%28')
      .replace(')', '%29')
      .replace('*', '%2A');

    const [year, month, day] = sendDate.split('-').map(Number);
    const [hours, minutes] = sendTime.split(':').map(Number);
    const sendDateTime = new Date(year, month - 1, day, hours, minutes);

    if (Number.isNaN(sendDateTime.getTime())) {
      throw new Error('Data ou horário inválido');
    }

    const formattedSendDateTime = `${sendDateTime.toISOString().split('T')[0]} ${String(
      sendDateTime.getHours(),
    ).padStart(2, '0')}:${String(sendDateTime.getMinutes()).padStart(2, '0')}`;

    const url = `https://s16.chatguru.app/api/v1?key=${process.env.CG_API_KEY}&account_id=${process.env.CG_ACCOUNT_ID}&phone_id=${process.env.CG_PHONE_ID}&action=message_send&text=${msg}&send_date=${formattedSendDateTime}&chat_number=${phoneNumber}`;

    const response = await fetch(url, { method: 'POST' });
    await response.text();

    return { status: 201, message: 'Agendamento realizado com sucesso!' };
  } catch (err) {
    console.error('Erro ao realizar o agendamento:', err);
    await logRegister(err);
    throw err;
  }
};

export const handleConfirmPlus = async (req: ConfirmOrderPlusRequest): Promise<any[]> => {
  const { token, suppliers, restaurant, deliveryDate } = req;

  const ordersRequest: ConfirmOrderRequest[] = suppliers.map((supplier) => ({
    token,
    supplier,
    restaurant,
    deliveryDate,
  }));

  const ordersResult = await Promise.all(
    ordersRequest.map(async (order, index) => {
      const isLastOrderRequest = index === ordersRequest.length - 1;
      return confirmOrder(order, isLastOrderRequest);
    }),
  );

  return ordersResult;
};
