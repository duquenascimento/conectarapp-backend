import {
  type PreferenciaClasse,
  type PreferenciaProduto,
  type CombinacaoAPI,
} from '../types/quotationTypes';

interface PreferencesResolverReturn {
  preferenceSuppliers: string[];
  preferenceCategories: PreferenciaClasse[];
  preferenceProducts: PreferenciaProduto[];
}

export function preferencesResolver(combinacao: CombinacaoAPI): PreferencesResolverReturn {
  const preferenceSuppliers = new Set<string>();
  const preferenceProducts = combinacao.preferencias.flatMap((preferencia) =>
    preferencia.produtos
      .filter((prod) => prod.produto_sku !== null)
      .map((prod) => {
        const supplierId = prod.fornecedor_id;
        if (supplierId !== null && supplierId !== undefined) {
          preferenceSuppliers.add(supplierId);
        }
        return {
          productId: prod.produto_sku,
          supplierId,
          unavailableIfFailed: preferencia.acao_na_falha !== 'ignorar',
          preferenceType: preferencia.tipo === 'fixar' ? 'fix' : 'block',
        };
      }),
  );

  const preferenceCategories = combinacao.preferencias.flatMap((preferencia) =>
    preferencia.produtos
      .filter((prod) => prod.classe !== null)
      .map((prod) => {
        const supplierId = prod.fornecedor_id;
        if (supplierId !== null && supplierId !== undefined) {
          preferenceSuppliers.add(supplierId);
        }
        return {
          class: prod.classe,
          supplierId,
          unavailableIfFailed: preferencia.acao_na_falha !== 'ignorar',
          preferenceType: preferencia.tipo === 'fixar' ? 'fix' : 'block',
        };
      }),
  );
  return {
    preferenceSuppliers: Array.from(preferenceSuppliers),
    preferenceCategories,
    preferenceProducts,
  };
}
