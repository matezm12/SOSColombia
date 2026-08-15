/**
 * Pass 52 (2026-08-15) — eighth city in the fourth research round,
 * Dosquebradas. Three prior passes (21, 30, 42) already covered this
 * city, with the standing Pereira cross-check re-applied (every finding
 * below was checked against Pereira's full 69-live/10-pending list; none
 * showed a name/address match — dual-city-serving orgs are noted
 * explicitly rather than miscredited to one city). This round was
 * unusually productive: a brand-new official shelter (Campestre B, ~120
 * people/36 families, corroborated by the mayor's own account, the
 * municipal website, Serviciudad, and local news independently) plus a
 * 4th shelter under construction, several new institutional acopio/
 * monetary channels, and — notably — a direct resolution of an open
 * question from pass 13/14: David Londoño's GoFundMe, previously
 * excluded from Pereira's list because its beneficiaries live elsewhere,
 * is confirmed via direct page read to belong to Dosquebradas (a
 * cousin's damaged apartment) and Marsella (an aunt's coffee farm), not
 * Pereira.
 * See wiki/17-allied-resources-and-community.md "Pass 52" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass52-dosquebradas-round4.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const dosquebradas = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66170' } })

  const sourceDefs = [
    {
      key: 'atencionpereira_decreto316_0815',
      url: 'https://www.instagram.com/p/Db9YNsutBnK/',
      org: 'atencionpereira_, citando el Decreto 316 de la Alcaldía de Dosquebradas',
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

  const tollDefs = [
    { metric: 'DAMNIFICADOS_PERSONAS' as const, value: 4583, sourceKey: 'atencionpereira_decreto316_0815', tier: 3, asOf: '2026-08-14T12:00:00-05:00', notes: 'Cifra citada en el Decreto 316 de la Alcaldía de Dosquebradas (toque de queda 6pm-6am hasta el viernes): 4,583 reportes de damnificados.' },
    { metric: 'VIVIENDAS_DESTRUIDAS' as const, value: 548, sourceKey: 'atencionpereira_decreto316_0815', tier: 3, asOf: '2026-08-14T12:00:00-05:00', notes: 'Mismo decreto: 548 viviendas destruidas.' },
    { metric: 'EDIFICIOS_COLAPSADOS' as const, value: 13, sourceKey: 'atencionpereira_decreto316_0815', tier: 3, asOf: '2026-08-14T12:00:00-05:00', notes: 'Mismo decreto: 13 edificaciones colapsadas.' },
    { metric: 'VIVIENDAS_AVERIADAS' as const, value: 3600, sourceKey: 'atencionpereira_decreto316_0815', tier: 3, asOf: '2026-08-14T12:00:00-05:00', notes: 'Mismo decreto: "más de 3,600 inmuebles averiados" — cifra de piso, no exacta.' },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: dosquebradas.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: dosquebradas.id,
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
      name: 'Albergue Polideportivo del Campestre B',
      address: 'Polideportivo del Campestre B, Comuna 3, Dosquebradas (junto a la iglesia del sector)',
      phone: null,
      needsText: 'Albergue municipal nuevo, abierto por la Alcaldía de Dosquebradas (alcalde Roberto Jiménez) y Serviciudad. Al 14-15 de agosto: ~120 personas / 36 familias en ~47 carpas. Serviciudad reportó "capacidad completa" pero sigue recibiendo gente. Necesidades: bolsas de basura, canecas, apoyo con lavandería, granos y alimentos no perecederos.',
      sourceUrl: 'https://www.facebook.com/reel/4565219053735994',
      sourceOrg: 'Alcaldía de Dosquebradas',
      submitterNote: 'Albergue genuinamente nuevo, distinto de los 4 puntos ya sembrados para Dosquebradas (Minuto de Dios, Las Violetas, hospital de campaña en el coliseo, SINALTRAINAL). Corroborado de forma independiente por la cuenta del propio alcalde, el sitio web municipal oficial (dosquebradas.gov.co), Serviciudad, y el medio local Noticias UNOA, todos dentro de una ventana de 24 horas con detalles consistentes. Sin superposición con la lista de Pereira. Alta confianza.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue en construcción — La Graciela (4to albergue, red de Dosquebradas)',
      address: 'La Graciela, Dosquebradas',
      phone: null,
      needsText: 'Cuarto albergue de la red municipal, en adecuación al momento de esta pasada (aún no operativo). Los tres albergues ya habilitados suman capacidad para 900 personas desplazadas; este cuarto espacio en La Graciela albergará 150 más.',
      sourceUrl: 'https://www.facebook.com/areapoliticanoticias/posts/pfbid02G54ay4W3Mwt6jKsjaZaWQgKJTfT9tffhrrDnpFUrsK7KmB6CdqN23CDEAmKG4ctAl',
      sourceOrg: 'Alcaldía de Dosquebradas',
      submitterNote: 'Desarrollo de fase de reconstrucción: red de albergues en expansión. No confundir con Campestre B (ya sembrado arriba) — este es un cuarto sitio distinto, aún en construcción. Sin superposición con la lista de Pereira. Confianza media (aún no operativo, verificar antes de aprobar como punto activo).',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Alcaldía de Dosquebradas — cuenta oficial + Centro de acopio Plazoleta del CAM',
      address: 'Plazoleta del CAM, bodega contigua a la IE Santa Juana, Dosquebradas',
      phone: null,
      needsText: 'Campaña oficial "Dosquebradas se levanta contigo". Acepta alimentos no perecederos, ropa, kit de aseo personal, cobijas/colchonetas y donaciones en dinero a la Cuenta de Ahorros Davivienda 127400027778 (a nombre del Municipio de Dosquebradas).',
      sourceUrl: 'https://www.instagram.com/p/Db864QspfdD/',
      sourceOrg: 'Alcaldía de Dosquebradas',
      submitterNote: 'Cuenta oficial verificada @alcaldia_dosquebradas (42.4K seguidores, enlace a dosquebradas.gov.co), post fijado en el perfil. Antes de ir directo al albergue, las familias deben pasar primero por este punto para caracterización/registro — comentarios reportan que registro y entrega de ayuda son pasos separados, y al menos una persona fue solo a "toma de datos" sin recibir ayuda directa. Sin superposición con la lista de Pereira. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Cámara de Comercio de Dosquebradas — cuentas bancarias oficiales',
      address: 'Sede Cámara de Comercio de Dosquebradas (camadco.org.co)',
      phone: null,
      needsText: 'Donaciones en dinero para personas y negocios afectados por el terremoto. Cuentas: Banco Popular (Ahorros) 500808278471; Davivienda (Corriente) 126269999309.',
      sourceUrl: 'https://www.instagram.com/p/Db6TGVkRw0n/',
      sourceOrg: 'Cámara de Comercio de Dosquebradas',
      submitterNote: 'Institución gremial verificable con dominio propio, reposteado y respaldado por la cuenta del Gobernador de Risaralda (Juan Diego Patiño Ochoa). La propia campaña incluye una advertencia antifraude explícita: "No enviamos dinero ni donaciones a cuentas que aparezcan en redes" — verificar solo por canales oficiales de la Cámara. Sin superposición con la lista de Pereira. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Ángela Rosa — Dosquebradas y Pereira',
      address: null,
      phone: 'WhatsApp 323 245 3572 / 321 310 3899',
      needsText: 'Recolecta alimentos y víveres, ropa en buen estado, y donaciones monetarias. Cuentas: Bancolombia (Ahorros) 70891547191; Nequi 350 683 7131; Bre-B 323 245 3572.',
      sourceUrl: 'https://www.instagram.com/p/Db8eRvERRwO/',
      sourceOrg: 'Fundación Ángela Rosa',
      submitterNote: 'Organización real con seguidores etiquetados identificables (Familia Arango Restrepo) y comentarios genuinos. IMPORTANTE: opera explícitamente en AMBAS ciudades (Dosquebradas y Pereira) — igual que el patrón ya visto en Adóptame Pereira — se marca así explícitamente para que no se le atribuya erróneamente a una sola ciudad en pasadas futuras. Distinta de la "Fundación Solidaridad por Colombia" ya sembrada para Pereira. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Fundación Juntos Somos Más — Centro de acopio K16',
      address: 'K16 # 27-8, Dosquebradas, contiguo al Hotel Yellow',
      phone: '315 345 0056 / 313 666 5206',
      needsText: 'Alimentos no perecederos, agua, elementos de aseo, pañales, cobijas, ropa limpia, artículos para bebés/niños/adultos. Ofrecen recoger la donación a domicilio.',
      sourceUrl: 'https://www.instagram.com/p/Db581lMIrK8/',
      sourceOrg: 'Fundación Juntos Somos Más',
      submitterNote: 'Dirección y dos teléfonos concretos dados, pero Instagram etiquetó este post como "contenido de IA", lo cual reduce la confianza — se registra con esta salvedad explícita, verificar antes de aprobar. Menciona apoyar albergues en Pereira y Dosquebradas. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'SO KIUT — Centro de acopio Los Naranjos',
      address: 'Calle 50 #14-23, barrio Los Naranjos, Dosquebradas',
      phone: 'Nequi 305 201 9388 (Ana María Romero)',
      needsText: 'Agua, cobijas y ropa, alimentos no perecederos, medicamentos e insumos básicos.',
      sourceUrl: 'https://www.instagram.com/p/DcB7IpLoEMf/',
      sourceOrg: null,
      submitterNote: 'Coordinado por el negocio @sokiut.co (con sede en Pereira) que no pudo recolectar en su propio local por daños y encontró esta casa en Dosquebradas como punto de acopio — punto informal en vivienda particular con Nequi personal, confianza media. Sin superposición con la lista de Pereira (el punto físico está en Dosquebradas).',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de acopio Barrio Los Pinos',
      address: 'Mz A, Cs 19, Avenida Principal, Barrio Los Pinos, Dosquebradas',
      phone: '301 520 9965 (Sara Serna)',
      needsText: 'Ayuda humanitaria urgente para familias del Barrio Los Pinos. Recogen a domicilio si no puedes acercarte.',
      sourceUrl: 'https://www.facebook.com/reel/1607319040965586',
      sourceOrg: null,
      submitterNote: 'Video de una residente apelando en cámara, dirección concreta y contacto nombrado — patrón consistente con un punto de acopio de base genuino. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio Parroquia San Marcos Evangelista (reemplazo transitorio de Cáritas Pereira)',
      address: 'Parroquia San Marcos Evangelista, barrio Santa Isabel, Dosquebradas',
      phone: null,
      needsText: 'El Banco de Alimentos operado por Cáritas Pereira tenía su sede anterior (Las Aromas, Pereira) dañada por el sismo; esta parroquia en Dosquebradas es ahora el punto de acopio transitorio de reemplazo.',
      sourceUrl: 'https://www.tiktok.com/@notihechos',
      sourceOrg: 'Cáritas Pereira',
      submitterNote: 'Detalle específico y no genérico (nombra el sitio exacto de Pereira que resultó dañado), pero aún sin corroborar por una segunda fuente — confianza media. Existe precisamente porque un sitio de Pereira quedó inhabilitado, por eso se señala el vínculo funcional, aunque el punto físico está en Dosquebradas.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de entrega frente al Parque Valher',
      address: 'Frente al Parque Valher, Dosquebradas (dirección exacta no dada)',
      phone: null,
      needsText: 'Medicamentos, kits de aseo personal, ropa para hombre/mujer/niño, y alimentos para mascotas.',
      sourceUrl: 'https://x.com/raresingular/status/2088050833032085877',
      sourceOrg: null,
      submitterNote: 'Publicación tipo reporte de testigo con lista concreta de artículos entregados. No corroborado por una segunda fuente. Confianza media.',
    },
    {
      kind: 'BLOOD_DONATION' as const,
      name: 'Hemocentro del Otún — jornada de donación de sangre (sede Hospital Santa Mónica, Dosquebradas)',
      address: 'Hospital Santa Mónica, Dosquebradas',
      phone: null,
      needsText: 'ACTUALIZACIÓN DE ESTADO / POSIBLE INEXACTITUD: la publicación original dice que el Hospital Santa Mónica recibe donaciones de sangre 9am-5pm, pero comentarios de dos días después contradicen esto: "En el hospital Santa Monica no están recibiendo donaciones de sangre" y "Actualicen la información por favor"; otro comentario pide habilitar un punto afuera porque "el centro está colapsado". Verificar disponibilidad antes de dirigir donantes ahí.',
      sourceUrl: 'https://www.instagram.com/p/Db8qfE5xs3A/',
      sourceOrg: 'Hemocentro del Otún',
      submitterNote: 'Cuenta oficial @hemocentrodelotun, pero comentarios de la propia comunidad contradicen la disponibilidad anunciada. Distinto del Banco de Sangre del Hospital San Jorge ya sembrado para Pereira. Confianza media dado el estado contradictorio.',
    },
    {
      kind: 'VET' as const,
      name: 'Hospital Veterinario de Santa Mónica — jornada gratuita de neurología veterinaria',
      address: 'Hospital Veterinario Santa Mónica, Dosquebradas, Risaralda',
      phone: null,
      needsText: 'Consulta/diagnóstico gratuito de neurología veterinaria, exclusivamente para mascotas con trauma, shock o lesiones por el terremoto. Evento puntual: 15 de agosto, 3:00-7:00pm.',
      sourceUrl: 'https://www.facebook.com/hvdesantamonica/posts/pfbid02GZtp2ZkYTA16dBauvpuSUyxabABYRa6qGrjzqB6UUgHehCWrZHkc7XbX7k7iexZyl',
      sourceOrg: 'Hospital Veterinario de Santa Mónica',
      submitterNote: 'Publicado directamente por la página propia del hospital. NOTA DE VIGENCIA: el evento era puntual (15 de agosto, misma fecha de esta pasada) — verificar si ya pasó antes de aprobar como punto activo. Sin superposición con la lista veterinaria de Pereira. Alta confianza en la autenticidad, baja en vigencia temporal.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help Dosquebradas and Claudia\'s Family (Claudia Macuil)',
      address: null,
      phone: null,
      needsText: 'Comidas para familias que dependen del trabajo diario, hidratación para rescatistas, cobijas y ropa para quienes lo perdieron todo — nombra explícitamente a los hermanos y vecinos de la organizadora en la cuadra donde creció, ahora destruida.',
      sourceUrl: 'https://www.gofundme.com/f/help-dosquebradas-and-claudias-family',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por tres de los cinco agentes de esta pasada. Organizadora nombrada (Claudia Macuil, Staten Island, NY, oriunda de Dosquebradas), $552 recaudados de meta $5,000, 8 donantes. Distinta de las 6 campañas pendientes de Pereira. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help Our Family Affected by Colombia\'s Earthquake (David Londoño)',
      address: null,
      phone: null,
      needsText: 'Ayuda de vivienda para una madre soltera con un hijo cuyo apartamento en Dosquebradas quedó inhabitable, más reparación estructural de la finca cafetera de una tía en Marsella (techo colapsado).',
      sourceUrl: 'https://www.gofundme.com/f/donate-to-help-our-family-after-colombias-earthquake',
      sourceOrg: null,
      submitterNote: 'RESUELVE una pregunta abierta desde la pasada 13/14: esta campaña había sido excluida deliberadamente de la lista de Pereira porque sus beneficiarios están en Dosquebradas y Marsella, no en Pereira propiamente. Lectura directa de la página confirma esto: beneficiaria 1 (prima, apartamento en Dosquebradas) y beneficiaria 2 (tía, finca en Marsella, fuera del alcance de esta pasada). $2,816 recaudados de meta $5,000, 46 donantes. Encontrada de forma independiente por tres de los cinco agentes. Pertenece aquí para Dosquebradas. Alta confianza.',
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
      permalink: 'https://x.com/infobae/status/2087435163860922503',
      authorHandle: '@infobae',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Dosquebradas',
      note: 'RESOLUCIÓN de personas desaparecidas: dos turistas argentinos, incluido Carlos Cáceres (69, de San Juan), que habían desaparecido sin señales de vida tras el sismo M7.4 cerca de Dosquebradas, fueron encontrados con vida.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/MundoPoliticoCo/status/2088666678578094401',
      authorHandle: '@MundoPoliticoCo',
      category: 'OFFICIAL' as const,
      placeName: 'Cali, Pereira y Dosquebradas',
      note: 'La Defensora del Pueblo, Iris Marín Ortiz, verificó en Cali, Pereira y Dosquebradas que la entrega institucional de ayuda tiene dificultades para llegar a algunas comunidades/zonas rurales afectadas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/ErnestoOrozcoD/status/2088000752526471239',
      authorHandle: '@ErnestoOrozcoD',
      category: 'OFFICIAL' as const,
      placeName: 'Valledupar (solidaridad hacia Dosquebradas)',
      note: 'La Alcaldía de Valledupar se suma, junto con Ibagué, a un llamado de Fedemunicipios para apoyar a familias afectadas en Dosquebradas, promoviendo donaciones voluntarias en el evento Ixel Moda 2026 — ejemplo de solidaridad entre ciudades similar al patrón ya documentado para Pijao.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/3592661804226529',
      authorHandle: 'Alcaldía de Dosquebradas',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas (comunas 2, 3, 6, 8, 10, 11 y 12)',
      note: 'Los equipos de DIGER (gestión del riesgo municipal) han visitado más de 150 viviendas/conjuntos residenciales en 7 comunas desde el sismo, verificando condiciones de habitabilidad. Etiquetado #DosquebradasSeLevantaContigo.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db67EgXtq9Y/',
      authorHandle: '_sandylovera',
      category: 'NEED' as const,
      placeName: 'Edificio Portal del Parque, Barrio Valher, Dosquebradas',
      note: 'Aviso de riesgo: el edificio "Portal del Parque" (Barrio Valher) cedió estructuralmente y está en zona de alto riesgo de colapso — prohibido el tránsito peatonal y vehicular en dos cuadras a la redonda. Corrobora el llamado de auxilio de una familia (Nequi 3117051558, Luz Elena Ruiz Ospina) cuyo apartamento en ese mismo edificio quedó inhabitable.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db9YNsutBnK/',
      authorHandle: 'atencionpereira_',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas (municipio)',
      note: 'La Alcaldía de Dosquebradas decretó toque de queda de 6:00pm a 6:00am hasta el viernes (Decreto 316). Cifras oficiales citadas — ver también los nuevos registros de TollRecord sembrados en este mismo script (4,583 reportes de damnificados, 548 viviendas destruidas, 13 edificaciones colapsadas, 3,600+ inmuebles averiados).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@danielvideosquevenden/video/7674088680839056660',
      authorHandle: '@danielvideosquevenden',
      category: 'AID_POINT' as const,
      placeName: 'Albergue Centro Vida, Barrio Las Violetas (Dosquebradas)',
      note: 'ACTUALIZACIÓN DE ESTADO del ya conocido Albergue Las Violetas (no es un punto nuevo): al 14 de agosto hay 75 cupos disponibles para familias desplazadas; necesidad concreta nueva: neveras para la cocina del albergue (donar o prestar llamando al 300 857 9103) y estibas para organizar la ayuda entrante. Otra publicación (Noti Hechos) da una cifra distinta (150 de capacidad, solo 15 ocupados) — parecen ser fotos distintas en el tiempo, no contradictorias.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/29049005861355794',
      authorHandle: 'Cesar Marin',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Barrio Las Violetas, Dosquebradas',
      note: 'Perfil en video de Blanca Inés Castro, residente afectada del Barrio Las Violetas, describiendo la pérdida de la mayor parte de su vivienda. Contacto directo para donaciones: 324 251 2160.',
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
