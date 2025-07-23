import { type FastifyInstance } from 'fastify'
import { listClassesProduto } from '../service/classeProdutoService'

export const classeProdutoRoute = async (server: FastifyInstance): Promise<void> => {
  server.get('/classes-produto', async (req, res): Promise<any> => {
    try {
      const result = await listClassesProduto()

      return await res.status(200).send({
        status: 200,
        data: result
      })
    } catch (err) {
      const message = (err as Error).message
      await res.status(500).send({
        status: 500,
        msg: message
      })
    }
  })
}
