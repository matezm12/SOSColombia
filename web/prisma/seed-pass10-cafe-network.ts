/**
 * One-off loader for pass 10 (2026-08-14) — following up on pass 8's tip:
 * searched Acopio Colombia for "CAFE" specifically (Comfamiliar's Centro de
 * Atención Familiar en Emergencia network), which wiki/13a-mapadelterremoto-watch.md
 * already knew existed ("the original 7 CAFE network") but never had
 * addresses for. Found the remaining 5 (2 already seeded in pass 7).
 * Run once via `npx tsx prisma/seed-pass10-cafe-network.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })
  const SRC = 'https://emergency-rosy.vercel.app'

  const defs = [
    {
      name: 'CAFE El Remanso',
      address: 'Avenida principal del barrio El Remanso, junto al Centro de Salud, Pereira',
      note: 'Red CAFE (Comfamiliar). Estado "Reportado" en Acopio Colombia.',
    },
    {
      name: 'CAFE Kennedy',
      address: 'Parque principal del barrio Kennedy, Pereira',
      note: 'Red CAFE (Comfamiliar). Estado "Reportado" en Acopio Colombia.',
    },
    {
      name: 'CAFE Ormaza',
      address: 'Calle 3 bis #5-38, avenida del Río, Pereira',
      note: 'Red CAFE (Comfamiliar). Estado "Reportado" en Acopio Colombia.',
    },
    {
      name: 'CAFE Perla del Otún',
      address: 'Diagonal a la iglesia de los 2.500 Lotes, sector Cuba, Pereira',
      note: 'Red CAFE (Comfamiliar). Estado "Reportado" en Acopio Colombia. Probablemente corresponde al punto "2.500 Lotes" (P-720/P-721) ya referenciado en wiki/13a-mapadelterremoto-watch.md como agregado "en el segundo día de la emergencia" — ahora con nombre y ubicación específicos de la red CAFE.',
    },
    {
      name: 'CAFE San Nicolás',
      address: 'Carrera 14 bis #28-38, antigua Estación de Policía, Pereira',
      note: 'Red CAFE (Comfamiliar). Estado "Reportado" en Acopio Colombia.',
    },
  ] as const

  let created = 0
  for (const p of defs) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: p.name, municipioId: pereira.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pereira.id,
        kind: 'ACOPIO',
        name: p.name,
        address: p.address,
        sourceUrl: SRC,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    created++
  }
  console.log(`PendingAidPoint (CAFE network, Pereira): ${created} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
