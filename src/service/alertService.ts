import { findCartItens } from '../repository/cartRepository'
import { findById } from '../repository/userRepository'
import { sendWhatsAppMessageChatGuru } from '../utils/sendWhatsappMessage'
import { cartAbandonedSlackAlert } from '../utils/slackUtils'

export const checkCartAndAlert = async (restaurantId: string, externalId: string, name: string, userId: string) => {
  if (!restaurantId) {
    throw new Error('restaurantId é obrigatório')
  }

  const cart = await findCartItens(restaurantId)
  const user = await findById(userId)
  if (!user?.phone || !user?.name) return

  if (cart) {
    // await cartAbandonedSlackAlert(externalId, name)
    await sendWhatsAppMessageChatGuru(user?.phone, user?.name)
    return { success: true, msg: 'Itens do carrinho encontrados, alerta enviado' }
  }

  return { success: true, msg: 'Itens não encontrados, alerta não enviado' }
}
