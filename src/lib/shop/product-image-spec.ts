/** Tamaño de referencia para fotos de producto en catálogo (ancho × alto, px). */
export const PRODUCT_IMAGE_WIDTH = 768;
export const PRODUCT_IMAGE_HEIGHT = 1251;

/** Texto para formularios y documentación. */
export const PRODUCT_IMAGE_SPEC_LABEL = `${PRODUCT_IMAGE_WIDTH}×${PRODUCT_IMAGE_HEIGHT}px`;

/**
 * Contenedor con la proporción oficial; la imagen debe ir con {@link productImageImgClass}
 * (object-cover) para recortar sin deformar.
 */
export const productImageFrameClass =
  "relative aspect-[768/1251] w-full overflow-hidden bg-surface-ice/50";

export const productImageImgClass = "absolute inset-0 h-full w-full object-cover object-center";
