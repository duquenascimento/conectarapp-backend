export function calculaPrecoBrutoConectarPlus(discount: number, priceUnique: number) {
  const calc = discount / (1 - discount) + 1;
  return priceUnique * calc;
}
