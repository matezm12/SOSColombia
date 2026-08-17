/**
 * Pass 86 (2026-08-17) — Medellín's first deep research pass, plus a
 * correction to pass 85: Medellín did NOT come through the quake with
 * zero effects. Directly verified (WebFetch, not just agent-reported)
 * against the Alcaldía de Medellín's own official press release and an
 * independent Publimetro article, both quoting Mayor Federico Gutiérrez:
 * after 600+ technical building inspections, 16 homes were temporarily
 * evacuated (Carlos E. Restrepo, buildings from the early 1970s, and
 * Laureles), and roughly 250 of the city's 421 public school campuses
 * reported some damage (mostly minor). Critically — no demolitions were
 * required, the mayor explicitly stated "no presenta riesgo
 * estructural," and no deaths or injuries have been reported in
 * Medellín from this quake. This is real, sourced, minor incidental
 * impact — not the "Medellín itself is a disaster zone" scenario, but
 * also not the "zero damage" premise pass 85 assumed. severityLabel
 * moves from null to LEVE (the lowest tier) to reflect this honestly;
 * Medellín's primary role — donor/logistics hub for the Pacific coast —
 * is otherwise unchanged and remains the dominant story.
 *
 * A separate, NOT-Medellín finding worth flagging for a future pass:
 * Antioquia's own risk agency (DAGRAN) is inspecting confirmed damage
 * (290 homes, 54 schools, 13 churches per one source) across ~26
 * unnamed municipios in Antioquia's Suroeste/Oriente subregions —
 * geographically distinct from Medellín (Valle de Aburrá), bordering
 * the Chocó/Caldas/Risaralda epicenter zone. Not entered here; noted in
 * the wiki as a lead.
 *
 * Ten new aid points, the best-corroborated of a much longer list this
 * pass surfaced (multiple official Alcaldía press releases, Infobae,
 * Telemedellín, Blu Radio, El Colombiano) — includes the city's official
 * 10-point acopio network, DIM's stadium-store collection point, an
 * airport-community aid convoy explicitly bound for Cartago/Valle del
 * Cauca, a shopping-mall collection point, EAFIT's internal emergency
 * fund for its own affected students, and the four Movilizatorio-listed
 * points flagged-but-not-yet-seeded in pass 85. Three social posts with
 * real, specific permalinks (not bare profile URLs) — including a
 * serious, multi-source-corroborated security incident: an aid truck
 * from Medellín's benefit concert was attacked with gunfire on the road
 * to Chocó.
 * Run once via `npx tsx prisma/seed-pass86-medellin-deep.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const medellin = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '05001' } })

  await prisma.municipio.update({
    where: { id: medellin.id },
    data: {
      severityLabel: 'LEVE',
      alertNote:
        'Medellín funciona principalmente como centro logístico/donante: varios puntos de acopio recolectan y despachan ayuda hacia el Pacífico colombiano (Buenaventura, Chocó) y el Eje Cafetero. La ciudad también sintió el sismo directamente — la Alcaldía confirmó más de 600 inspecciones técnicas de edificaciones, con 16 viviendas evacuadas temporalmente (barrios Carlos E. Restrepo y Laureles) y cerca de 250 de 421 sedes educativas con algún daño, mayormente menor. El alcalde Federico Gutiérrez declaró explícitamente que ninguna edificación requirió demolición y que la ciudad "no presenta riesgo estructural". No se han reportado muertos ni heridos en Medellín a causa del sismo.',
    },
  })
  console.log('Updated Medellín: severityLabel LEVE, alertNote reflects both hub role and real minor local impact')

  const sourceUrl = 'https://www.publimetro.co/medellin/2026/08/14/se-confirma-que-medellin-ha-evacuado-16-viviendas-tras-el-terremoto-del-lunes-10-de-agosto/'
  const sourceOrg = 'Alcaldía de Medellín (alcalde Federico Gutiérrez), vía Publimetro Colombia'
  let src = await prisma.source.findFirst({ where: { url: sourceUrl } })
  if (!src) {
    src = await prisma.source.create({ data: { url: sourceUrl, org: sourceOrg, tier: 2 } })
    console.log('Created Source: publimetro_medellin_16viviendas_0814')
  }

  const tollDefs = [
    {
      metric: 'VIVIENDAS_AVERIADAS' as const,
      value: 16,
      asOf: '2026-08-14T12:00:00-05:00',
      tier: 2,
      notes: 'Viviendas evacuadas temporalmente tras 600+ inspecciones técnicas, principalmente en el barrio Carlos E. Restrepo (edificaciones de comienzos de los años 70) y Laureles. El alcalde Federico Gutiérrez declaró que ninguna requiere demolición ni presenta riesgo estructural — daño real pero menor, no catastrófico. Verificado directamente en la fuente, no solo reportado por un agente de investigación.',
    },
    {
      metric: 'CENTROS_EDUCATIVOS_AFECTADOS' as const,
      value: 250,
      asOf: '2026-08-14T12:00:00-05:00',
      tier: 2,
      notes: 'De 421 sedes educativas oficiales en Medellín, cerca de 250 (~60%) reportaron algún daño, mayormente menor. 2 colegios suspendieron actividades y 3 más cerraron temporalmente algunos espacios.',
    },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: medellin.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: medellin.id,
        metric: t.metric,
        value: t.value,
        sourceId: src.id,
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    tollCreated++
  }
  console.log(`TollRecord: ${tollCreated} created`)

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Red municipal de puntos de acopio — Alcaldía de Medellín',
      address: 'Múltiples sedes: Fundación Banco Arquidiocesano de Alimentos, Fundación Saciar, Parques Biblioteca (Belén, San Javier, Gabriel García Márquez, León de Greiff), Biblioteca Pública El Poblado, Terminal del Norte, Universidad EAFIT, sede principal de la Alcaldía (La Alpujarra)',
      phone: '(+57) 604 44 44 144 / WhatsApp 301 604 44 44',
      needsText: 'Alimentos no perecederos, granos, kits de aseo, pañales, colchonetas, mantas, cepillos de dientes, papel higiénico, crema dental. Horario general 8:00 a.m.–6:00 p.m. (varía por punto). Reporte oficial: 179 toneladas de alimentos y más de $1.813 millones de pesos recaudados a la fecha, con destino a Chocó y comunidades afectadas.',
      sourceUrl: 'https://www.medellin.gov.co/es/sala-de-prensa/noticias/medellin-convierte-la-solidaridad-en-ayudas-mas-de-1-813-millones-y-179-toneladas-de-alimentos-se-han-recaudado-para-los-afectados-por-el-terremoto/',
      sourceOrg: 'Alcaldía de Medellín (Secretaría de Inclusión Social)',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Corporación Presentes — "Colombia se Levanta" / Gran Donatón "Medellín te Quiere"',
      address: 'Calle 16B Sur #41-16, Medellín (sede de la organización)',
      phone: '604 448 2013 / WhatsApp +57 333 226 0828',
      needsText: 'Canal de donación monetaria oficial de la ciudad, coordinado con la Alcaldía de Medellín. El megaconcierto benéfico del 15 de agosto en Plaza de La Macarena (25+ artistas) recaudó más de $6.000 millones de pesos y 31 toneladas de ayuda en especie en un solo día — evento puntual ya concluido, pero el canal de donación en línea (presentes.co) sigue siendo el mecanismo activo de la ciudad.',
      sourceUrl: 'https://www.bluradio.com/regiones/antioquia/en-medellin-se-hara-un-megaconcierto-para-recaudar-fondos-para-ayudar-a-las-victimas-del-terremoto-rg10',
      sourceOrg: 'Corporación Presentes, Alcaldía de Medellín',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Tienda oficial DIM — Estadio Atanasio Girardot',
      address: 'Bajos del Estadio Atanasio Girardot, Medellín',
      phone: null,
      needsText: 'Alimentos no perecederos, elementos de aseo personal, cobijas, agua potable, concentrado para animales. Horario 10:00 a.m.–5:00 p.m.',
      sourceUrl: 'https://telemedellin.tv/dim-tiendas-oficiales-centros-acopio-donaciones/',
      sourceOrg: 'Deportivo Independiente Medellín (DIM)',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Aeropuerto Olaya Herrera — acopio para tractomula (Comité Alianza / Transurcar / Airplan)',
      address: 'Ingreso a los hangares, Aeropuerto Olaya Herrera, Calle 5 #65F-00, sector Guayabal, Medellín',
      phone: null,
      needsText: 'Alimentos no perecederos, herramientas, agua embotellada, elementos de higiene, kits médicos y de primeros auxilios. Abierto hasta llenar un camión de carga de 35 toneladas. Destino explícito: Cartago, Valle del Cauca y municipios cercanos afectados.',
      sourceUrl: 'https://telemedellin.tv/tractomula-con-donaciones-para-valle-olaya-herrera/',
      sourceOrg: 'Comité Alianza del Aeropuerto Olaya Herrera, Transurcar, Airplan',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'El Tesoro Parque Comercial — punto de recolección',
      address: 'El Tesoro Parque Comercial, Plaza Palmas, sótano 4, El Poblado, Medellín',
      phone: null,
      needsText: 'Alimentos, elementos de aseo, ropa nueva, cobijas, herramientas. Activo desde el 13 de agosto, parte de la campaña "Colombia, estamos contigo". Destino: comunidades afectadas en el occidente del país.',
      sourceUrl: 'https://www.eltesoro.com.co/entrega-donaciones-terremoto',
      sourceOrg: 'El Tesoro Parque Comercial',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'EAFIT Contigo — fondo de emergencia de Universidad EAFIT',
      address: 'Universidad EAFIT, Carrera 49 #7 Sur-50, Medellín',
      phone: null,
      needsText: 'Fondo de emergencia de $1.000 millones de pesos para subsidios y apoyo psicosocial, tras identificar más de 800 estudiantes de EAFIT originarios del Eje Cafetero, Valle del Cauca y Chocó. El campus también funciona como uno de los puntos oficiales de acopio de la red municipal.',
      sourceUrl: 'https://www.bluradio.com/regiones/antioquia/ola-de-solidaridad-en-medellin-por-el-terremoto-artistas-y-entidades-lideran-la-entrega-de-ayudas-rg10',
      sourceOrg: 'Universidad EAFIT',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Colegio Padre Manyanet',
      address: 'Carrera 84F #8-29, Medellín',
      phone: null,
      needsText: 'Punto de acopio general, horario 12:00 p.m.–6:00 p.m.',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'Colegio Padre Manyanet',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Cola del Zorro',
      address: 'Carrera 15 #9C-10, El Poblado, Medellín',
      phone: null,
      needsText: 'Punto de acopio, horario 7:00 a.m.–10:00 p.m. Nota del directorio: "llevar cajas" (traer sus propias cajas para empacar).',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'Cola del Zorro',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'La Kombi',
      address: 'Frente al D1 de Envigado Bucarest, Envigado (área metropolitana de Medellín)',
      phone: null,
      needsText: 'Punto de acopio, horario 10:00 a.m.–3:00 p.m.',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'La Kombi',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Politécnico Gran Colombiano (sede Medellín)',
      address: 'Carrera 74 #52-20, Medellín',
      phone: '322 853 3106 (Marcelino Gaitán)',
      needsText: 'Punto de acopio, horario 9:00 a.m.–5:00 p.m., con contacto directo en sitio.',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'Politécnico Gran Colombiano',
    },
  ] as const

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: medellin.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: medellin.id,
        kind: a.kind,
        name: a.name,
        address: a.address ?? undefined,
        phone: a.phone ?? undefined,
        needsText: a.needsText,
        sourceUrl: a.sourceUrl,
        sourceOrg: a.sourceOrg ?? undefined,
        submitterNote: 'Pasada de investigación dedicada a Medellín (pasada 86), primera para esta ciudad.',
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
      permalink: 'https://www.facebook.com/ElColombiano/posts/pfbid0P8VZSZBUvpWBfwi2rFAnkKC2mtFDiefRRG1dB4hpCyKJTmRB5aHDpqsnmoLsDCupl',
      authorHandle: 'El Colombiano',
      category: 'AID_POINT' as const,
      note: 'El Colombiano reporta 178 toneladas de alimentos recolectadas hasta la fecha en los puntos de acopio de Medellín, con foto de voluntarios clasificando donaciones en uno de los Parques Biblioteca.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/Enfoquecinconoticias/posts/pfbid0o4LRZHzYVFZMhoGH5PF6kYAzKQu2LwQ3kozMVpYJssWvwaZjSPBiSRJq9sKvsxaYl',
      authorHandle: 'Enfoque Cinco',
      category: 'HUMAN_INTEREST' as const,
      note: '"Medellín se une a la solidaridad por los afectados del terremoto" — cobertura del superconcierto de La Macarena, balance de $6.000 millones de pesos recaudados, con fotos de alimentos siendo clasificados.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/ConexionSur1/posts/pfbid02bUoRndb6fxswEhBzozudMB1eCn8n1qwq8mbvCVz2zeEBf9fz9phoNnVZZ7ePp58ol',
      authorHandle: 'Conexión Sur',
      category: 'NEED' as const,
      note: 'ALERTA DE SEGURIDAD: un camión con ayuda humanitaria recolectada en el donatón de La Macarena (Medellín) fue atacado a tiros — un intento de robo — en el sector Remolino, vía a Ciudad Bolívar (Antioquia), rumbo al Chocó. Hombres armados en al menos 4 motos interceptaron dos camiones; el primero recibió más de 10 impactos pero logró escapar; un segundo camión más adelante (sector El Balsal) también fue atacado. Ambos conductores resultaron ilesos. La comunidad pide más seguridad en el corredor Bolombolo–Ciudad Bolívar. Corroborado de forma independiente por al menos otras cinco páginas de Facebook regionales.',
    },
  ] as const

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
        municipioId: medellin.id,
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
