export const LEAD_STATUSES = ['NEW', 'IN_PROGRESS', 'CONFIRMED', 'REJECTED'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  CONFIRMED: 'Подтверждена',
  REJECTED: 'Отклонена',
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === 'string' && (LEAD_STATUSES as readonly string[]).includes(value);
}
