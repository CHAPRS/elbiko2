export const apiVersion = '2026-08-05';

// Пытаемся прочитать сначала переменные Next.js, затем Sanity Studio
const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

export const dataset = 
  env.NEXT_PUBLIC_SANITY_DATASET || 
  env.SANITY_STUDIO_DATASET || 
  'production';

export const projectId = 
  env.NEXT_PUBLIC_SANITY_PROJECT_ID || 
  env.SANITY_STUDIO_PROJECT_ID;

// Финальная проверка, чтобы не падать жестко в браузере
if (!projectId) {
  console.warn("⚠️ Предупреждение Sanity: Project ID не найден в переменных окружения. Убедитесь, что .env файл настроен.");
}
