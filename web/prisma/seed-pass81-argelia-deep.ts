/**
 * Pass 81 (2026-08-16) — Argelia, Valle del Cauca's first deep research
 * pass (5 agents), immediately following its addition as a tracked
 * municipio in pass 79.
 *
 * THE INTERCEPTION QUESTION: all five independent agents, searching
 * dozens of distinct term combinations across news, X, Instagram,
 * Facebook and TikTok, found ZERO corroboration for the aid-
 * interception/diversion allegation that motivated adding this city.
 * No news coverage, official statement, oversight-body action, or even
 * fringe social-media chatter alleges aid meant for Argelia was stolen
 * or redirected. What IS well-documented, across four independent
 * mainstream outlets (Canal Trece, Vanguardia, El País, Semana) plus a
 * private citizen's own GoFundMe letter, is a genuine and different
 * story: Argelia is real but overshadowed and slow to reach — national
 * attention and resources concentrate on Cali/Pereira/Manizales, rural
 * censuses in the norte-del-Valle corridor hadn't even started as of
 * Aug 16 (a neighboring town's own acting mayor admitted this on the
 * record), and the earliest aid to reach these towns came informally,
 * from passing drivers and personal contacts, before institutions
 * arrived. This access/attention-gap story — not diversion — is what's
 * recorded here. The interception claim itself is left unrepeated
 * as fact anywhere in this seed or the wiki, consistent with pass 79's
 * decision to keep it out of the public alertNote; a genuine caveat
 * remains that Facebook/WhatsApp-level grassroots complaints (the most
 * likely place a real rumor like this would surface) could not be
 * directly swept this pass — the tool that would do that (live,
 * authenticated social search) was unavailable across all five agents.
 *
 * CONFIRMED: the "más del 90% del municipio afectado" figure that
 * pass 79 explicitly declined to cite (only an unreachable Google News
 * redirect was found then) is real — El País, Aug 15, directly quoting
 * Cuerpo de Bomberos de Argelia officer Yulian Giraldo, independently
 * echoed by a community Instagram account. Not logged as a TollRecord
 * (no metric in the schema maps to "% of municipio affected"), but
 * confirmed and cited narratively in the wiki.
 *
 * Toll figures logged: DAMNIFICADOS_FAMILIAS (70+, ~400 people, the
 * same figure pass 79 already cited in alertNote — now with a named
 * barrio, Monserrate, where a 100+ meter fissure threatens a
 * landslide); DEATHS_REPORTED_OFFICIAL (zero — independently confirmed
 * by both the Cuerpo de Bomberos and the mayor's own statement, two
 * different official channels agreeing); CENTROS_SALUD_AFECTADOS (the
 * town's one hospital, out of service, corroborated by three
 * independent outlets).
 *
 * Aid points: two live, directly-verified GoFundMe campaigns (donor
 * ledgers loaded and read firsthand, not just search snippets), plus a
 * medium-confidence WhatsApp contact for a named volunteer firefighter
 * that circulated organically across two independent posts. Several
 * other informal Nequi/DaviPlata donation numbers and out-of-town
 * collection points surfaced but were NOT seeded — confidence too low
 * and control too unverifiable to publish as legitimate channels even
 * through the moderation queue; documented as a caution in the wiki
 * instead.
 * See wiki/17-allied-resources-and-community.md "Pass 81" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass81-argelia-deep.ts`.
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
      name: 'GoFundMe: "¡Apoyemos a Argelia! - Let\'s Support Argelia" (Sara Marin para Martha Zuluaga)',
      address: null,
      phone: null,
      needsText: 'Fondos para que voluntarios locales compren materiales de refugio, gas, comida, agua e insumos en ciudades cercanas y los transporten a Argelia. La familia describe más del 80% de las viviendas destruidas o inhabitables, gente durmiendo en la calle sin gas y con electricidad y agua limitadas.',
      sourceUrl: 'https://www.gofundme.com/f/lets-support-argelia-apoyemos-a-argelia',
      sourceOrg: 'GoFundMe — organizadora Sara Marin, para Martha Zuluaga',
      submitterNote: 'Página en vivo verificada directamente (no solo un snippet de búsqueda): $1,050 recaudados de una meta de $4,000, 16 donantes, creada ~14 de agosto de 2026. Organizadora en Brewster, MA (EE.UU.), con familia en Argelia.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Earthquake Colombia Argelia" (Jhonny Hernandez / London Thames FC)',
      address: null,
      phone: null,
      needsText: 'Fondos para refugio de emergencia, comida, agua, ropa, cobijas, insumos de higiene, reparación de viviendas y necesidades médicas.',
      sourceUrl: 'https://www.gofundme.com/f/earthquake-colombia-argelia',
      sourceOrg: 'GoFundMe — organizador Jhonny Hernandez',
      submitterNote: 'Página en vivo verificada directamente: £2,273 recaudados de una meta de £3,000, 35 donantes, creada ~11 de agosto de 2026. El organizador, gerente del club London Thames FC (Reino Unido), había visitado Argelia un día antes del sismo.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Contacto WhatsApp — Yulian Giraldo, bombero voluntario de Argelia',
      address: null,
      phone: '+57 320 726 3014',
      needsText: '"Casi el 70% de las viviendas tienen daños. Necesitan ayuda urgente." Contacto directo para quienes puedan enviar ayuda o brindar apoyo.',
      sourceUrl: 'https://x.com/juanmartinbc',
      sourceOrg: 'Relayed by journalist Juan Martín Bravo C., a pedido de Yulian Giraldo (Cuerpo de Bomberos de Argelia)',
      submitterNote: 'Confianza media: el mismo número circuló de forma independiente en una publicación separada de Facebook (grupo "MIO Usuarios"), lo que sugiere difusión orgánica y no un solo actor. Sigue siendo un contacto personal informal, no un canal institucional auditado.',
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

  const sourceDefs = [
    {
      key: 'elpais_argelia_gobernadora_visita_0813',
      url: 'https://www.elpais.com.co/valle/gobernadora-del-valle-recorre-argelia-y-anuncia-acciones-para-familias-afectadas-por-el-terremoto-derrumbados-pero-nunca-derrotados-1358.html',
      org: 'El País (Cali)',
      tier: 2,
    },
    {
      key: 'elpais_argelia_balance_danos_monserrate_0813',
      url: 'https://www.elpais.com.co/valle/balance-de-danos-en-el-cairo-el-aguila-argelia-ansermanuevo-y-el-corregimiento-de-san-francisco-en-toro-esto-dice-la-gobernacion-1340.html',
      org: 'El País (Cali)',
      tier: 2,
    },
    {
      key: 'semana_argelia_bombero_0812',
      url: 'https://www.semana.com/politica/articulo/casas-partidas-techos-colapsados-y-gente-que-pide-ayuda-semana-llego-hasta-argelia-valle-donde-un-barrio-tendra-que-desaparecer-tras-el-terremoto/202629/',
      org: 'Semana',
      tier: 2,
    },
  ] as const

  const sources: Record<string, string> = {}
  for (const s of sourceDefs) {
    let src = await prisma.source.findFirst({ where: { url: s.url } })
    if (!src) {
      src = await prisma.source.create({ data: { url: s.url, org: s.org, tier: s.tier } })
      console.log(`Created Source: ${s.key}`)
    }
    sources[s.key] = src.id
  }
  console.log(`Sources ensured: ${Object.keys(sources).length}`)

  const tollDefs = [
    {
      metric: 'DAMNIFICADOS_FAMILIAS' as const,
      value: 70,
      asOf: '2026-08-13T16:00:00-05:00',
      sourceKey: 'elpais_argelia_gobernadora_visita_0813',
      tier: 2,
      notes: 'Cifra directa de la gobernadora del Valle, Dilian Francisca Toro, tras su recorrido por Argelia: más de 70 familias afectadas (~400 personas, estimado de fuentes secundarias). Un sector completo — identificado por el alcalde Wilson Vanegas como el barrio Monserrate — debe ser reubicado por una fisura de más de 100 metros que amenaza con generar un deslizamiento hacia el sector La Pista.',
    },
    {
      metric: 'DEATHS_REPORTED_OFFICIAL' as const,
      value: 0,
      asOf: '2026-08-11T12:00:00-05:00',
      sourceKey: 'semana_argelia_bombero_0812',
      tier: 2,
      notes: 'Doblemente confirmado por dos canales oficiales independientes: el oficial del Cuerpo de Bomberos de Argelia, Yulian Giraldo, declaró a Semana "No hemos tenido víctimas fatales" (12 de agosto); el alcalde Wilson Vanegas Villa emitió por separado un "parte de tranquilidad" oficial en Facebook con la misma afirmación (~11 de agosto), replicado de forma independiente por la página "Soy Radio Viva" el mismo día.',
    },
    {
      metric: 'CENTROS_SALUD_AFECTADOS' as const,
      value: 1,
      asOf: '2026-08-13T12:00:00-05:00',
      sourceKey: 'elpais_argelia_balance_danos_monserrate_0813',
      tier: 2,
      notes: 'El único hospital municipal de Argelia quedó fuera de servicio, sin planta eléctrica ("sin planta eléctrica" — cita directa de la gobernadora), obligando a atender heridos bajo carpas de campaña. Corroborado de forma independiente por El Espectador (listado entre ~12 hospitales dañados del Valle) y por Las2Orillas/Acento-France24. La Gobernación instaló posteriormente un generador de emergencia.',
    },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: argelia.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: argelia.id,
        metric: t.metric,
        value: t.value,
        sourceId: sources[t.sourceKey],
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    tollCreated++
  }
  console.log(`TollRecord: ${tollCreated} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
