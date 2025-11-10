import { airtableHandler } from '../../service/airtableConfirmService'
import { chunkArray } from '../../utils/chunkArray'
import { createOrderAirtable } from '../../repository/airtableOrderService'
import { createDetailingAirtable } from '../../repository/airtableDetailingService'
import { createOrderTextAirtable } from '../../repository/airtableOrderTextService'
import { findProductsIdsFromAirtable } from '../../repository/airtableProductService'
import { findIdFromAirtable } from '../../repository/airtableSupplierService'

jest.mock('../../utils/chunkArray')
jest.mock('../../repository/airtableOrderService')
jest.mock('../../repository/airtableDetailingService')
jest.mock('../../repository/airtableOrderTextService')
jest.mock('../../repository/airtableProductService')
jest.mock('../../repository/airtableSupplierService')

const mockEnv = {
  AIRTABLE_TABLE_SUPPLIER_NAME: 'Suppliers',
  AIRTABLE_TABLE_REST_NAME: 'Restaurants',
  AIRTABLE_BASE_ORDER_ID: 'appOrderId',
  AIRTABLE_TABLE_RESTSUPPLIERAPP_NAME: 'RestSupplierApp',
  AIRTABLE_TABLE_SUPPLIERSUPPLIERAPP_NAME: 'SupplierSupplierApp',
  AIRTABLE_BASE_SUPPLIERAPP_ID: 'appSupplierId'
}

