import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { logRecord } from '../utils/log-utility'

const prisma = new PrismaClient()

export interface Company {
  cnpj: string
  identificador_matriz_filial: number
  descricao_matriz_filial: string
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: number
  descricao_situacao_cadastral: string
  data_situacao_cadastral: Date
  motivo_situacao_cadastral: number
  nome_cidade_exterior?: string
  codigo_natureza_juridica: number
  data_inicio_atividade: Date
  cnae_fiscal: number
  cnae_fiscal_descricao: string
  descricao_tipo_de_logradouro: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cep: string
  uf: string
  codigo_municipio: number
  municipio: string
  ddd_telefone_1?: string
  ddd_telefone_2?: string
  ddd_fax?: string
  qualificacao_do_responsavel: number
  capital_social: number
  porte: number
  descricao_porte: string
  opcao_pelo_simples: boolean
  data_opcao_pelo_simples?: Date
  data_exclusao_do_simples?: Date
  opcao_pelo_mei: boolean
  situacao_especial?: string
  data_situacao_especial?: Date
}

export const createCompany = async (data: Company): Promise<any> => {
  const dataForCreate = {
    data: {
      cnpj: data.cnpj,
      identificador_matriz_filial: data.identificador_matriz_filial,
      descricao_matriz_filial: data.descricao_matriz_filial,
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia,
      situacao_cadastral: data.situacao_cadastral,
      descricao_situacao_cadastral: data.descricao_situacao_cadastral,
      data_situacao_cadastral: new Date(data.data_situacao_cadastral),
      motivo_situacao_cadastral: data.motivo_situacao_cadastral,
      nome_cidade_exterior: data.nome_cidade_exterior,
      codigo_natureza_juridica: data.codigo_natureza_juridica,
      data_inicio_atividade: new Date(data.data_inicio_atividade),
      cnae_fiscal: data.cnae_fiscal,
      cnae_fiscal_descricao: data.cnae_fiscal_descricao,
      descricao_tipo_de_logradouro: data.descricao_tipo_de_logradouro,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      bairro: data.bairro,
      cep: data.cep,
      uf: data.uf,
      codigo_municipio: data.codigo_municipio,
      municipio: data.municipio,
      ddd_telefone_1: data.ddd_telefone_1,
      ddd_telefone_2: data.ddd_telefone_2,
      ddd_fax: data.ddd_fax,
      qualificacao_do_responsavel: data.qualificacao_do_responsavel,
      capital_social: data.capital_social,
      porte: data.porte,
      descricao_porte: data.descricao_porte,
      opcao_pelo_simples: data.opcao_pelo_simples,
      data_opcao_pelo_simples: data.data_opcao_pelo_simples
        ? new Date(data.data_opcao_pelo_simples)
        : null,
      data_exclusao_do_simples: data.data_exclusao_do_simples
        ? new Date(data.data_exclusao_do_simples)
        : null,
      opcao_pelo_mei: data.opcao_pelo_mei,
      situacao_especial: data.situacao_especial,
      data_situacao_especial: data.data_situacao_especial
        ? new Date(data.data_situacao_especial)
        : null
    }
  }
  await logRecord({
    level: 'info',
    message: 'Dados para registro de Empresa',
    data: dataForCreate,
    location: 'companyRepository.createCompany'
  })

  try {
    const company = await prisma.companies.create(dataForCreate)
    return company
  } catch (error) {
    await logRecord({
      level: 'error',
      message: 'Erro ao criar empresa',
      data: error,
      location: 'companyRepository.createCompany'
    })
    throw new Error('Failed to create company')
  }
}
