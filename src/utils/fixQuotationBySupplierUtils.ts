// TODO: Remover bloco após ajuste na API de preços

interface SupplierItem {
  supplier: {
    externalId: string;
  };
}

export const fixQuotationBySupplier = (data: any[]): any[] => {
  let newData = [];

  newData = data.map(
    (
      supplierItem: SupplierItem & {
        supplier: { discount?: { product?: Array<{ price?: number }> } };
      },
    ) => {
      if (
        supplierItem.supplier?.discount?.product &&
        Array.isArray(supplierItem.supplier.discount.product)
      ) {
        const updatedProducts = supplierItem.supplier.discount.product.map(
          (product: { price?: number }) => {
            if (product.price !== undefined && product.price !== null) {
              return {
                ...product,
                price: Math.round(product.price * 100) / 100,
              };
            }
            return product;
          },
        );
        return {
          ...supplierItem,
          supplier: {
            ...supplierItem.supplier,
            discount: {
              ...supplierItem.supplier.discount,
              product: updatedProducts,
            },
          },
        };
      }
      return supplierItem;
    },
  );

  return newData;
};
