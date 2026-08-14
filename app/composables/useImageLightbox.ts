export interface LightboxImage {
  src: string
  alt: string
}

/**
 * Shared state for a single global image lightbox modal, used by carousels
 * (e.g. the draft-process typed-page gallery) where the embla-carousel drag
 * handling swallows clicks before the browser's native image-zoom can fire.
 */
export function useImageLightbox() {
  const image = useState<LightboxImage | null>("image-lightbox", () => null)

  function open(src: string, alt: string) {
    image.value = { src, alt }
  }

  function close() {
    image.value = null
  }

  return { image, open, close }
}
