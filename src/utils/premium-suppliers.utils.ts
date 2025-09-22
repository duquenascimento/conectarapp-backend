import { DateTime } from 'luxon'
import { type Supplier } from '../types/confirmTypes'
import {
  type ProdutoCesta,
  type FornecedorMotor,
  type FornecedorPriceList,
  type MotorCombinacaoResponse,
  type MotorCombinacaoWithSupplierNames
} from '../types/quotationTypes'

export async function getSuppliersFromPriceList(
  prices: any[],
  cart: ProdutoCesta[]
): Promise<FornecedorMotor[] | null> {
  const supplierList = prices.map(
    (item: any) => item.supplier
  ) as FornecedorPriceList[]

  const result = await fornecedoresCotacaoPremium(supplierList, cart)

  return result
}

export async function fornecedoresCotacaoPremium(
  fornecedores: FornecedorPriceList[],
  produtosCesta: ProdutoCesta[]
): Promise<FornecedorMotor[] | null> {
  if (fornecedores.length === 0) {
    return null
  }

  const fornecedoresCotacao: FornecedorMotor[] = []
  for (const item of fornecedores) {
    if (!isOpen(item)) {
      continue
    }
    const produtosComPrecoFornecedor = produtosCesta.map((prodCesta) => {
      const produto = item.discount.product.find((p) => p.sku === prodCesta.id)
      return {
        price: produto?.priceUnique,
        productId: produto?.sku
      }
    })

    fornecedoresCotacao.push({
      id: item.externalId,
      products: produtosComPrecoFornecedor,
      discounts: [],
      minValue: item.minimumOrder
    })
  }

  return fornecedoresCotacao
}

export function addSupplierNames(
  motorResponse: MotorCombinacaoResponse,
  supplierList: any[]
): MotorCombinacaoWithSupplierNames {
  return {
    ...motorResponse,
    supplier: motorResponse.supplier.map((sup) => ({
      ...sup,
      name:
        supplierList.find((s) => s.supplier.externalId === sup.id)?.supplier
          .name ?? 'Nome não encontrado'
    }))
  }
}

function isOpen(supplier: Supplier): boolean {
  const currentDate = DateTime.now().setZone('America/Sao_Paulo')
  const currentHour = Number(
    `${
      currentDate.hour.toString().length < 2
        ? `0${currentDate.hour}`
        : currentDate.hour
    }${
      currentDate.minute.toString().length < 2
        ? `0${currentDate.minute}`
        : currentDate.minute
    }${
      currentDate.second.toString().length < 2
        ? `0${currentDate.second}`
        : currentDate.second
    }`
  )

  return Number(supplier.hour.replaceAll(':', '')) > currentHour
}
