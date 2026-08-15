/**
 * Pass 39 (2026-08-15) — third deep research pass on Pijao, requested
 * explicitly by the user ("more on Pijao, then we move on"). Resolves
 * both contradictions left open by pass 38:
 * (1) fire containment — confirmed still NOT contained, with a more
 *     precise hectare estimate;
 * (2) aerial (Bambi Bucket) support — the strongest "yes" evidence (a
 *     CRQ Instagram post) turned out to be recycled boilerplate also
 *     used verbatim in unrelated Antioquia wildfire posts, while the two
 *     most detailed primary accounts (Génova's own thorough thank-you
 *     post, and a field report quoting the Génova mayor on exactly which
 *     resources arrived) both omit any aerial mention despite crediting
 *     every other responder by name — the pass now leans "probably not
 *     delivered" rather than treating it as confirmed either way.
 * Also corrects a pass-38 finding: the "Ibanakuara psychosocial brigade"
 * lead traces to a quindio.gov.co article dated a year before the
 * earthquake (unrelated pre-existing water project) — no 2026 brigade
 * article exists after three hard searches. See
 * wiki/17-allied-resources-and-community.md "Pass 39" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass39-pijao-deep3.ts`.
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
      kind: 'VET' as const,
      name: 'SADRAQuindio - jornada de vacunación, resguardo indígena Ibanakuara',
      address: 'Resguardo indígena Ibanakuara, Pijao, Quindío',
      phone: null,
      needsText: 'Vacunación, desparasitación y vitaminización para animales de la comunidad indígena Ibanakuara, en el marco de la respuesta a la emergencia.',
      sourceUrl: 'https://www.facebook.com/SADRAQuindio',
      sourceOrg: 'Secretaría de Agricultura y Desarrollo Rural del Quindío (SADRAQuindío)',
      submitterNote:
        'Corroborado en dos de los cinco agentes de esta pasada, describiendo la misma jornada en el mismo resguardo. Confianza media: solo se leyó un fragmento del post, no el texto completo, y no se pudo confirmar con certeza la fecha exacta ni el vínculo directo con la emergencia (podría ser una jornada de rutina). NOTA IMPORTANTE: esto NO es la "brigada psicosocial" mencionada en la pasada 38 - esa referencia se investigó en profundidad esta pasada y resultó ser una cita errónea de un artículo de quindio.gov.co fechado en 2025, un año antes del terremoto (proyecto de agua potable, no relacionado con esta emergencia). No existe evidencia de una brigada psicosocial 2026 para Ibanakuara tras tres búsquedas exhaustivas - se recomienda descartar esa entrada de la pasada 38.',
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
      platform: 'FACEBOOK' as const,
      permalink: 'https://cronicadelquindio.com/quindio/genova-y-pijao-en-maxima-alerta-por-un-incendio-forestal-que-no-cede/',
      authorHandle: 'La Crónica del Quindío (Andrés Felipe Ramos Gámez)',
      category: 'NEED' as const,
      placeName: 'Pijao / Génova (sector Cueva Loca, La Topacia, La Maicena)',
      note: 'RESUELTO - el incendio SIGUE SIN CONTROLAR a la fecha más reciente consultada (14-15 de agosto): reportaje de campo con el alcalde de Génova en el sitio confirma que el fuego, originado en Pijao, se extendió a Génova y sigue activo al tercer día, empeorando según el alcalde ("ya se evidencia que la afectación es muy alta"). Nueva estimación más precisa: ~200 hectáreas quemadas en Pijao y ~30 en Génova (cifra informal, pendiente de medición técnica oficial), una vivienda deshabitada adicional perdida en el lado de Génova. Solo se mencionan recursos terrestres (bomberos del Quindío y del norte del Valle del Cauca) - ningún apoyo aéreo mencionado pese a que el alcalde detalla con precisión qué apoyo llegó.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_Wqy_pLoT/',
      authorHandle: 'alcaldiadegenova',
      category: 'OFFICIAL' as const,
      placeName: 'Génova, Quindío',
      note: 'VEREDICTO SOBRE BAMBI BUCKET: esta pasada se dedicó específicamente a resolver si llegó apoyo aéreo (Bambi Bucket/Fuerza Aeroespacial) a Pijao/Génova. Este post de la propia Alcaldía de Génova (14 de agosto) agradece detalladamente a CADA entidad que respondió (bomberos voluntarios, Policía, Ejército, Defensa Civil, sector privado, comunidad) y NO menciona ningún recurso aéreo - justo el tipo de post que lo mencionaría si hubiera ocurrido. La evidencia más fuerte a favor del "sí" (un post de la CRQ citando el "sistema Bambi Bucket") resultó ser una frase textual reciclada, usada de forma idéntica en publicaciones no relacionadas de Cornare (la autoridad ambiental de Antioquia) sobre otros incendios - debilitando seriamente esa fuente como prueba específica de un despliegue real en Pijao/Génova. Veredicto final tras tres pasadas: el apoyo aéreo probablemente NO llegó a Pijao/Génova, aunque no existe una negación explícita y directa que lo confirme al 100%.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/search/posts/?q=incendio%20Pijao%20controlado',
      authorHandle: 'Guillermo Rivera Valencia (comentario ciudadano)',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pijao, Quindío',
      note: 'Un ciudadano cuestiona públicamente el mensaje oficial de "controlado", alegando que el fuego sigue en las lomas de la zona alta de maizales, consumiendo por completo varias viviendas. Sin verificar (comentario individual, no institucional) - se registra como contra-narrativa de terreno, no como hecho confirmado.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/search?q=Pijao%20ayuda%20donaciones',
      authorHandle: 'Andrés Gury Rodríguez',
      category: 'NEED' as const,
      placeName: 'Pijao y zonas aledañas del Eje Cafetero',
      note: 'Operación informal y aparentemente recurrente de convoyes de ayuda: "sale nuestro séptimo camión, con 7 toneladas de ayudas rumbo a Pijao", con escolta del Ejército Nacional según el propio publicador. Sin dirección fija ni nombre de fundación registrada - se documenta como señal de una red de ayuda informal activa hacia Pijao, no como punto de acopio verificado.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/fncquindio/',
      authorHandle: 'fncquindio (Comité de Cafeteros del Quindío)',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao / Génova / Quindío (12 municipios)',
      note: 'Señal de fase de reconstrucción agrícola: el Comité de Cafeteros del Quindío se sumó a una jornada atendiendo específicamente "los incendios registrados en Pijao y Génova"; el Ministerio de Agricultura desplegó equipos de evaluación en los 12 municipios del Quindío junto con el Comité de Cafeteros. Es la única señal de ayuda agrícola encontrada que nombra a Pijao explícitamente, aunque el despliegue ministerial es departamental, no exclusivo de Pijao.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/alcaldiadegenova/p/DcChNmkAJ_8/',
      authorHandle: 'alcaldiadegenova',
      category: 'OFFICIAL' as const,
      placeName: 'Génova, Quindío',
      note: 'La Ministra del Trabajo Natalia López Fuentes visitó Génova en persona para evaluar daños del terremoto y el incendio con el alcalde Diego Fernando Sicua - continuación de la videollamada que sostuvo con el alcalde de Pijao reportada en la pasada 38, mismo recorrido ministerial por el sur del Quindío. No se anunció un programa concreto en este post, solo una visita de evaluación.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.instagram.com/reels/Db8YBLVMPal/',
      authorHandle: 'alcaldiadepijaoq',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao, Quindío',
      note: 'ACLARACIÓN METODOLÓGICA: en un video del balance del alcalde circula una cifra de "7,153 hectáreas" que corresponde al total NACIONAL de incendios forestales tras el sismo (438 incendios, 191 municipios, 19 departamentos, según UNGRD) - NO es una cifra específica de Pijao. Se documenta para evitar que se cite por error como pérdida forestal propia de Pijao en el futuro; la cifra específica de Pijao es la estimación informal de ~200 hectáreas ya registrada arriba.',
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
