export enum AcaoNaFalhaEnum {
  IGNORAR = 'ignorar',
  INDISPONIVEL = 'indisponivel'
}

export enum TipoProdutoEnum {
  FIXAR = 'fixar',
  REMOVER = 'remover'
}

export enum TipoFornecedorEnum {
  QUALQUER = 'qualquer',
  ESPECIFICO = 'especifico'
}

export interface ProdutoPreferencia {
  produto_sku: string
  classe: string
  fornecedores: string[]
  acao_na_falha: AcaoNaFalhaEnum
}

export interface PreferenciaProduto {
  ordem: number
  tipo: TipoProdutoEnum
  produtos: ProdutoPreferencia[]
}

export interface CombinacaoInput {
  restaurant_id: string
  nome: string
  bloquear_fornecedores?: boolean
  dividir_em_maximo: number
  preferencia_fornecedor_tipo?: TipoFornecedorEnum
  fornecedores_bloqueados?: string[]
  fornecedores_especificos?: string[]
  definir_preferencia_produto: boolean
  preferencias?: PreferenciaProduto[]
  preferencias_hard?: boolean
}
