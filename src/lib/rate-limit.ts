import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
  uniqueTokenPerInterval?: number; // Максимальное количество IP в памяти
  interval?: number;               // Временное окно в миллисекундах
};

export function rateLimit(options?: RateLimitOptions) {
  // Создаем кэш в оперативной памяти сервера
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000, // 1 минута по умолчанию
  });

  return {
    check: (limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1]);
        } else {
          tokenCount[0] += 1;
          tokenCache.set(token, tokenCount);
        }

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;

        if (isRateLimited) {
          return reject(new Error('Rate limit exceeded'));
        }
        
        return resolve();
      }),
  };
}

// Инициализируем лимитер: максимум 500 уникальных IP за окно
export const limiter = rateLimit({
  uniqueTokenPerInterval: 500,
  interval: 60000, // Временное окно: 1 минута
});
