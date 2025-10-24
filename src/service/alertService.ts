import { findCartItens } from '../repository/cartRepository'
import { findById } from '../repository/userRepository'
import { sendWhatsAppMessageChatGuru } from '../utils/sendWhatsappMessage'
import { cartAbandonedSlackAlert } from '../utils/slackUtils'

export const checkCartAndAlert = async (restaurantId: string, externalId: string, restaurantName: string, userId: string) => {
  if (!restaurantId) throw new Error('restaurantId é obrigatório')

  const cart = await findCartItens(userId[0])
  const user = await findById(userId[0])

  if (!user) return { success: false, msg: 'Usuário não encontrado' }
  if (!user.phone) return { success: false, msg: 'Usuário sem telefone' }
  if (!user.name) return { success: false, msg: 'Usuário sem nome' }

  if (cart.length > 0) {
    await cartAbandonedSlackAlert(externalId, restaurantName)
    await sendWhatsAppMessageChatGuru(user.phone, user.name)

    return { success: true, msg: 'Itens do carrinho encontrados, alerta enviado' }
  }

  return { success: true, msg: 'Itens não encontrados, alerta não enviado' }
}
