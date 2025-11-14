/**
 * Função para validar CPF ou CNPJ
 * @param document - CPF ou CNPJ no formato numérico (apenas números)
 * @returns {boolean} - Retorna `true` se o documento for válido, caso contrário `false`
 */
export const validateDocument = (document: string): boolean => {
  const cleanDocument = document.replace(/\D/g, '') // Remove caracteres não numéricos

  if (cleanDocument.length === 11) {
    return validateCPF(cleanDocument)
  } else if (cleanDocument.length === 14) {
    return validateCNPJ(cleanDocument)
  } else {
    return false
  }
}

/**
   * Função para validar CPF
   * @param cpf - CPF no formato numérico (11 dígitos)
   * @returns {boolean} - Retorna `true` se o CPF for válido, caso contrário `false`
   */
const validateCPF = (cpf: string): boolean => {
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0

  if (digit !== parseInt(cpf.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0

  if (digit !== parseInt(cpf.charAt(10))) return false

  return true
}

/**
   * Função para validar CNPJ
   * @param cnpj - CNPJ no formato numérico (14 dígitos)
   * @returns {boolean} - Retorna `true` se o CNPJ for válido, caso contrário `false`
   */
const validateCNPJ = (cnpj: string): boolean => {
  if (cnpj.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  const weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights[i]
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0

  if (digit !== parseInt(cnpj.charAt(12))) return false

  sum = 0
  weights.unshift(6)
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights[i]
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0

  if (digit !== parseInt(cnpj.charAt(13))) return false

  return true
}
