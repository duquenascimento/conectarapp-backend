import 'dotenv/config'

export const saveFile = async (
  url: string,
  fileName: string
): Promise<string | null> => {
  try {
    // Monta a URL da requisição
    const urlRequest = `https://gateway.conectarhortifruti.com.br/api/v1/system/saveFile?url=${encodeURIComponent(
      url
    )}&fileName=${encodeURIComponent(fileName)}`

    // Configura os headers da requisição
    const myHeaders = new Headers()
    myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a')
    myHeaders.append('external-id', 'F0')
    myHeaders.append('username', 'contato@conectarhortifruti.com.br')
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append(
      'system-user-pass',
      'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo='
    )
    myHeaders.append(
      'Authorization',
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTIwVDAzOjQwOjM3IiwibmJmIjoxNzE3OTkwODM3LCJleHAiOjE3MTg4NTQ4MzcsImlhdCI6MTcxNzk5MDgzNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.RBX5whQIqwtRJOnjTX622qvwCFQJxcgVXQKTyUoVFys'
    )

    // Faz a requisição HTTP
    const response = await fetch(urlRequest, {
      method: 'GET',
      headers: myHeaders
    })

    // Verifica se a requisição foi bem-sucedida
    if (!response.ok) {
      console.error(
        'Erro ao salvar o arquivo:',
        response.status,
        response.statusText
      )
      return null
    }

    // Extrai a resposta JSON
    const responseData = await response.json()

    // Extrai a URL do arquivo salvo
    const savedFileUrl = responseData?.data?.url // Ajuste para acessar o campo correto
    if (!savedFileUrl) {
      console.error('A API não retornou a URL do arquivo salvo.')
      return null
    }

    return savedFileUrl
  } catch (err) {
    console.error('Erro capturado durante o saveFile:', err)
    return null
  }
}

export const generateRandomSequenceObject = (
  length: number = 5
): Record<string, string> => {
  const sequence: Record<string, string> = {}

  for (let i = 1; i <= length; i++) {
    const randomDigit = Math.floor(Math.random() * 10)
    sequence[`c${i}`] = randomDigit.toString()
  }

  return sequence
}

export const formatDecimalNumber = (num: number): string => {
  // Função para formatar o número recebido para um número decimal
  const formatValue = new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatValue.format(num)
}