describe('airtableHandler', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeAll(() => {
    originalEnv = { ...process.env }
    process.env = { ...process.env, ...mockEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('cenário de sucesso', () => {
    const mockOrder = {
      supplierId: 'SUP001',
      restaurantId: 'REST001',
      deliveryDate: new Date('2023-12-01'),
      orderDate: new Date('2023-11-30'),
      paymentWay: 'PIX',
      referencePoint: 'Próximo ao mercado',
      calcOrderAgain: {
        data: [
          { supplier: { externalId: 'EXT001' } },
          { supplier: { externalId: 'EXT002' } }
        ]
      },
      id: 'ORDER001',
      orderHour: new Date('2023-11-30T14:30:00'),
      totalSupplier: 100,
      totalConectar: 120,
      status_id: 12,
      orderDocument: 'https://example.com/document.pdf',
      tax: 10
    }

    const mockDetailing = [
      {
        productId: 'PROD001',
        orderAmount: 5,
        supplierFinalAmount: 4,
        restaurantFinalAmount: 4,
        supplierPricePerUnid: 10,
        conectarPricePerUnid: 12,
        supplierFinalPrice: 40,
        conectarFinalPrice: 48,
        status: 'Confirmado',
        obs: 'Produto em bom estado'
      },
      {
        productId: 'PROD002',
        orderAmount: 3,
        supplierFinalAmount: 3,
        restaurantFinalAmount: 3,
        supplierPricePerUnid: 15,
        conectarPricePerUnid: 18,
        supplierFinalPrice: 45,
        conectarFinalPrice: 54,
        status: 'Teste',
        obs: 'Verificar qualidade'
      }
    ]

    const mockYourNumber = 'YOUR123'
    const mockOrderText = 'Pedido de teste'

    it('deve processar o pedido com sucesso', async () => {
      const mockFindIdFromAirtable = findIdFromAirtable as jest.MockedFunction<
        typeof findIdFromAirtable
      >
      mockFindIdFromAirtable
        .mockResolvedValueOnce('supplierAirtableId')
        .mockResolvedValueOnce('restaurantAirtableId')
        .mockResolvedValueOnce('restSupplierAppId')
        .mockResolvedValueOnce('supplierSupplierAppId')

      const mockFindProductsIdsFromAirtable =
        findProductsIdsFromAirtable as jest.MockedFunction<
          typeof findProductsIdsFromAirtable
        >
      mockFindProductsIdsFromAirtable.mockResolvedValue([
        { productId: 'PROD001', airtableId: 'airtableProd001' },
        { productId: 'PROD002', airtableId: 'airtableProd002' }
      ])

      const mockCreateOrderAirtable =
        createOrderAirtable as jest.MockedFunction<typeof createOrderAirtable>
      mockCreateOrderAirtable.mockResolvedValue({
        id: 'createdOrderId',
        fields: {}
      } as any)

      const mockChunkArray = chunkArray as jest.MockedFunction<
        typeof chunkArray
      >
      mockChunkArray.mockImplementation((array) => [array])

      const mockCreateDetailingAirtable =
        createDetailingAirtable as jest.MockedFunction<
          typeof createDetailingAirtable
        >
      mockCreateDetailingAirtable.mockResolvedValue(undefined)

      const mockCreateOrderTextAirtable =
        createOrderTextAirtable as jest.MockedFunction<
          typeof createOrderTextAirtable
        >
      mockCreateOrderTextAirtable.mockResolvedValue(undefined)

      await airtableHandler(
        mockOrder,
        mockDetailing,
        mockYourNumber,
        mockOrderText
      )

      expect(mockFindIdFromAirtable).toHaveBeenCalledTimes(4)
      expect(mockFindProductsIdsFromAirtable).toHaveBeenCalledWith([
        'PROD001',
        'PROD002'
      ])
      expect(mockCreateOrderAirtable).toHaveBeenCalled()
      expect(mockChunkArray).toHaveBeenCalled()
      expect(mockCreateDetailingAirtable).toHaveBeenCalled()
      expect(mockCreateOrderTextAirtable).toHaveBeenCalled()
    })

    it('deve lidar com restaurantes especiais (IDs C757, C939, C940, C941)', async () => {
      const specialOrder = {
        ...mockOrder,
        restaurantId: 'C757'
      }

      const mockFindIdFromAirtable = findIdFromAirtable as jest.MockedFunction<
        typeof findIdFromAirtable
      >
      mockFindIdFromAirtable
        .mockResolvedValueOnce('supplierAirtableId')
        .mockResolvedValueOnce('restaurantAirtableId')
        .mockResolvedValueOnce('restSupplierAppId')
        .mockResolvedValueOnce('supplierSupplierAppId')

      const mockFindProductsIdsFromAirtable =
        findProductsIdsFromAirtable as jest.MockedFunction<
          typeof findProductsIdsFromAirtable
        >
      mockFindProductsIdsFromAirtable.mockResolvedValue([
        { productId: 'PROD001', airtableId: 'airtableProd001' }
      ])

      const mockCreateOrderAirtable =
        createOrderAirtable as jest.MockedFunction<typeof createOrderAirtable>
      mockCreateOrderAirtable.mockResolvedValue({
        id: 'createdOrderId',
        fields: {}
      } as any)

      const mockChunkArray = chunkArray as jest.MockedFunction<
        typeof chunkArray
      >
      mockChunkArray.mockImplementation((array) => [array])

      const mockCreateDetailingAirtable =
        createDetailingAirtable as jest.MockedFunction<
          typeof createDetailingAirtable
        >
      mockCreateDetailingAirtable.mockResolvedValue(undefined)

      const mockCreateOrderTextAirtable =
        createOrderTextAirtable as jest.MockedFunction<
          typeof createOrderTextAirtable
        >
      mockCreateOrderTextAirtable.mockResolvedValue(undefined)

      await airtableHandler(
        specialOrder,
        [mockDetailing[0]],
        mockYourNumber,
        mockOrderText
      )

      expect(mockCreateOrderAirtable).toHaveBeenCalledWith(
        expect.objectContaining({
          'ID Distribuidor': ['recGaGKpONIbRlNK5']
        })
      )
    })
  })

  describe('cenários de erro', () => {
    const mockOrder = {
      supplierId: 'SUP001',
      restaurantId: 'REST001',
      deliveryDate: new Date('2023-12-01'),
      orderDate: new Date('2023-11-30'),
      paymentWay: 'PIX',
      referencePoint: 'Próximo ao mercado',
      calcOrderAgain: { data: [] },
      id: 'ORDER001',
      orderHour: new Date('2023-11-30T14:30:00'),
      totalSupplier: 100,
      totalConectar: 120,
      status_id: 12,
      orderDocument: 'https://example.com/document.pdf',
      tax: 10
    }

    const mockDetailing = [
      {
        productId: 'PROD001',
        orderAmount: 5,
        supplierFinalAmount: 4,
        restaurantFinalAmount: 4,
        supplierPricePerUnid: 10,
        conectarPricePerUnid: 12,
        supplierFinalPrice: 40,
        conectarFinalPrice: 48,
        status: 'Confirmado',
        obs: 'Produto em bom estado'
      }
    ]

    it('deve lançar erro quando a criação do pedido falhar', async () => {
      const mockFindIdFromAirtable = findIdFromAirtable as jest.MockedFunction<
        typeof findIdFromAirtable
      >
      mockFindIdFromAirtable.mockResolvedValue('airtableId')

      const mockFindProductsIdsFromAirtable =
        findProductsIdsFromAirtable as jest.MockedFunction<
          typeof findProductsIdsFromAirtable
        >
      mockFindProductsIdsFromAirtable.mockResolvedValue([
        { productId: 'PROD001', airtableId: 'airtableProd001' }
      ])

      const mockCreateOrderAirtable =
        createOrderAirtable as jest.MockedFunction<typeof createOrderAirtable>
      mockCreateOrderAirtable.mockResolvedValue(null)

      await expect(
        airtableHandler(mockOrder, mockDetailing, 'YOUR123', 'Pedido teste')
      ).rejects.toThrow('Order creation failed')
    })

    it('deve lançar erro quando ocorrer exceção em qualquer serviço', async () => {
      const mockFindIdFromAirtable = findIdFromAirtable as jest.MockedFunction<
        typeof findIdFromAirtable
      >
      mockFindIdFromAirtable.mockRejectedValue(new Error('Erro no Airtable'))

      await expect(
        airtableHandler(mockOrder, mockDetailing, 'YOUR123', 'Pedido teste')
      ).rejects.toThrow('Erro no servico do airtable')
    })

    it('deve lançar erro quando variáveis de ambiente estiverem faltando', async () => {
      const originalAIRTABLE_TABLE_SUPPLIER_NAME =
        process.env.AIRTABLE_TABLE_SUPPLIER_NAME
      process.env.AIRTABLE_TABLE_SUPPLIER_NAME = ''

      const mockFindIdFromAirtable = findIdFromAirtable as jest.MockedFunction<
        typeof findIdFromAirtable
      >
      mockFindIdFromAirtable.mockResolvedValue('airtableId')

      await expect(
        airtableHandler(mockOrder, mockDetailing, 'YOUR123', 'Pedido teste')
      ).rejects.toThrow('Erro no servico do airtable')

      process.env.AIRTABLE_TABLE_SUPPLIER_NAME =
        originalAIRTABLE_TABLE_SUPPLIER_NAME
    })
  })
})
