/**
 * Pass 37a (2026-08-15) — adds Pijao, Quindío as a tenth tracked
 * municipality, per explicit user request: Pijao is fighting an
 * out-of-control wildfire (incendio forestal) in its rural veredas
 * (La Maicena, Cueva Loca, El Cinabrio, Cañaveral) that broke out the
 * evening of Aug 11 — the day after the M7.4 earthquake — and is still
 * not contained as of Aug 15, spreading into neighboring Génova. The
 * fire's cause is NOT confirmed to be earthquake-triggered by any source
 * found (dry season, steep terrain and wind are the cited factors) — it
 * is a compounding, concurrent disaster, not a documented consequence of
 * the quake itself. Framed that way deliberately in alertNote to avoid
 * overclaiming causation. See wiki/17-allied-resources-and-community.md
 * "Pass 37" for full sourcing.
 *
 * Sources: Canal Trece ("Doble emergencia en Pijao", 2026-08-12),
 * La Crónica del Quindío ("Génova y Pijao, en máxima alerta...",
 * 2026-08-14, and "Después del temblor" editorial, 2026-08-15).
 * Run once via `npx tsx prisma/seed-pass37a-pijao-municipio.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const quindio = await prisma.department.findFirstOrThrow({ where: { divipolaCode: '63' } })

  let pijao = await prisma.municipio.findFirst({ where: { divipolaCode: '63548' } })
  if (!pijao) {
    pijao = await prisma.municipio.create({
      data: {
        name: 'Pijao',
        divipolaCode: '63548',
        departmentId: quindio.id,
        populationDane: 5439,
        populationAsOf: new Date('2026-01-01'),
        severityLabel: 'CRITICA',
        redAlert: true,
        alertNote:
          'Crítico también por un incendio forestal fuera de control en sus veredas rurales desde el 11 de agosto (un día después del sismo) — emergencia compuesta, no confirmada como causada por el terremoto.',
        lat: 4.3328,
        lng: -75.7056,
      },
    })
    console.log('Created Pijao municipio')
  } else {
    console.log('Pijao municipio already exists — no changes made')
  }

  // ── Sources ──────────────────────────────────────────────────────────
  const sourceDefs = [
    {
      key: 'canaltrece_pijao_0812',
      url: 'https://canaltrece.com.co/noticias/doble-emergencia-en-pijao-tras-los-danos-del-terremoto-incendio-forestal-fuera-de-control-amenaza-bosques-y-cultivos-en-quindio/',
      org: 'Canal Trece',
      tier: 2,
    },
    {
      key: 'cronica_quindio_genova_pijao_0814',
      url: 'https://cronicadelquindio.com/quindio/genova-y-pijao-en-maxima-alerta-por-un-incendio-forestal-que-no-cede/',
      org: 'La Crónica del Quindío, citando al alcalde de Génova Diego Fernando Sicua Galvis',
      tier: 2,
    },
    {
      key: 'cronica_quindio_editorial_0815',
      url: 'https://cronicadelquindio.com/opinion/editorial/despues-del-temblor/',
      org: 'La Crónica del Quindío (editorial)',
      tier: 3,
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

  // ── Toll records ─────────────────────────────────────────────────────
  // Only figures that map cleanly onto the existing TollMetric enum are
  // logged here. Hectares burned (~200 in Pijao, ~230 total with Génova)
  // and aftershock counts have no corresponding metric and are NOT forced
  // into an ill-fitting one — they're documented in the wiki narrative and
  // in community-embed notes instead.
  const tollDefs = [
    {
      metric: 'VIVIENDAS_DESTRUIDAS' as const,
      value: 1,
      sourceKey: 'cronica_quindio_genova_pijao_0814',
      tier: 2,
      asOf: '2026-08-14T12:00:00-05:00',
      notes: 'Una vivienda deshabitada destruida por el incendio forestal (no por el sismo). Cinco familias más en alto riesgo de perder sus viviendas mientras el fuego sigue sin control, per el alcalde de Génova.',
    },
  ]

  let created = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: pijao.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: pijao.id,
        metric: t.metric,
        value: t.value,
        sourceId: sources[t.sourceKey],
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    created++
  }
  console.log(`TollRecord: ${created} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
