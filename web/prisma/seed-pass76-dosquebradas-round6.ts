/**
 * Pass 76 (2026-08-16) — round 6 continues, Dosquebradas. Five prior
 * rounds (21, 30, 42, 52, 65) already covered this city. This round's
 * biggest development is a status update, not a new site: the official
 * Alcaldía Instagram confirms all four shelters are now operational —
 * the "4th shelter under construction" seeded in pass 52 (as "Albergue
 * en construcción — La Graciela") is now open with an exact address
 * (cancha del barrio Minuto de Dios, capacity 150), and pass 65's
 * "Centro Vida José Argemiro Cárdenas," previously queued behind
 * Violetas filling up, is now confirmed active. Neither is re-seeded
 * as a new row — same entities, richer detail, folded into the wiki.
 *
 * Genuinely new: a community-run acopio at a union hall in barrio
 * Guadalupe, and a UNGRD material-aid delivery (70 tents, 210
 * blankets) straight to the municipal government. A notable
 * accountability story broke too — a contractor's heavy-machinery
 * demolitions in La Graciela without letting residents retrieve
 * belongings, escalating to a formal complaint and a PMU-mediated
 * ban on heavy equipment there — but despite real effort across all
 * five agents, none obtained a genuine social-platform permalink for
 * it (X fetches blocked with HTTP 402, only news-site URLs available),
 * so per the project's standing rule it is NOT seeded as a
 * PendingSocialPost — documented in the wiki narrative instead. Same
 * treatment for a named in-city quake death (a 17-year-old student,
 * Roger David Ramírez Quiroz, killed by a collapsing wall at Colegio
 * Fabio Vásquez Botero) — real and dated, but no verifiable permalink.
 *
 * Toll: round 5's uncorroborated "10 fallecidos" city figure got no
 * fresh confirmation or contradiction this round. Two earlier,
 * single-source, mutually-conflicting counts turned up (7 vs. 8 dead,
 * both dated Aug 11) — neither meets the corroboration bar on its own,
 * so no TollRecord is logged; all three figures are laid out in the
 * wiki as unresolved context. Crowdfunding and scam reports both stay
 * a confirmed null this round.
 * See wiki/17-allied-resources-and-community.md "Pass 76" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass76-dosquebradas-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const dosquebradas = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66170' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Acopio Sindicato de Trabajadores de La Rosa (Barrio Guadalupe)',
      address: 'Calle 33 # 14-46, barrio Guadalupe, Dosquebradas, Risaralda (a una cuadra de CHEC)',
      phone: null,
      needsText: 'Alimentos, kit de aseo básico, y voluntarios para empacar, cocinar y distribuir ayuda a familias damnificadas. Colecta comunitaria, distinta de los canales oficiales, coordinada por su capacidad de almacenamiento, logística y transporte propios.',
      sourceUrl: 'https://www.instagram.com/reel/DcCfOuyusqn/',
      sourceOrg: 'Sindicato de Trabajadores de La Rosa, vía @compremoslocal y @diegorodriguez.co',
      submitterNote: 'Corroborado de forma independiente por dos agentes de esta pasada, ambos citando la misma dirección exacta (calle 33 #14-46, barrio Guadalupe) y el mismo coordinador nombrado. El mismo post también lista un punto de acopio en Pereira (el_solar_pereira) — excluido explícitamente por no ser de Dosquebradas.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: dosquebradas.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: dosquebradas.id,
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

  const socialPosts = [
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/GestionUNGRD/posts/-dosquebradas-risaraldala-ungrd-entreg%C3%B3-al-municipio-70-carpas-y-210-frazadas-pa/1456405276515775/',
      authorHandle: 'UNGRD (Unidad Nacional para la Gestión del Riesgo de Desastres)',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas, Risaralda',
      note: 'La UNGRD entregó al municipio de Dosquebradas 70 carpas y 210 frazadas para apoyar la atención de familias afectadas — entrega de ayuda material nacional-a-municipal específica de Dosquebradas, corroborada de forma idéntica en al menos 5 publicaciones de Facebook y en la cuenta oficial de UNGRD en X.',
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
        municipioId: dosquebradas.id,
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
