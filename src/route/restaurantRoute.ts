import { type FastifyInstance } from 'fastify'
import { AddClientCount, listRestaurantsByUserId, updateAddressService, updateAllowCloseSupplierAndMinimumOrder, updateComercialBlock, updateFinanceBlock, updateRestaurant, updateAddressByExternalId, patchRestaurant } from '../service/restaurantService'
import { type address, type restaurant } from '@prisma/client'
import restaurantUpdateSchema, { restaurantPatchSchema } from '../validators/restaurantValidator'
import addressUpdateSchema from '../validators/addrestValidator'

export const restaurantRoute = async (server: FastifyInstance): Promise<void> => {
  server.post('/restaurant/list', async (req, res): Promise<any> => {
    try {
      const result = await listRestaurantsByUserId(req.body as { token: string })
      if (result == null) throw Error(process.env.INTERNAL_ERROR_MSG)
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.post('/address/update', async (req, res): Promise<void> => {
    try {
      await updateAddressService(req.body as { rest: any })
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.post('/rest/updateComercialBlock', async (req, res): Promise<void> => {
    try {
      await updateComercialBlock(req.body as { restId: string, value: boolean })
      return await res.status(200).send({
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.post('/rest/updateFinanceBlock', async (req, res): Promise<void> => {
    try {
      await updateFinanceBlock(req.body as { restId: string, value: boolean })
      return await res.status(200).send({
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.post('/rest/addClientCount', async (req, res): Promise<void> => {
    try {
      await AddClientCount(req.body as { count: number, value: boolean })
      return await res.status(200).send({
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.put('/rest/updateAllowCloseSupplierAndMinimumOrder', async (req, res): Promise<void> => {
    try {
      await updateAllowCloseSupplierAndMinimumOrder(req.body as Pick<restaurant, 'allowClosedSupplier' | 'allowMinimumOrder' | 'externalId'>)
      return await res.status(200).send({
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
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.put('/rest/updateRestaurant', async (req, res): Promise<void> => {
    try {
      const { error } = restaurantUpdateSchema.validate(req.body)
      if (error) {
        return await res.status(422).send({ error: error.details[0].message })
      }
      const { externalId, ...restaurantData } = req.body as {
        externalId: string
        [key: string]: any
      }

      await updateRestaurant(externalId, restaurantData)
      return await res.status(200).send({
        status: 200,
        msg: 'Restaurante atualizado com sucesso.'
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.put('/rest/updateAddressByExternalId', async (req, res): Promise<void> => {
    try {
      const { error } = addressUpdateSchema.validate(req.body)
      if (error) {
        return await res.status(422).send({ error: error.details[0].message })
      }
      const { externalId, ...addressData } = req.body as {
        externalId: string
        [key: string]: any
      }

      await updateAddressByExternalId(externalId, addressData)
      return await res.status(200).send({
        status: 200,
        msg: 'Endereço atualizado com sucesso.'
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })

  server.patch('/restaurants', async (req, res) => {
    try {
      // Log: Início da requisição
      console.log('[DEBUG] Requisição recebida para atualizar restaurante:', req.body)

      // Validação do corpo da requisição
      const { error } = restaurantPatchSchema.validate(req.body)
      if (error) {
        console.error('[ERROR] Erro de validação:', error.details[0].message)
        return await res.status(422).send({ error: error.details[0].message })
      }

      // Extração dos dados do corpo da requisição
      const { externalId, ...restaurantData } = req.body as {
        externalId: string
        [key: string]: any
      }

      // Log: Dados extraídos
      console.log('[DEBUG] External ID:', externalId)
      console.log('[DEBUG] Dados a serem atualizados:', restaurantData)

      // Atualização dos dados do restaurante
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const response = await patchRestaurant(externalId, restaurantData)
      console.log('>>>>>>>>>dados recebidos', response)

      // Log: Atualização bem-sucedida
      console.log('[DEBUG] Restaurante atualizado com sucesso.')

      // Resposta de sucesso
      return await res.status(200).send({
        status: 200,
        msg: 'Restaurante atualizado com sucesso.'
      })
    } catch (err) {
      // Log: Captura de erro geral
      console.error('[ERROR] Erro ao processar a requisição:', err)

      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        // Log: Erro interno do servidor
        console.error('[ERROR] Erro interno do servidor:', message)
        return await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        // Log: Recurso não encontrado ou outro erro
        console.error('[ERROR] Recurso não encontrado ou erro desconhecido:', message)
        return await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })
}
