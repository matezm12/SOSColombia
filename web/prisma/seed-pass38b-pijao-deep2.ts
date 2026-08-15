/**
 * Pass 38b (2026-08-15) — second deep research pass on Pijao, expanding
 * on pass 37. Confirms the Alcaldía's own physical collection point
 * (distinct from the MMQ drive), World Central Kitchen's multi-day
 * operation naming Pijao, and mental-health/risk-management hotlines not
 * captured in the first pass's emergency directory. Also documents
 * several corrections to pass-37 findings: the fire is NOT confirmed
 * contained (contradicts the more optimistic "partially controlled"
 * framing), aerial firefighting support is a CONTESTED claim (one source
 * says yes, three independent harder searches found no confirmation), a
 * viral livestock-casualty figure turned out to be recycled content-farm
 * boilerplate, and the @GLP760 donation key is real but was misattributed
 * to the Alcaldía — it belongs to a separate regional campaign. See
 * wiki/17-allied-resources-and-community.md "Pass 38" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass38b-pijao-deep2.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pijao = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63548' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de Acopio - Alcaldía de Pijao (Secretaría de Gobierno)',
      address: 'Secretaría de Gobierno, Palacio Municipal, Pijao, Quindío',
      phone: null,
      needsText: 'Alimentos no perecederos, colchones y colchonetas, agua potable, cobijas y artículos de aseo, para familias damnificadas por el sismo y el incendio. También recibió tejas, amarras y plásticos para reparaciones temporales de vivienda, entregados personalmente por el alcalde a hogares rurales.',
      sourceUrl: 'https://www.instagram.com/p/Db52hUilkyA/',
      sourceOrg: 'Alcaldía Municipal de Pijao',
      submitterNote:
        'Punto de acopio oficial propio de la Alcaldía, distinto del punto de MMQ/Media Maratón Quindío ya sembrado en la pasada 37. Publicado directamente en la cuenta oficial (#PijaoSeUneParaAyudar #CentroDeAcopio), corroborado por un post posterior mostrando al alcalde entregando lo recolectado a familias rurales.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'World Central Kitchen (WCK) - operación de alimentación en Pijao',
      address: 'Operación multi-ciudad (Manizales, Pereira, Armenia, Pijao, Buenavista, Cali); sin dirección fija en Pijao',
      phone: null,
      needsText: 'Comidas calientes y distribución de alimentos para familias afectadas por el terremoto. ONG internacional (fundada por el chef José Andrés) que nombró explícitamente a Pijao entre las ciudades atendidas en al menos 3 publicaciones distintas entre el 12 y 13 de agosto.',
      sourceUrl: 'https://www.instagram.com/wckitchen/',
      sourceOrg: 'World Central Kitchen',
      submitterNote:
        'Hallazgo de alta confianza: ONG internacional grande y verificada, José Andrés anunció además una donación de US$1M para la respuesta en Colombia. Pijao aparece repetidamente junto a Manizales/Pereira/Armenia/Buenavista/Cali, no como un error de indexación aislado. Precaución: la publicación más reciente de WCK (~15 de agosto) lista Cali/Quibdó/Manizales/Pereira/Buenaventura sin repetir a Pijao - presencia continuada probable pero no garantizada a la fecha de esta pasada.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Pijao Trail - visita solidaria a fincas afectadas',
      address: 'Fincas rurales de Pijao (visita programada, no un punto fijo)',
      phone: null,
      needsText: 'Aporte económico o ayuda en especie para una jornada de entrega de ayuda el domingo 16 de agosto a fincas afectadas por el sismo y los incendios.',
      sourceUrl: 'https://www.instagram.com/pijaotrail/',
      sourceOrg: 'Pijao Trail (carrera de montaña)',
      submitterNote: 'Marca deportiva local preexistente (18K seguidores, organiza la carrera anual Pijao Trail) conectando la identidad turística del municipio con la respuesta a la emergencia - ángulo genuinamente nuevo encontrado en esta pasada.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Alcaldía de Pijao - líneas de Salud Mental y Gestión del Riesgo (DIGER)',
      address: 'Pijao, Quindío',
      phone: 'Salud Mental: 310 214 7329 · DIGER (Gestión del Riesgo): 313 336 4324 · Línea general: 312 287 5860',
      needsText: 'Líneas de atención específicas no incluidas en el directorio de emergencia general ya sembrado (policía/bomberos/hospital) - atención en salud mental y gestión del riesgo.',
      sourceUrl: 'https://www.instagram.com/alcaldiadepijaoq/',
      sourceOrg: 'Alcaldía Municipal de Pijao',
      submitterNote: 'Complementa (no reemplaza) el directorio de emergencia ya sembrado en la pasada 37 con dos líneas específicas de salud mental y gestión del riesgo. El permalink exacto del post no se pudo confirmar de forma independiente pese a varios intentos; texto visto verbatim, atribuido a la cuenta oficial, dos veces en caché de Google.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Fundación SOS Internacional + Red Salud Armenia - brigada de emergencias',
      address: 'Pijao, Quindío (brigada móvil)',
      phone: null,
      needsText: 'Apoyo y atención médica de emergencia durante la crisis del sismo y el incendio, en articulación con la Alcaldía de Pijao.',
      sourceUrl: 'https://www.instagram.com/alcaldiadepijaoq/',
      sourceOrg: 'Fundación SOS Internacional / Red Salud Armenia',
      submitterNote: 'Nombrada directamente por la Alcaldía en su post "LÍNEAS DE ATENCIÓN PARA EMERGENCIAS". Confianza media: el alcance exacto de la participación (brigada médica vs. derivación telefónica) no se confirmó más allá del texto del post.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Gobernación del Quindío + Alcaldía de Pijao - brigada psicosocial, comunidad Ibanakuara',
      address: 'Comunidad Ibanakuara, Pijao, Quindío',
      phone: null,
      needsText: 'Brigada conjunta de atención psicosocial/salud mental para la comunidad Ibanakuara, como parte de la respuesta post-sismo.',
      sourceUrl: 'https://quindio.gov.co',
      sourceOrg: 'Gobernación del Quindío + Alcaldía de Pijao',
      submitterNote: 'Encontrada en el dominio oficial quindio.gov.co (título: "Unidos por la comunidad Ibanakuara: Gobierno del Quindío y Alcaldía de Pijao realizan brigada de atención a esta población"), pero solo vía fragmento de búsqueda de Google - la lectura directa del artículo devolvió error HTTP 403. Confianza media, pendiente de una verificación de lectura completa.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: pijao.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pijao.id,
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
      permalink: 'https://www.instagram.com/p/DcC2en-sF_i/',
      authorHandle: 'alcaldiadepijaoq',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao, Quindío',
      note: 'ESTADO MÁS RECIENTE (post de hace ~5 horas al momento de esta pasada): el Gobernador del Quindío Juan Miguel Galvis visitó Pijao en persona; el alcalde sostuvo videollamada con la Ministra del Trabajo Natalia López Fuentes presentando un "balance del proceso de caracterización de las familias afectadas"; la Brigada de Atención y Prevención de Desastres del Ejército inspeccionó "focos activos" en las veredas La Maicena y El Sinabrio - confirma que el incendio NO está totalmente extinguido a la fecha de esta pasada.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://cronicadelquindio.com/quindio/genova-y-pijao-en-maxima-alerta-por-un-incendio-forestal-que-no-cede/',
      authorHandle: 'La Crónica del Quindío',
      category: 'NEED' as const,
      placeName: 'Pijao / Génova',
      note: 'CONTRADICE el tono más optimista de la Alcaldía: reporte de campo (~21 horas antes de esta pasada) dice que las autoridades reconocen que el incendio "continúa sin ser controlado" en el límite Génova-Pijao, ya en su 4º-5º día. El alcalde de Génova declaró "controlamos un punto y vuelve a aparecer otro." Corroborado por Canal Telecafé: "tras reporte de incendio controlado, comunidad de Pijao vuelve a alertar por avance de las llamas."',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.instagram.com/alcaldiadegenova/',
      authorHandle: 'alcaldiadegenova / Quindío Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Cueva Loca, límite Génova-Pijao',
      note: 'HALLAZGO CONTESTADO - no resuelto: un agente de investigación encontró que la Alcaldía de Génova y Quindío Noticias reportan que un helicóptero Bambi Bucket de la Fuerza Aeroespacial Colombiana hizo ~32 descargas de agua sobre el incendio Cueva Loca/La Maicena hacia el 13-14 de agosto. SIN EMBARGO, tres búsquedas independientes más exhaustivas de otros agentes no encontraron ninguna confirmación de apoyo aéreo específico para Pijao/Génova - todos los despliegues confirmados de Bambi Bucket rastreados corresponden a Tolima (San Luis) y Antioquia (Abejorral, La Vega/Cundinamarca), no a Quindío. Se documenta el hallazgo contradictorio sin resolverlo a un solo veredicto - verificar directamente antes de asumir que llegó apoyo aéreo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://elquindiano.com/noticia/272905/poderoso-incendio-en-vereda-la-maizena-del-municipio-de-pijao/',
      authorHandle: 'Investigación de contenido - hallazgo metodológico',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao, Quindío',
      note: 'ALERTA METODOLÓGICA: una cifra viralmente citada ("8 mil hectáreas de pastos naturales, 200 cabezas de ganado ovino") resultó ser texto reciclado de tipo "content farm" - la misma frase exacta aparece en reportes de incendios no relacionados en Bolivia (hace 7 años), Panamá y Perú, con el nombre de Pijao simplemente sustituido. NO se debe citar como una cifra real de pérdidas ganaderas para Pijao - no existe ninguna cifra confiable de pérdidas de ganado para este municipio a la fecha.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/mediamaratonquindio/p/Db82d4JRvRa/',
      authorHandle: 'mediamaratonquindio / gobernacionquindio',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao',
      note: 'ACLARACIÓN sobre la llave Bre-B @GLP760 (ver aidPoints de la pasada 37): NO aparece en ninguno de los ~10 posts oficiales de la Alcaldía de Pijao revisados en esta pasada - la propia Alcaldía solo dirige donaciones en especie a su Centro de Acopio, nunca a esta llave. La llave está vinculada a un nombre real ("Gustavo Lupaco") y se rastrea hasta campañas anteriores de Media Maratón Quindío de hace ~1 año, siendo reposteada por la propia cuenta oficial de la Gobernación del Quindío. Conclusión: la llave parece legítima (pertenece a MMQ/Gobernación, no es una cuenta fabricada), pero la afirmación de que "la publica la Alcaldía de Pijao" es una atribución incorrecta, no una estafa confirmada. Se recomienda cautela normal, pero la preocupación original de posible fraude queda mayormente descartada.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@_laxur__/photo/7673511533921684756',
      authorHandle: 'RTVC Noticias',
      category: 'NEED' as const,
      placeName: 'Vereda La Maicena, Pijao',
      note: 'Primera mención documentada de pérdidas económicas: "la comunidad reporta pérdidas incalculables en cultivos" en la zona del incendio de La Maicena - sin cifras concretas de café/aguacate/plátano, pero confirma el impacto económico agrícola. El mismo reporte confirma que las fallas de comunicación (sin energía, sin señal) tras el sismo dificultaron la respuesta al incendio.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/corpoquindiocrq/',
      authorHandle: 'corpoquindiocrq',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao / Génova',
      note: 'La CRQ (Corporación Autónoma Regional del Quindío, autoridad ambiental regional) confirma que la operación de bomberos sigue activa hoy: "en la atención de la emergencia participan los cuerpos de bomberos de Caicedonia, Pijao, Buenavista y otros municipios del Quindío" - fuente institucional nueva no citada en la pasada anterior.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://elquindiano.com/noticia/272920/el-pedido-del-gobernador-al-presidente-de-la-espriella-tras-el-terremoto/',
      authorHandle: 'El Quindiano',
      category: 'OFFICIAL' as const,
      placeName: 'Quindío (departamental)',
      note: 'El Gobernador Juan Miguel Galvis Bedoya presentó al presidente De la Espriella un pliego de 15 puntos (hospitales, infraestructura escolar para ~22,000 estudiantes, sistemas de agua, generadores para Génova, subsidios de vivienda, plan aeroportuario) - departamental, no nombra a Pijao específicamente. El presidente respondió con exenciones de servicios públicos por 3 meses, subsidios de arriendo y subsidios de vivienda fase 3, que aplicarían a hogares de Pijao entre otros.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://cronicadelquindio.com/quindio/atienden-a-30-animales-afectados-por-incendio-en-pijao/',
      authorHandle: 'La Crónica del Quindío / El Quindiano',
      category: 'AID_POINT' as const,
      placeName: 'Vereda La Maicena, Pijao',
      note: 'Actualización del hallazgo de bienestar animal ya sembrado: cifra actualizada a 35 perros y gatos atendidos (ninguno con quemaduras), desparasitados y medicados; alimento concentrado también repartido a familias afectadas para sus animales, además de los 6 cachorros y 1 perra gestante ya reportados en hogar de paso.',
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
        municipioId: pijao.id,
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
