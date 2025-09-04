import { DateTime } from 'luxon'
import path from 'path'
import { logRegister } from '../../utils/logUtils'
import { appendFile } from 'fs/promises'

jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn()
}))
jest.mock('fs/promises', () => ({
  appendFile: jest.fn()
}))
jest.mock('luxon', () => {
  const original = jest.requireActual('luxon')
  return {
    ...original,
    DateTime: {
      now: jest.fn(() => ({
        toFormat: jest.fn(() => '2025-09-04'),
        setZone: jest.fn().mockReturnThis()
      }))
    }
  }
})

describe('logRegister', () => {
  const logPath = 'logs'
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('deve logar erro e relançar (default)', async () => {
    const err = new Error('Teste falhou')

    await expect(logRegister(err)).rejects.toThrow('Teste falhou')

    expect(appendFile).toHaveBeenCalledWith(
      expect.stringContaining(
        path.join(process.cwd(), 'logs', '2025-09-04.log')
      ),
      expect.stringContaining('Teste falhou')
    )
  })

  it('deve logar erro sem relançar quando rethrow = false', async () => {
    const err = new Error('Falha silenciosa')

    await expect(logRegister(err, false)).resolves.toBeUndefined()

    expect(appendFile).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Falha silenciosa')
    )
  })

  it('deve lidar com erros dentro do próprio logger (ex: falha ao salvar)', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    ;(appendFile as jest.Mock).mockRejectedValueOnce(
      new Error('FS indisponível')
    )

    const err = new Error('Erro original')
    await expect(logRegister(err, false)).resolves.toBeUndefined()

    expect(appendFile).toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error logging the message:',
      expect.any(Error)
    )
    consoleErrorSpy.mockRestore()
  })

  it('deve tratar erro que não seja instancia de Error', async () => {
    await expect(logRegister('erro simples', false)).resolves.toBeUndefined()
  })

  it('deve usar INTERNAL_ERROR_MSG se a env estiver definida', async () => {
    process.env.INTERNAL_ERROR_MSG = 'Mensagem customizada'
    await expect(logRegister(new Error('qualquer'), true)).rejects.toThrow(
      'Mensagem customizada'
    )
    delete process.env.INTERNAL_ERROR_MSG
  })
})
