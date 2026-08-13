/**
 * First-pass seed: loads the key facts already sourced/verified in `../../wiki/`
 * (stage 1, declared done 2026-08-14) into the stage-2 schema.
 *
 * This is NOT exhaustive — it's a representative load per wiki/10-app-architecture.md
 * step 3 ("parse-and-load, not new research"). Deep tables in the wiki (e.g. INMLCF's
 * full 164/205-name victim lists, every GoFundMe hub page, every Pereira CAFE address)
 * are intentionally left for a fast-follow ingestion pass rather than hand-transcribed
 * here. Every row below traces back to a specific wiki file — see the `notes` field.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // ── Sources ──────────────────────────────────────────────────────────
  const sourceDefs = [
    { key: 'ungrd_balance_0812', url: 'https://www.elcolombiano.com', org: 'UNGRD (via El Colombiano)', tier: 2 },
    { key: 'ocha_flash_004', url: 'https://reliefweb.int/report/colombia/colombia-flash-update-004-actualizacion-afectaciones-por-terremoto-en-colombia-12-agosto-de-2026', org: 'OCHA / Equipo Humanitario País Colombia', tier: 1 },
    { key: 'ungrd_balance_0813', url: 'https://www.telesurtv.net', org: 'UNGRD (via teleSUR/7N/DW)', tier: 2 },
    { key: 'inmlcf_comunicado_06', url: 'https://www.medicinalegal.gov.co/web/guest/noticias', org: 'INMLCF (Medicina Legal)', tier: 1 },
    { key: 'cali_gov_co', url: 'https://www.cali.gov.co', org: 'Alcaldía de Cali', tier: 1 },
    { key: 'el_tiempo_quibdo', url: 'https://www.eltiempo.com', org: 'El Tiempo', tier: 2 },
    { key: 'la_patria_manizales', url: 'https://www.lapatria.com', org: 'La Patria', tier: 2 },
    { key: 'mayor_sjp_press', url: 'https://www.elpais.com.co', org: 'Mayor León Fabio Marín Moncada (via El País Cali)', tier: 3 },
    { key: 'dane_pop_file', url: 'https://www.dane.gov.co/files/censo2018/proyecciones-de-poblacion/Municipal/DCD-area-proypoblacion-Mun-2020-2035-ActPostCOVID-19.xlsx', org: 'DANE', tier: 1 },
    { key: 'decreto_1171', url: '', org: 'Presidencia (Abelardo De La Espriella)', tier: 3 },
    { key: 'risaralda_decl', url: 'https://www.semana.com/nacion/regionales/articulo/gobernacion-de-risaralda-declara-calamidad-publica-y-urgencia-manifiesta-tras-terremoto-en-colombia/202649/', org: 'Gobernación de Risaralda (via Semana)', tier: 3 },
    { key: 'alcaldia_pereira_fb', url: 'https://www.facebook.com/AlcaldiaDePereira/posts/pfbid0iNQ9mEs7ozeDZhJCZQ4eq5dMQLL8RP7ApwonQdRSHnUeZxHPeCF8CAUv6oqy2Vpbl', org: 'Alcaldía de Pereira', tier: 4 },
    { key: 'quibdo_shelter', url: '', org: 'Noticias RCN / Infobae', tier: 2 },
    { key: 'gob_choco_acopio', url: '', org: 'Gobernación del Chocó (via El Tiempo + Pulzo)', tier: 3 },
    { key: 'manizales_shelter', url: '', org: 'Semana / Vanguardia / TikTok (Juan Diego Alvira)', tier: 4 },
    { key: 'armenia_coliseo_sur', url: 'https://www.tiktok.com/@stefannycastellanosm/video/7673334781010038023', org: 'Región Cafetera TV / @nataliapanezzo / Alerta Armenia', tier: 4 },
    { key: 'cauca_gov_co', url: 'https://www.cauca.gov.co', org: 'Gobernación del Cauca', tier: 1 },
    { key: 'gofundme_camila_franco', url: 'https://gofund.me/740d646f4', org: 'GoFundMe', tier: 2 },
    { key: 'gofundme_rescate_colombia', url: 'https://gofundme.com/f/rescate-x-colombia-movilizamos-ayuda-a-la-zona-del-sismo', org: 'GoFundMe', tier: 2 },
    { key: 'vaki_fe_pacifico', url: 'https://vaki.co/vaki/yo-tengo-fe-por-el-pacifico', org: 'Vaki', tier: 2 },
    { key: 'sgc_bulletins', url: 'https://www2.sgc.gov.co', org: 'Servicio Geológico Colombiano', tier: 1 },
    { key: 'usgs_api', url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us6000tjl2.geojson', org: 'USGS', tier: 1 },
  ]
  const sources: Record<string, string> = {}
  for (const s of sourceDefs) {
    const row = await prisma.source.create({
      data: { url: s.url || 'not directly located — see wiki/05-gov-reports.md', org: s.org, tier: s.tier, status: 'LIVE', lastFetchedAt: new Date('2026-08-14') },
    })
    sources[s.key] = row.id
  }

  // ── Event ────────────────────────────────────────────────────────────
  await prisma.event.create({
    data: {
      name: 'Terremoto de Colombia 2026',
      magnitudeSgc: 7.4,
      magnitudeUsgs: 7.4,
      depthSgcKm: 103,
      depthUsgsKm: 110.3,
      epicenterLatSgc: 4.99,
      epicenterLngSgc: -76.29,
      epicenterLatUsgs: 4.8436,
      epicenterLngUsgs: -76.2422,
      occurredAt: new Date('2026-08-10T07:34:00-05:00'),
    },
  })

  // ── Departments + Municipios ─────────────────────────────────────────
  const deptDefs = [
    { key: 'risaralda', name: 'Risaralda', divipolaCode: '66' },
    { key: 'valle', name: 'Valle del Cauca', divipolaCode: '76' },
    { key: 'caldas', name: 'Caldas', divipolaCode: '17' },
    { key: 'quindio', name: 'Quindío', divipolaCode: '63' },
    { key: 'choco', name: 'Chocó', divipolaCode: '27' },
    { key: 'cauca', name: 'Cauca', divipolaCode: '19' },
  ]
  const depts: Record<string, string> = {}
  for (const d of deptDefs) {
    const row = await prisma.department.create({ data: { name: d.name, divipolaCode: d.divipolaCode } })
    depts[d.key] = row.id
  }

  const municipioDefs = [
    { key: 'pereira', name: 'Pereira', divipolaCode: '66001', dept: 'risaralda', population: 482851, severity: 'CRITICA', redAlert: true },
    { key: 'cali', name: 'Cali', divipolaCode: '76001', dept: 'valle', population: 2284775, severity: 'CRITICA', redAlert: true },
    { key: 'manizales', name: 'Manizales', divipolaCode: '17001', dept: 'caldas', population: 461278, severity: 'CRITICA', redAlert: true },
    { key: 'armenia', name: 'Armenia', divipolaCode: '63001', dept: 'quindio', population: 311959, severity: 'ALTA', redAlert: true },
    { key: 'quibdo', name: 'Quibdó', divipolaCode: '27001', dept: 'choco', population: 148945, severity: 'CRITICA', redAlert: true },
    { key: 'sjp', name: 'San José del Palmar', divipolaCode: '27660', dept: 'choco', population: 5907, severity: 'ALTA', redAlert: false },
    { key: 'popayan', name: 'Popayán', divipolaCode: '19001', dept: 'cauca', population: 349671, severity: 'MODERADA', redAlert: false },
  ] as const
  const municipios: Record<string, string> = {}
  for (const m of municipioDefs) {
    const row = await prisma.municipio.create({
      data: {
        name: m.name,
        divipolaCode: m.divipolaCode,
        departmentId: depts[m.dept],
        populationDane: m.population,
        populationAsOf: new Date('2026-01-01'),
        severityLabel: m.severity,
        redAlert: m.redAlert,
      },
    })
    municipios[m.key] = row.id
  }

  // ── Toll records — national ──────────────────────────────────────────
  await prisma.tollRecord.createMany({
    data: [
      { metric: 'DEATHS_REPORTED_OFFICIAL', value: 239, unit: 'personas', sourceId: sources.ungrd_balance_0812, tier: 2, asOf: new Date('2026-08-12T07:30:00-05:00'), notes: 'UNGRD morning balance' },
      { metric: 'DEATHS_REPORTED_OFFICIAL', value: 241, unit: 'personas', sourceId: sources.ocha_flash_004, tier: 1, asOf: new Date('2026-08-12T18:30:00-05:00'), notes: 'OCHA Flash Update 004 — best primary multi-sector figure' },
      { metric: 'DEATHS_REPORTED_OFFICIAL', value: 265, unit: 'personas', sourceId: sources.ungrd_balance_0813, tier: 2, asOf: new Date('2026-08-13T00:00:00-05:00'), notes: 'UNGRD balance, corroborated across 3 independent outlets' },
      { metric: 'DEATHS_CONFIRMED_FORENSIC', value: 230, unit: 'cuerpos recibidos', sourceId: sources.inmlcf_comunicado_06, tier: 1, asOf: new Date('2026-08-12T00:00:00-05:00'), notes: 'INMLCF Comunicado 06 — bodies received' },
      { metric: 'DEATHS_CONFIRMED_FORENSIC', value: 205, unit: 'cuerpos identificados', sourceId: sources.inmlcf_comunicado_06, tier: 1, asOf: new Date('2026-08-12T00:00:00-05:00'), notes: 'INMLCF Comunicado 06 — bodies identified (12 minors)' },
      { metric: 'INJURED', value: 3771, sourceId: sources.ocha_flash_004, tier: 1, asOf: new Date('2026-08-12T18:30:00-05:00') },
      { metric: 'MISSING_OFFICIAL', value: 287, sourceId: sources.ungrd_balance_0812, tier: 2, asOf: new Date('2026-08-12T07:30:00-05:00'), notes: 'Institutional count — distinct from crowdsourced ~4,145-4,210 on "Colombia Te Busca" (not yet seeded, see wiki/03-death-toll.md)' },
      { metric: 'DAMNIFICADOS_PERSONAS', value: 49214, sourceId: sources.ocha_flash_004, tier: 1, asOf: new Date('2026-08-12T18:30:00-05:00') },
      { metric: 'DAMNIFICADOS_FAMILIAS', value: 24324, sourceId: sources.ungrd_balance_0812, tier: 2, asOf: new Date('2026-08-12T07:30:00-05:00'), notes: 'Same-day contradiction vs OCHA 30,324 — resolved as expected volatility, see wiki/08-contradictions.md' },
      { metric: 'DAMNIFICADOS_FAMILIAS', value: 30324, sourceId: sources.ocha_flash_004, tier: 1, asOf: new Date('2026-08-12T18:30:00-05:00') },
      { metric: 'DAMNIFICADOS_PERSONAS', value: 53816, sourceId: sources.ungrd_balance_0813, tier: 2, asOf: new Date('2026-08-13T00:00:00-05:00') },
      { metric: 'DAMNIFICADOS_FAMILIAS', value: 25872, sourceId: sources.ungrd_balance_0813, tier: 2, asOf: new Date('2026-08-13T00:00:00-05:00'), notes: 'Third data point — sits between the two Aug 12 figures, confirms volatility not error' },
      { metric: 'VIVIENDAS_DESTRUIDAS', value: 9215, sourceId: sources.ungrd_balance_0812, tier: 2, asOf: new Date('2026-08-12T07:30:00-05:00') },
      { metric: 'VIVIENDAS_AVERIADAS', value: 45457, sourceId: sources.ungrd_balance_0812, tier: 2, asOf: new Date('2026-08-12T07:30:00-05:00') },
      { metric: 'EDIFICIOS_COLAPSADOS', value: 140, sourceId: sources.ungrd_balance_0812, tier: 2, asOf: new Date('2026-08-12T07:30:00-05:00') },
    ],
  })

  // ── Toll records — municipio-level ───────────────────────────────────
  await prisma.tollRecord.createMany({
    data: [
      { municipioId: municipios.cali, metric: 'DEATHS_REPORTED_OFFICIAL', value: 96, sourceId: sources.cali_gov_co, tier: 1, asOf: new Date('2026-08-12T20:00:00-05:00'), notes: 'cali.gov.co\'s own updated-figures page — most authoritative single-city figure found in the whole project' },
      { municipioId: municipios.cali, metric: 'INJURED', value: 1224, sourceId: sources.cali_gov_co, tier: 1, asOf: new Date('2026-08-12T20:00:00-05:00') },
      { municipioId: municipios.cali, metric: 'MISSING_OFFICIAL', value: 111, sourceId: sources.cali_gov_co, tier: 1, asOf: new Date('2026-08-12T20:00:00-05:00') },
      { municipioId: municipios.pereira, metric: 'DEATHS_CONFIRMED_FORENSIC', value: 83, unit: 'identificados', sourceId: sources.inmlcf_comunicado_06, tier: 1, asOf: new Date('2026-08-12T15:00:00-05:00'), notes: 'INMLCF Comunicado 05 — largest single-city identified-victim count in the whole dataset; a floor, not necessarily a final total' },
      { municipioId: municipios.manizales, metric: 'DEATHS_REPORTED_OFFICIAL', value: 6, sourceId: sources.la_patria_manizales, tier: 2, asOf: new Date('2026-08-12T00:00:00-05:00'), notes: 'Named victims; independently cross-confirmed by INMLCF (5 of the 7 names)' },
      { municipioId: municipios.manizales, metric: 'DAMNIFICADOS_PERSONAS', value: 2000, sourceId: sources.la_patria_manizales, tier: 1, asOf: new Date('2026-08-12T00:00:00-05:00'), notes: 'centrodeinformacion.manizales.gov.co official cifras — "2,000+"' },
      { municipioId: municipios.armenia, metric: 'DEATHS_REPORTED_OFFICIAL', value: 0, sourceId: sources.alcaldia_pereira_fb, tier: 2, asOf: new Date('2026-08-13T00:00:00-05:00'), notes: 'Confirmed near-zero via Mayor James Padilla García + Municipal Secretary — genuine finding, not a data gap. Department has 2 deaths total (Quimbaya + ambiguous Armenia-Calarcá) — see wiki/08-contradictions.md' },
      { municipioId: municipios.armenia, metric: 'DAMNIFICADOS_PERSONAS', value: 6284, unit: 'reportes ciudadanos', sourceId: sources.alcaldia_pereira_fb, tier: 1, asOf: new Date('2026-08-13T00:00:00-05:00') },
      { municipioId: municipios.quibdo, metric: 'DEATHS_REPORTED_OFFICIAL', value: 9, sourceId: sources.el_tiempo_quibdo, tier: 2, asOf: new Date('2026-08-11T00:00:00-05:00'), notes: 'City-specific — department (Chocó) total is 13-14, see wiki/08-contradictions.md (resolved as scope difference)' },
      { municipioId: municipios.sjp, metric: 'DEATHS_REPORTED_OFFICIAL', value: 0, sourceId: sources.mayor_sjp_press, tier: 3, asOf: new Date('2026-08-11T00:00:00-05:00'), notes: 'Confirmed zero despite being the literal epicenter — mayor quoted directly across ~10 outlets' },
      { municipioId: municipios.popayan, metric: 'DEATHS_REPORTED_OFFICIAL', value: 1, sourceId: sources.inmlcf_comunicado_06, tier: 1, asOf: new Date('2026-08-12T00:00:00-05:00'), notes: 'Carlos Ernesto Rennella Campo, 45 — resolved contradiction, see wiki/08-contradictions.md' },
      { municipioId: municipios.popayan, metric: 'DAMNIFICADOS_PERSONAS', value: 0, sourceId: sources.cauca_gov_co, tier: 2, asOf: new Date('2026-08-13T00:00:00-05:00'), notes: 'Not consolidated as of Aug 13 — genuine gap, value 0 is a placeholder meaning "no figure published," not a real zero. Flag in UI rather than seeding a misleading number long-term.' },
    ],
  })

  // ── Aid points ───────────────────────────────────────────────────────
  const albergueDefs = [
    { m: 'pereira', name: 'Ecoparque El Vergel', status: 'ACTIVE', src: 'alcaldia_pereira_fb' },
    { m: 'pereira', name: 'Parque El Oso', status: 'ACTIVE', src: 'alcaldia_pereira_fb' },
    { m: 'pereira', name: 'Coliseo Mayor', status: 'ACTIVE', src: 'alcaldia_pereira_fb', notes: 'Earlier snapshots called this "at capacity" — official post is more current' },
    { m: 'pereira', name: 'Parque Olaya Herrera', status: 'ACTIVE', src: 'alcaldia_pereira_fb' },
    { m: 'pereira', name: 'Plaza de Ferias', status: 'ACTIVE', src: 'alcaldia_pereira_fb' },
    { m: 'pereira', name: 'Estadio Alberto "Mora Mora"', status: 'ACTIVE', src: 'alcaldia_pereira_fb', notes: 'Housing 47 people incl. 4 dogs, 1 cat as of Aug 13' },
    { m: 'cali', name: 'Unidad Deportiva Panamericana', status: 'ACTIVE', src: 'cali_gov_co', notes: 'Shared complex — no distinct per-building addresses found for its 3 component venues' },
    { m: 'manizales', name: 'Coliseo Mayor Jorge Arango Uribe', address: 'Unidad Deportiva Palogrande', status: 'ACTIVE', src: 'manizales_shelter', notes: 'Housing 240 people incl. 35 children (Juan Diego Alvira visit)' },
    { m: 'manizales', name: 'Coliseo Menor Ramón Marín Vargas', address: 'Unidad Deportiva Palogrande', status: 'ACTIVE', src: 'manizales_shelter', notes: 'Also doubles as a centro de acopio at the same venue' },
    { m: 'armenia', name: 'Coliseo del Sur', address: 'Near barrio La Isabela', status: 'ACTIVE', src: 'armenia_coliseo_sur', access: 'Restricted to pre-assessed families only', notes: 'Upgraded from single-source crowd report to officially confirmed, Pass 2 2026-08-14' },
    { m: 'quibdo', name: 'Coliseo de Boxeo de Quibdó', address: 'Calle 30 #17, barrio Las Américas, frente al Comando de Policía', status: 'ACTIVE', src: 'quibdo_shelter', notes: 'Quibdó\'s first and, as of last check, only named shelter' },
  ] as const
  for (const a of albergueDefs) {
    await prisma.aidPoint.create({
      data: {
        municipioId: municipios[a.m],
        kind: 'ALBERGUE',
        name: a.name,
        address: 'address' in a ? a.address : undefined,
        status: a.status as never,
        accessRestriction: 'access' in a ? a.access : undefined,
        sourceId: sources[a.src],
        lastVerifiedAt: new Date('2026-08-14'),
      },
    })
  }

  const acopioDefs = [
    { m: 'pereira', name: 'CAFE Consota', address: 'Mz 7 y Mz 8, Villa Consota, Cuba', src: 'alcaldia_pereira_fb' },
    { m: 'pereira', name: 'Centro de eventos Expofuturo', src: 'alcaldia_pereira_fb', notes: 'Official national-campaign collection/distribution point, announced by the first lady' },
    { m: 'quibdo', name: 'Gobernación del Chocó', address: 'Calle 31, Edificio La Confianza', src: 'gob_choco_acopio', notes: 'Donation account: Banco de Bogotá 578818429, NIT 891.680.010-3' },
    { m: 'quibdo', name: 'Centro Logístico Humanitario del Chocó', address: 'Antigua bodega Postobón, km 4 vía Quibdó–Yuto', src: 'gob_choco_acopio' },
    { m: 'popayan', name: 'Casa de la Moneda', address: 'Carrera 7 Calle 4 Esquina, Popayán, Cauca (CP 190001)', src: 'cauca_gov_co', notes: 'Regional collection hub for broader Cauca relief, not solely Popayán-facing' },
  ] as const
  for (const a of acopioDefs) {
    await prisma.aidPoint.create({
      data: {
        municipioId: municipios[a.m],
        kind: 'ACOPIO',
        name: a.name,
        address: 'address' in a ? a.address : undefined,
        status: 'ACTIVE',
        sourceId: sources[a.src],
        lastVerifiedAt: new Date('2026-08-14'),
      },
    })
  }

  // ── Government reports ───────────────────────────────────────────────
  await prisma.govReport.createMany({
    data: [
      {
        org: 'Presidencia', docType: 'Decreto', title: 'Decreto 1171 de 2026',
        date: new Date('2026-08-11T00:00:00-05:00'),
        summary: 'Declares "situación de desastre de carácter nacional," signed by President Abelardo De La Espriella the night of Aug 11. Triggers the special legal regime (streamlined procurement/contracting, resource reallocation). PDF itself not located — confirmed via 8+ independent outlets.',
        keyFigures: {},
        sourceTier: 3,
      },
      {
        org: 'Gobernación de Risaralda', docType: 'Declaración departamental', title: 'Calamidad pública y urgencia manifiesta',
        date: new Date('2026-08-11T00:00:00-05:00'),
        url: 'https://www.semana.com/nacion/regionales/articulo/gobernacion-de-risaralda-declara-calamidad-publica-y-urgencia-manifiesta-tras-terremoto-en-colombia/202649/',
        summary: 'Covers 14 municipios of Risaralda, 6 months extendable. Grants special contracting powers subject to Contraloría oversight. Decree number itself not found after 2 passes. Nequi donation channel: 3184411752.',
        keyFigures: {},
        sourceTier: 3,
      },
      {
        org: 'UNGRD', docType: 'Informe de situación (balance)', title: 'Balance nacional terremoto Chocó — 2026-08-12 07:30',
        date: new Date('2026-08-12T07:30:00-05:00'),
        summary: '239 muertos, 3,755 heridos, 287 desaparecidos, 14 deptos, 403 municipios.',
        keyFigures: { deaths: 239, injured: 3755, missing: 287, departamentos: 14, municipios: 403 },
        sourceTier: 2,
      },
      {
        org: 'OCHA + El Equipo Humanitario País Colombia', docType: 'Situation report', title: 'Flash Update 004',
        date: new Date('2026-08-12T18:30:00-05:00'),
        url: 'https://reliefweb.int/report/colombia/colombia-flash-update-004-actualizacion-afectaciones-por-terremoto-en-colombia-12-agosto-de-2026',
        summary: 'Best multi-sector primary document found for this event. 241 fallecidos, 49,214 personas afectadas. USD 5 million CERF allocation announced.',
        keyFigures: { deaths: 241, affected: 49214, cerfUsd: 5000000 },
        sourceTier: 1,
      },
      {
        org: 'INMLCF', docType: 'Comunicado Oficial', title: 'Comunicado Oficial No. 06',
        date: new Date('2026-08-12T00:00:00-05:00'),
        url: 'https://www.medicinalegal.gov.co',
        summary: '230 bodies received, 205 identified (12 minors), 140 delivered to family.',
        keyFigures: { received: 230, identified: 205, delivered: 140 },
        sourceTier: 1,
      },
    ],
  })

  // ── Contradictions ───────────────────────────────────────────────────
  await prisma.contradiction.createMany({
    data: [
      {
        topic: 'Popayán death toll', status: 'RESOLVED',
        valueA: '0 (Gobernación del Cauca + El País)', sourceA: 'Gobernación del Cauca / El País, Aug 10-12',
        valueB: '1 — Carlos Ernesto Rennella Campo (INMLCF)', sourceB: 'INMLCF Comunicados 05 y 06',
        resolutionText: 'Deep-verified as a real, Popayán-based taxi-cooperative member confirmed across 7+ independent outlets. "Zero deaths" was a stale early assessment, not contradicted by an error.',
        loggedAt: new Date('2026-08-14'), resolvedAt: new Date('2026-08-14'),
      },
      {
        topic: 'Armenia-Calarcá death attribution', status: 'OPEN',
        valueA: 'Armenia city: 0 confirmed deaths', sourceA: 'Mayor James Padilla García + Municipal Secretary',
        valueB: '1 victim, "Unidad Básica: Armenia-Calarcá" (Daniel Gutiérrez Arias, 84)', sourceB: 'INMLCF Comunicado 06',
        resolutionText: null,
        loggedAt: new Date('2026-08-14'),
      },
      {
        topic: 'Familias damnificadas, 2026-08-12', status: 'RESOLVED',
        valueA: '24,324 familias', sourceA: 'UNGRD 07:30 balance',
        valueB: '30,324 familias', sourceB: 'OCHA Flash Update 004, 18:30',
        resolutionText: 'A third data point (25,872, Aug 13) sits between the two — confirms genuine report-to-report volatility from evolving assessment methodology, not a data error. Keep all values, never pick "the" number.',
        loggedAt: new Date('2026-08-14'), resolvedAt: new Date('2026-08-14'),
      },
      {
        topic: 'Quake depth', status: 'OPEN',
        valueA: '~103 km (drifted 82→96→103 across bulletins)', sourceA: 'SGC',
        valueB: '110.285 km', sourceB: 'USGS',
        resolutionText: null,
        loggedAt: new Date('2026-08-13'),
      },
    ],
  })

  // ── Crowdfunding campaigns ───────────────────────────────────────────
  await prisma.crowdfundingCampaign.createMany({
    data: [
      { platform: 'GOFUNDME', title: 'Relief Supplies for Colombia Earthquake', orgOrPerson: 'Camila Franco', url: 'https://gofund.me/740d646f4', goal: 1600, raised: 1262, donorCount: 19, verificationStatus: 'PLAUSIBLE', lastCheckedAt: new Date('2026-08-13') },
      { platform: 'GOFUNDME', title: 'Rescate x Colombia', orgOrPerson: 'Laura U', url: 'https://gofundme.com/f/rescate-x-colombia-movilizamos-ayuda-a-la-zona-del-sismo', goal: 28000, raised: 20591, donorCount: 206, verificationStatus: 'PLAUSIBLE', lastCheckedAt: new Date('2026-08-13') },
      { platform: 'VAKI', title: 'Yo Tengo Fe por el Pacífico', orgOrPerson: 'Willy García', url: 'https://vaki.co/vaki/yo-tengo-fe-por-el-pacifico', goal: null, raised: 0, donorCount: 0, verificationStatus: 'VERIFIED', lastCheckedAt: new Date('2026-08-14') },
    ],
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
