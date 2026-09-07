export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Пробелы в именах файлов ломают URL — заменяем на дефисы
  url = url.replace(/ /g, '-');
  // Если передано только имя файла — считаем, что оно лежит в /images/
  if (!url.startsWith('/') && !url.startsWith('http')) {
    url = `/images/${url}`;
  }
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
