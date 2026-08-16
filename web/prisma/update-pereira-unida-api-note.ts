/**
 * One-off update: Pereira Unida was already seeded (2026-08-14, direct
 * team recommendation -- see its `notes`). This just appends a sentence
 * about its public API (pereiraunida.com/docs/api, key-gated) to the
 * existing description, per user request (2026-08-16). Not re-created --
 * every other field is left untouched. Run once via
 * `npx tsx prisma/update-pereira-unida-api-note.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const API_NOTE =
  ' Tiene una API pública (bajo API key, ver pereiraunida.com/docs/api) para consultar solicitudes de ayuda ("ayudas") y ofertas de voluntarios ("ayudantes") de forma programática.'

async function main() {
  const existing = await prisma.alliedResource.findFirst({ where: { url: 'https://pereiraunida.com' } })
  if (!existing) {
    console.log('Pereira Unida not found -- nothing to update')
    return
  }
  if (existing.description.includes('API pública')) {
    console.log('API note already present, skipping')
    return
  }
  await prisma.alliedResource.update({
    where: { id: existing.id },
    data: { description: existing.description + API_NOTE },
  })
  console.log('Updated Pereira Unida description with API note')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
