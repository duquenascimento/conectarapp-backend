import { Decimal } from '@prisma/client/runtime/library';
import { HttpException } from '../errors/httpException';
import { findRestaurantById } from '../repository/restaurantRepository';
import { cestaProdutos, solveCombinations } from '../utils/premiumCestaProdutos';
import { type ICartResponse } from './cartService';
import { type QuotationEngineRequest } from '../types/quotationEngineTypes';
import { CombinationResponse } from '../types/quotationTypes';

export const newQuotationEngine = async (
  data: QuotationEngineRequest,
): Promise<CombinationResponse[]> => {
  const restaurant = await findRestaurantById(data.selectedRestaurant?.id as string);

  if (!restaurant) {
    throw new HttpException('Restaurante não encontrado', 404);
  }

  const iCart = data.cart.map(([_, dados]) => ({
    productId: dados.productId,
    amount: new Decimal(Number(dados.amount)),
    obs: dados.obs ?? null,
    sku: dados.sku,
    addOrder: dados.addOrder,
  })) as ICartResponse[];

  const cart = await cestaProdutos(iCart);

  const combinations = await solveCombinations(data.prices, cart, restaurant);

  return combinations;
};
