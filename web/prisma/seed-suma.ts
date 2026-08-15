/**
 * One-off loader adding SUMA to /recursos — spotted via @luchocloud's
 * Instagram bio link list (2026-08-15), not featured per explicit request.
 * Run once via `npx tsx prisma/seed-suma.ts`, NOT part of the repeatable
 * prisma/seed.ts.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const url = 'https://suma.web.app'
  const existing = await prisma.alliedResource.findFirst({ where: { url } })
  if (existing) {
    console.log('SUMA already seeded, skipping')
    return
  }
  await prisma.alliedResource.create({
    data: {
      name: 'SUMA',
      url,
      org: 'Independiente — Nodo Aid (sin marca de ONG/institución)',
      description:
        'Plataforma humanitaria con mapa en vivo de puntos de ayuda (albergues, agua potable, salud) y reporte de emergencias (SOS) por ciudad. Rol "Coordinador" (registro rápido) para poblar el mapa y gestionar listas de insumos requeridos; rol "Ciudadano" para localizar ayuda y pedir auxilio.',
      category: 'MAP_TRACKER',
      hostingNoCustomDomain: true,
      ogImageUrl: null,
      tier: 4,
      notes:
        'Cubre Bogotá, Cali, Medellín, Eje Cafetero, Quibdó y la región Caribe (no un solo municipio, por eso sin municipioId). Datos de puntos poblados por "Coordinadores" tras un registro rápido -- más verificación que un mapa 100% abierto, pero sin insignia de verificación oficial. Reportes SOS ciudadanos son abiertos, sin revisión previa. Hospedado en suma.web.app (Firebase Hosting), sin dominio propio. Encontrado vía el enlace "SUMA: Web app para damnificados" en la bio de Instagram de @luchocloud (compartido también en su historia), 2026-08-15.',
      lastCheckedAt: new Date('2026-08-15'),
      featured: false,
    },
  })
  console.log('Created AlliedResource: SUMA')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
