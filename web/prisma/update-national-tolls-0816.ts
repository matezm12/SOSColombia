/**
 * National-level toll refresh (2026-08-16 evening) + first department-level
 * death toll for Quindío + a second, independently-sourced MISSING_OFFICIAL
 * figure from Medicina Legal that conflicts with UNGRD's — logged as a
 * separate row per the project's established discipline (see pass 70,
 * "Cali, a toll jump with a live contradiction"): never merge or silently
 * pick between two real, differently-sourced official figures, log both
 * and let the append-only history + notes make the conflict visible.
 *
 * National figures (11 metrics) all come from one UNGRD situational
 * bulletin (16 ago) as quoted by El Tiempo -- one coherent, internally
 * consistent source, not blended across articles (other same-day search
 * results showed different totals from different UNGRD bulletins; only
 * this one directly-fetched article's numbers are used here).
 *
 * EDIFICIOS_COLAPSADOS drops from 121 (08-14) to 66 (08-16) in the new
 * bulletin -- a real official number, not a data-entry error. Recorded
 * as-is with a note; likely a reclassification between bulletins, not
 * something for us to resolve.
 *
 * Department table gaps: Cauca and Tolima genuinely have no published
 * department-level death toll anywhere (confirmed via direct search, not
 * just an oversight) -- left absent rather than invented. Quindío's is
 * added (3, tier 3, local outlet with named victims). The other five
 * departments' existing figures (08-12) were searched for updates; none
 * found, so they're left untouched rather than re-inserted unchanged.
 *
 * Run once via `npx tsx prisma/update-national-tolls-0816.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const quindio = await prisma.department.findFirstOrThrow({ where: { name: 'Quindío' } })

  const sourceDefs = [
    {
      key: 'ungrd_balance_0816',
      url: 'https://www.eltiempo.com/colombia/otras-ciudades/balance-oficial-de-la-ungrd-este-16-de-agosto-tras-terremoto-de-7-4-en-colombia-289-fallecidos-4-187-heridos-y-143-desaparecidos-3578742',
      org: 'UNGRD (vía El Tiempo)',
      tier: 2,
    },
    {
      key: 'medlegal_comunicado11_0815',
      url: 'https://www.infobae.com/colombia/2026/08/16/medicina-legal-avanza-en-el-reconocimiento-de-victimas-del-terremoto-ya-son-279-los-cuerpos-confirmados/',
      org: 'Instituto Nacional de Medicina Legal y Ciencias Forenses, Comunicado Oficial No. 11 (vía Infobae)',
      tier: 2,
    },
    {
      key: 'medlegal_207desaparecidos',
      url: 'https://www.elpais.com.co/colombia/medicina-legal-reporta-207-personas-desaparecidas-relacionadas-con-el-terremoto-este-es-el-listado-1453.html',
      org: 'Instituto Nacional de Medicina Legal y Ciencias Forenses (vía El País Cali)',
      tier: 2,
    },
    {
      key: 'pilasarmenia_quindio3muertes',
      url: 'https://www.pilasarmenia.com/2026/08/14/en-el-quindio-van-tres-victimas-mortales-por-el-terremoto/',
      org: 'Pilas Armenia',
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

  const nationalAsOf = '2026-08-16T00:00:00-05:00'

  const tollDefs = [
    // National, single UNGRD bulletin (16 ago)
    { metric: 'DEATHS_REPORTED_OFFICIAL' as const, value: 289, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto. Sube desde 287 (14 de agosto).' },
    { metric: 'INJURED' as const, value: 4187, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto. Sube desde 3.975 (14 de agosto).' },
    { metric: 'MISSING_OFFICIAL' as const, value: 143, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto: 143 desaparecidos. Baja desde 400 (14 de agosto) -- cifra de desaparecidos ha sido muy volátil día a día (202 el 14, 320 el 15 según otras fuentes, 143 el 16), sin explicación oficial del descenso. Ver también el registro separado de Medicina Legal (207) el mismo día -- dos fuentes oficiales distintas, cifras distintas, ambas registradas sin fusionar.' },
    { metric: 'MISSING_OFFICIAL' as const, value: 207, unit: 'identificadas por nombre', sourceKey: 'medlegal_207desaparecidos', tier: 2, asOf: nationalAsOf, notes: 'Listado de Medicina Legal con 207 personas desaparecidas relacionadas con el terremoto, identificadas por nombre -- distinto del conteo UNGRD (143) registrado en la misma pasada. Fecha exacta de corte no especificada en el artículo, se usa el 16 de agosto como fecha de publicación/hallazgo. CONTRADICCIÓN A SEÑALAR: no se concilian las dos cifras, ambas quedan visibles para que un moderador las revise.' },
    { metric: 'DAMNIFICADOS_PERSONAS' as const, value: 185016, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto. Sube desde 102.262 (14 de agosto).' },
    { metric: 'DAMNIFICADOS_FAMILIAS' as const, value: 120238, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto. Sube desde 45.523 (14 de agosto).' },
    { metric: 'VIVIENDAS_DESTRUIDAS' as const, value: 26945, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto. Sube desde 12.828 (14 de agosto).' },
    { metric: 'VIVIENDAS_AVERIADAS' as const, value: 127557, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto. Sube desde 73.455 (14 de agosto).' },
    { metric: 'EDIFICIOS_COLAPSADOS' as const, value: 66, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto: 66 edificios colapsados -- BAJA desde 121 (14 de agosto). Cifra oficial real, no un error de captura; probablemente una reclasificación de criterio entre boletines (p.ej. "colapsado" vs "con daño estructural severo"), no confirmado. Registrado tal cual, sin ajustar.' },
    { metric: 'CENTROS_EDUCATIVOS_AFECTADOS' as const, value: 2838, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto. Sube desde 2.205 (14 de agosto).' },
    { metric: 'CENTROS_SALUD_AFECTADOS' as const, value: 285, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto. Sube desde 240 (14 de agosto).' },
    { metric: 'CENTROS_COMUNITARIOS_AFECTADOS' as const, value: 3782, unit: null, sourceKey: 'ungrd_balance_0816', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 16 de agosto. Primer registro nacional de esta métrica (no había cifra previa).' },
    // Medicina Legal, forensic ID count (distinct source/date from the UNGRD bulletin)
    { metric: 'DEATHS_CONFIRMED_FORENSIC' as const, value: 279, unit: 'identificados', sourceKey: 'medlegal_comunicado11_0815', tier: 2, asOf: '2026-08-15T16:00:00-05:00', notes: 'Comunicado Oficial No. 11 de Medicina Legal (corte 15 de agosto, 4:00pm): 279 cuerpos identificados de 287 recibidos. Sube desde 243 (14 de agosto).' },
    // Department: Quindío's first department-level death toll
    { metric: 'DEATHS_REPORTED_OFFICIAL' as const, value: 3, unit: null, sourceKey: 'pilasarmenia_quindio3muertes', tier: 3, asOf: '2026-08-14T00:00:00-05:00', notes: 'Primer registro departamental de Quindío (antes solo Chocó/Antioquia/Caldas/Risaralda/Valle del Cauca tenían fila). Medio local, 3 víctimas nombradas (Diana Marcela Duque, Daniel Gutiérrez, Yesica Lorena Céspedes Rondón). Cauca y Tolima siguen sin cifra departamental publicada -- búsqueda confirmó que no existe, no es un vacío por no buscar.', departmentId: quindio.id },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const isDept = 'departmentId' in t
    const existing = await prisma.tollRecord.findFirst({
      where: {
        municipioId: null,
        departmentId: isDept ? t.departmentId : null,
        metric: t.metric,
        value: t.value,
        asOf: new Date(t.asOf),
      },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: null,
        departmentId: isDept ? t.departmentId : null,
        metric: t.metric,
        value: t.value,
        unit: t.unit ?? undefined,
        sourceId: sources[t.sourceKey],
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    tollCreated++
    console.log(`Created TollRecord: ${t.metric} = ${t.value}${isDept ? ' (Quindío)' : ' (nacional)'}`)
  }
  console.log(`\nTollRecord: ${tollCreated} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
