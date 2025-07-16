const apiMotorCotacaoUrl = process.env.API_MOTOR_COTACAO

export const postCombinacaoCotacao = async (): Promise<any> => {
  if (!apiMotorCotacaoUrl) {
    throw new Error('Erro ao encontrar variável do motor de cotação')
  }
  const apiMotorCotacao = new ApiRepository(apiMotorCotacaoUrl)
  
  const body = {
    fornecedores: [
      {
        id: '', // ou null, se a API aceitar
        produtos: [
          {
            valorPorUnid: 0,
            sku: '',
            quantidade: 0,
            classe: ''
          }
        ],
        descontos: {
          0: 0
        },
        pedidoMinimo: 0
      }
    ],
    fornecedoresBloqueados: [],
    preferenciasProduto: [],
    preferenciasClasse: [],
    preferenciasHard: false,
    cesta: [
      {
        sku: '',
        quantidade: 0,
        classe: ''
      }
    ],
    taxa: 0
  }
  const result = await apiMotorCotacao.callApi('bestPrice', 'POST', JSON.stringify(body))
  return result
}