import { type FastifyInstance } from 'fastify'
import { getCombination } from '../service/combinationService'
import { type CombinacaoAPI, postCombinacaoCotacao, cestaProdutos } from '../service/QuotationEngine'
import { findById } from '../service/restaurantService'

export const quotationEngineRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/getQuotation/:restaurantId', async (req, res) => {
    try {
      const { restaurantId } = req.params as { restaurantId: string }
      const carrinho = await cestaProdutos(restaurantId)
      const { cesta, cart } = carrinho

      const cestaCarrinho = cesta.map((item, idx) => ({
        sku: item.data.sku,
        quantidade: cart?.[idx]?.amount ? Number(cart[idx].amount) : 0,
        classe: item.data.classe,
        valorPorUnid: item.data.valorPorUnid
      }))

      const restaurant = await findById(restaurantId)
      if (!restaurant) {
        throw new Error('Nenhum restaurante encontrado')
      }

      const tax = restaurant.tax.d
      const taxa = Number(`${tax[0]}.${String(tax[1]).slice(0, 2)}`) / 100

      if (!restaurantId || !Array.isArray(cestaCarrinho) || typeof taxa !== 'number') {
        return await res.status(400).send({ status: 400, msg: 'Parâmetros inválidos' })
      }

      const combinacoes = (await getCombination(restaurantId)) as CombinacaoAPI[]

      // console.log('>>>>>>>', combinacoes)
      // console.log('>>>>>>>', cestaCarrinho)
      // console.log('>>>>>>>', taxa)
      const result = await postCombinacaoCotacao(combinacoes, cestaCarrinho, taxa)

      return await res.status(200).send({
        status: 200,
        return: result
      })
    } catch (err) {
      console.log('erro', err)
      const message = (err as Error).message
      const status = message === process.env.INTERNAL_ERROR_MSG ? 500 : 400
      return await res.status(status).send({ status, msg: message })
    }
  })
}
