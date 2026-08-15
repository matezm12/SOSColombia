/**
 * Pass 56 (2026-08-15) — second city in the fifth research round, Cali.
 * Four prior rounds (15, 24, 33, 46) already covered this city
 * exhaustively. This pass found the long-tracked Alcaldía-vs-CPI death
 * toll split (104 vs 110 as of pass 46) has resolved upward — the
 * Alcaldía's own Aug 15 balance now reports 111 fallecidos, 77
 * desaparecidos (down from 115 as bodies were identified), and 1,416
 * heridos, independently corroborated by multiple outlets. Logged as new
 * TollRecord rows. Mayor Alejandro Éder gave the city's first concrete
 * reconstruction cost estimate (~$10 billones COP over ~3 years) and
 * formalized the estampillas funding request first flagged in pass 46 —
 * but a sitting city councilwoman's own public demand suggests subsidy
 * money had not reached families as of this pass. The Saavedra triplets
 * case, closed in pass 46, is now fully named: Isabella Saavedra Caicedo
 * confirmed dead alongside her sister and both parents, leaving Ana
 * María as sole survivor.
 * See wiki/17-allied-resources-and-community.md "Pass 56" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass56-cali-round5.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cali = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76001' } })

  const sourceDefs = [
    {
      key: 'elpaiscali_balance_111_0815',
      url: 'https://www.facebook.com/diarioelpaiscali/posts/pfbid0PTw29PtGLkiKUhY3BHb6Ahh14mDPuwjnw7k3V5FfwLAWtYHxW4UU4MSzvcwmkxPel',
      org: 'El País Cali, citando el balance oficial de la Alcaldía de Santiago de Cali',
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
    { metric: 'DEATHS_REPORTED_OFFICIAL' as const, value: 111, sourceKey: 'elpaiscali_balance_111_0815', tier: 2, asOf: '2026-08-15T12:00:00-05:00', notes: 'El balance oficial de la Alcaldía de Cali sube a 111 fallecidos — converge con (y supera) tanto la cifra previa de la Alcaldía (104) como la del CPI (110) ya registradas en la pasada 46, cerrando esa discrepancia. Se registra como fila nueva, no se fusiona con las anteriores, siguiendo la disciplina de nunca sobrescribir.' },
    { metric: 'MISSING_OFFICIAL' as const, value: 77, sourceKey: 'elpaiscali_balance_111_0815', tier: 2, asOf: '2026-08-15T12:00:00-05:00', notes: 'Mismo balance: desaparecidos bajó de 115 (pasada 46) a 77, reflejando identificación de cuerpos durante estos días.' },
    { metric: 'INJURED' as const, value: 1416, sourceKey: 'elpaiscali_balance_111_0815', tier: 2, asOf: '2026-08-15T12:00:00-05:00', notes: 'Mismo balance oficial de la Alcaldía de Cali.' },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: cali.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: cali.id,
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
      name: 'Antiguas bodegas Industria de Licores del Valle (ILV) — acopio departamental',
      address: 'Carrera 1 # 26-85, Cali (abierto 7:00am-10:00pm)',
      phone: null,
      needsText: 'Centro principal de acopio de la campaña departamental de donaciones para damnificados del terremoto.',
      sourceUrl: 'https://www.facebook.com/AlcaldiaDeCali/posts/pfbid03L3Czq7JWxj4ssJ6fssfEFWDLyHu6MzFMBQwHiuDrjtpnBSGhfKsLfata15iEqwQl',
      sourceOrg: 'Alcaldía de Cali',
      submitterNote: 'Publicado por la cuenta oficial verificada de la Alcaldía de Cali, junto con el ya conocido punto Ciudadela Petronio Álvarez. No sembrado en ninguna de las cuatro pasadas anteriores. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Arena Cañaveralejo — punto de acopio 24 horas',
      address: 'Carrera 56 # 3-153, Cali',
      phone: null,
      needsText: 'Recepción de donaciones habilitada las 24 horas.',
      sourceUrl: 'https://www.facebook.com/AlcaldiaDeCali/posts/pfbid03L3Czq7JWxj4ssJ6fssfEFWDLyHu6MzFMBQwHiuDrjtpnBSGhfKsLfata15iEqwQl',
      sourceOrg: 'Alcaldía de Cali',
      submitterNote: 'Mismo post oficial de la Alcaldía de Cali, tercer punto de recolección nuevo esta ronda.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio @doradoscali (Club Atlético Dorados) — para deportistas afectados',
      address: 'Calle 11 #41-06, Barrio Departamental, Cali',
      phone: null,
      needsText: 'Punto de acopio específico para deportistas/personas del mundo deportivo afectadas por el terremoto en Cali.',
      sourceUrl: 'https://www.instagram.com/p/DcEc9P-AADj/',
      sourceOrg: 'Club Atlético Dorados',
      submitterNote: 'Publicado conjuntamente por la cuenta propia del club (academia de fútbol/futsal juvenil real, registrada en clubatleticodorados.com) y un arquero/influencer verificado con 212K seguidores, 3 horas antes de esta revisión. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de acopio Fénix Fútbol Club',
      address: 'Cra 26R #73-88, Barrio Alfonso Bonilla Aragón, Cali',
      phone: '315 802 0710 / Nequi 304 337 7558 / Bancolombia 80804848812',
      needsText: 'Alimentos no perecederos, agua, artículos de higiene, ropa — para víctimas del terremoto, recolectados en las instalaciones de un club deportivo juvenil. Contacto nombrado: Elena Maritza.',
      sourceUrl: 'https://www.instagram.com/fenixfutbolclub2023/',
      sourceOrg: 'Fénix Fútbol Club',
      submitterNote: 'Publicado hace 2 días y reposteado textualmente (misma dirección, teléfono y cuentas) por al menos 6 cuentas independientes de Cali/Valle — señal de corroboración fuerte pese a no poder fijar el permalink exacto de la publicación original (solo el perfil). Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Nuevo hogar para familias terremoto Colombia Cali (Catalina Ordoñez Barona)',
      address: null,
      phone: null,
      needsText: 'Primeros meses de arriendo de vivienda permanente; camas, ropa, calzado, electrodomésticos para familiares que lo perdieron todo en los barrios Guadalupe, Tequendama y Cuarto de Legua.',
      sourceUrl: 'https://www.gofundme.com/f/nuevo-hogar-familias-terremoto-colombia-cali',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por cuatro de los cinco agentes de esta pasada — corroboración excepcionalmente fuerte. Organizadora nombrada (Montreal), familiares nombrados, 17 donantes reales, $911 CAD recaudados de meta $8,000 CAD, fotos de los edificios dañados. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — Reconstruyamos un hogar',
      address: null,
      phone: null,
      needsText: 'Muebles básicos de habitación, nevera, lavadora, menaje de cocina, ropa y primeros meses de arriendo para una familia cuyo edificio en Cali fue declarado inhabitable por ingenieros tras el sismo.',
      sourceUrl: 'https://vaki.co/vaki/reconstruyamos-hogar',
      sourceOrg: null,
      submitterNote: 'ADVERTENCIA — DISCREPANCIA ENTRE FUENTES: dos agentes de esta pasada describen esta MISMA URL con historias de beneficiarios distintas — uno cita a la familia "Anita, Mario, Isabella y Juan" (organizador con insignia verificada Juan Carlos Galeano, 53 donantes nombrados), otro cita a "Marina Chilito, Sandra Mamian y Stephany" en el Barrio Meléndez (organizadora Catalina Quintero, publicado ~2 horas antes). Ambos coinciden en que la página vaki.co/vaki/reconstruyamos-hogar es real y activa, pero no coinciden en de quién es la campaña — posible error de uno de los agentes al copiar la URL, o la página pudo haber cambiado de contenido entre revisiones. Quien modere debe abrir el enlace directamente y confirmar la historia actual antes de aprobar.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Aid for Cali Quake Victims Through La Red Latiendo',
      address: null,
      phone: null,
      needsText: 'Comida, kits de higiene, colchones, cobijas y artículos personales para familias desplazadas en el barrio Tequendama de Cali, canalizados a través del grupo de base La Red Latiendo.',
      sourceUrl: 'https://www.gofundme.com/f/aid-for-cali-quake-victims-through-la-red-latiendo',
      sourceOrg: null,
      submitterNote: 'Encontrada por dos de los cinco agentes. Organizadora (Walnut Creek, CA) estaba visitando familia en Cali cuando ocurrió el sismo; fondos van a un grupo liderado por su sobrino, activo en búsqueda y rescate. 21 donantes, $2,100 recaudados de meta $5,000. No se verificó de forma independiente la organización La Red Latiendo. Confianza media-alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help rebuild my sister\'s business after earthquake in Cali (Big Bang)',
      address: 'Cali, Colombia',
      phone: null,
      needsText: 'Salarios de personal, arriendo y costos de reapertura de "Big Bang", una tienda de decoración festiva y juguetes con paredes agrietadas, ventanas/persianas rotas y AC/estanterías dañados — sostiene a la familia de la dueña más 10 familias de empleados.',
      sourceUrl: 'https://www.gofundme.com/f/help-rebuild-my-sisters-business-after-earthquake-in-cali',
      sourceOrg: null,
      submitterNote: 'Encontrada por dos de los cinco agentes. Organizador nombrado (Olmer Rendon Yepes), £1,266 recaudadas de meta £10,000 (19 donaciones) — enfocada en recuperación de negocio, no de vivienda, distinta de la docena+ de campañas ya sembradas. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — Ayudemos a Juan David y Salomón',
      address: null,
      phone: null,
      needsText: 'Vivienda segura, alimentación, insumos para bebé, ropa y atención médica para un padre y su hijo de 3 meses, rescatados con vida de los escombros el día del sismo; la madre del bebé, Valentina, fue hallada sin vida en el mismo edificio.',
      sourceUrl: 'https://vaki.co/vaki/ayudemos-a-juan-david-y-salom-n',
      sourceOrg: null,
      submitterNote: 'Encontrada por dos de los cinco agentes. Campaña recién publicada (~3 horas antes de esta revisión) en la plataforma legítima Vaki, historia de superviviente específica y verificable. Alta confianza.',
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
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/diarioelpaiscali/posts/pfbid02cByPfoV2px3Qmbt4QePVhMus9Jwo9bgk9nuxGeHpRCbmRRzaL9DF83Pj9GXFkaXQl',
      authorHandle: 'El País Cali',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'FASE DE RECONSTRUCCIÓN: el alcalde Alejandro Éder dio la primera cifra concreta de reconstrucción de Cali: ~$10 billones COP en ~3 años (~$4 billones atención humanitaria inmediata, ~$6 billones infraestructura resiliente). Formalizó ante el presidente Abelardo De la Espriella la petición de liberar $350,000 millones COP de estampillas, redirigir ~$2 billones de deuda de EMCALI hacia la reconstrucción, congelar arriendos en zonas afectadas, y dar autoridad a alcaldes/gobernadores para desembolsar subsidios directamente. Corroborado por al menos 5 medios independientes el mismo día. Ver también los nuevos registros de TollRecord sembrados en este mismo script.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/lavozdepueblo1/status/2088056109726568920',
      authorHandle: '@lavozdepueblo1',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'ALERTA DE ESTAFA: la Secretaría de Gestión del Riesgo de Emergencias y Desastres de Cali advierte que personas se hacen pasar por censistas oficiales y visitan casa por casa a familias afectadas para extraer información privada bajo la excusa de registrarlas para recibir ayuda.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/diarioelpaiscali/posts/pfbid06br3kJUhryBw4BifARVygGZCzjQcCkCHXQgwnACvwqBvTA9DLczwjSbTokHx4159l',
      authorHandle: 'El País Cali',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'NUEVA ALERTA: el Centro Cibernético Policial advirtió sobre estafadores que suplantan entidades/figuras públicas para solicitar donaciones falsas relacionadas con el terremoto.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/luisa.chaparroplazas/posts/pfbid02CEVWp2MMLzKthGS4GZB1hoz1jJNGCoZyxWTSjsYwp3Y5a5yRsoxUvfFYeuz5vAmZl',
      authorHandle: 'Luisa Chaparro Plazas',
      category: 'NEED' as const,
      placeName: 'Cali',
      note: 'ACTUALIZACIÓN DE ESTADO: el subsidio de arriendo prometido AÚN NO se ha empezado a desembolsar — fechas, montos y canales de pago solo se definirán una vez se consolide el censo oficial de damnificados (RUD). Advierte explícitamente no dar dinero ni datos personales a intermediarios externos, ya que el proceso es gratuito y directo con el municipio; enlaza el portal oficial real (rud.gestiondelriesgo.gov.co). Corroborado por una concejala de Cali que exige públicamente que la Secretaría de Vivienda acelere la entrega de subsidios.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/enteratecali/p/DcEyuoWmTJL/',
      authorHandle: 'enteratecali',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'CORRECCIÓN DE RUMOR: la administración del Edificio Vida Centro Profesional ("Edificio de Colores") aclara que solo sufrió daños menores, fue evaluado por ingenieros estructurales, y NO es un centro oficial de donación/acopio pese a reclamos virales — pide a los donantes confiar solo en canales oficiales de la Alcaldía.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/NotiExpressColo/posts/pfbid036r9hxQYrcdE5bFeAyxwkThtdrMRhBaMbTCcFXjMi76ec4pe8YNdTZxkjARCAoC2ol',
      authorHandle: 'Notiexpresscolor VE',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Edificio María Alvira, Cali',
      note: 'CIERRE COMPLETO del caso de las trillizas Saavedra: Isabella Saavedra Caicedo, la última hermana sin ubicar, fue hallada sin vida en los escombros del edificio María Alvira, junto a su hermana Sofía y ambos padres (Jairo Saavedra, Vicky Caicedo, hallados abrazados) — confirma la cuarta muerte de la familia. Ana María es la única sobreviviente, estable tras cirugía.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.elpais.com.co/cali/quiere-ayudar-tras-el-terremoto-en-cali-estas-son-las-condiciones-para-ser-voluntario-en-el-centro-de-acopio-ciudadela-petronio-alvarez-1516.html',
      authorHandle: 'El País Cali',
      category: 'OFFICIAL' as const,
      placeName: 'Ciudadela Petronio Álvarez, Cali',
      note: 'ACTUALIZACIÓN DE ESTADO al centro de acopio ya conocido: la Alcaldía publicó requisitos formales de voluntariado — mayores de 18 años, EPS vigente (extranjeros necesitan seguro internacional), zapato cerrado y pantalón largo, ingreso solo por "entrada 2", dos turnos (7am-2pm y 2pm-8pm), tope de 400 voluntarios por turno. Según otra fuente del mismo día, el punto ya recibió 230 toneladas de ayuda en dos días y despachó 125 toneladas hacia otros municipios afectados, con ~1,100 voluntarios.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/EnterateCali/status/2088731454633325025',
      authorHandle: '@EnterateCali',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Cali',
      note: 'Karol G, Beéle, Silvestre Dangond, Eladio Carrión, Grupo Niche, ChocQuibTown, Andrés Cepeda, Sebastián Yatra y otros artistas confirmaron un concierto benéfico para el 23 de agosto de 2026 en respuesta a la emergencia del terremoto.',
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
