function normalizePhone(phone: string): string {
  const phoneNumber = phone.replace(/\D/g, '')
  const DDI = '55'
  const ddd = phoneNumber.slice(0, 2)
  const numero = phoneNumber.slice(3)
  return DDI + ddd + numero
}

export const sendWhatsAppMessageChatGuru = async (phone: string, nomeContato: string): Promise<any> => {
  try {
    const phoneNumber = normalizePhone(phone)
    const messageText = 'Olá! Notamos que você deixou itens no carrinho. Posso ajudar com algo?'
    const encodedMessage = encodeURIComponent(messageText).replace('!', '%21').replace("'", '%27').replace('(', '%28').replace(')', '%29').replace('*', '%2A')

    const params = new URLSearchParams({
      key: process.env.CG_API_KEY!,
      account_id: process.env.CG_ACCOUNT_ID!,
      phone_id: process.env.CG_PHONE_ID!,
      chat_number: phoneNumber,
      action: 'message_send',
      name: nomeContato,
      text: encodedMessage
    })

    const response = await fetch('https://s16.chatguru.app/api/v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    })

    const responseText = await response.text()
    return responseText
  } catch (err: any) {
    console.error('Erro ao enviar mensagem para ChatGuru:', err)
    throw err
  }
}
