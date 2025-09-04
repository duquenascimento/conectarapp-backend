import { WebClient, LogLevel } from '@slack/web-api'
import 'dotenv/config'
import { logRegister } from './logUtils'

interface BolecodeAndPixErrorMessage {
  externalId: string
  paymentWay: string
  finalValue: number
}

const client = new WebClient(process.env.SLACK_TOKEN, {
  logLevel: LogLevel.DEBUG
})

const sendMessage = async (msg: string): Promise<void> => {
  try {
    await client.chat.postMessage({
      channel: process.env.SLACK_BUGS_AND_ERROS_CHANNELID ?? '',
      text: msg ?? ''
    })
  } catch (err) {
    void logRegister(err)
  }
}

export const bolecodeAndPixErrorMessage = async (
  body: BolecodeAndPixErrorMessage
): Promise<void> => {
  await sendMessage(
    `@canal Erro na geração da cobrança do cliente ${
      body.externalId
    }, utilizando o banco ${process.env.BANK_CLIENT}, com o tipo de pagamento ${
      body.paymentWay
    } no valor de R$${body.finalValue.toString().replace('.', ',')}.`
  )
}

export const receiptErrorMessage = async (
  externalId: string
): Promise<void> => {
  await sendMessage(
    `@canal Erro na geração do recibo do cliente ${externalId}.`
  )
}

export const airtableOrderErrorMessage = async (
  orderId: string,
  orderText: string
) => {
  await sendMessage(`@canal Erro ao criar o pedido no Airtable: 
    *************** OrderId: ${orderId} *****************
    
    ${orderText}
    ****************************************************`)
}
