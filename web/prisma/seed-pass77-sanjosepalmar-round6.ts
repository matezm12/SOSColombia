/**
 * Pass 77 (2026-08-16) — round 6 continues, San José del Palmar, the
 * earthquake's epicenter. Five prior rounds (22, 31, 43, 53, 67) already
 * covered this small, remote town — as expected, this round stayed thin:
 * no new physical aid points inside the town, no casualty-figure change,
 * no fresh scam reports.
 *
 * The one genuine addition resolves an open thread from pass 67: a Cali
 * creator-organized supply truck for San José del Palmar (culotauro /
 * elgordomurillo, coordinated with the town's own Alcaldía) was logged
 * back then only as a social post, explicitly flagged "pista a verificar,
 * no punto de ayuda confirmado" for lack of a physical address. This
 * round found that address via the Alcaldía's own repost — upgraded to a
 * proper aid point now that it's confirmed.
 *
 * NOT seeded, by design: the Valentina Jurado Vaki campaign (tracked
 * since pass 22) ticked up again ($47,579/1,846 donors → $48,178/1,862,
 * still open, 3 days from its announced Aug 19 close) — per the
 * established pattern for this campaign, funding-total updates are
 * documented in the wiki narrative only, not re-seeded as a new row. A
 * single small, unverified X account's claim of international rescue
 * teams (Chile/US/Israel) arriving was not corroborated by any of the
 * other four agents despite real effort, so it's flagged in the wiki as
 * unconfirmed rather than reported as fact. A set of granular family/
 * house-damage figures attributed to the Alcaldía's Instagram was
 * independently flagged by a different agent's live-browser check as
 * likely a tool hallucination (contradicts a Semana figure, and a real
 * visit to the account couldn't load the post feed at all) — not logged.
 * See wiki/17-allied-resources-and-community.md "Pass 77" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass77-sanjosepalmar-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const sanJosePalmar = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27660' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de Acopio Cali para San José del Palmar (organizado por @culotauro y @elgordomurillo)',
      address: 'Calle 2C # 66B-40, Barrio La Cascada, Cali, Valle del Cauca (recolecta destinada a San José del Palmar)',
      phone: null,
      needsText: 'Productos físicos, no dinero: agua, enlatados, linternas, pilas, guantes, medicinas, jabón, papel higiénico. Llenando un camión con salida directa hacia San José del Palmar, epicentro del sismo.',
      sourceUrl: 'https://www.instagram.com/p/DcFlASft_PB/',
      sourceOrg: 'Creadores de contenido caleños (@culotauro, @elgordomurillo), en coordinación con la Alcaldía de San José del Palmar',
      submitterNote: 'Resuelve una pista abierta desde la pasada 67, cuando este mismo esfuerzo (mismos organizadores) se registró solo como publicación social por no tener dirección física confirmada. Esta pasada encontró la dirección exacta vía un repost en la cuenta oficial @alcaldiamunicipalsjp, con agradecimiento explícito al alcalde por "establecer esta conexión, para garantizar la recepción de las donaciones". El punto físico está en Cali, no en el municipio mismo — se siembra aquí porque su propósito único es canalizar ayuda hacia San José del Palmar.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: sanJosePalmar.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: sanJosePalmar.id,
        kind: a.kind,
        name: a.name,
        address: a.address ?? undefined,
        phone: a.phone ?? undefined,
        needsText: a.needsText,
        sourceUrl: a.sourceUrl,
        sourceOrg: a.sourceOrg ?? undefined,
        submitterNote: a.submitterNote,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    aidCreated++
  }
  console.log(`PendingAidPoint: ${aidCreated} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
