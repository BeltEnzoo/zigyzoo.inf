import type { Category, ProductDetail, ProductListItem } from "@/types/shop";

/** Imágenes de ejemplo (Unsplash). Solo para vista previa sin DB. */
const IMG = {
  remera:
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800&q=80&auto=format&fit=crop",
  remera2:
    "https://images.unsplash.com/photo-1622290291468-a23f6fe21b1c?w=800&q=80&auto=format&fit=crop",
  remera3:
    "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80&auto=format&fit=crop",
  pantalon:
    "https://images.unsplash.com/photo-1471286172490-4e4e1f1b8783?w=800&q=80&auto=format&fit=crop",
  vestido:
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80&auto=format&fit=crop",
  buzo:
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80&auto=format&fit=crop",
  short:
    "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=800&q=80&auto=format&fit=crop",
  campera:
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80&auto=format&fit=crop",
  pollera:
    "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&q=80&auto=format&fit=crop",
  medias:
    "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80&auto=format&fit=crop",
  body:
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80&auto=format&fit=crop",
} as const;

const mockCategories: Category[] = [
  { id: "mock-cat-remeras", name: "Remeras", slug: "remeras", sort_order: 1, color_hex: null },
  {
    id: "mock-cat-pantalones",
    name: "Pantalones",
    slug: "pantalones",
    sort_order: 2,
    color_hex: null,
  },
  { id: "mock-cat-vestidos", name: "Vestidos", slug: "vestidos", sort_order: 3, color_hex: null },
  { id: "mock-cat-buzos", name: "Buzos", slug: "buzos", sort_order: 4, color_hex: null },
  {
    id: "mock-cat-accesorios",
    name: "Accesorios",
    slug: "accesorios",
    sort_order: 5,
    color_hex: null,
  },
];

const mockList: ProductListItem[] = [
  {
    id: "mock-p-1",
    category_id: "mock-cat-remeras",
    name: "Remera manga corta algodón",
    slug: "remera-manga-corta-algodon",
    description: "Remera suave para el día a día.",
    price: 12990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[0],
    product_images: [
      { id: "mock-i-1", url: IMG.remera, sort_order: 0 },
      { id: "mock-i-2", url: IMG.remera2, sort_order: 1 },
    ],
    product_variants: [
      { id: "mock-v-1", stock: 4, size_label: "4" },
      { id: "mock-v-2", stock: 6, size_label: "6" },
      { id: "mock-v-3", stock: 2, size_label: "8" },
    ],
  },
  {
    id: "mock-p-2",
    category_id: "mock-cat-pantalones",
    name: "Pantalón jogger",
    slug: "pantalon-jogger",
    description: "Cómodo y liviano.",
    price: 18990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[1],
    product_images: [{ id: "mock-i-3", url: IMG.pantalon, sort_order: 0 }],
    product_variants: [
      { id: "mock-v-4", stock: 3, size_label: "6" },
      { id: "mock-v-5", stock: 0, size_label: "8" },
    ],
  },
  {
    id: "mock-p-3",
    category_id: "mock-cat-vestidos",
    name: "Vestido estampado",
    slug: "vestido-estampado",
    description: "Ideal para ocasiones especiales.",
    price: 22990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[2],
    product_images: [{ id: "mock-i-4", url: IMG.vestido, sort_order: 0 }],
    product_variants: [
      { id: "mock-v-6", stock: 5, size_label: "4" },
      { id: "mock-v-7", stock: 1, size_label: "6" },
    ],
  },
  {
    id: "mock-p-4",
    category_id: "mock-cat-remeras",
    name: "Remera rayada clásica",
    slug: "remera-rayada-clasica",
    description: "Rayas finas, cuello redondo.",
    price: 13990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[0],
    product_images: [{ id: "mock-i-5", url: IMG.remera3, sort_order: 0 }],
    product_variants: [
      { id: "mock-v-8", stock: 8, size_label: "4" },
      { id: "mock-v-9", stock: 4, size_label: "6" },
      { id: "mock-v-10", stock: 2, size_label: "8" },
    ],
  },
  {
    id: "mock-p-5",
    category_id: "mock-cat-buzos",
    name: "Buzo con capucha",
    slug: "buzo-capucha",
    description: "Frisa suave, ideal para el frío.",
    price: 24990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[3],
    product_images: [{ id: "mock-i-6", url: IMG.buzo, sort_order: 0 }],
    product_variants: [
      { id: "mock-v-11", stock: 3, size_label: "4" },
      { id: "mock-v-12", stock: 5, size_label: "6" },
      { id: "mock-v-13", stock: 1, size_label: "8" },
    ],
  },
  {
    id: "mock-p-6",
    category_id: "mock-cat-pantalones",
    name: "Short deportivo",
    slug: "short-deportivo",
    description: "Liviano, cintura elástica.",
    price: 9990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[1],
    product_images: [{ id: "mock-i-7", url: IMG.short, sort_order: 0 }],
    product_variants: [
      { id: "mock-v-14", stock: 6, size_label: "6" },
      { id: "mock-v-15", stock: 6, size_label: "8" },
    ],
  },
  {
    id: "mock-p-7",
    category_id: "mock-cat-vestidos",
    name: "Pollera plisada",
    slug: "pollera-plisada",
    description: "Plisados suaves, cintura cómoda.",
    price: 16990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[2],
    product_images: [{ id: "mock-i-8", url: IMG.pollera, sort_order: 0 }],
    product_variants: [
      { id: "mock-v-16", stock: 4, size_label: "4" },
      { id: "mock-v-17", stock: 2, size_label: "6" },
    ],
  },
  {
    id: "mock-p-8",
    category_id: "mock-cat-remeras",
    name: "Body manga larga",
    slug: "body-manga-larga",
    description: "Abrojo inferior, algodón.",
    price: 11990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[0],
    product_images: [{ id: "mock-i-9", url: IMG.body, sort_order: 0 }],
    product_variants: [
      { id: "mock-v-18", stock: 10, size_label: "0-3 m" },
      { id: "mock-v-19", stock: 7, size_label: "3-6 m" },
    ],
  },
  {
    id: "mock-p-9",
    category_id: "mock-cat-accesorios",
    name: "Pack medias x3",
    slug: "pack-medias",
    description: "Algodón, colores surtidos (demo).",
    price: 4990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[4],
    product_images: [{ id: "mock-i-10", url: IMG.medias, sort_order: 0 }],
    product_variants: [
      { id: "mock-v-20", stock: 20, size_label: "21-23" },
      { id: "mock-v-21", stock: 15, size_label: "24-26" },
    ],
  },
  {
    id: "mock-p-10",
    category_id: "mock-cat-buzos",
    name: "Campera rompeviento",
    slug: "campera-rompeviento",
    description: "Liviana, ideal para media estación.",
    price: 27990,
    currency: "ARS",
    is_active: true,
    categories: mockCategories[3],
    product_images: [{ id: "mock-i-11", url: IMG.campera, sort_order: 0 }],
    product_variants: [
      { id: "mock-v-22", stock: 2, size_label: "4" },
      { id: "mock-v-23", stock: 3, size_label: "6" },
      { id: "mock-v-24", stock: 0, size_label: "8" },
    ],
  },
];

