import { DateTime } from 'luxon'
import { type ICartList, listCartComplete } from './cartService'
import { Decimal } from '@prisma/client/runtime/library'
import { ApiRepository } from '../repository/apiRepository'

const apiRepository = new ApiRepository(process.env.URL_API_ANTIGA ?? '')

interface Product {
  Qtd: Decimal
  Obs: string
  Sku: string
}

export const suppliersPrices = async (req: ICartList): Promise<any> => {
  try {
    const products = await listCartComplete(req)
    const Product: Product[] | undefined = products?.map(item => {
      return {
        Qtd: item.amount ?? new Decimal(0),
        Obs: item.obs ?? '',
        Sku: item.sku ?? ''
      }
    })

    const request = {
      neighborhood: req.selectedRestaurant.addressInfos[0].neighborhood,
      minimumTime: `0001-01-01T${req.selectedRestaurant.addressInfos[0].initialDeliveryTime.substring(11, 16)}:00.00000+00:00`,
      maximumTime: `0001-01-01T${req.selectedRestaurant.addressInfos[0].finalDeliveryTime.substring(11, 16)}:00.00000+00:00`,
      externalId: 'F0',
      createdBy: 'system',
      DiaEntrega: '',
      Product,
      tax: req.selectedRestaurant.tax / 100 + 1,
      SupplierToExclude: [],
      ActualDayWeek: '',
      ActualHour: DateTime.now().setZone('America/Sao_Paulo').toJSDate().toISOString()
    }

    const raw = JSON.stringify(request)

    const data = await apiRepository.callApi('/list-available-supplier-new', 'POST', raw)
    return data
  } catch (err) {
    console.error('Erro ao buscar preços dos fornecedores:', err)
    return {}
  }
}

export const suppliersCompletePrices = async (req: ICartList): Promise<any> => {
  try {
    const products = await listCartComplete(req)
    const Product: Product[] | undefined = products?.map(item => { return { Qtd: item.amount ?? new Decimal(0), Obs: item.obs ?? '', Sku: item.sku ?? '' } })
    const request = {
      neighborhood: req.selectedRestaurant.addressInfos[0].neighborhood,
      minimumTime: `0001-01-01T${req.selectedRestaurant.addressInfos[0].initialDeliveryTime.substring(11, 16)}:00.00000+00:00`,
      maximumTime: `0001-01-01T${req.selectedRestaurant.addressInfos[0].finalDeliveryTime.substring(11, 16)}:00.00000+00:00`,
      externalId: 'F0',
      createdBy: 'system',
      DiaEntrega: '',
      Product,
      tax: req.selectedRestaurant.tax / 100 + 1,
      SupplierToExclude: [],
      ActualDayWeek: '',
      ActualHour: DateTime.now().setZone('America/Sao_Paulo').toJSDate().toISOString()
    }

    const myHeaders = new Headers()
    myHeaders.append('secret-key', '9ba805b2-6c58-4adc-befc-aad30c6af23a')
    myHeaders.append('external-id', 'F0')
    myHeaders.append('username', 'contato@conectarhortifruti.com.br')
    myHeaders.append('Content-Type', 'application/json')
    myHeaders.append('system-user-pass', 'd2NuOUVVNnJWbDR5dDE5Mnl0WFdaeGo2cjRGeEtycUMydzNaWEJ5enlub0FLQmdjdEU2anBVQ2RDbWxkM2xSMQo=')
    myHeaders.append('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IkYwIiwiZW1haWwiOiJjb250YXRvQGNvbmVjdGFyaG9ydGlmcnV0aS5jb20uYnIiLCJuYW1laWQiOiIwIiwiX0V4cGlyZWQiOiIyMDI0LTA2LTIwVDAzOjQwOjM3IiwibmJmIjoxNzE3OTkwODM3LCJleHAiOjE3MTg4NTQ4MzcsImlhdCI6MTcxNzk5MDgzNywiaXNzIjoiNWRhYTY1NmNmMGNkMmRhNDk1M2U2ZTA2Njc3OTMxY2E1MTU1YzIyYWE5MTg2ZmVhYzYzMTBkNzJkMjNkNmIzZiIsImF1ZCI6ImRlN2NmZGFlNzBkMjBiODk4OWQxMzgxOTRkNDM5NGIyIn0.RBX5whQIqwtRJOnjTX622qvwCFQJxcgVXQKTyUoVFys')

    const raw = JSON.stringify(request)

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw
    }

    const res = await fetch('https://gateway.conectarhortifruti.com.br/api/v1/system/list-all-prices-of-suppliers', requestOptions)
    const data = await res.json()
    console.log('all prices supliers', data)
    return data
  } catch (err) {
    return {}
  }
}
