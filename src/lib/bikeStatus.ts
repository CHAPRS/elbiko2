export const BIKE_STATUSES = ['FREE', 'RENTED', 'MAINTENANCE'] as const;

export type BikeStatus = (typeof BIKE_STATUSES)[number];

export const BIKE_STATUS_LABELS: Record<BikeStatus, string> = {
  FREE: 'Свободен',
  RENTED: 'В аренде',
  MAINTENANCE: 'На сервисе',
};

export function isBikeStatus(value: unknown): value is BikeStatus {
  return typeof value === 'string' && (BIKE_STATUSES as readonly string[]).includes(value);
}
