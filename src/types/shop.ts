export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  color_hex: string | null;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  is_active: boolean;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size_label: string;
  sku: string | null;
  stock: number;
  sort_order: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
};

export type ProductListItem = Product & {
  categories: Category | null;
  categories_all?: Category[];
  product_images: Pick<ProductImage, "id" | "url" | "sort_order">[];
  product_variants: Pick<ProductVariant, "id" | "stock" | "size_label">[];
};

export type ProductDetail = Product & {
  categories: Category | null;
  categories_all?: Category[];
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};
