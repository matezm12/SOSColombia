/**
 * One-off loader for pass 9 (2026-08-14) — Popayán had gotten almost no
 * attention across passes 1-8 (all focused on the 5 red-alert cities +
 * Buenaventura). Checked Cuidar a Colombia's raw data + Acopio Colombia for
 * Popayán specifically. San José del Palmar checked too — confirmed zero
 * aid infrastructure again (consistent with wiki/00-INDEX.md's original
 * finding, a genuine gap not missing data). Run once via
 * `npx tsx prisma/seed-pass9-popayan.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const popayan = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '19001' } })

  const defs = [
    {
      name: 'S.C.A.R.E. — Sede Popayán (jornada "Juntos somos Colombia")',
      address: 'Carrera 9 #18N-231, oficina 205, Edificio Terrazas del Norte, Popayán',
      sourceUrl: 'https://scare.org.co/noticias/juntos-somos-colombia-scare-fepasde/',
      note: 'S.C.A.R.E. (Sociedad Colombiana de Anestesiología y Reanimación), fuente_oficial en el dataset de Cuidar a Colombia. Tel. 320 477 0256. Lunes a jueves 8am-12:30pm y 2-5pm, viernes hasta 4pm. Alimentos no perecederos, agua, higiene, kits para personal de salud, insumos médicos nuevos (mín. 1 año de vigencia). Cross-confirmado independientemente por Acopio Colombia como "ACSC Popayán" en la MISMA dirección exacta — alta confianza.',
    },
    {
      name: 'Polideportivo de La Paz',
      address: 'Polideportivo de La Paz, Popayán',
      sourceUrl: 'https://emergency-rosy.vercel.app',
      note: 'Verificado en Acopio Colombia. Alimentos, aseo e higiene, medicamentos e insumos médicos. Jueves de 3 a 8pm.',
    },
  ] as const

  let created = 0
  for (const p of defs) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: p.name, municipioId: popayan.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: popayan.id,
        kind: 'ACOPIO',
        name: p.name,
        address: p.address,
        sourceUrl: p.sourceUrl,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    created++
  }
  console.log(`PendingAidPoint (Popayán): ${created} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
