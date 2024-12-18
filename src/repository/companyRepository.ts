/*import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCompany = async (data: any) => {
  return prisma.companies.create({
    data: {
      cnpj: data.cnpj,
      identificador_matriz_filial: data.identificador_matriz_filial,
      descricao_matriz_filial: data.descricao_matriz_filial,
      razao_social: data.razao_social,
      nome_fantasia: data.nome_fantasia,
      situacao_cadastral: data.situacao_cadastral,
      descricao_situacao_cadastral: data.descricao_situacao_cadastral,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      data_situacao_cadastral: new Date(data.data_situacao_cadastral),
      motivo_situacao_cadastral: data.motivo_situacao_cadastral,
      nome_cidade_exterior: data.nome_cidade_exterior,
      codigo_natureza_juridica: data.codigo_natureza_juridica,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
      data_opcao_pelo_simples: data.data_opcao_pelo_simples ? new Date(data.data_opcao_pelo_simples) : null,
      data_exclusao_do_simples: data.data_exclusao_do_simples ? new Date(data.data_exclusao_do_simples) : null,
      opcao_pelo_mei: data.opcao_pelo_mei,
      situacao_especial: data.situacao_especial,
      data_situacao_especial: data.data_situacao_especial ? new Date(data.data_situacao_especial) : null,
    }
  })
}*/