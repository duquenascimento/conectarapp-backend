import { type FieldSet, type Record as AirtableRecord } from 'airtable';
import { type Order, type Detailing } from '../repository/confirmRepository';
import { chunkArray } from '../utils/chunkArray';
import { createOrderAirtable } from '../repository/airtableOrderService';
import { createDetailingAirtable } from '../repository/airtableDetailingService';
import { createOrderTextAirtable } from '../repository/airtableOrderTextService';
import { findProductsIdsFromAirtable } from '../repository/airtableProductService';
import { findIdFromAirtable } from '../repository/airtableSupplierService';
import { olderSupplierDiscountNamePattern } from '../utils/airtableDetailingUtils';

export const airtableHandler = async (
  _order: Order,
  _detailing: Detailing[],
  yourNumber: string,
  orderText: string,
  pixKey?: string,
): Promise<void> => {
  try {
    const [supplierId, restId, productsId, restIdInSupplierApp, supplierIdInSupplierApp] =
      await Promise.all([
        findIdFromAirtable(
          process.env.AIRTABLE_TABLE_SUPPLIER_NAME ?? '',
          'ID Fornecedor',
          _order.supplierId,
          process.env.AIRTABLE_BASE_ORDER_ID ?? '',
        ),
        findIdFromAirtable(
          process.env.AIRTABLE_TABLE_REST_NAME ?? '',
          'ID_Cliente',
          _order.restaurantId,
          process.env.AIRTABLE_BASE_ORDER_ID ?? '',
        ),
        findProductsIdsFromAirtable(_detailing.map((item) => item.productId)),
        findIdFromAirtable(
          process.env.AIRTABLE_TABLE_RESTSUPPLIERAPP_NAME ?? '',
          'ID_Cliente',
          _order.restaurantId,
          process.env.AIRTABLE_BASE_SUPPLIERAPP_ID ?? '',
        ),
        findIdFromAirtable(
          process.env.AIRTABLE_TABLE_SUPPLIERSUPPLIERAPP_NAME ?? '',
          'ID Fornecedor',
          _order.supplierId,
          process.env.AIRTABLE_BASE_SUPPLIERAPP_ID ?? '',
        ),
      ]);

    const productsMap = productsId.reduce((obj: Record<string, string>, product) => {
      obj[product.productId] = product.airtableId;
      return obj;
    }, {});

    const order = await createOrderAirtable({
      'Código operador': 'APP',
      'Data Entrega': _order.deliveryDate.toISOString().substring(0, 10),
      'Data Pedido': _order.orderDate.toISOString().substring(0, 10),
      'Forma de pagamento': _order.paymentWay ?? '',
      'ID Distribuidor': _order.status_id === 13 ? ['recGaGKpONIbRlNK5'] : [supplierId],
      'Pedido Bubble': true,
      'Ponto de referência': _order.referencePoint ?? '',
      'Presentes na cotação': _order.calcOrderAgain.data.map(
        (item: any) => item.supplier.externalId,
      ),
      ID_Pedido: _order.id,
      Horário: _order.orderHour.toISOString().substring(11, 16),
      'Total Fornecedor': _order.totalSupplier,
      'Total Conéctar': _order.totalConectar,
      'Status Pedido':
        _order.status_id === 12
          ? 'Confirmado'
          : _order.status_id === 13
            ? 'Teste'
            : _order.status_id === 6
              ? 'Cancelado'
              : 'Recusado',
      'Recibo original': [
        {
          url: _order.orderDocument!,
        },
      ],
      ID_Cliente: [restId],
      Identificador: yourNumber,
    });

    if (!order) {
      throw new Error('Order creation failed');
    }

    await createOrderTextAirtable({
      App: true,
      'Data Pedido': _order.orderDate.toISOString().substring(0, 10),
      'ID Cliente': _order.restaurantId,
      'Texto Pedido': orderText,
    });

    const batchedDetails = chunkArray(
      _detailing.map((item) => {
        const productQuotationFields = prepareProductQuotationFieldsForDetailing(
          _order,
          item.productId,
        );
        return {
          ID_Pedido: [(order as AirtableRecord<FieldSet>).id],
          'ID Produto': [productsMap[item.productId]],
          'Qtd Pedido': item.orderAmount,
          'Qtd Final Distribuidor': item.supplierFinalAmount,
          'Qtd Final Cliente': item.restaurantFinalAmount,
          'Custo / Unidade Fornecedor': item.supplierPricePerUnid,
          'Custo / Unidade Conéctar': item.conectarPricePerUnid,
          'Preço Final Distribuidor': item.supplierFinalPrice,
          'Preço Final Conéctar': item.conectarFinalPrice,
          'Status Detalhamento Pedido': item.status as
            | 'Confirmado'
            | 'Teste'
            | 'Produto não disponível',
          OBS: item.obs,
          Aux_OBS: item.obs,
          'Custo Estimado': item.conectarFinalPrice,
          'Custo / Unid Fornecedor BD': item.supplierPricePerUnid,
          'Custo / Unidade Conéctar BD': item.conectarPricePerUnid,
          'Taxa Cliente': _order.tax,
          'Qtd Estimada': item.supplierFinalAmount,
          ...productQuotationFields,
        };
      }),
      10,
    );

    for (const batch of batchedDetails) {
      await createDetailingAirtable(batch);
    }
  } catch (err: any) {
    if (err.statusCode === 422) {
      throw err;
    }
    throw new Error(`Erro no servico do airtable: ${err.message}`);
  }
};

function prepareProductQuotationFieldsForDetailing(
  order: Order,
  productId: string,
): Record<string, any> {
  const quotationFields: Record<string, any> = {};
  if (!order.calcOrderAgain?.data) return quotationFields;

  order.calcOrderAgain.data.forEach((quotationData: any) => {
    const { supplier } = quotationData;

    if (supplier?.externalId === 'F0') return;
    if (!supplier?.name) return;
    const detailingSuffix = olderSupplierDiscountNamePattern(supplier.externalId as string)
      ? '_ %'
      : '_%';

    const supplierName = supplier.name;
    const discountData = supplier.discount || {};

    const productInQuotation = discountData.product?.find((prod: any) => prod.sku === productId);

    if (productInQuotation) {
      const productValue = productInQuotation.price || 0;
      const discountPercentage = discountData.discount || 0;

      quotationFields[`${supplierName}`] = productValue;
      quotationFields[`${supplierName}${detailingSuffix}`] = discountPercentage;
    } else {
      quotationFields[`${supplierName}`] = 0;
      quotationFields[`${supplierName}${detailingSuffix}`] = 0;
    }
  });

  return quotationFields;
}
