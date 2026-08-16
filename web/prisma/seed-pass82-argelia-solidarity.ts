/**
 * Pass 82 (2026-08-16) — Argelia, Valle del Cauca's second deep pass,
 * per an explicit user request to dig further into Argelia itself AND
 * specifically hunt for other cities/towns organizing aid for it.
 *
 * HEADLINE RESULT: Argelia's official "padrino" (sponsor municipio)
 * under Fedemunicipios' Plan Padrino entre Alcaldes is Pamplona, Norte
 * de Santander (alcalde Klaus Faber Mogollón) — this resolves pass 81's
 * headline-only lead, which one agent this round couldn't corroborate
 * on FCM's own static page (the pairing lives in an interactive,
 * JS-rendered database that a plain fetch can't see) while another
 * found it directly via live browser automation. Independently
 * confirmed here a third way: a direct fetch of Pamplona's own official
 * Instagram reel (@alcaldiadepamplona) explicitly announces the
 * sponsorship and lists accepted donation items. Status as of this
 * pass: "en proceso," no shipment confirmed delivered yet.
 *
 * A CAUTION ON VERIFICATION: this pass's research agents surfaced
 * several other candidate Cali-based collection points explicitly said
 * to serve Argelia (a Surtifamiliar supermarket "Caravana por la Vida"
 * drive, an influencer's home-address drive, the Alcaldía de Cali's
 * official redistribution point with a claimed 146kg delivered to
 * Argelia specifically) — before writing any of them to the database,
 * they were checked directly. Two could not be corroborated at all (one
 * turned up nothing in the account's current visible content; the other
 * exists but the specific 146kg-to-Argelia figure could not be
 * independently verified beyond a search snippet). The third —
 * Surtifamiliar's own post — actually names "Buenaventura y otros
 * municipios del norte" as its destination, NOT Argelia specifically;
 * the Argelia-specific address came only from a reposting account, not
 * Surtifamiliar itself. None of these three are seeded. This matches
 * the same "must name Argelia specifically, not just norte del Valle
 * generically" bar this project has already applied to Palmira's
 * diocesan campaign.
 *
 * Two new, directly-verified GoFundMe campaigns explicitly naming
 * Argelia: one from an individual with family ties to the town, one
 * from a Salento (Quindío)-based family/volunteer group personally
 * delivering supplies to Argelia and three neighboring norte-del-Valle
 * towns.
 *
 * INTERCEPTION QUESTION: still no corroboration found. The only
 * adjacent finding this round was a single vague, unattributed
 * Instagram comment about "personas inescrupulosas" — no named target,
 * no specific incident, explicitly not an interception allegation.
 * Conclusion unchanged from pass 81.
 * See wiki/17-allied-resources-and-community.md "Pass 82" for full
 * reasoning, including a genuine cross-department solidarity story
 * (Bruselas, Pitalito, Huila) and other findings not seeded here.
 * Run once via `npx tsx prisma/seed-pass82-argelia-solidarity.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const argelia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76054' } })

  const aidPoints = [
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Plan Padrino entre Alcaldes — Pamplona apadrina a Argelia (Fedemunicipios)',
      address: null,
      phone: '316 447 9587',
      needsText: 'Medicamentos, alimentos no perecederos sellados y con fecha vigente de al menos tres meses, carpas, cobijas, colchonetas, almohadas, kits de aseo, materiales de construcción, plantas eléctricas, y alimento para mascotas. Coordinado por la Alcaldía de Pamplona (Norte de Santander) como municipio "padrino" oficial de Argelia. Estado: en proceso (envío aún no confirmado como entregado).',
      sourceUrl: 'https://www.instagram.com/alcaldiadepamplona/reel/DcANfbGg71s/',
      sourceOrg: 'Alcaldía de Pamplona (alcalde Klaus Faber Mogollón), vía Federación Colombiana de Municipios',
      submitterNote: 'Confirmado de forma independiente por tres vías: la base de datos en vivo del Plan Padrino de Fedemunicipios (fcm.org.co/plan-padrino/ — solo visible vía navegador con JS, no vía fetch estático, lo que explica por qué un agente de esta misma pasada no pudo verlo en la página estática), el reel oficial de Instagram de la Alcaldía de Pamplona (verificado directamente, con el anuncio "Solidaridad por Argelia" y la lista de artículos aceptados), y cobertura de El País, Diario Occidente y Emisora Nueva Época. El mismo alcalde es simultáneamente co-padrino del vecino municipio de El Cairo.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Help Argelia, Colombia recover from 7.4 Earthquake" (Nicole Diaz)',
      address: null,
      phone: null,
      needsText: 'Agua, plantas eléctricas y alimentos para las zonas rurales de Argelia.',
      sourceUrl: 'https://www.gofundme.com/f/help-argelia-colombia-recover-from-74-earthquake',
      sourceOrg: 'GoFundMe — organizadora Nicole Diaz (Inglaterra)',
      submitterNote: 'Página en vivo verificada directamente: £218 recaudados de una meta de £1,000, 14 donantes. La organizadora describe vínculo familiar personal (finca de sus abuelos) en Argelia.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Help Colombia\'s Overlooked Communities After the Earthquake" (Daniela Camargo)',
      address: null,
      phone: null,
      needsText: 'Comida, agua, productos de higiene, insumos médicos/primeros auxilios, cobijas/ropa y transporte, para entrega personal en Argelia, El Cairo, El Águila y Roldanillo (Valle del Cauca), además de Quimbaya y Montenegro (Quindío).',
      sourceUrl: 'https://www.gofundme.com/f/help-colombias-overlooked-communities-after-the-earthquake',
      sourceOrg: 'GoFundMe — Daniela Camargo y grupo de voluntarios de Salento, Quindío',
      submitterNote: 'Página en vivo verificada directamente: $3,992 recaudados de una meta de $4,500, 48 donantes (89% completado), con donaciones recibidas hasta una hora antes de la verificación. Nombra explícitamente a Argelia como uno de los municipios beneficiarios — cumple el criterio de nombrar a Argelia específicamente, no solo "norte del Valle" en general.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: argelia.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: argelia.id,
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
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/alcaldiadepamplona/reel/DcANfbGg71s/',
      authorHandle: 'alcaldiadepamplona',
      category: 'OFFICIAL' as const,
      placeName: 'Pamplona, Norte de Santander (para Argelia, Valle del Cauca)',
      note: 'La Alcaldía de Pamplona anuncia públicamente "Solidaridad por Argelia" como parte del Plan Padrino entre Alcaldes, describiendo a Argelia como un municipio de "7 mil habitantes... destruido en más del 80%" — cifra de encuadre propio de Pamplona, distinta de la cifra ya establecida (~5.400 personas, más del 90% afectado, según El País/Bomberos de Argelia) — no se usa para reemplazar esa cifra, se documenta como una variante de encuadre. Lista de donaciones aceptadas incluida en el post.',
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
        municipioId: argelia.id,
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
