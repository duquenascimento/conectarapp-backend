export interface agendamentoPedido {
  token: string
  selectedRestaurant: {
    addressInfos: Array<{
      phoneNumber?: string
    }>
  }
  message: string // Mensagem a ser enviada
  sendDate: string // Data no formato YYYY-MM-DD
  sendTime: string // Horário no formato HH:mm
}
