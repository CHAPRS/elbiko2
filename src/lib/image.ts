export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Заменяем старые расширения .jpg/.jpeg/.png на .webp,
  // если изображение лежит в /images/
  if (url.startsWith('/images/')) {
    return url.replace(/\.(jpg|jpeg|png)(\?.*)?$/i, '.webp$2');
  }
  return url;
}

export const tariffFallbackImages = [
  '/images/tariff-basic.webp',
  '/images/tariff-earning.webp',
  '/images/tariff-partner.webp',
];
