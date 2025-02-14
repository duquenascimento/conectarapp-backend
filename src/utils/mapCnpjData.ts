export const mapCnpjData = (data: any): any => {
  console.log('data CHECK CNPJ', data)
  try {
    if (!data?.cnpj || !data.razao) {
      console.error('Dados insuficientes para mapear o CNPJ:', data)
      return {
        status: 500,
        msg: 'Erro interno ao processar os dados do CNPJ.'
      }
    }

    const {
      cnpj,
      razao,
      fantasia,
      capitalSocial,
      inicioAtividade,
      email,
      matrizEndereco,
      telefones,
      fax,
      situacao,
      naturezaJuridica,
      cnae,
      porte,
      socios,
      simplesNacional,
      complementares
    } = data

    // Mapeia as Inscrições Estaduais do pacote 16 (H)
    const inscricoesEstaduais = complementares?.inscricoesEstaduais || []

    // Define um valor padrão para o QSA caso ele não esteja presente
    const qsa = socios || [
      {
        pais: null,
        nome_socio: '',
        codigo_pais: null,
        faixa_etaria: '',
        cnpj_cpf_do_socio: '',
        qualificacao_socio: 'Sócio-inistrador',
        codigo_faixa_etaria: null,
        data_entrada_sociedade: '',
        identificador_de_socio: null,
        cpf_representante_legal: '',
        nome_representante_legal: '',
        codigo_qualificacao_socio: null,
        qualificacao_representante_legal: 'Não informada',
        codigo_qualificacao_representante_legal: 0
      }
    ]

    return {
      status: 200,
      data: {
        cnpj: cnpj.replace(/\D/g, ''),
        razao_social: razao,
        nome_fantasia: fantasia,
        capital_social: capitalSocial || 0,
        data_inicio_atividade: inicioAtividade || null,
        email: email || null,
        cep: matrizEndereco.cep.replace(/\D/g, ''),
        logradouro: matrizEndereco.logradouro || '',
        numero: matrizEndereco.numero || null,
        complemento: matrizEndereco.complemento || null,
        bairro: matrizEndereco.bairro || '',
        municipio: matrizEndereco.cidade || '',
        uf: matrizEndereco.uf || '',
        ddd_telefone_1: telefones[0] ? `${telefones[0].ddd} ${telefones[0].numero}` : null,
        ddd_telefone_2: telefones[1] ? `${telefones[1].ddd} ${telefones[1].numero}` : null,
        ddd_fax: fax ? `${fax.ddd} ${fax.numero}` : null,
        cnae_fiscal: cnae?.fiscal || 0,
        cnae_fiscal_descricao: cnae?.descricao || '',
        natureza_juridica: naturezaJuridica?.descricao || '',
        porte: porte?.descricao || 'DEMAIS',
        qsa,
        situacao_cadastral: situacao?.id || 0,
        descricao_situacao_cadastral: situacao?.nome || '',
        opcao_pelo_simples: simplesNacional?.optante || null,
        data_opcao_pelo_simples: simplesNacional?.inicio || null,
        data_exclusao_do_simples: simplesNacional?.fim || null,
        inscricoes_estaduais: inscricoesEstaduais.map((inscricao: any) => ({
          inscricao_estadual: inscricao.inscricao_estadual || '',
          ativo: inscricao.ativo || false,
          estado: inscricao.estado?.sigla || ''
        }))
      }
    }
  } catch (error) {
    console.error('Erro ao mapear os dados do CNPJ:', error)
    return {
      status: 500,
      msg: 'Erro interno ao processar os dados do CNPJ.'
    }
  }
}
