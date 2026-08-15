/**
 * Pass 53 (2026-08-15) — ninth city in the fourth research round, San
 * José del Palmar, the earthquake's epicenter. Three prior passes (22,
 * 31, 43) already covered this small, remote town thoroughly, so this
 * round was expected to be thin — and mostly was, except for one genuine
 * find: the municipality's own official Instagram account
 * (@alcaldiamunicipalsjp), never documented before, with two dated
 * communiqués showing real, measurable progress — missing persons down
 * from 2 to 1, and the access road improved from fully cut (14
 * landslides) to passable on one lane. Logged as this town's first
 * precise toll figures beyond the general damage description on file.
 * The Valentina Jurado Vaki campaign (already tracked since pass 22)
 * continues climbing — $46,480/1,828 donors to $47,334/1,839 — resolving
 * a stale-cache data conflict pass 31 had flagged but never confirmed.
 * See wiki/17-allied-resources-and-community.md "Pass 53" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass53-sanjosepalmar-round4.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const sjp = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27660' } })

  const sourceDefs = [
    {
      key: 'alcaldiamunicipalsjp_comunicado2_0813',
      url: 'https://www.instagram.com/alcaldiamunicipalsjp/p/Db_C2b1jt4X/',
      org: 'Alcaldía de San José del Palmar (Consejo Municipal de Gestión del Riesgo)',
      tier: 1,
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
    { metric: 'MISSING_OFFICIAL' as const, value: 1, sourceKey: 'alcaldiamunicipalsjp_comunicado2_0813', tier: 1, asOf: '2026-08-13T12:00:00-05:00', notes: 'Segundo comunicado oficial de la Alcaldía de San José del Palmar (CMGRD). Baja de 2 desaparecidos reportados en el primer comunicado (3 días antes) a 1, búsqueda activa.' },
    { metric: 'INJURED' as const, value: 2, sourceKey: 'alcaldiamunicipalsjp_comunicado2_0813', tier: 1, asOf: '2026-08-13T12:00:00-05:00', notes: 'Mismo comunicado: 2 lesionados, bajo observación.' },
    { metric: 'DAMNIFICADOS_FAMILIAS' as const, value: 525, sourceKey: 'alcaldiamunicipalsjp_comunicado2_0813', tier: 1, asOf: '2026-08-13T12:00:00-05:00', notes: 'Primera cifra precisa de familias damnificadas para este municipio, según el mismo comunicado oficial.' },
    { metric: 'DAMNIFICADOS_PERSONAS' as const, value: 2625, sourceKey: 'alcaldiamunicipalsjp_comunicado2_0813', tier: 1, asOf: '2026-08-13T12:00:00-05:00', notes: 'Mismo comunicado: 2,625 personas afectadas.' },
    { metric: 'VIVIENDAS_DESTRUIDAS' as const, value: 40, sourceKey: 'alcaldiamunicipalsjp_comunicado2_0813', tier: 1, asOf: '2026-08-13T12:00:00-05:00', notes: 'Mismo comunicado: 40 casas colapsadas.' },
    { metric: 'VIVIENDAS_AVERIADAS' as const, value: 485, sourceKey: 'alcaldiamunicipalsjp_comunicado2_0813', tier: 1, asOf: '2026-08-13T12:00:00-05:00', notes: 'Mismo comunicado: 485 viviendas averiadas.' },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: sjp.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: sjp.id,
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
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio Cruz Roja Colombiana — Cartago (para San José del Palmar)',
      address: 'Carrera 3 entre calles 16 y 17, Bodega de la Cruz Roja, Cartago, Valle del Cauca',
      phone: null,
      needsText: 'Alimentos no perecederos, agua embotellada, elementos de aseo personal, ropa en buen estado y cobijas, elementos de primeros auxilios — canalizado específicamente hacia San José del Palmar.',
      sourceUrl: 'https://x.com/MJDuzan/status/2088267439146434609',
      sourceOrg: 'Cruz Roja Colombiana',
      submitterNote: 'Gráfico oficial de la Cruz Roja Colombiana con dirección física concreta, amplificado por la periodista verificada María Jimena Duzán el 14 de agosto, con alto alcance orgánico (137 reposteos, 169 me gusta, ~7K vistas). No presente en ninguna de las tres pasadas anteriores. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Venta benéfica de empanadas para San José del Palmar',
      address: 'Barrio Modelo, Calle 49 #19-27, Dosquebradas',
      phone: null,
      needsText: 'Evento presencial el domingo 16 de agosto: cada compra de empanadas se destina como aporte a los afectados de San José del Palmar.',
      sourceUrl: 'https://www.instagram.com/p/DcDLq3dzFtF/',
      sourceOrg: null,
      submitterNote: 'Dirección física concreta y fecha específica, respaldado en comentarios por @mamadeamara (Valentina Jurado), la creadora verificada que ya lidera la campaña Vaki de San José del Palmar. Evento puntual — verificar vigencia antes de aprobar si ya pasó la fecha. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki por Pereira, Risaralda y San José del Palmar (Lina María Naranjo López)',
      address: null,
      phone: null,
      needsText: 'Donaciones monetarias generales para la recuperación tras el terremoto en Pereira, Risaralda y San José del Palmar.',
      sourceUrl: 'https://vaki.co/vaki/Vaki-por-pereira-risaralda-y-san-jos-del-palmar',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por dos de los cinco agentes de esta pasada (X y Facebook). Organizadora nombrada con publicación de Facebook que enlaza directamente a la página Vaki, 9 donantes nombrados, US$553 recaudados, creada el 13 de agosto, cierra el 1 de septiembre. Escala pequeña y reparte fondos entre varias ciudades en vez de ser exclusiva de San José del Palmar. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio Escuela de Arqueros 5.50 — Torres de Maracaibo (Cali, para San José del Palmar)',
      address: 'Torres de Maracaibo, Cali, Valle del Cauca',
      phone: '318 396 9872',
      needsText: 'Para San José del Palmar: agua, pañales, alimentos no perecederos, kits de aseo. Contactar por WhatsApp para punto de entrega y donaciones en dinero.',
      sourceUrl: 'https://www.instagram.com/p/Db6Ezd2RacF/',
      sourceOrg: null,
      submitterNote: 'Cuenta con varias cuentas relacionadas etiquetadas, número de WhatsApp consistente con el gráfico, publicado hace 4 días — no se confirmó si sigue vigente. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de acopio Ensifera Nature / Fundación Serraniagua (Cali, para El Cairo Valle y San José del Palmar)',
      address: 'Carrera 5 #3-76, Barrio San Antonio, Cali (Local Ensifera Nature)',
      phone: '310 741 1557',
      needsText: 'Alimentos no perecederos, comida para mascotas, aseo, ropa, cobijas, medicamentos, linternas. Dinero: llave Bancolombia @corpserraniagua o llave Davivienda @8210008842 (Fundación Serraniagua).',
      sourceUrl: 'https://www.instagram.com/p/Db-6wbCDju9/',
      sourceOrg: 'Fundación Serraniagua',
      submitterNote: 'Respaldado por dos organizaciones identificables, la Fundación Serraniagua con llaves bancarias a nombre corporativo. NOTA DE VIGENCIA: el plazo de recepción física declarado era "hasta el viernes 14 de agosto, 7:00pm" — ya vencido a la fecha de esta pasada; el punto físico probablemente cerró, pero las llaves bancarias de la fundación pueden seguir siendo un canal válido. Verificar antes de aprobar. Confianza media.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: sjp.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: sjp.id,
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
      permalink: 'https://www.instagram.com/alcaldiamunicipalsjp/p/Db_C2b1jt4X/',
      authorHandle: 'alcaldiamunicipalsjp',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar',
      note: 'HALLAZGO NOTABLE: cuenta oficial de la Alcaldía de San José del Palmar, no documentada en pasadas anteriores. Segundo comunicado oficial (CMGRD): 525 familias damnificadas, 2,625 personas afectadas, 40 casas colapsadas, 485 averiadas, 2 lesionados, 1 desaparecido en búsqueda activa — baja de los 2 desaparecidos reportados en el primer comunicado 3 días antes. Vía principal ya habilitada a un solo carril (mejora frente al reporte anterior de incomunicación total por 14 derrumbes). Ver también los nuevos registros de TollRecord sembrados en este mismo script.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCczZCp37l/',
      authorHandle: 'kevinbernalgirardota',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar (apadrinado por Girardota, Antioquia)',
      note: 'El alcalde de Girardota (Antioquia) anuncia que su municipio "apadrina" a San José del Palmar para apoyar su reconstrucción, coordinado con la Alcaldía de San José del Palmar — desarrollo nuevo de hermanamiento municipal, mismo patrón de solidaridad entre ciudades ya documentado para Pijao.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1392247252787732',
      authorHandle: 'Noticias NVC - Cartago',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'NUEVA ALERTA DE ESTAFA: video de rueda de prensa oficial titulado "ATENCIÓN, NO SE DEJEN ENGAÑAR: EL ICBF NO ESTÁ PIDIENDO DINERO" — advertencia de que estafadores se hacen pasar por el ICBF para solicitar donaciones a nombre de las víctimas del terremoto.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/MintransporteColombiaoficial/posts/pfbid03UEJ9GMVyzGkj8jh8rhFuxu9jeXJ9yEjQqiHzFqpXa97b2SpQPaHczFaXsrEYa7tl',
      authorHandle: 'Ministerio de Transporte Colombia',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'Anuncio oficial: la vía de acceso al municipio, epicentro del terremoto, ha sido rehabilitada. Corroborado el mismo día por Revista Semana. Desarrollo directo de fase de reconstrucción sobre el problema de aislamiento rural ya documentado.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/BurbujadeCordoba/posts/pfbid02PkCjH8oRPwqZV56wsuN4ZeNQwHNPyabuGdPF7G9UEJHJfXKoGyxnFK31PU2zzLaMl',
      authorHandle: 'Burbuja Política',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'MATIZ IMPORTANTE: pese a la reapertura de la vía reportada el mismo día, este post describe que el municipio sigue funcionalmente aislado — llegan helicópteros con ayuda y se evacúa de urgencia a una mujer embarazada. Ambas cosas pueden ser ciertas a la vez: vía transitable pero aún frágil/limitada.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1125856669964079/',
      authorHandle: 'Revista Semana',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'Reportaje fresco (publicado ~5 horas antes de esta pasada) de Revista Semana hablando directamente con habitantes del epicentro: "Creímos que era el fin del mundo".',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/elespectador/status/2088691002156503352',
      authorHandle: '@elespectador',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar y Sipí, Chocó',
      note: 'El Servicio Geológico Colombiano (SGC) reporta 269 réplicas registradas desde el sismo M7.4, concentradas en San José del Palmar y Sipí — actividad sísmica continua, sin fin aún a la secuencia de réplicas cinco días después.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Impacto24_7/status/2088678355285557521',
      authorHandle: '@Impacto24_7',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó (incluye San José del Palmar como epicentro)',
      note: 'El presidente Abelardo De La Espriella anunció un "Plan Marshall" nacional (inspirado en el programa de reconstrucción europea de 1948) para reconstruir el Chocó, nombrando explícitamente a San José del Palmar (epicentro) y Quibdó como municipios prioritarios para inversión en infraestructura, conectividad y vivienda — primer anuncio concreto de política de reconstrucción encontrado para este municipio en cualquier pasada.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/MirenAVer/status/2088459085851029725',
      authorHandle: '@MirenAVer / @patillerorojo',
      category: 'NEED' as const,
      placeName: 'Vereda Surumita, San José del Palmar',
      note: 'Reporte de peligro nuevo y específico: el río se está represando peligrosamente en la vereda Surumita, elevando el riesgo de inundación/avalancha — distinto del conteo genérico ya conocido de 45+ derrumbes. Etiqueta directamente a UNGRD pidiendo acceso vial urgente. Sin verificación oficial aún.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@full_cali/video/7673718600489880850',
      authorHandle: '@full_cali',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'La comunidad y organismos de apoyo formaron una cadena humana para descargar ayuda humanitaria transportada por aire, dado que el acceso vial sigue cortado en algunos puntos — la respuesta se ha desplazado hacia la entrega aérea dado el bloqueo por deslizamientos ya documentado.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@undr.col/video/7673890374888295701',
      authorHandle: '@undr.col',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'Análisis de datos preliminar (Undr Colombia) cruzando reportes de viviendas destruidas con el censo de vivienda del DANE por municipio: San José del Palmar tiene ~76.5 viviendas destruidas por cada 10,000 unidades censales, frente a 11.3 en Tadó y 9.1 en Quibdó — proporcionalmente, por un margen amplio, el municipio más golpeado. Cifras marcadas como preliminares.',
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
        municipioId: sjp.id,
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
