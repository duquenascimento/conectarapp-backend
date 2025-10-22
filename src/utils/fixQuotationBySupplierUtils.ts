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
        supplier: {
          discount?: {
            product?: Array<{ price?: number }>;
            orderValue?: number;
            orderValueFinish?: number;
          };
        };
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

        // Recalculate orderValue and orderValueFinish based on sum of rounded prices
        const totalPrice = updatedProducts.reduce((sum, product) => {
          return sum + (product.price || 0);
        }, 0);
        const roundedTotalPrice = Math.round(totalPrice * 100) / 100;

        return {
          ...supplierItem,
          supplier: {
            ...supplierItem.supplier,
            discount: {
              ...supplierItem.supplier.discount,
              product: updatedProducts,
              orderValue: roundedTotalPrice,
              orderValueFinish: roundedTotalPrice,
            },
          },
        };
      }
      return supplierItem;
    },
  );

  return newData;
};
