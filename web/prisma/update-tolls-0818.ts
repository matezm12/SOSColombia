/**
 * Toll refresh (2026-08-18 morning), national + Pereira + Cali + Manizales +
 * Popayán. Sourced from a 5-agent parallel research pass, every figure below
 * personally re-verified by direct WebFetch against the actual article
 * before being written here (not just trusting the agents' reports).
 *
 * National: one UNGRD balance (6:30am, corte reflected 07:33 by El Tiempo)
 * -- all 9 national metrics here come from that single bulletin, not
 * blended across articles. CENTROS_COMUNITARIOS_AFECTADOS and
 * DEATHS_CONFIRMED_FORENSIC not mentioned in this bulletin -- left
 * untouched at their existing 08-16 values.
 *
 * Cali's own article explicitly frames its MISSING figure as "cifra en
 * proceso de depuración, antes 94" -- the article's own prior figure was 94,
 * not the 111 already on file here (from a different article/thread).
 * Recorded as-is with a note, not reconciled.
 *
 * Manizales VIVIENDAS_DESTRUIDAS drops from 1512 (08-15) to 1153 (08-16) --
 * the Alcaldía's own bulletin explicitly says it revises the prior 08-15
 * figure downward. Real correction, not a data error, recorded as-is.
 *
 * Popayán CENTROS_SALUD_AFECTADOS is a first-time metric for that city
 * (dated 08-12, older than today, but there was no prior figure at all for
 * this metric/scope, so it's a genuine addition, not a stale re-report).
 *
 * Run once via `npx tsx prisma/update-tolls-0818.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { name: 'Pereira' } })
  const cali = await prisma.municipio.findFirstOrThrow({ where: { name: 'Cali' } })
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { name: 'Manizales' } })
  const popayan = await prisma.municipio.findFirstOrThrow({ where: { name: 'Popayán' } })

  const sourceDefs = [
    {
      key: 'eltiempo_0818',
      url: 'https://www.eltiempo.com/colombia/otras-ciudades/terremoto-en-colombia-hoy-18-de-agosto-ultimas-noticias-balance-de-la-emergencia-y-nuevos-temblores-en-el-pais-3578987',
      org: 'UNGRD / Alcaldía de Pereira (vía El Tiempo, live blog)',
      tier: 2,
    },
    {
      key: 'elpais_cali_0818',
      url: 'https://www.elpais.com.co/cali/terremoto-en-cali-en-vivo-autoridades-suspenden-el-pico-y-placa-debido-a-la-emergencia-1007.html',
      org: 'Alcaldía de Santiago de Cali (vía El País Cali, live blog)',
      tier: 2,
    },
    {
      key: 'lapatria_manizales_0816',
      url: 'https://www.lapatria.com/manizales/terremoto-en-manizales-5241-damnificados-203-personas-en-albergues-y-1153-viviendas-con',
      org: 'Alcaldía de Manizales (vía La Patria)',
      tier: 2,
    },
    {
      key: 'elpais_cauca_0812',
      url: 'https://www.elpais.com.co/colombia/balance-del-terremoto-en-el-cauca-1241-casas-danadas-15-colegios-y-cinco-centros-de-salud-con-afectaciones-1210.html',
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

  const nationalAsOf = '2026-08-18T06:30:00-05:00'
  const caliAsOf = '2026-08-18T08:00:00-05:00'
  const pereiraAsOf = '2026-08-18T09:12:00-05:00'
  const manizalesAsOf = '2026-08-16T00:00:00-05:00'
  const popayanAsOf = '2026-08-12T00:00:00-05:00'

  const tollDefs = [
    // National -- single UNGRD balance, 18 de agosto 6:30am
    { metric: 'DEATHS_REPORTED_OFFICIAL' as const, value: 304, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto 6:30am. Sube desde 289 (16 de agosto).' },
    { metric: 'INJURED' as const, value: 4548, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto. Sube desde 4.187 (16 de agosto).' },
    { metric: 'MISSING_OFFICIAL' as const, value: 426, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto: 426 desaparecidos, 356 rescatados. Sube desde 143 (16 de agosto) -- UNGRD reconcilia registros con Fiscalía/Medicina Legal para evitar doble conteo, cifra sigue siendo volátil. Fila separada de Medicina Legal (207, identificadas por nombre) queda sin conciliar, como ya era el caso.' },
    { metric: 'DAMNIFICADOS_PERSONAS' as const, value: 292043, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto: 292.043 personas en 472 municipios (15 departamentos). Sube desde 185.016 (16 de agosto).' },
    { metric: 'DAMNIFICADOS_FAMILIAS' as const, value: 123789, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto. Sube desde 120.238 (16 de agosto).' },
    { metric: 'VIVIENDAS_DESTRUIDAS' as const, value: 29554, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto. Sube desde 26.945 (16 de agosto).' },
    { metric: 'VIVIENDAS_AVERIADAS' as const, value: 134342, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto. Sube desde 127.557 (16 de agosto).' },
    { metric: 'EDIFICIOS_COLAPSADOS' as const, value: 267, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto: 267 colapsados + 5.808 edificaciones con daños. Sube desde 66 (16 de agosto).' },
    { metric: 'CENTROS_EDUCATIVOS_AFECTADOS' as const, value: 3443, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto. Sube desde 2.838 (16 de agosto).' },
    { metric: 'CENTROS_SALUD_AFECTADOS' as const, value: 303, sourceKey: 'eltiempo_0818', tier: 2, asOf: nationalAsOf, notes: 'Balance oficial UNGRD, 18 de agosto. Sube desde 285 (16 de agosto).' },

    // Pereira (mismo live blog de El Tiempo, sección local, 9:12am)
    { metric: 'DEATHS_REPORTED_OFFICIAL' as const, value: 98, sourceKey: 'eltiempo_0818', tier: 2, asOf: pereiraAsOf, notes: 'Actualización local Pereira, 18 de agosto 9:12am: "Rescatados: 260. Fallecidos: 98. Heridos: 259. Desaparecidos: 132." Sube desde 95 (14 de agosto).', municipioId: pereira.id },
    { metric: 'MISSING_OFFICIAL' as const, value: 132, sourceKey: 'eltiempo_0818', tier: 2, asOf: pereiraAsOf, notes: 'Misma actualización local, 18 de agosto: 132 desaparecidos. Baja desde 270 (14 de agosto) -- probable depuración de registros, no explicada en la nota.', municipioId: pereira.id },

    // Cali (El País Cali, live blog, corte 8:00am)
    { metric: 'DEATHS_REPORTED_OFFICIAL' as const, value: 139, sourceKey: 'elpais_cali_0818', tier: 2, asOf: caliAsOf, notes: 'Reporte oficial Alcaldía de Cali, corte 18 de agosto 8:00am: 88 rescatadas, 139 fallecidas, 1.569 heridas. Sube desde 123 (15 de agosto). También reporta 126 cuerpos entregados a familias, 24 colapsos totales, 127 parciales, 192 con daño estructural (de 878 edificaciones verificadas).', municipioId: cali.id },
    { metric: 'INJURED' as const, value: 1569, sourceKey: 'elpais_cali_0818', tier: 2, asOf: caliAsOf, notes: 'Mismo reporte, corte 18 de agosto 8:00am. Sube desde 1.485 (15 de agosto).', municipioId: cali.id },
    { metric: 'MISSING_OFFICIAL' as const, value: 56, sourceKey: 'elpais_cali_0818', tier: 2, asOf: caliAsOf, notes: 'Mismo reporte, corte 18 de agosto 8:00am: "56 reportadas como desaparecidas (cifra en proceso de depuración, antes 94)." El propio artículo marca su cifra previa como 94, no como el 111 ya registrado aquí de otro hilo -- discrepancia entre fuentes, no conciliada, registrada tal cual.', municipioId: cali.id },

    // Manizales (La Patria, balance de la Alcaldía, 16 de agosto)
    { metric: 'DAMNIFICADOS_PERSONAS' as const, value: 5241, sourceKey: 'lapatria_manizales_0816', tier: 2, asOf: manizalesAsOf, notes: 'Balance Alcaldía de Manizales, 16 de agosto: 5.241 damnificados, 203 en albergues. Sube desde 2.000 (12 de agosto).', municipioId: manizales.id },
    { metric: 'VIVIENDAS_DESTRUIDAS' as const, value: 1153, sourceKey: 'lapatria_manizales_0816', tier: 2, asOf: manizalesAsOf, notes: 'Balance Alcaldía de Manizales, 16 de agosto: 1.153 viviendas con afectación total -- el propio comunicado revisa a la baja la cifra previa de 1.512 (15 de agosto), corrección real de la Alcaldía, no error de captura. Heridos (211), fallecidos (6) y viviendas con afectación parcial (3.993) se mantuvieron iguales según la misma nota.', municipioId: manizales.id },

    // Popayán (El País, primer registro de este métrica/ciudad)
    { metric: 'CENTROS_SALUD_AFECTADOS' as const, value: 5, sourceKey: 'elpais_cauca_0812', tier: 2, asOf: popayanAsOf, notes: 'Primer registro de esta métrica para Popayán: 5 instituciones hospitalarias con afectaciones técnicas, incluyendo Clínica La Estancia (cierre de quirófanos) y Hospital Susana López de Valencia (daños en segundo piso y unidad de neonatología). Fecha del balance (12 de agosto) es anterior a hoy, pero no había ninguna cifra previa para este metric/ciudad.', municipioId: popayan.id },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const municipioId = 'municipioId' in t ? t.municipioId : null
    const existing = await prisma.tollRecord.findFirst({
      where: {
        municipioId,
        departmentId: null,
        metric: t.metric,
        value: t.value,
        asOf: new Date(t.asOf),
      },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId,
        departmentId: null,
        metric: t.metric,
        value: t.value,
        sourceId: sources[t.sourceKey],
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    tollCreated++
    console.log(`Created TollRecord: ${t.metric} = ${t.value}`)
  }
  console.log(`\nTollRecord: ${tollCreated} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
