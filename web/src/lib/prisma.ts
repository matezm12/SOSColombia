import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Standard Next.js dev-mode singleton — avoids exhausting DB connections on every hot reload.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// `max` kept small deliberately: DATABASE_URL points at a session-mode
// pooler capped at 15 total connections (see the EMAXCONNSESSION errors
// this was tuned to fix) — that cap is shared with other dev processes and
// one-off scripts hitting the same database, so this client shouldn't try
// to claim most of the budget for itself.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 4 })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
