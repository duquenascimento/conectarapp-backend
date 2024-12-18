import { createCompany, type Company } from '../repository/companyRepository' // Importa a função e a interface
import axios from 'axios'
import dotenv from 'dotenv'
import { validateDocument } from '../utils/validateDocument'

dotenv.config()

const API_TOKEN_CPFCNPJ = process.env.API_TOKEN_CPFCNPJ
const API_URL_CPFCNPJ = process.env.API_URL_CPFCNPJ

const formatDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split('/')
  return new Date(`${year}-${month}-${day}`)
}

const mapCNPJDataToCompany = (data: any): Company => {
  return {
    cnpj: data.cnpj.replace(/\D/g, ''), 
    identificador_matriz_filial: data.matrizfilial.id,
    descricao_matriz_filial: data.matrizfilial.tipo,
    razao_social: data.razao,
    nome_fantasia: data.fantasia,
    situacao_cadastral: data.situacao.id,
    descricao_situacao_cadastral: data.situacao.nome,
    data_situacao_cadastral: formatDate(data.situacao.data),
    motivo_situacao_cadastral: data.situacao.motivo.id,
    nome_cidade_exterior: undefined,
    codigo_natureza_juridica: parseInt(data.naturezaJuridica.codigo, 10),
    data_inicio_atividade: formatDate(data.inicioAtividade),
    cnae_fiscal: parseInt(data.cnae.fiscal, 10),
    cnae_fiscal_descricao: data.cnae.descricao,
    descricao_tipo_de_logradouro: data.matrizEndereco.tipo,
    logradouro: data.matrizEndereco.logradouro,
    numero: data.matrizEndereco.numero,
    complemento: data.matrizEndereco.complemento,
    bairro: data.matrizEndereco.bairro,
    cep: data.matrizEndereco.cep.replace(/\D/g, ''),
    uf: data.matrizEndereco.uf,
    codigo_municipio: data.ibge.cidade.ibge_id,
    municipio: data.matrizEndereco.cidade,
    ddd_telefone_1: data.telefones[0]?.ddd,
    ddd_telefone_2: data.telefones[1]?.ddd,
    ddd_fax: data.fax?.ddd,
    qualificacao_do_responsavel: data.responsavelQualificacao.id,
    capital_social: data.capitalSocial,
    porte: parseInt(data.porte.id, 10),
    descricao_porte: data.porte.descricao,
    opcao_pelo_simples: data.simplesNacional.optante === 'Sim',
    data_opcao_pelo_simples: data.simplesNacional.inicio ? formatDate(data.simplesNacional.inicio) : undefined, // Corrigido: usa a função formatDate
    data_exclusao_do_simples: data.simplesNacional.fim ? formatDate(data.simplesNacional.fim) : undefined, // Corrigido: usa a função formatDate
    opcao_pelo_mei: false,
    situacao_especial: undefined,
    data_situacao_especial: undefined
  }
}

const saveCompanyData = async (data: any): Promise<void> => {
  try {
    const companyData: Company = mapCNPJDataToCompany(data)
    await createCompany(companyData)
  } catch (error) {
    console.error('Erro ao salvar dados da empresa no banco de dados.')
  }
}

export const fetchCNPJData = async (cnpj: string): Promise<any> => {
  if (!validateDocument(cnpj)) {
    throw new Error('CNPJ inválido.')
  }

  try {
    // Pacote D
    const responseD = await axios.get(`${API_URL_CPFCNPJ}/${API_TOKEN_CPFCNPJ}/6/${cnpj}/0`)

    // Pacote H
    const responseH = await axios.get(`${API_URL_CPFCNPJ}/${API_TOKEN_CPFCNPJ}/16/${cnpj}/0`)

    const combinedData = {
      ...responseD.data,
      complementares: responseH.data,
      socios: responseD.data.socios
    }

    await saveCompanyData(combinedData)

    return combinedData
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro ao buscar dados do CNPJ:', error.response?.data)
      throw new Error(`Erro na requisição: ${error.response?.data.message}`)
    } else {
      console.error('Erro inesperado:', error)
      throw new Error('Erro inesperado ao buscar dados do CNPJ.')
    }
  }
}
