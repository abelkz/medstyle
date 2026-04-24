// SQLite stores arrays as JSON strings — parse them back for the client
export function parseProduct(p: any) {
  if (!p) return p;
  return {
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
    shippingAddress: p.shippingAddress
      ? (typeof p.shippingAddress === 'string' ? JSON.parse(p.shippingAddress) : p.shippingAddress)
      : undefined,
  };
}

export function parseProducts(arr: any[]) {
  return arr.map(parseProduct);
}
