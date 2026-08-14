/**
 * One-off loader for pass 8 (2026-08-14) — GitHub search for new allied
 * sites (same technique as passes 1/3), plus a direct TikTok search
 * (previously only agent-sampled). See
 * wiki/17-allied-resources-and-community.md "Pass 8" for context, including
 * why this is the only new AlliedResource this pass.
 * Run once via `npx tsx prisma/seed-pass8-sites.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const existing = await prisma.alliedResource.findFirst({
    where: { url: 'https://andresabarca-atlas.github.io/terremoto-colombia-2026/' },
  })
  if (existing) {
    console.log('Skipping — already seeded')
    return
  }
  await prisma.alliedResource.create({
    data: {
      name: 'Terremoto Colombia 2026 — Impacto en Edificaciones',
      url: 'https://andresabarca-atlas.github.io/terremoto-colombia-2026/',
      org: 'Cuenta personal de GitHub (andresabarca-atlas) — afiliación institucional no confirmada',
      description:
        'Dashboard de pérdida económica y daño estructural estimados, usando metodología estilo BID/GEM (Global Earthquake Model) sobre el evento del 10 de agosto de 2026 — pérdida directa, personas afectadas, estructuras irreparables por departamento/municipio.',
      category: 'MAP_TRACKER',
      hostingNoCustomDomain: true,
      tier: 5,
      notes:
        'ADVERTENCIA DE ATRIBUCIÓN: el sitio se presenta con una insignia "USO INTERNO" y texto "Evaluación rápida del BID" (Banco Interamericano de Desarrollo), pero está alojado en GitHub Pages bajo una cuenta personal, no una cuenta institucional del BID — no se pudo confirmar afiliación oficial. El propio sitio incluye su descargo de responsabilidad: "Cifras preliminares generadas con modelos — uso interno del BID. No constituyen una evaluación oficial de daños ni sustituyen las cifras de las autoridades competentes." Tratar como una estimación modelada independiente que usa metodología/datos de exposición GEM 2023, no como una publicación oficial del BID. Repositorio: github.com/andresabarca-atlas/terremoto-colombia-2026.',
    },
  })
  console.log('Created AlliedResource: Terremoto Colombia 2026 — Impacto en Edificaciones')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
