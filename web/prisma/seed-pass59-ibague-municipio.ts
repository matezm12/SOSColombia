/**
 * Pass 59 (2026-08-15) — adds Ibagué, Tolima as an eleventh tracked
 * municipality, per explicit user request drawing a direct parallel to
 * Pijao: a compounding earthquake + wildfire crisis. Tolima's governor
 * (Adriana Magali Matiz) declared a department-level crisis and announced
 * a Fondo Mixto de Reconstrucción del Tolima explicitly covering both
 * quake and fire losses; the department has 46 municipios en alerta roja
 * (second-highest in the country), 10,000+ hectares burned, and 29-33
 * active fires as of Aug 15. Ibagué itself has confirmed quake-specific
 * damage independent of the fires: structural cracks reported at the
 * Palacio de Justicia, multiple landslides in the Cañón del Combeima, and
 * ash/smoke cover over the city (masks recommended). As with Pijao, the
 * wildfire wave is NOT confirmed to be earthquake-triggered by any source
 * found (dry season and wind are the cited factors) — framed as a
 * compounding, concurrent disaster in alertNote, not a documented
 * consequence of the quake itself.
 *
 * This script only establishes the Department + Municipio rows. City-
 * specific aid points, needs, and toll figures are left to a dedicated
 * research pass (see wiki "Pass 59" and the follow-up pass), matching how
 * Pijao's own base municipio script (pass 37a) preceded its deeper
 * research passes (37b onward).
 *
 * Sources: Infobae ("Tras el terremoto, Colombia se enfrenta a los
 * incendios forestales: 340 municipios están en alerta roja", 2026-08-14),
 * Caracol Radio ("Incendios forestales en el Tolima dejan por lo menos
 * 800 familias damnificadas", 2026-08-15). Population and coordinates
 * from DANE via Wikipedia (2023 population figure, DIVIPOLA 73001).
 * Run once via `npx tsx prisma/seed-pass59-ibague-municipio.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  let tolima = await prisma.department.findFirst({ where: { divipolaCode: '73' } })
  if (!tolima) {
    tolima = await prisma.department.create({ data: { name: 'Tolima', divipolaCode: '73' } })
    console.log('Created Tolima department')
  } else {
    console.log('Tolima department already exists — no changes made')
  }

  let ibague = await prisma.municipio.findFirst({ where: { divipolaCode: '73001' } })
  if (!ibague) {
    ibague = await prisma.municipio.create({
      data: {
        name: 'Ibagué',
        divipolaCode: '73001',
        departmentId: tolima.id,
        populationDane: 542046,
        populationAsOf: new Date('2023-01-01'),
        severityLabel: 'ALTA',
        redAlert: true,
        alertNote:
          'Crítico también por la ola de incendios forestales que afecta a 46 municipios del Tolima (más de 10.000 hectáreas quemadas) desde días después del sismo — emergencia compuesta, no confirmada como causada por el terremoto. La Gobernación del Tolima declaró crisis departamental y anunció el Fondo Mixto de Reconstrucción del Tolima para cubrir daños de ambos eventos.',
        lat: 4.4378,
        lng: -75.2006,
      },
    })
    console.log('Created Ibagué municipio')
  } else {
    console.log('Ibagué municipio already exists — no changes made')
  }

  const sourceDefs = [
    {
      key: 'infobae_incendios_340municipios_0814',
      url: 'https://www.infobae.com/colombia/2026/08/14/tras-el-terremoto-colombia-se-enfrenta-a-los-incendios-forestales-340-municipios-estan-en-alerta-roja/',
      org: 'Infobae',
      tier: 2,
    },
    {
      key: 'caracolradio_tolima_800familias_0815',
      url: 'https://caracol.com.co/2026/08/15/incendios-forestales-en-el-tolima-dejan-por-lo-menos-800-familias-damnificadas/',
      org: 'Caracol Radio',
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
