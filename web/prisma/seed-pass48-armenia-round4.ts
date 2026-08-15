/**
 * Pass 48 (2026-08-15) — fourth city in the fourth research round,
 * Armenia. Three prior rounds (passes 17, 26, 35) already covered this
 * city exhaustively, so this pass hunted for fresh posts, status updates,
 * new scams, reconstruction-phase news, missing-persons resolutions, and
 * new crowdfunding campaigns. Caught several false leads other agents
 * proposed as "new" that were actually already-seeded campaigns
 * (Fundación Covida, already known since pass 17) or a third instance of
 * a recurring mislabeling pattern (a "Terremoto armenia" GoFundMe whose
 * actual home is in Calarcá, already flagged twice in passes 17 and 26)
 * — neither re-seeded here.
 *
 * The most significant finding: an official municipal damage bulletin
 * (Informe Preliminar de Afectación N.11) reports Armenia's FIRST
 * confirmed fatality (zona Centro) plus 134 injured — updating the
 * "zero deaths in Armenia" figure this project had on file since
 * stage-1 research. Logged as a new, separate TollRecord row per this
 * project's append-only discipline, not merged into or replacing the
 * prior zero-deaths record.
 * See wiki/17-allied-resources-and-community.md "Pass 48" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass48-armenia-round4.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const armenia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63001' } })

  const sourceDefs = [
    {
      key: 'quindionoticias_informe11_0815',
      url: 'https://www.facebook.com/photo/?fbid=1550835303753232&set=a.605459941624111',
      org: 'Quindío Noticias, citando el Informe Preliminar de Afectación N.° 11 de la Alcaldía de Armenia',
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

  const tollDefs = [
    {
      metric: 'DEATHS_REPORTED_OFFICIAL' as const,
      value: 1,
      sourceKey: 'quindionoticias_informe11_0815',
      tier: 2,
      asOf: '2026-08-15T07:00:00-05:00',
      notes: 'Informe Preliminar de Afectación N.°11 de la Alcaldía de Armenia (corte 7am, 15 de agosto): 1 fallecido en la zona Centro. PRIMER FALLECIDO CONFIRMADO para Armenia — actualiza (no reemplaza) la cifra de cero muertes registrada desde la investigación de etapa 1 de este proyecto, citando al alcalde y a la secretaría municipal. Se registra como fila nueva, no se fusiona con el dato anterior de cero, siguiendo la disciplina de nunca sobrescribir de este proyecto.',
    },
    {
      metric: 'INJURED' as const,
      value: 134,
      sourceKey: 'quindionoticias_informe11_0815',
      tier: 2,
      asOf: '2026-08-15T07:00:00-05:00',
      notes: 'Mismo informe: 134 heridos atendidos en 7 centros de salud.',
    },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: armenia.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: armenia.id,
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

  const aidPoints = [
    {
      kind: 'ALBERGUE' as const,
      name: 'Coliseo del Sur de Armenia (albergue temporal)',
      address: 'Coliseo del Sur, Armenia, Quindío',
      phone: null,
      needsText: 'Albergue temporal para damnificados y segundo punto oficial de acopio. Requiere verificación de Sisbén y daño de vivienda confirmado, exclusivo para damnificados del municipio de Armenia. Necesidades urgentes reportadas: colchonetas, almohadas, cobijas, sábanas, agua, alimentos no perecederos, productos de higiene.',
      sourceUrl: 'https://x.com/pc_inmob/status/2087915057287922056',
      sourceOrg: 'Alcaldía de Armenia',
      submitterNote: 'Triple corroborado: publicación de necesidades urgentes (@pc_inmob, 13 de agosto), confirmado como albergue oficial activo por la cuenta de Cruz Roja Quindío (equipo de apoyo psicosocial trabajando ahí) y por un artículo de El Quindiano citando al Subsecretario de Desarrollo Social de la Alcaldía. ACTUALIZACIÓN DE ESTADO (14-15 de agosto): cerca de su capacidad máxima de 60 familias — actualmente aloja 56 familias (150-200 personas); el municipio evalúa abrir un segundo albergue más grande, sin ubicación/fecha definida aún. No encontrado en ninguna de las tres pasadas anteriores.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Auditorio Ancízar López López — Centro Administrativo Municipal (CAM)',
      address: 'CAM, ingreso por la Carrera 16, en la bahía del edificio de la Alcaldía, Armenia',
      phone: null,
      needsText: 'Punto oficial principal de recepción de donaciones para familias damnificadas, habilitado por la Administración Municipal de Armenia.',
      sourceUrl: 'https://www.facebook.com/QuindioNoticias/posts/pfbid0eNSQzUj7USSye15UdVWvTPAaToYirU56fxo6yH4HyJ6VDvMkYGt2GBNvZvibEB85l',
      sourceOrg: 'Alcaldía de Armenia',
      submitterNote: 'Anuncio oficial municipal reportado por Quindío Noticias, publicado el 15 de agosto con detalles de dirección/acceso y foto del punto. IMPORTANTE: la misma publicación confirma que el Cuerpo Oficial de Bomberos de Armenia YA NO recibe donaciones en sus instalaciones (deben mantenerse libres para responder a nuevas emergencias) — quien modere debe evitar redirigir donantes ahí.',
    },
    {
      kind: 'VET' as const,
      name: 'Bienestar Animal Armenia — jornada veterinaria móvil (Parque Sucre) + línea de mascotas desaparecidas',
      address: 'Parque Sucre, Armenia (Unidad Móvil de Bienestar Animal, jornada los jueves 9:00am-1:00pm)',
      phone: '310 447 4441',
      needsText: 'No es una solicitud de donaciones — actualización con detalle del programa municipal Bienestar Animal ya conocido: 216 reportes de mascotas perdidas recibidos desde el sismo (5 reencontradas hasta ahora); reportar avistamientos/mascotas encontradas o reclamar una perdida vía bienestaranimal@armenia.gov.co o el teléfono indicado. Triage veterinario básico gratuito para mascotas afectadas en la jornada de los jueves en Parque Sucre.',
      sourceUrl: 'https://elquindiano.com/noticia/272962/en-armenia-se-buscan-216-mascotas-reportadas-como-desaparecidas/',
      sourceOrg: 'Alcaldía de Armenia',
      submitterNote: 'Declaración oficial del programa municipal publicada por El Quindiano, corroborada de forma independiente por alerta.com.co. Añade dirección/horario/contacto concretos que la entrada genérica "Bienestar Animal" de pasadas anteriores no tenía — se registra como enriquecimiento de ese programa, no como uno nuevo.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Banco de Alimentos Monseñor Roberto López Londoño',
      address: 'Carrera 19 #26N-10, Edificio Cámara de Comercio, Barrio Mercedes Norte, Armenia',
      phone: null,
      needsText: 'Banco de alimentos ya conocido por este proyecto (citado solo por El Tiempo en fase 1, sin dirección registrada). Esta publicación de Instagram aporta la dirección faltante.',
      sourceUrl: 'https://www.instagram.com/p/Db333VcP8D1/',
      sourceOrg: null,
      submitterNote: 'El nombre coincide exactamente con la organización ya verificada vía El Tiempo. Fuente única para la dirección en sí (una cuenta local citándola en un video viral sobre el terremoto), por eso confianza media y no alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio para Pijao (organizado desde Armenia)',
      address: 'Cra 16 #12-27, Local 9, Armenia, Quindío',
      phone: null,
      needsText: 'Alimentos, elementos de primera necesidad y donaciones económicas — recolectados en Armenia y transportados físicamente a Pijao.',
      sourceUrl: 'https://www.instagram.com/p/DcCsQ_QKusG/',
      sourceOrg: null,
      submitterNote: 'Dirección exacta dada directamente en el pie de la publicación por una cuenta local nombrada (@valen_valdes73), acepta bienes y dinero, sin señales de alerta en los comentarios. Ejemplo del patrón de solidaridad Armenia→Pijao ya documentado en la pasada 44 desde el otro lado.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help a Colombian family struck by disaster (Cristian Marín)',
      address: null,
      phone: null,
      needsText: 'Un padre soltero, Cristian Marín, y sus dos hijos perdieron su vivienda cuando su edificio fue destruido el 10 de agosto; actualmente duermen en un albergue de una iglesia mientras buscan vivienda permanente.',
      sourceUrl: 'https://www.gofundme.com/f/help-a-colombian-family-struck-by-disaster',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por cuatro de los cinco agentes de esta pasada (X, Facebook, TikTok y el barrido de crowdfunding dedicado) — corroboración excepcionalmente fuerte. 72% financiada: CAD $1,289 de $1,800, 28 donaciones, organizadora Maria C. Marin (Vancouver). POSIBLE DUPLICADO A VERIFICAR: la pasada 17 registró "dos campañas GoFundMe/Vaki de la diáspora" para Armenia solo por descripción, sin nombrarlas — esta podría ser una de esas dos. Quien modere con acceso a los registros ya sembrados puede resolverlo con certeza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help Our Family in Armenia, Colombia Rebuild After the Earthquake (Valentina Barrera)',
      address: null,
      phone: null,
      needsText: 'Campaña de la diáspora (organizadora en Las Vegas, NV) para familiares extendidos en Armenia cuyas viviendas fueron dañadas.',
      sourceUrl: 'https://www.gofundme.com/f/help-our-family-in-armenia-colombia-rebuild-after-the-earth',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por dos agentes (Facebook y crowdfunding). $710 de $1,500, 7 donantes. MISMO POSIBLE DUPLICADO A VERIFICAR que la campaña de Cristian Marín (ver nota arriba) — la pasada 17 mencionó dos campañas de diáspora sin nombrarlas.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Ayuda para mi familia en Quindío (Sofia Muñoz / Karol Sofia Perdomo Muñoz)',
      address: null,
      phone: null,
      needsText: 'Apartamentos dañados y pertenencias perdidas de la familia de la organizadora en Armenia; organizadora reside en Salt Lake City, UT.',
      sourceUrl: 'https://www.gofundme.com/f/ayuda-para-mi-familia-en-quindio',
      sourceOrg: null,
      submitterNote: 'Confianza baja: historia personal plausible pero tracción muy temprana ($110 de $5,000, 4 donaciones), difícil de corroborar más allá de la publicación misma. Incluida con esta salvedad explícita en vez de descartada, dado que tiene organizadora nombrada y ubicación estable.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Armenia Unida, Ayuda tras el terremoto (Jenny Fabiana Salazar Londoño)',
      address: null,
      phone: null,
      needsText: 'Fondo de propósito general para víctimas del terremoto en Armenia, con fondos dirigidos a organizaciones humanitarias/iniciativas locales en el terreno en vez de a una sola familia.',
      sourceUrl: 'https://www.gofundme.com/f/fuerza-colombia-fagsm',
      sourceOrg: null,
      submitterNote: 'Organizadora nativa de Armenia residente en Toledo, España. Señal de transparencia inusual: la campaña declara explícitamente que los fondos NO se han distribuido aún a ningún beneficiario específico, que siguen evaluando necesidades en el terreno y prometen verificación antes de cualquier transferencia — un patrón responsable, no una alerta. €100 de €1,400, 9 donantes. POSIBLE SUPERPOSICIÓN A VERIFICAR con una entrada de confianza baja de la pasada 17 que tenía una salvedad similar sobre custodia de fondos, aunque aquella se describió como multi-ciudad y esta es solo de Armenia — probablemente NO es la misma, pero se deja señalado.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: armenia.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: armenia.id,
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
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid02TaLVLba7YGeztC9tt2iEm7xtQr5YTVn4xjNPrTFGpK6mJa31y3MywpNCh2EvFT3sl&id=100033349272686',
      authorHandle: 'Impacto Quindío',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia / Quindío',
      note: 'NUEVA ALERTA DE ESTAFA: el Secretario de Gobierno de Armenia, Carlos Arturo Ramírez Hincapié, advirtió que ninguna organización (Gobernación, alcaldías, ni la empresa "PROYECTA") solicita donaciones directamente para las víctimas; reportes de falsos rescatistas pidiendo dinero y personas haciéndose pasar por inspectores de daños para entrar a las viviendas. Corroborado de forma independiente por al menos 4 medios/cuentas distintas (alerta.com.co, Quindío Noticias, Caracol Radio Armenia, Alerta Armenia).',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/CruzRojaQuindio/status/2088066033173078195',
      authorHandle: '@CruzRojaQuindio',
      category: 'AID_POINT' as const,
      placeName: 'Coliseo del Sur, Armenia',
      note: 'Cruz Roja Quindío confirma que su equipo de Salud Mental y Apoyo Psicosocial inició labores en el albergue temporal del Coliseo del Sur — corrobora que el albergue está activo y operando.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/photo/?fbid=1550835303753232&set=a.605459941624111',
      authorHandle: 'Quindío Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia, Quindío',
      note: 'Informe Preliminar de Afectación N.° 11 (corte 7am, 15 de agosto): 10,800 estructuras con algún daño; 1,250 evaluadas, 140 en riesgo de colapso (80 viviendas + 60 edificios = 1,074 unidades habitacionales, ~4,100 personas desplazadas); 1 fallecido (zona Centro) y 134 heridos en 7 centros de salud; 10 colegios y 5 universidades con afectación estructural; balance animal: 8 gatos heridos, 3 perros muertos, 1 perro herido, 17 gatos en situación de calle, 223 mascotas desaparecidas (6 ya reencontradas). Ver también los nuevos registros de TollRecord (1 fallecido, 134 heridos) sembrados en este mismo script.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_IOcbOpfy/',
      authorHandle: 'apuntesdekt',
      category: 'NEED' as const,
      placeName: 'Armenia, Quindío',
      note: 'Denuncia sobrecostos de arriendo contra familias desplazadas (ejemplo: apartamento de $1.8M a $3M COP), etiqueta a @gobernacionquindio y @alcaldiadearmenia preguntando quién regula esto, ofrece un canal de WhatsApp (3215490256) para listar/buscar arriendos legítimos. Corroborado de forma independiente por una segunda publicación (marceceliispsicologa) la misma semana.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db4EYQJtBDY/',
      authorHandle: 'alemed07',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Armenia, Quindío',
      note: 'RESOLUCIÓN de persona desaparecida: publicación de una mujer en España en nombre de la familia de una amiga buscando a un familiar en Armenia, seguida de un comentario propio de resolución: "ya apareció y se comunicó con su familia, gracias a Dios está bien."',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/lucely.marin.7906/posts/pfbid0t5Gd3Vgr9WcsLSZDWPxaoNYkQnSuHTbo9Gm7TMLbWax7BQ8PppgzBwr3gq7uErxDl',
      authorHandle: 'Lucelly Marin',
      category: 'NEED' as const,
      placeName: 'Armenia, Quindío',
      note: 'Caso ABIERTO, sin resolver: Lucelly Marín busca a su hijo, Cristian Camilo Arango Marín, desaparecido desde el terremoto en Armenia. Contacto directo: 314-554-7669. No se encontró resolución para este caso en esta pasada.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db9aRq3pp9C/',
      authorHandle: 'nicdml_',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia, Quindío',
      note: 'Guía legal/de derechos para víctimas del terremoto: cómo presentar un Derecho de Petición, inscribirse en el Registro Único de Damnificados (RUD), por qué el seguro debe cubrir áreas comunes en propiedad horizontal, y que un arriendo inhabitable termina el contrato por fuerza mayor. WhatsApp 321 692 9038 para quienes no tienen acceso a internet.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@hardtabogados/video/7674292920790322433',
      authorHandle: '@hardtabogados',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia (también Cali, Pereira, Manizales, Quibdó)',
      note: 'Explicación legal gratuita: el Decreto 1171 (declaratoria nacional de desastre) solo garantiza aplazamiento de arriendo, NO condonación — los subsidios de arriendo/servicios siguen siendo "promesas, no decretos" — y la inscripción en el censo de damnificados de cada alcaldía es la única puerta de entrada a cualquier beneficio. Advierte contra gestores/intermediarios pagos.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@cncquindio/video/7673029923174354197',
      authorHandle: 'CNC Quindío',
      category: 'OFFICIAL' as const,
      placeName: 'Departamento del Quindío (incl. Armenia)',
      note: 'Durante una visita presidencial a Quindío, el presidente Abelardo De La Espriella se comprometió a resolver subsidios de arriendo y reparación de vivienda. El gobernador Juan Miguel Galvis afirmó que cerca del 70% del stock de vivienda/edificios públicos del departamento fue afectado, y pidió ayuda nacional para 4 acueductos críticos (Filandia, Circasia, Salento, Calarcá); todas las solicitudes municipales se canalizarán ahora únicamente a través del Gobernador ante la Presidencia.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcAPAbLM_sB/',
      authorHandle: 'johannaandreagrajales',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Armenia, Quindío',
      note: '"El terremoto en el Quindío no ha terminado — lo seguimos viviendo." Publicación de concientización sobre el daño invisible cinco días después: muros agrietados y cimientos debilitados que no se ven como escombros en la calle, familias que no pueden dormir en su propia casa, negocios cerrados, trabajadores sin ingresos — respondiendo a la percepción de que "aquí no pasó nada" porque Armenia no tuvo muertes (cifra que esta misma pasada actualiza a 1, ver TollRecord).',
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
        municipioId: armenia.id,
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
