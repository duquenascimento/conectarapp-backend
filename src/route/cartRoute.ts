// cartRoute.ts
import { type FastifyInstance } from 'fastify'
import { type ICartList, listCart, type ICartAddRequestArray, listCartComplete, addService, deleteCartByUser, type ICartDeleteItem, deleteItem } from '../service/cartService'

export const cartRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/cart/add', async (req, res): Promise<any> => {
    try {
      // Adiciona a requisição na fila
      await addService(req.body as ICartAddRequestArray)
      return await res.status(201).send({
        status: 200
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        await res.status(400).send({
          status: 400,
          msg: message
        })
      }
    }
  })

  server.post('/cart/list', async (req, res): Promise<any> => {
    try {
      // Adiciona a requisição na fila
      const result = await listCart(req.body as ICartList)
      return await res.status(201).send({
        status: 200,
        data: result
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        await res.status(400).send({
          status: 400,
          msg: message
        })
      }
    }
  })

  server.post('/cart/full-list', async (req, res): Promise<any> => {
    try {
      // Adiciona a requisição na fila
      const result = await listCartComplete(req.body as ICartList)
      return await res.status(201).send({
        status: 200,
        data: result
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        await res.status(400).send({
          status: 400,
          msg: message
        })
      }
    }
  })

  server.post('/cart/delete-by-id', async (req, res): Promise<any> => {
    try {
      // Adiciona a requisição na fila
      await deleteCartByUser(req.body as ICartList)
      return await res.status(201).send({
        status: 200
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        await res.status(400).send({
          status: 400,
          msg: message
        })
      }
    }
  })

  server.post('/cart/delete-item', async (req, res): Promise<any> => {
    try {
      // Adiciona a requisição na fila
      await deleteItem(req.body as ICartDeleteItem)
      return await res.status(201).send({
        status: 200
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        await res.status(400).send({
          status: 400,
          msg: message
        })
      }
    }
  })
}
