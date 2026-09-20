import { resolveApiUrl } from '../lib/api';

const productAssetModules = import.meta.glob('../assets/product image/**/*', {
  eager: true,
  import: 'default'
});

export const WATER_PUMP_FALLBACK = 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=900&q=85';
export const GENERIC_PRODUCT_FALLBACK = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';

export const PRODUCT_IMAGES = {};
export const CATEGORY_IMAGES = {
  'Water Pumps': WATER_PUMP_FALLBACK,
};

const normalizedProductMap = {};

for (const [path, url] of Object.entries(productAssetModules)) {
  const parts = path.split('/');
  const filenameWithExt = parts[parts.length - 1];
  const filename = filenameWithExt.replace(/\.(jpg|jpeg|png|webp)$/i, '');

  PRODUCT_IMAGES[filename] = url;
  normalizedProductMap[filename.toLowerCase().trim()] = url;

  if (parts.length >= 3) {
    const categoryFolder = parts[parts.length - 2];
    if (!CATEGORY_IMAGES[categoryFolder]) {
      CATEGORY_IMAGES[categoryFolder] = url;
    }
  }
}

// Custom aliases & fallbacks
PRODUCT_IMAGES['Life Jacket / Life Buoy'] = PRODUCT_IMAGES['Life JacketLife Buoy'] || CATEGORY_IMAGES['Emergency Response Equipment'];
PRODUCT_IMAGES['Scissors Barrier'] = PRODUCT_IMAGES['Queue Manager'];
PRODUCT_IMAGES['Quatro Bins'] = PRODUCT_IMAGES['Trio Bins'];
PRODUCT_IMAGES['Two in One'] = PRODUCT_IMAGES['Duo Bins'];

PRODUCT_IMAGES['Submersible Pumps'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Garden Water Pumps'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Water Circulation Pump'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Deep Well Pumps'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Single Phase'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['CDS Series'] = WATER_PUMP_FALLBACK;
PRODUCT_IMAGES['Dewatering Pump'] = WATER_PUMP_FALLBACK;

export const getLocalProductImage = (name, category) => {
  if (!name) return CATEGORY_IMAGES[category] || GENERIC_PRODUCT_FALLBACK;
  const trimmed = name.trim();
  if (PRODUCT_IMAGES[trimmed]) return PRODUCT_IMAGES[trimmed];
  const lower = trimmed.toLowerCase();
  if (normalizedProductMap[lower]) return normalizedProductMap[lower];
  return CATEGORY_IMAGES[category] || GENERIC_PRODUCT_FALLBACK;
};

export const getProductImage = (category, name) => {
  return getLocalProductImage(name, category);
};

export const resolveProductImage = (product) => {
  if (!product) return GENERIC_PRODUCT_FALLBACK;

  const rawImage = typeof product.image === 'string' ? product.image.trim() : (typeof product.logo === 'string' ? product.logo.trim() : '');

  if (rawImage !== '') {
    if (
      rawImage.startsWith('http://') ||
      rawImage.startsWith('https://') ||
      rawImage.startsWith('data:image')
    ) {
      if (product.updated_at || product.updatedAt) {
        const v = new Date(product.updated_at || product.updatedAt).getTime();
        if (!isNaN(v)) {
          return rawImage.includes('?') ? `${rawImage}&v=${v}` : `${rawImage}?v=${v}`;
        }
      }
      return rawImage;
    }

    if (rawImage.startsWith('/api/') || rawImage.startsWith('/')) {
      const fullUrl = resolveApiUrl(rawImage);
      if (product.updated_at || product.updatedAt) {
        const v = new Date(product.updated_at || product.updatedAt).getTime();
        if (!isNaN(v)) {
          return fullUrl.includes('?') ? `${fullUrl}&v=${v}` : `${fullUrl}?v=${v}`;
        }
      }
      return fullUrl;
    }

    const fileName = rawImage.split('/').pop().replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const localMatch = PRODUCT_IMAGES[fileName] || normalizedProductMap[fileName.toLowerCase()];
    if (localMatch) {
      return localMatch;
    }

    return rawImage;
  }

  return getLocalProductImage(product.name, product.category);
};

export const handleProductImageError = (event, product) => {
  const target = event.currentTarget;
  const name = typeof product === 'string' ? product : product?.name;
  const category = typeof product === 'object' ? product?.category : '';

  const localFallback = getLocalProductImage(name, category);

  if (target.src !== localFallback) {
    target.src = localFallback;
  } else {
    target.src = GENERIC_PRODUCT_FALLBACK;
  }
};
