/**
 * One-off: adds Aliados Colombia (aliadoscolombia.com) as an AlliedResource,
 * per direct user request 2026-08-20 -- surfaced by the same veterinarian
 * (@nathaporlosanimales) whose post was added to the community queue in
 * prisma/add-nathaporlosanimales-post.ts the same session; she and a
 * collaborator built it themselves. Verified live via Scrapling (JS-rendered
 * SPA, a plain fetch only sees the shell) -- real, active platform: 104
 * people registered, 29 municipios, 12 departamentos, 2 fundaciones, a
 * live "muro de necesidades" with real dated requests (e.g. a real Cali
 * address needing heavy equipment, 18 Aug). Tier/category calibrated
 * against the closest existing comparable, "Ayudas Pereira" (also
 * independent, self-built, VOLUNTEER_COORDINATION, tier 3).
 *
 * Also sets featured: true here and featured: false on "SOS Pereira 2026"
 * (id clzsospereira0000000001) -- explicit swap requested by the user for
 * the homepage highlight strip.
 *
 * Run once via `npx tsx prisma/add-aliados-colombia.ts`, NOT part of the
 * repeatable prisma/seed.ts.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const existing = await prisma.alliedResource.findFirst({ where: { url: 'https://aliadoscolombia.com' } })
  if (existing) {
    console.log('Already exists, skipping create:', existing.id)
  } else {
    const created = await prisma.alliedResource.create({
      data: {
        name: 'Aliados Colombia',
        url: 'https://aliadoscolombia.com',
        org: 'Independiente — Dra. Nathalia Villada (@nathaporlosanimales) y un colaborador',
        description:
          'Red de voluntariado para emergencias que conecta profesionales y voluntarios con fundaciones en toda Colombia. Incluye un "muro de necesidades" en tiempo real, registro de disponibilidad de voluntarios por más de 13 áreas de capacidad (alimentación, salud, rescate, construcción, logística, etc.) y registro de fundaciones. Los perfiles son privados — el equipo coordinador gestiona cada enlace, no son públicos.',
        category: 'VOLUNTEER_COORDINATION',
        hostingNoCustomDomain: false,
        ogImageUrl: null,
        tier: 3,
        status: 'LIVE',
        featured: true,
        notes:
          'Verificado en vivo 2026-08-20 (SPA con JS, no accesible vía fetch simple): 104 personas registradas, 29 municipios, 12 departamentos, 2 fundaciones al momento de la revisión -- cifras en vivo, cambian. Sin insignia de verificación oficial -- tratar como no verificado, igual que Ayudas Pereira. Según su propio aviso de privacidad: la inscripción no garantiza asignación de cupo ni participación en un voluntariado; datos protegidos bajo la Ley 1581 de 2012 de Colombia, usados solo para conectar voluntarios con fundaciones.',
      },
    })
    console.log('Created:', created.id)
  }

  const unfeatured = await prisma.alliedResource.updateMany({
    where: { id: 'clzsospereira0000000001' },
    data: { featured: false },
  })
  console.log('Un-featured SOS Pereira 2026:', unfeatured.count)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
