export function olderSupplierDiscountNamePattern(externalId: string): boolean {
  const oldDiscountPatternSuppliers = [
    'F7',
    'F13',
    'F18',
    'F19',
    'F20',
    'F21',
    'F22',
    'F27',
    'F50'
  ]

  return oldDiscountPatternSuppliers.includes(externalId)
}
