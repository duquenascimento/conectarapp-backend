import { WebClient, LogLevel } from '@slack/web-api';
import 'dotenv/config';
import { logRegister } from './logUtils';

interface BolecodeAndPixErrorMessage {
  externalId: string;
  paymentWay: string;
  finalValue: number;
}

export const createSlackClient = (): WebClient => {
  return new WebClient(process.env.SLACK_TOKEN, {
    logLevel: LogLevel.DEBUG,
  });
};

export const sendMessage = async (msg: string): Promise<void> => {
  const client = createSlackClient();
  try {
    await client.chat.postMessage({
      channel: process.env.SLACK_ORDER_WITH_ERRORS_CHANNELID ?? '',
      text: msg ?? '',
    });
  } catch (err) {
    console.error('Falha ao enviar mensagem para o slack: ', err);
    void logRegister(err, false);
  }
};

export const bolecodeAndPixErrorMessage = async (
  body: BolecodeAndPixErrorMessage,
): Promise<void> => {
  await sendMessage(
    `@canal Erro na geração da cobrança do cliente ${body.externalId}, utilizando o banco ${process.env.BANK_CLIENT}, com o tipo de pagamento ${body.paymentWay} no valor de R$${body.finalValue.toString().replace('.', ',')}.`,
  );
};

export const receiptErrorMessage = async (externalId: string): Promise<void> => {
  await sendMessage(`@canal Erro na geração do recibo do cliente ${externalId}.`);
};

export const airtableOrderErrorMessage = async (orderId: string, orderText: string) => {
  await sendMessage(`@canal Erro ao criar o pedido no Airtable: 
    *************** OrderId: ${orderId} *****************
    
    ${orderText}
    ****************************************************`);
};
export const cartAbandonedSlackAlert = async (externalId: string, name: string) => {
  await sendMessage(`@canal Pedido não finalizado pelo cliente há 30 minutos!
    
    Restaurante: ${externalId} - ${name}
    ****************************************************`);
};

export const orderMissingItemsMessage = async (
  externalId: string,
  name: string,
  orderId: string,
  missingItems: string[] | string,
) => {
  const itemsArray = Array.isArray(missingItems) ? missingItems : [missingItems];
  const formattedItems = itemsArray.map((item) => `• ${item}`).join('\n');
  await sendMessage(`Pedido "${orderId}", finalizado com itens faltantes!
    
    Restaurante: ${externalId} - ${name}

    Itens faltantes: 
${formattedItems}
  ****************************************************`);
};
