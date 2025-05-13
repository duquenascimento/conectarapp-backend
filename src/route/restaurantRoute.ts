import { type FastifyInstance } from 'fastify'
import { AddClientCount, listRestaurantsByUserId, updateAddressService, updateAllowCloseSupplierAndMinimumOrder, updateComercialBlock, updateRegistrationReleasedNewApp, updateFinanceBlock, updateRestaurant, updateAddressByExternalId, patchRestaurant } from '../service/restaurantService'
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
      await updateComercialBlock(req.body as { restId: string; value: boolean })
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

  server.post('/rest/updateRegistrationReleasedNewApp', async (req, res): Promise<void> => {
    // Validação dos tipos
    const { error } = restaurantPatchSchema.validate(req.body)
    if (error) {
      console.error('[ERROR] Erro de validação:', error.details[0].message)
      return await res.status(422).send({ error: error.details[0].message })
    }
    try {
      const { externalId, registrationReleasedNewApp } = req.body as { externalId: string; registrationReleasedNewApp: boolean }

      // Certifique-se de que a função espera esses campos
      await updateRegistrationReleasedNewApp({
        restId: externalId,
        value: registrationReleasedNewApp
      })
      res.status(200).send({ status: 200 })
    } catch (err) {
      const message = (err as Error).message
      const isInternal = message === process.env.INTERNAL_ERROR_MSG

      res.status(isInternal ? 500 : 422).send({
        status: isInternal ? 500 : 422,
        msg: message
      })
    }
  })

  server.post('/rest/updateFinanceBlock', async (req, res): Promise<void> => {
    try {
      await updateFinanceBlock(req.body as { restId: string; value: boolean })
      return await res.status(200).send({
        status: 200,
        msg: 'Atualização realizada com sucesso'
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
      await AddClientCount(req.body as { count: number; value: boolean })
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

  function cleanObject<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const result: Partial<T> = {}

    ;(Object.entries(obj) as Array<[keyof T, T[keyof T]]>).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        result[key] = value
      }
    })

    return result
  }

  server.put('/rest/updateRestaurant', async (req, res): Promise<void> => {
    try {
      const data = cleanObject(req.body as Record<string, unknown>)

      const { error } = restaurantUpdateSchema.validate(data)
      if (error) {
        return await res.status(422).send({ error: error.details[0].message })
      }
      const { externalId, ...restaurantData } = data as {
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

      /*// Se comercialBlock for true, seta blockNewApp como true
      if (restaurantData.comercialBlock === false) {
        restaurantData.blockNewApp = false
      }*/

      // Atualização dos dados do restaurante
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const response = await patchRestaurant(externalId, restaurantData)

      // Resposta de sucesso
      return await res.status(200).send({
        status: 200,
        msg: 'Restaurante atualizado com sucesso.'
      })
    } catch (err) {
      const message = (err as Error).message
      if (message === process.env.INTERNAL_ERROR_MSG) {
        return await res.status(500).send({
          status: 500,
          msg: message
        })
      } else {
        return await res.status(404).send({
          status: 404,
          msg: message
        })
      }
    }
  })
}