function detail(
  p: ProductListItem,
  variants: { id: string; size_label: string; stock: number; sort_order: number }[],
): ProductDetail {
  return {
    id: p.id,
    category_id: p.category_id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    currency: p.currency,
    is_active: p.is_active,
    categories: p.categories,
    product_images: p.product_images.map((im) => ({
      ...im,
      product_id: p.id,
    })),
    product_variants: variants.map((v) => ({
      ...v,
      product_id: p.id,
      sku: null,
    })),
  };
}

const mockDetails: Record<string, ProductDetail> = {
  "remera-manga-corta-algodon": detail(mockList[0], [
    { id: "mock-v-1", size_label: "4", stock: 4, sort_order: 0 },
    { id: "mock-v-2", size_label: "6", stock: 6, sort_order: 1 },
    { id: "mock-v-3", size_label: "8", stock: 2, sort_order: 2 },
  ]),
  "pantalon-jogger": detail(mockList[1], [
    { id: "mock-v-4", size_label: "6", stock: 3, sort_order: 0 },
    { id: "mock-v-5", size_label: "8", stock: 0, sort_order: 1 },
  ]),
  "vestido-estampado": detail(mockList[2], [
    { id: "mock-v-6", size_label: "4", stock: 5, sort_order: 0 },
    { id: "mock-v-7", size_label: "6", stock: 1, sort_order: 1 },
  ]),
  "remera-rayada-clasica": detail(mockList[3], [
    { id: "mock-v-8", size_label: "4", stock: 8, sort_order: 0 },
    { id: "mock-v-9", size_label: "6", stock: 4, sort_order: 1 },
    { id: "mock-v-10", size_label: "8", stock: 2, sort_order: 2 },
  ]),
  "buzo-capucha": detail(mockList[4], [
    { id: "mock-v-11", size_label: "4", stock: 3, sort_order: 0 },
    { id: "mock-v-12", size_label: "6", stock: 5, sort_order: 1 },
    { id: "mock-v-13", size_label: "8", stock: 1, sort_order: 2 },
  ]),
  "short-deportivo": detail(mockList[5], [
    { id: "mock-v-14", size_label: "6", stock: 6, sort_order: 0 },
    { id: "mock-v-15", size_label: "8", stock: 6, sort_order: 1 },
  ]),
  "pollera-plisada": detail(mockList[6], [
    { id: "mock-v-16", size_label: "4", stock: 4, sort_order: 0 },
    { id: "mock-v-17", size_label: "6", stock: 2, sort_order: 1 },
  ]),
  "body-manga-larga": detail(mockList[7], [
    { id: "mock-v-18", size_label: "0-3 m", stock: 10, sort_order: 0 },
    { id: "mock-v-19", size_label: "3-6 m", stock: 7, sort_order: 1 },
  ]),
  "pack-medias": detail(mockList[8], [
    { id: "mock-v-20", size_label: "21-23", stock: 20, sort_order: 0 },
    { id: "mock-v-21", size_label: "24-26", stock: 15, sort_order: 1 },
  ]),
  "campera-rompeviento": detail(mockList[9], [
    { id: "mock-v-22", size_label: "4", stock: 2, sort_order: 0 },
    { id: "mock-v-23", size_label: "6", stock: 3, sort_order: 1 },
    { id: "mock-v-24", size_label: "8", stock: 0, sort_order: 2 },
  ]),
};

export function getMockCategories(): Category[] {
  return mockCategories;
}

export function getMockProducts(opts: { categorySlug?: string; q?: string } = {}): ProductListItem[] {
  let out = mockList;
  if (opts.categorySlug) {
    const exists = mockCategories.some((c) => c.slug === opts.categorySlug);
    if (!exists) return [];
    out = out.filter((p) => p.categories?.slug === opts.categorySlug);
  }
  const q = opts.q?.trim().toLowerCase();
  if (!q) return out;
  return out.filter((p) => {
    const haystack = `${p.name} ${p.slug} ${p.description ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function getMockProductBySlug(slug: string): ProductDetail | null {
  return mockDetails[slug] ?? null;
}
