export const apiVersion = '2026-08-05';

// Явное чтение переменных для корректной работы статического анализа сборщиков
export const dataset = 
  process.env.NEXT_PUBLIC_SANITY_DATASET || 
  (typeof process !== 'undefined' ? process.env.SANITY_STUDIO_DATASET : undefined) || 
  'production';

export const projectId = 
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 
  (typeof process !== 'undefined' ? process.env.SANITY_STUDIO_PROJECT_ID : undefined);

// Жесткая проверка: без projectId студия всё равно упадет, лучше сразу выкинуть понятную ошибку
if (!projectId) {
  throw new Error(
    "❌ Ошибка Sanity: Переменная NEXT_PUBLIC_SANITY_PROJECT_ID не найдена. " +
    "Проверьте, что файл .env создан в корне проекта и вы перезапустили сервер."
  );
}
