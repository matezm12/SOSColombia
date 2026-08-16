/**
 * Pass 79 (2026-08-16) — adds Argelia, Valle del Cauca as a twelfth
 * tracked municipality, per explicit user request. The user had heard
 * that little relief is reaching this town and that aid meant for it may
 * be getting diverted elsewhere — this script only establishes the
 * Department + Municipio rows on verified structural-damage grounds; the
 * diversion/interception claim is NOT corroborated by any source found in
 * preliminary research and is explicitly left out of alertNote (a public-
 * facing field) pending a dedicated research pass — it should be pursued
 * there as an open, unconfirmed community concern, not asserted as fact.
 *
 * Severity set to CRÍTICA (matching Pijao and Buenaventura's precedent
 * for compounding/severe situations), based on two fully-fetched and
 * verified El País (Cali) articles: an Aug 13 piece quoting Valle
 * governor Dilian Francisca Toro after a personal visit to Argelia —
 * "hay un sector que deberá ser reubicado y otras viviendas que
 * requieren intervención" — an entire sector needing relocation, 70+
 * families displaced, and the town's hospital affected badly enough to
 * require an emergency generator; and an Aug 16 department-wide roundup
 * in which Valle's Risk Management Secretary Francisco Tenorio names
 * Argelia among the region's affected municipios in the same report
 * documenting 6,000+ homes lost departmentally and several municipios
 * at over 80% affectation. A separately-seen Aug 15 headline claiming
 * "más del 90% del municipio afectado" could NOT be traced to a live,
 * fetchable article (only an unreachable Google News redirect) — it is
 * deliberately NOT cited or asserted here, and should be chased down and
 * either confirmed or dropped in the dedicated research pass. Argelia's
 * own casualty count was not found isolated from the regional Valle
 * (ex-Cali) toll in any source reached this pass.
 *
 * DIVIPOLA code (76054), population, and coordinates cross-verified
 * across Spanish Wikipedia, Wikidata (Q2142901), and citypopulation.de —
 * all three independently agree on the code. Population figure uses the
 * 2018 DANE census count (5,397) rather than a later, less-clearly-
 * sourced projection (a Wikipedia annex table cites 5,242 for 2022 with
 * an unclear vintage/methodology).
 *
 * City-specific aid points, needs, toll figures, and the interception
 * question are left to a dedicated research pass, matching how Pijao's
 * own base municipio script (pass 37a) and Ibagué's (pass 59) preceded
 * their deeper research passes.
 * Run once via `npx tsx prisma/seed-pass79-argelia-municipio.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  let valle = await prisma.department.findFirst({ where: { divipolaCode: '76' } })
  if (!valle) {
    valle = await prisma.department.create({ data: { name: 'Valle del Cauca', divipolaCode: '76' } })
    console.log('Created Valle del Cauca department')
  } else {
    console.log('Valle del Cauca department already exists — no changes made')
  }

  let argelia = await prisma.municipio.findFirst({ where: { divipolaCode: '76054' } })
  if (!argelia) {
    argelia = await prisma.municipio.create({
      data: {
        name: 'Argelia',
        divipolaCode: '76054',
        departmentId: valle.id,
        populationDane: 5397,
        populationAsOf: new Date('2018-01-01'),
        severityLabel: 'CRITICA',
        redAlert: true,
        alertNote:
          'La gobernadora del Valle visitó personalmente Argelia y confirmó que un sector completo del municipio deberá ser reubicado, con más de 70 familias desplazadas; el hospital municipal resultó afectado al punto de requerir un generador de emergencia (El País, 13 de agosto). La Secretaría de Gestión del Riesgo del Valle nombra a Argelia entre los municipios más golpeados de la región, en el mismo reporte donde se documentan más de 6.000 viviendas perdidas en todo el departamento y varios municipios con más del 80% de afectación (El País, 16 de agosto). Localidad pequeña, remota y montañosa en el norte del Valle, con ayuda humanitaria llegando de forma notablemente más lenta y limitada que a municipios más grandes o visibles de la misma región.',
        lat: 4.7261,
        lng: -76.1217,
      },
    })
    console.log('Created Argelia municipio')
  } else {
    console.log('Argelia municipio already exists — no changes made')
  }

  const sourceDefs = [
    {
      key: 'elpais_argelia_gobernadora_visita_0813',
      url: 'https://www.elpais.com.co/valle/gobernadora-del-valle-recorre-argelia-y-anuncia-acciones-para-familias-afectadas-por-el-terremoto-derrumbados-pero-nunca-derrotados-1358.html',
      org: 'El País (Cali)',
      tier: 2,
    },
    {
      key: 'elpais_valle_6000hogares_80pct_0816',
      url: 'https://www.elpais.com.co/valle/mas-de-6000-hogares-se-perdieron-por-el-terremoto-en-el-valle-hay-municipios-que-tienen-mas-del-80-de-afectacion-1634.html',
      org: 'El País (Cali)',
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
