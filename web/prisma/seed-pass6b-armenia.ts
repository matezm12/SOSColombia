/**
 * Continuation of pass 6 (2026-08-14) — ayudaspereira.com has grown since
 * pass 1 (28 -> 41 Pereira centers) and now also covers Armenia directly
 * with 2 real, addressed centers. Run once via
 * `npx tsx prisma/seed-pass6b-armenia.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const armenia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63001' } })

  const defs = [
    {
      name: 'Barrio Limonar',
      address: 'Etapa 3, Mz 5, Casa 20, Armenia',
      note: 'Responsable: Marcela Marín. Fuente: ayudaspereira.com (la plataforma ya aprobada para Pereira/Dosquebradas también cubre Armenia ahora).',
    },
    {
      name: 'Power Music Center',
      address: 'Carrera 14 #9-72, Armenia',
      note: 'Responsable: Alejandro Rincón. Fuente: ayudaspereira.com.',
    },
  ] as const

  let created = 0
  for (const p of defs) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: p.name, municipioId: armenia.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: armenia.id,
        kind: 'ACOPIO',
        name: p.name,
        address: p.address,
        sourceUrl: 'https://ayudaspereira.com',
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    created++
  }
  console.log(`PendingAidPoint (Armenia): ${created} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
