/**
 * Pass 65 (2026-08-15) — round 5 continues, Dosquebradas. Four prior
 * rounds (21, 30, 42, 52) already covered this city, with the standing
 * Pereira cross-check discipline applied throughout. This round's five
 * agents found dosquebradas.gov.co's own press office newly active and
 * indexed, which surfaced a lot of real detail — but also caused heavy
 * rediscovery of ground already covered under different phrasing: the
 * "Hospital Móvil de Campaña" at the Coliseo Municipal is the same field
 * hospital seeded in pass 42 ("Hospital de Campaña - Coliseo de
 * Dosquebradas", identical address); "Centro Vida Violetas de Frailes"
 * is the same shelter as pass 42's "Albergue Las Violetas"; the La
 * Graciela 4th shelter and the Plazoleta del CAM acopio point are both
 * already on file from pass 52. None re-seeded as new rows — their
 * fresh operational detail (bed counts, donor orgs, capacity figures,
 * phone numbers) is folded into the wiki narrative instead.
 *
 * What IS genuinely new: a third shelter (Centro Vida José Argemiro
 * Cárdenas, Bosques de la Acuarela) queued to open once Violetas fills;
 * three new crowdfunding campaigns; and — notably — Dosquebradas'
 * first-ever city-specific donation scam reports and its first
 * city-specific death-toll figure, across all five research rounds.
 * The death-toll figure (10 fallecidos, via a local news Facebook post)
 * could not be corroborated against an official municipal source
 * despite its adjacent family/shelter figures matching the government's
 * own count closely — flagged in the wiki, not logged as a TollRecord.
 * See wiki/17-allied-resources-and-community.md "Pass 65" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass65-dosquebradas-round5.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const dosquebradas = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66170' } })

  const aidPoints = [
    {
      kind: 'ALBERGUE' as const,
      name: 'Centro Vida José Argemiro Cárdenas (albergue temporal, Bosques de la Acuarela)',
      address: 'Bosques de la Acuarela, Dosquebradas, Risaralda',
      phone: '(+57) 606 351 5333',
      needsText: 'Tercer albergue oficial de la red municipal, capacidad ~300 personas, se activará progresivamente conforme se llene el Centro Vida Violetas. Junto con Campestre B (ya lleno) y Violetas, la capacidad combinada de la red llega a ~900 personas. Registro mediante "caracterización" previa en la Plazoleta del CAM.',
      sourceUrl: 'https://www.dosquebradas.gov.co/web/dosquebradas/ciudad/sala-de-prensa/noticias/303-vigencia-2026/9980-dosquebradas-amplia-su-red-de-albergues-para-las-familias-afectadas-por-el-terremoto',
      sourceOrg: 'Alcaldía de Dosquebradas',
      submitterNote: 'Comunicado oficial municipal fechado 14 de agosto de 2026, citando a la Secretaria de Desarrollo Social y Político Luz Faride Grisales Ocampo. Distinto de Campestre B y de Las Violetas (ambos ya sembrados desde pasadas anteriores) — este es el tercer sitio de la red, no el cuarto (que sigue siendo La Graciela, ya sembrado en la pasada 52 y aún en construcción).',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — reconstrucción hogar barrio Santa Mónica (Nana Gutiérrez)',
      address: 'Barrio Santa Mónica, Dosquebradas',
      phone: null,
      needsText: 'Campaña de Vaki.co ("Ayúdanos a reconstruir el hogar de mis papás y el de mi tía tras el terremoto en Colombia / Dosquebradas") para reconstruir la vivienda de una familia con daño estructural severo en el barrio Santa Mónica, Dosquebradas.',
      sourceUrl: 'https://www.facebook.com/nanagutierrez82/posts/pfbid02sGkDwAuo54Z1Ncivj3cHkkQdYsnZfhs936hrsavo65NaYHNVJN43jZG6WF2a4UUSl',
      sourceOrg: null,
      submitterNote: 'Publicación de Facebook con etiqueta de ubicación explícita "Dosquebradas, Colombia", barrio nombrado (Santa Mónica), fotos del daño interior, y enlace activo a una campaña de Vaki.co. La página del Vaki en sí no fue verificada de forma independiente más allá de la vista previa del enlace en Facebook — confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help Escobar\'s Family Rebuild (Conjunto Granate / Los Naranjos)',
      address: 'Conjunto Granate (sector Valher) y Avenida Simón Bolívar, Los Naranjos, Dosquebradas',
      phone: null,
      needsText: 'Apartamento de una familia en Conjunto Granate perdió el techo y quedó inhabitable; el negocio de una hermana en la Avenida Simón Bolívar, Los Naranjos, colapsó por completo, eliminando su fuente de ingresos. Uno de dos gatos de la familia sigue desaparecido. Fondos para vivienda temporal, reconstrucción y recuperación del negocio.',
      sourceUrl: 'https://www.gofundme.com/f/help-escobars-family-rebuild-after-74-earthquake-in-colomb',
      sourceOrg: null,
      submitterNote: 'Lectura directa de la página en vivo: direcciones concretas de Dosquebradas (Conjunto Granate/Valher, Av. Simón Bolívar/Los Naranjos), familiares nombrados. AVISO PARA MODERACIÓN: un segundo agente de investigación de esta misma pasada marcó el texto de la campaña como escrito "Dosquebradas, Pereira" de forma conjunta, y recomendó precaución por el riesgo de que también se reclame para la lista de Pereira — no se ha duplicado aquí, pero quien modere debe verificar antes de aprobar en ambas ciudades.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Ayuda a mi madre tras el sismo (Elizabeth Arango Heredia)',
      address: 'Dosquebradas, Risaralda (edificio específico no nombrado)',
      phone: null,
      needsText: 'La madre de la organizadora resultó gravemente herida cuando su edificio colapsó el 10 de agosto en Dosquebradas; un tío (Sigifredo Heredia M.) murió en el mismo incidente. Fondos para gastos médicos, cuidadores, transporte y necesidades básicas.',
      sourceUrl: 'https://www.gofundme.com/f/una-mano-amiga-a-mi-madre-tras-el-sismo-en-dosquebradas',
      sourceOrg: null,
      submitterNote: 'AVISO PARA MODERACIÓN — discrepancia título/cuerpo: el TÍTULO público de la página de GoFundMe dice "terremoto en Pereira", pero el texto del cuerpo y el slug de la URL dicen explícitamente "el sismo... en Dosquebradas". Se incluye aquí por el peso del texto explícito y la URL, siguiendo la disciplina de verificación directa de página ya usada en la pasada 52 para el caso de David Londoño — pero quien modere debe confirmar antes de descartar la posibilidad de que también pertenezca a la lista de Pereira.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: dosquebradas.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: dosquebradas.id,
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
      permalink: 'https://x.com/UNGRD/status/2088733129917825142',
      authorHandle: '@UNGRD',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas, Risaralda',
      note: 'La UNGRD (agencia nacional de gestión del riesgo) reporta la entrega de 70 carpas y 210 cobijas a Dosquebradas para apoyar a familias afectadas por el terremoto — apoyo material de nivel nacional adicional a los canales municipales ya sembrados.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/areapoliticanoticias/posts/pfbid0CXRQ3tsgWiv1oBpoZiJN9CjJq17hSyVyHS7dwDvyEAzg9Cc99LnD1ZFsUoSHRzsGl',
      authorHandle: 'Área Política Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas, Risaralda',
      note: 'ACTUALIZACIÓN DE ESTADO IMPORTANTE: el albergue Campestre B alcanzó su capacidad disponible al 14 de agosto — ya NO recibe nuevas llegadas. Las familias ahora son dirigidas al Centro Vida Violetas (Frailes, ya conocido desde la pasada 42 como "Las Violetas"), y un tercer sitio, Centro Vida José Argemiro Cárdenas, se activará cuando Violetas se llene. Capacidad combinada de los tres: ~900 personas. Repost de un comunicado oficial de la Alcaldía de Dosquebradas (dosquebradas.gov.co) con foto del alcalde visitando el albergue.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/cafecalientenoticias/posts/pfbid02V3xVTVHRP5BHbgeCuBKvFa2J29hHpVwEXmHj1mQpNXc8tQFLV5hUEkW3awd87zPfl',
      authorHandle: 'Café Caliente Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas, Risaralda',
      note: 'PRIMERA CIFRA DE MUERTOS ESPECÍFICA DE DOSQUEBRADAS encontrada en las cinco rondas de investigación: "10 personas fallecidas dejó el terremoto en el municipio de Dosquebradas y 700 familias caracterizadas, de las cuales 140 personas permanecen en albergues." Las cifras secundarias (familias caracterizadas, personas en albergues) coinciden casi exactamente con el comunicado oficial municipal del mismo día (733 familias), lo que da cierta credibilidad — pero la cifra de fallecidos en sí NO pudo confirmarse en una página oficial de gobierno durante esta pasada. NO se registra como TollRecord; queda aquí señalada pendiente de confirmación oficial.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/elizabeth.bedoyagalvis/posts/pfbid0GLnnzhirKMMtSw5gqVmfnADPNbru81DCAS4HtTy28xdJ5oPMiTNMm231RmEKUvFwl',
      authorHandle: 'Elizabeth Bedoya Galvis',
      category: 'NEED' as const,
      placeName: 'Calle 65 #18-44, La Capilla, Dosquebradas',
      note: 'PRIMERA ALERTA DE ESTAFA ESPECÍFICA DE DOSQUEBRADAS en las cinco rondas: la propietaria de una vivienda destruida en La Capilla denuncia que personas desconocidas están fotografiando/filmando su casa en ruinas y diciendo falsamente que su familia está alojada en un albergue, solicitando donaciones por Nequi en su nombre sin autorización. Relato en primera persona, con fotos de la vivienda y familiares nombrados.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0Ra2e7ygJFp4C94ZYPjgivjCfTE2CH6CdjL4MbR58yzsu7nGeK9h9yEz1UZ7EfUsMl&id=100012040812170',
      authorHandle: 'Claudia Patricia Acevedo',
      category: 'NEED' as const,
      placeName: 'Frailes (sector La Playita), Dosquebradas',
      note: 'Segunda alerta de posible fraude, en el mismo sector (Frailes) donde está el albergue real Centro Vida Violetas: denuncia de que un sitio autodenominado albergue en un antiguo centro de rehabilitación en Frailes/La Playita estaría solicitando donaciones para el terremoto sin ser realmente un albergue de damnificados. Acusación unilateral no verificada de forma independiente — parece aprovechar la confusión con el sitio legítimo cercano.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBt67cRRwq/',
      authorHandle: 'felipealzate94',
      category: 'NEED' as const,
      placeName: 'Barrio La Graciela, Dosquebradas',
      note: 'Denuncia (15K+ likes, 626 comentarios) de que un funcionario/contratista nombrado está demoliendo viviendas dañadas por el sismo en La Graciela sin dejar a los residentes recuperar sus pertenencias, presuntamente en contra de las recomendaciones técnicas de CARDER. La Graciela es también el sitio del cuarto albergue en construcción (ya sembrado en la pasada 52). Acusación unilateral, sección de comentarios dividida — tratar como denuncia sin confirmar, no como hecho establecido.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiasunoa/video/7673602827880533255',
      authorHandle: 'noticiasunoa',
      category: 'NEED' as const,
      placeName: 'Conjunto Portal del Parque, Dosquebradas',
      note: 'Situación de desplazamiento abierta y sin resolver, no un rescate puntual: en el conjunto Portal del Parque, la Torre 6 colapsó por completo y las Torres 3, 4 y 5 tienen daño estructural severo; todo el conjunto fue evacuado. Docenas de familias siguen esperando autorización para reingresar y recuperar sus pertenencias.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCy-uhxZ_q/',
      authorHandle: 'viajandoandoeneleje',
      category: 'NEED' as const,
      placeName: 'Dosquebradas',
      note: 'Caso de persona desaparecida ABIERTO: Jairo Aldana, visto por última vez en Dosquebradas tras el terremoto; su familia no ha podido contactarlo. Contacto: 323 442 9795. Salvedades: Instagram marcó la publicación como "contenido de IA" (el diseño del volante podría ser generado por IA aunque el caso sea real), y una segunda versión del mismo caso en Facebook tenía la etiqueta de ubicación del perfil marcada como "Pereira" aunque el texto del volante nombra Dosquebradas explícitamente.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db5-5rNRlJB/',
      authorHandle: 'henaougc',
      category: 'NEED' as const,
      placeName: 'Dosquebradas, Risaralda',
      note: 'Caso de persona desaparecida ABIERTO: Nicolás Díaz, entrenador de Bodytech, última ubicación conocida Dosquebradas; llamadas y mensajes no logran contactarlo. Contacto: 314 246 9167. Un voluntario de verificación de datos en los comentarios dirigió al publicante a los registros oficiales colombiatebusca.com y reddesperanza.com, lo que sugiere un esfuerzo de búsqueda organizado, no spam.',
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
        municipioId: dosquebradas.id,
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
