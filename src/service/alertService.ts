import { findCartItens } from '../repository/cartRepository';
import { findById } from '../repository/userRepository';
import { sendWhatsAppMessageChatGuru } from '../utils/sendWhatsappMessage';
import { cartAbandonedSlackAlert, orderMissingItemsMessage } from '../utils/slackUtils';

export const checkCartAndAlert = async (
  restaurantId: string,
  externalId: string,
  restaurantName: string,
  userId: string,
) => {
  if (!restaurantId) throw new Error('restaurantId é obrigatório');

  const cart = await findCartItens(userId[0]);
  const user = await findById(userId[0]);

  if (!user) return { success: false, msg: 'Usuário não encontrado' };
  if (!user.phone) return { success: false, msg: 'Usuário sem telefone' };
  if (!user.name) return { success: false, msg: 'Usuário sem nome' };

  if (cart.length > 0) {
    await cartAbandonedSlackAlert(externalId, restaurantName);
    await sendWhatsAppMessageChatGuru(user.phone, user.name);

    return { success: true, msg: 'Itens do carrinho encontrados, alerta enviado' };
  }

  return { success: true, msg: 'Itens não encontrados, alerta não enviado' };
};

export const checkMissingItems = async (
  externalId: string,
  restaurantName: string,
  orderId: string,
  missingItems?: string[] | string,
) => {
  if (missingItems && (Array.isArray(missingItems) ? missingItems.length > 0 : missingItems)) {
    await orderMissingItemsMessage(externalId, restaurantName, orderId, missingItems);

    return { success: true, msg: 'Pedido com itens faltantes, alerta enviado' };
  }

  return { success: false, msg: 'Nenhum dado para processar' };
};
