/**
 * Pass 61 (2026-08-15) — round 5, Quibdó, PARTIAL. Four of the five
 * research agents (X, Instagram, Facebook, TikTok) hit a session-wide
 * capacity limit mid-run and failed outright; only the crowdfunding
 * agent completed, and — with WebSearch also exhausted — it fell back to
 * a broad browser sweep covering more ground than its own label
 * suggests. The four missing angles are deferred to a follow-up pass
 * once capacity resets, not abandoned.
 *
 * The one real finding: Hospital San Francisco de Asís, already flagged
 * as evacuated once (pass 27) and near its limit (pass 49), took a
 * second hit — a M4.2 aftershock on Aug 14 forced another partial
 * evacuation, and the Superintendencia de Salud has since formally
 * intervened the hospital, naming an agente interventor. Not an
 * improvement since pass 49; if anything, a step further into crisis.
 *
 * Everything else the surviving agent checked (the Benavides fraud
 * scandal, new scam reports, subsidy disbursement, the death toll,
 * three already-seeded GoFundMe campaigns, the Vaki solar-lighting
 * campaign) came back as "no material new movement" or an explicit
 * rejection — see wiki "Pass 61" for the honest negative-finding detail
 * instead of padding this script with non-findings.
 * Run once via `npx tsx prisma/seed-pass61-quibdo-round5-partial.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  const socialPosts = [
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcEECQ8Bpyu/',
      authorHandle: 'gobernaciondelchoco',
      category: 'OFFICIAL' as const,
      placeName: 'Hospital San Francisco de Asís, Quibdó',
      note: 'ACTUALIZACIÓN DE ESTADO: una réplica de magnitud 4.2 (epicentro en San José del Palmar) el 14 de agosto ~9:42am forzó una segunda evacuación parcial — pacientes trasladados afuera bajo carpas donadas por una licorera, muros agrietados, un pasillo del primer piso cerrado; los pacientes de UCI permanecieron adentro por depender de equipos de soporte vital. El gerente Ovidio Garrido activó de nuevo los protocolos de emergencia. Desarrollo estructural más significativo: la Superintendencia de Salud intervino el hospital, nombrando al propio Ovidio Garrido como agente interventor; la sala de urgencias reportó estar entre 245% y 340% por encima de su capacidad según la fuente/fecha. La Gobernación del Chocó (Nubia Carolina Córdoba Curi) anunció una inversión de $1.200 millones COP para el área de urgencias. El Minsalud a nivel nacional cuestionó públicamente la caracterización de la Gobernación sobre la gravedad de la crisis — una disputa intergubernamental sobre qué tan grave es realmente la situación. En conjunto: el hospital sigue operando pero no se ha estabilizado, y ahora está bajo intervención formal — no es una mejora respecto a la pasada 49, sino un paso más hacia la crisis.',
    },
  ]

  let postsCreated = 0
  for (const p of socialPosts) {
    const existing = await prisma.pendingSocialPost.findFirst({ where: { permalink: p.permalink } })
    if (existing) continue
    await prisma.pendingSocialPost.create({
      data: {
        platform: p.platform,
        permalink: p.permalink,
        authorHandle: p.authorHandle,
        category: p.category,
        municipioId: quibdo.id,
        placeName: p.placeName ?? undefined,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    postsCreated++
  }
  console.log(`PendingSocialPost: ${postsCreated} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
