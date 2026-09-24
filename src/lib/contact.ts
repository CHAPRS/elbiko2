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
  const digits = input.phone.replace(/\D/g, '');

  const existing = (await prisma.$queryRaw`
    SELECT * FROM Contact
    WHERE REGEXP_REPLACE(phone, '[^0-9]', '') = ${digits}
    LIMIT 1
  `) as { id: number; status: string; source: string | null }[];

  if (existing.length > 0) {
    const contact = existing[0];
    return prisma.contact.update({
      where: { id: contact.id },
      data: {
        lastContactAt: new Date(),
        status: input.status ?? contact.status,
        source: input.source ?? contact.source,
        notes: input.notes === undefined ? undefined : input.notes,
      },
    });
  }

  return prisma.contact.create({
    data: {
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
