import { prisma } from './prisma';

export function parseName(fullName: string): { firstName: string | null; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || null,
    lastName: parts[1] || null,
  };
}

export async function upsertContactByPhone(input: {
  fullName: string;
  phone: string;
  status?: 'INQUIRY' | 'CUSTOMER' | 'REPEAT' | 'BLOCKED';
  source?: string;
  notes?: string | null;
}) {
  const { firstName, lastName } = parseName(input.fullName);

  return prisma.contact.upsert({
    where: { phone: input.phone },
    update: {
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      status: input.status,
      source: input.source,
      notes: input.notes === undefined ? undefined : input.notes,
      lastContactAt: new Date(),
    },
    create: {
      phone: input.phone,
      firstName,
      lastName,
      status: input.status ?? 'INQUIRY',
      source: input.source ?? 'SITE',
      notes: input.notes ?? null,
      lastContactAt: new Date(),
    },
  });
}
