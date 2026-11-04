// Asset loader that tries to load PNG from public/images/
// If it fails or does not exist, automatically falls back to clean SVG version
export function loadGameImage(src, fallbackSrc) {
  const img = new Image();
  img.src = src;
  img.onerror = () => {
    img.src = fallbackSrc;
  };
  return img;
}

export const ASSET_PATHS = {
  hero: {
    png: '/images/hero.png',
    fallback: '/images/hero-fallback.svg'
  },
  obstacle: {
    png: '/images/obstacle.png',
    fallback: '/images/obstacle-fallback.svg'
  },
  bonus: {
    png: '/images/bonus.png',
    fallback: '/images/bonus-fallback.svg'
  },
  bgFar: {
    png: '/images/bg-far.png'
  },
  bgNear: {
    png: '/images/bg-near.png'
  }
};
