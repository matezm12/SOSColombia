/**
 * Pass 24 (2026-08-14) — follow-up social media research pass on Cali, days
 * after the original deep pass (wiki pass 15). The response has visibly
 * entered a reconstruction phase: an official 2-year reconstruction
 * timeline, a confirmed Aug 24 school-reopening date, blood banks reporting
 * full reserves, and — most notably — evidence the city's shelter network is
 * larger than the "only two official shelters" finding from pass 15. See
 * wiki/17-allied-resources-and-community.md "Pass 24" for full reasoning,
 * including a distribution-bottleneck complaint and conflicting casualty
 * figures left undocumented pending clearer sourcing. Run once via
 * `npx tsx prisma/seed-pass24-cali-followup.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cali = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76001' } })

  const aidPoints = [
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue temporal Canchas Panamericanas (Unidad Deportiva Panamericana)',
      address: 'Unidad Deportiva Panamericana / Canchas Panamericanas, Cali',
      phone: null,
      needsText: 'Tercer albergue oficial temporal (más allá de los ya conocidos Coliseo de Hockey Miguel Calero y Diamante de Béisbol) habilitado por la Alcaldía para ~60 familias (129 personas); también funciona como punto de distribución de donaciones.',
      sourceUrl: 'https://www.cali.gov.co/publicaciones/193678/refugio-y-solidaridad-asi-se-vive-en-el-albergue-temporal-ubicado-en-las-canchas-panamericanas/',
      sourceOrg: 'Alcaldía de Santiago de Cali',
      submitterNote: 'Fuente oficial (cali.gov.co), corroborado independientemente por El País y Caracol Radio, y mencionado también en Instagram, Facebook y TikTok por agentes distintos. Actualiza directamente el hallazgo de "solo dos albergues oficiales" de la pasada anterior. Confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Iglesia Reyes y Sacerdotes',
      address: 'Iglesia Reyes y Sacerdotes, Cali',
      phone: null,
      needsText: 'Alberga a 15 personas. Alimentación, kits de higiene, atención médica y apoyo psicosocial disponibles.',
      sourceUrl: 'https://x.com/elcorrillodemao/status/2088349940963582349',
      sourceOrg: 'Secretaría de Bienestar Social de Santiago de Cali',
      submitterNote:
        'Video citando directamente a Nigeria Rentería Lozano, Secretaria de Bienestar Social de Cali, listando todos los puntos de albergue activos de la ciudad. Corroborado por un segundo video (TikTok, @elcorrillodemao2020) de la misma funcionaria. Confianza media.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Casa de paso/tránsito - Comuna 1, Cali',
      address: 'Zona de la Comuna 1, Cali (dirección exacta no dada)',
      phone: null,
      needsText: 'Alberga a 54 personas, 15 de ellas migrantes de la Comuna 1. Alimentación, kits de higiene, atención médica y apoyo psicosocial disponibles.',
      sourceUrl: 'https://x.com/elcorrillodemao/status/2088349940963582349',
      sourceOrg: 'Secretaría de Bienestar Social de Santiago de Cali',
      submitterNote: 'Mismo video oficial que el albergue de Reyes y Sacerdotes. Confianza media.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Punto de albergue - Barrio Capri, Cali',
      address: 'Barrio Capri, Cali (dirección exacta no dada)',
      phone: null,
      needsText: 'Cupo para 40 personas adicionales. Alimentación, kits de higiene, atención médica y apoyo psicosocial disponibles.',
      sourceUrl: 'https://x.com/elcorrillodemao/status/2088349940963582349',
      sourceOrg: 'Secretaría de Bienestar Social de Santiago de Cali',
      submitterNote: 'Mismo video oficial que los dos albergues anteriores. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Módulos de privacidad - Arquitectura para la Gente (Albergue Coliseo de Hockey)',
      address: 'Calle 9na con Carrera 39, entrada Unidad Deportiva Jaime Aparicio, Albergue Coliseo de Hockey, Cali',
      phone: null,
      needsText: 'Tela blanca o azul claro (~2,508 m²), tubos de cartón industrial (400 grandes + 400 medianos, 3m cada uno) y herramientas, para construir 100 módulos de privacidad dentro del albergue colectivo del Coliseo de Hockey.',
      sourceUrl: 'https://www.instagram.com/p/Db_sxFEkdVj/',
      sourceOrg: 'Arquitectura para la Gente (a nombre de Liliana López, Alcaldía)',
      submitterNote: 'Arquitecta identificada, contacto de la Alcaldía nombrado (Liliana López), dirección exacta de entrega. Confianza media-alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de Acopio Alterno - Mercadillo del Peñón',
      address: 'Calle 3 Oeste #1-80, junto al Parque del Peñón, Cali',
      phone: null,
      needsText: 'Implementos de rescate, alimentos no perecederos, agua, pañales/toallitas, cobijas/colchonetas, linternas/pilas, comida/medicina para mascotas. Camiones salen hacia municipios afectados fuera de Cali donde ha llegado menos ayuda.',
      sourceUrl: 'https://www.instagram.com/p/Db8hD18xmI6/',
      sourceOrg: 'Secretaría de Cultura del Valle del Cauca (co-firmante)',
      submitterNote: 'Co-firmado por la Secretaría de Cultura departamental. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio SUKIPARTES',
      address: 'Cra. 15 #11-62, Cali',
      phone: null,
      needsText: 'Alimentos no perecederos y artículos de higiene personal, desde el 13 de agosto; las donaciones se canalizan a la Parroquia San Miguel y luego al Banco de Alimentos.',
      sourceUrl: 'https://www.instagram.com/p/Db_RCZfgmiE/',
      sourceOrg: 'SUKIPARTES',
      submitterNote: 'Negocio local (repuestos Suzuki), dirección específica y cadena de entrega detallada. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Casa Mangle - reconstrucción del techo (ecosistema cultural)',
      address: null,
      phone: null,
      needsText: 'Reparación de techo y estructura de Casa Mangle, un espacio cultural/comunitario preexistente en Cali (artistas, músicos, pequeños emprendedores) dañado por el sismo.',
      sourceUrl: 'https://vaki.co/vaki/recaudar-fondos-para-el-techo-del-ecosistema-casa-mangle-afectada-por-el-terremoto-en-cali-colombia',
      sourceOrg: 'Casa Mangle',
      submitterNote:
        'Encontrado independientemente por los 5 agentes de esta pasada - la corroboración cruzada más fuerte de todo este seguimiento. Insignia verificada en Vaki, página de Facebook/Instagram con historial previo al sismo (no es una cuenta creada para la ocasión), campaña creada 11 de agosto, US$362 recaudados de 13 aportes/12 patrocinadores reales. Confianza media.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: cali.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: cali.id,
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
      platform: 'X' as const,
      permalink: 'https://x.com/CABLENOTICIAS/status/2088453121483620449',
      authorHandle: '@CABLENOTICIAS',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'Cali extiende la búsqueda de personas desaparecidas 48 horas más; equipos de rescate mantienen nueve frentes activos.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/France24_es/status/2088407174183637247',
      authorHandle: '@France24_es',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'Brigadas internacionales (Topos Aztecas de México, rescatistas israelíes y estadounidenses) trabajan con autoridades colombianas en la búsqueda de desaparecidos.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/z101digital/status/2088440606313853203',
      authorHandle: '@z101digital',
      category: 'OFFICIAL' as const,
      placeName: 'Cali / nacional',
      note: 'Cifras oficiales actualizadas a 4 días del sismo: 285 muertos a nivel nacional (UNGRD), 311 estructuras colapsadas, 375 desaparecidos en las 5 capitales de alerta roja. El presidente declaró duelo nacional de 3 días y una "emergencia económica" con fondo de reconstrucción.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/guirampar/status/2088435201181389007',
      authorHandle: '@guirampar',
      category: 'OFFICIAL' as const,
      placeName: 'Cali / Valle del Cauca',
      note: 'Detalle de la recuperación económica: fondo "Fondo Milagro" nacional/internacional, alivios tributarios y de arriendo, ~270,000 negocios y 1.4M empleos formales en riesgo según Confecámaras.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/MeridianoR_CO/status/2088032859810410582',
      authorHandle: '@MeridianoR_CO',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'La Alcaldía (alcalde Alejandro Eder) ha inspeccionado 99 de 338 sedes escolares afectadas; 63 habilitadas para reabrir el 24 de agosto.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_1SGOiZUZ/',
      authorHandle: 'meridianoregionalco',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'Corrobora la fecha de regreso a clases (24 de agosto) con las mismas cifras oficiales de daño escolar.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/meridianoregionalco/p/DcCjSfCkeQ7/',
      authorHandle: 'meridianoregionalco',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'Retrospectiva de la respuesta del alcalde Eder a 5 días del sismo; anuncia nueva "Donatón" para el suroccidente y que Petronio Solidario ha movilizado ~$2,500 millones COP y 160 toneladas de ayuda.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcALUIBOY4J/',
      authorHandle: 'comunidad_kef',
      category: 'NEED' as const,
      placeName: 'Coliseo del Pueblo, Cali',
      note: 'Denuncia de cuello de botella en la distribución: el centro de acopio del Coliseo del Pueblo estaría acumulando donaciones que no llegan a las fundaciones/juntas de acción comunal pequeñas que las necesitan. Hilo de comentarios extenso con posturas encontradas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/Noti90Minutos/posts/pfbid02hNX3iJshs2PS9fXXWfKuKk9g7wujBb1x1JygdvHXwzAbi2DvpbEcrk4twe2iK9NYl',
      authorHandle: 'Noticiero 90 Minutos',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'El alcalde Alejandro Eder confirma que la reconstrucción de Cali podría tomar al menos dos años.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/ConcejoCali/posts/pfbid0rtU4SaZjSHjFovGzgAB2tw96fmiZTLjCCZ2GT5rHN9sbcScACfnDsJ3fW3GgNzxhl',
      authorHandle: 'Concejo de Cali',
      category: 'OFFICIAL' as const,
      placeName: 'Coliseo Del Pueblo, Cali',
      note: 'El Concejo de Cali respalda públicamente las iniciativas de estabilización de terreno lideradas por la Alcaldía.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/stories/109532851712187/UzpfSVNDOjEzMzM4OTEwMTY0NjM5Nzc=/?view_single=false',
      authorHandle: 'CW+ Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'Balance oficial actualizado (viernes 14 de agosto, 5pm): 111 muertos y 1,416 heridos en Cali específicamente - cifra distinta a la de 74 (Eder/CTI, ver TikTok) y a la de 96 ya registrada (Aug 12); las tres se dejan documentadas sin resolver, dada la volatilidad ya conocida en este proyecto.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/diarioelpaiscali/posts/pfbid02A9VEfU74i6nF4SZAVWuSjnpqLpsnu9zyRFSVyZRZsBpHt7MMSgW7hxwZWvLUtgspl',
      authorHandle: 'El País Cali',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia',
      note: 'La Policía alerta sobre estafas que usan el terremoto para pedir donaciones falsas.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@fernandoposada92/video/7674044930712505621',
      authorHandle: '@fernandoposada92',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (incl. Cali)',
      note: 'Los bancos de sangre reportan reservas llenas según el Instituto Nacional de Salud; ya solo se puede donar con cita para días futuros - actualiza el estado de las campañas de HUV/Imbanaco/Hemolife.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@el.foco.noticias/photo/7673919702887943445',
      authorHandle: '@el.foco.noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Cali / nacional',
      note: 'El chef José Andrés anuncia una donación de casi USD $1 millón vía el Longer Tables Fund para pequeños negocios de comida afectados.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@cwmasnoticias/video/7673169897752464647',
      authorHandle: '@cwmasnoticias',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'El alcalde Eder reporta 88 personas rescatadas y un balance de 74 fallecidos certificados por el CTI en Cali - cifra distinta a otras registradas el mismo día (ver nota en el post de CW+ Noticias).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@elcorrillodemao2020/video/7673960547234106641',
      authorHandle: '@elcorrillodemao2020',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'La Secretaria de Bienestar Social de Cali reporta sobre los albergues temporales activos - corrobora los nuevos puntos de albergue sembrados en esta pasada.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@cyglg1/video/7674062748447247623',
      authorHandle: '@cyglg1',
      category: 'NEED' as const,
      placeName: 'Cali',
      note: 'Alerta de estafa: la cuenta @soylalulu35 cobraría por productos sin enviarlos y se habría burlado de las víctimas del sismo al ser confrontada.',
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
        municipioId: cali.id,
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
