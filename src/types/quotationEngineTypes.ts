import { type FornecedorPriceList } from './quotationTypes';

export interface QuotationCartItemData {
  productId: string;
  amount: string | number;
  obs?: string | null;
  sku?: string;
  addOrder?: number | null;
}

export interface QuotationPriceItemData {
  supplier: FornecedorPriceList;
}

export interface QuotationRestaurantData {
  id: string;
  tax: string | number;
}

export interface QuotationEngineRequest {
  token: string;
  selectedRestaurant: QuotationRestaurantData;
  cart: Array<[string, QuotationCartItemData]>;
  prices: QuotationPriceItemData[];
}
