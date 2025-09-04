import * as slackUtils from '../../utils/slackUtils'
import { type WebClient } from '@slack/web-api'
import { logRegister } from '../../utils/logUtils'

jest.mock('@slack/web-api', () => {
  return {
    WebClient: jest.fn(),
    LogLevel: {
      DEBUG: 'DEBUG'
    }
  }
})

jest.mock('dotenv/config', () => ({}))

jest.mock('../../utils/logUtils', () => ({
  logRegister: jest.fn()
}))

const mockEnv = {
  SLACK_TOKEN: 'mock-token',
  SLACK_BUGS_AND_ERROS_CHANNELID: 'mock-channel-id',
  BANK_CLIENT: 'Itaú'
}

describe('Slack Utils', () => {
  let originalEnv: NodeJS.ProcessEnv
  let mockPostMessage: jest.Mock

  beforeAll(() => {
    originalEnv = { ...process.env }
    process.env = { ...process.env, ...mockEnv }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockPostMessage = jest.fn().mockResolvedValue({ ok: true })

    const mockClient = {
      chat: {
        postMessage: mockPostMessage
      }
    } as unknown as WebClient

    jest.spyOn(slackUtils, 'createSlackClient').mockReturnValue(mockClient)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('sendMessage', () => {
    it('deve enviar mensagem com sucesso', async () => {
      await slackUtils.sendMessage('Test message')

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: 'mock-channel-id',
        text: 'Test message'
      })
    })

    it('deve lidar com erro ao enviar mensagem', async () => {
      const mockError = new Error('Slack API error')
      mockPostMessage.mockRejectedValue(mockError)

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      await slackUtils.sendMessage('Test message')

      expect(mockPostMessage).toHaveBeenCalled()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Falha ao enviar mensagem para o slack: ',
        mockError
      )
      expect(logRegister).toHaveBeenCalledWith(mockError, false)

      consoleErrorSpy.mockRestore()
    })

    it('deve lidar com channelID vazio', async () => {
      const originalChannelId = process.env.SLACK_BUGS_AND_ERROS_CHANNELID
      process.env.SLACK_BUGS_AND_ERROS_CHANNELID = ''

      await slackUtils.sendMessage('Test message')

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: '',
        text: 'Test message'
      })

      process.env.SLACK_BUGS_AND_ERROS_CHANNELID = originalChannelId
    })
  })

  describe('receiptErrorMessage', () => {
    it('deve formatar mensagem corretamente para erro de recibo', async () => {
      await slackUtils.receiptErrorMessage('67890')

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: 'mock-channel-id',
        text: '@canal Erro na geração do recibo do cliente 67890.'
      })
    })
  })

  describe('airtableOrderErrorMessage', () => {
    it('deve formatar mensagem corretamente para erro do Airtable', async () => {
      const orderId = 'ORDER-123'
      const orderText = 'Erro de conexão com a API'

      await slackUtils.airtableOrderErrorMessage(orderId, orderText)

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: 'mock-channel-id',
        text: expect.stringContaining('Erro ao criar o pedido no Airtable')
      })
    })

    it('deve lidar com texto longo corretamente', async () => {
      const longText = 'a'.repeat(100)

      await slackUtils.airtableOrderErrorMessage('ORDER-123', longText)

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: 'mock-channel-id',
        text: expect.stringContaining(longText)
      })
    })
  })
})
