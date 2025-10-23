import axios from 'axios';
import { HttpException } from '../errors/httpException';
import { ApiRepository } from '../repository/apiRepository';
import { getSuppliersIdsByReferralRestaurantId } from '../repository/supplierRepository';
import { type ICartResponse } from '../service/cartService';
import { QuotationPriceItemData, QuotationRestaurantData } from '../types/quotationEngineTypes';
import {
  type CombinacaoAPI,
  type CombinationResponse,
  type FornecedorMotor,
  type MotorCombinacaoRequest,
  type MotorCombinacaoWithSupplierNames,
  type PreferenciaClasse,
  type PreferenciaProduto,
  type ProdutoCesta,
} from '../types/quotationTypes';
import { preferencesResolver } from './premium-preferences.utils';
import { addSupplierNames, getSuppliersFromPriceList } from './premium-suppliers.utils';

const apiDbConectar = new ApiRepository(process.env.API_DB_CONECTAR ?? '');

export async function cestaProdutos(cart: ICartResponse[]): Promise<ProdutoCesta[]> {
  const cesta: ProdutoCesta[] = [];

  const results = await Promise.all(
    cart.map(async (item) => {
      const produto = await apiDbConectar.callApi(`/system/produtos/${item.productId}`, 'GET');

      if (!produto) {
        throw new Error('Erro ao buscar produtos na base de dados');
      }

      return {
        id: produto.data.sku,
        quantity: Number(item.amount),
        class: produto.data.classe,
      } as ProdutoCesta;
    }),
  );

  cesta.push(...results);

  return cesta;
}

async function getEngineQuotationForSuppliers(
  req: MotorCombinacaoRequest,
  prices: QuotationPriceItemData[],
): Promise<MotorCombinacaoWithSupplierNames> {
  const result = await axios.post(`${process.env.API_MOTOR_COTACAO}/solve`, req);
  const resultadoCotacao = addSupplierNames(result.data, prices);
  return resultadoCotacao;
}

export async function solveCombinations(
  prices: QuotationPriceItemData[],
  products: ProdutoCesta[],
  restaurant: QuotationRestaurantData,
): Promise<CombinationResponse[]> {
  const combinationsResult = await apiDbConectar.callApi(
    `/system/combinacao/${restaurant.id}`,
    'GET',
  );
  const combinations = combinationsResult.data as CombinacaoAPI[];

  const reqSuppliers = await getSuppliersFromPriceList(prices, products, restaurant);
  if (!reqSuppliers) {
    throw new HttpException('Não há fornecedores disponíveis', 404);
  }

  const taxa = Number(restaurant.tax) / 100;

  const zeroTaxSuppliersIds = await getSuppliersIdsByReferralRestaurantId(restaurant.id);

  const solvedCombinations: CombinationResponse[] = await Promise.all(
    combinations.map(async (combination) => {
      const favoriteCategories: PreferenciaClasse[] = [];
      const favoriteProducts: PreferenciaProduto[] = [];
      let suppliers: FornecedorMotor[] = reqSuppliers.filter(
        (sup) => !combination.fornecedores_bloqueados.includes(sup.id),
      );

      if (combination.fornecedores_especificos.length !== 0) {
        suppliers = suppliers.filter((sup) =>
          combination.fornecedores_especificos.includes(sup.id),
        );
      }

      if (combination.preferencias.length > 0) {
        const { preferenceCategories, preferenceProducts } = preferencesResolver(combination);
        favoriteCategories.push(...preferenceCategories);
        favoriteProducts.push(...preferenceProducts);
      }

      const reqMotor: MotorCombinacaoRequest = {
        suppliers,
        favoriteCategories,
        favoriteProducts,
        products,
        fee: taxa,
        zeroFee: zeroTaxSuppliersIds,
        maxSupplier: combination.dividir_em_maximo,
      };

      const quotationResult = await getEngineQuotationForSuppliers(reqMotor, prices);

      return {
        id: combination.id,
        nome: combination.nome,
        resultadoCotacao: quotationResult,
      } as CombinationResponse;
    }),
  );

  return solvedCombinations;
}
