/**
 * Pass 74 (2026-08-16) — round 6 continues, Buenaventura. Seven prior
 * passes (6, 11, 12, 19, 28, 40, 50, 63) already covered this city, most
 * recently documenting the Manos Visibles Nequi-impersonation crisis
 * getting worse (six-plus fake numbers circulating). This round found
 * the org's "Fondo de Reconstrucción S.O.S. Pacífico" fund — flagged in
 * pass 63's notes but deliberately NOT seeded then because no agent
 * could capture a working permalink — now has real, working sources
 * (Instagram, Facebook, and a news article all pointing to the same
 * afrus.org link), so it's formally entered into the database for the
 * first time this pass.
 *
 * On the Nequi/QR impersonation risk specifically: three of four
 * relevant agents concluded it remains UNRESOLVED — the org appears to
 * be abandoning that channel in favor of the pre-existing, already-known
 * afrus.org link rather than fixing it. One agent read a successful test
 * of afrus.org itself as evidence the "broken link" had been fixed, but
 * afrus.org was already the known-good channel before this pass; that
 * finding doesn't actually confirm the Nequi/QR side was repaired. Not
 * treating this as resolved.
 *
 * First-ever Buenaventura TollRecord: two same-day figures conflicted
 * (16 dead/258 injured, corroborated by three independent outlets and
 * three of five agents, vs. 26 dead/433 injured from one local outlet).
 * Logged the more broadly-corroborated figure, with the outlier flagged
 * in the notes rather than silently dropped.
 *
 * Also new: coastal flooding forcing evacuations in Juanchaco and
 * Ladrilleros (a genuinely new hazard, unrelated to the earthquake's
 * structural damage), the sitting president's in-person visit to the
 * city, and the real underlying situation behind the "Albergue de Rita"
 * impersonation scam flagged in pass 63 — a genuine volunteer-run puppy
 * shelter with no payment channel at all, now documented so donors can
 * tell the real thing from the scam using its name.
 * See wiki/17-allied-resources-and-community.md "Pass 74" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass74-buenaventura-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const buenaventura = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76109' } })

  const sourceDefs = [
    {
      key: 'alcaldia_buenaventura_toll_0816',
      url: 'https://www.facebook.com/reel/1111278404895901',
      org: 'Alcaldía Distrital de Buenaventura, vía Caracol Cali (corroborado por Infobae y Radio Nacional)',
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
      value: 16,
      sourceKey: 'alcaldia_buenaventura_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'PRIMER REGISTRO DE TOLL específico de Buenaventura — verificado directamente contra las siete pasadas anteriores: nunca se había registrado formalmente. Cifra atribuida a la Alcaldía Distrital ("a seis días del terremoto"), repetida el mismo día por Infobae, Radio Nacional y Caracol Cali (3 de 5 agentes de esta pasada convergen en esta cifra). CONTRADICCIÓN A SEÑALAR: un agente distinto encontró una cifra más alta el mismo día (26 fallecidos, 433 heridos) atribuida a "Buenaventura En Línea" y corroborada por un segundo medio local — se registra la cifra con más corroboración amplia (3 fuentes vs. 2), pero ambas están fechadas el mismo día; una pasada futura debería reconciliarlas.',
    },
    {
      metric: 'INJURED' as const,
      value: 258,
      sourceKey: 'alcaldia_buenaventura_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'Misma fuente; misma salvedad sobre la cifra contradictoria de 433 heridos encontrada por otro agente.',
    },
    {
      metric: 'VIVIENDAS_DESTRUIDAS' as const,
      value: 2000,
      sourceKey: 'alcaldia_buenaventura_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'Primer registro de daño habitacional específico de Buenaventura: de un total de 7.150 viviendas afectadas, ~2.000+ son pérdida total (cifra aproximada, "2.000+" en la fuente original).',
    },
    {
      metric: 'VIVIENDAS_AVERIADAS' as const,
      value: 5000,
      sourceKey: 'alcaldia_buenaventura_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'Misma fuente: ~5.000 viviendas con daño parcial (cifra aproximada, "~5.000" en la fuente original), del total de 7.150 viviendas afectadas.',
    },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: buenaventura.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: buenaventura.id,
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
      kind: 'MONETARY_DONATION' as const,
      name: 'Manos Visibles — Fondo de Reconstrucción S.O.S. Pacífico / Espacios de Vida',
      address: null,
      phone: null,
      needsText: 'Fondo de reconstrucción activado el 14 de agosto, cubriendo Buenaventura y Chocó en cuatro frentes: salud mental, recuperación de vivienda, protección infantil y conectividad comunitaria. Trabajando con la Escuela Taller de Buenaventura para reconstruir al menos 100 viviendas (25 completadas al momento de esta pasada); ya enviaron 46 toneladas de ayuda al Chocó. Donar en https://web.afrus.org/donamigosvisibleschoco (tarjeta débito/crédito o PSE).',
      sourceUrl: 'https://www.sercolombiano.com/2026/08/14/manos-visibles-activa-el-fondo-de-reconstruccion-s-o-s-pacifico-y-envia-46-toneladas-de-ayudas-al-choco/',
      sourceOrg: 'Manos Visibles',
      submitterNote: 'Este fondo ya se mencionó en la pasada 63 (25 de 100 viviendas), pero explícitamente NO se sembró entonces porque ningún agente pudo capturar un permalink funcional. Esta pasada sí lo logró: corroborado por tres medios independientes (sercolombiano.com, zonabien.info, noticiassuper.com) y por publicaciones propias de Manos Visibles en Instagram y Facebook, todas apuntando al mismo enlace afrus.org ya verificado como legítimo desde antes. NO confirma que el canal Nequi/QR roto (riesgo de suplantación documentado desde la pasada 50, empeorado en la 63) haya sido reparado — la organización parece estar abandonando ese canal en vez de arreglarlo.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Fundación Internacional María Luisa de Moreno (FIMLM) — Brigada de Salud y campaña #HoyPorColombia',
      address: 'Sede: Carrera 51 No. 130-29, Barrio Prado Veraniego, Bogotá D.C. (brigada móvil desplegada en Buenaventura, sin dirección local publicada)',
      phone: '+57 (1) 795 3000',
      needsText: 'Brigada de salud móvil atendiendo ~500 personas afectadas por el terremoto en múltiples especialidades médicas en Buenaventura, parte de la campaña #HoyPorColombia (12.000 paquetes de ayuda entregados en 80 municipios). Donar en fimlm.org/HoyPorColombia (Wompi/PayU, tarjeta o PSE).',
      sourceUrl: 'https://x.com/FIMLM/status/2089058466182681069',
      sourceOrg: 'Fundación Internacional María Luisa de Moreno',
      submitterNote: 'Organización real, registrada desde el año 2000 (NIT 830.073.822-1, Cámara de Comercio de Bogotá), no vista en las ocho pasadas anteriores de Buenaventura. AVISO: es el brazo de caridad de la iglesia IDMJI y de María Luisa Piraquive, ligada al partido político MIRA — registro legítimo, pero los donantes deben conocer esta afiliación religiosa/política antes de donar. La página de donación en sí es genérica, sin copy específico del terremoto ni de Buenaventura.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Espacio La Barca — punto de acopio para Buenaventura',
      address: 'Diagonal 42A #20-45, Bogotá, Colombia',
      phone: '315 680 8350',
      needsText: 'Donaciones en especie para barrios/comunidades de Buenaventura identificados por la organización local @yunta_studio. Camión de 3 toneladas sale la semana siguiente. Horario: viernes-sábado 2:00pm-9:00pm, domingo 9:00am-12:00pm.',
      sourceUrl: 'https://www.instagram.com/p/DcBbIiekV9c/',
      sourceOrg: 'Espacio La Barca',
      submitterNote: 'Cuenta de un espacio cultural establecido (18.2K seguidores, 917 publicaciones), no una cuenta anónima ni recién creada; teléfono y dirección coinciden con la publicación.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio Medellín (Olaya Herrera) para Buenaventura',
      address: 'Calle 14 #52A-304, junto al parque/estación Olaya Herrera, Medellín',
      phone: null,
      needsText: 'Productos de higiene, medicamentos, pañales/fórmula infantil, agua, utensilios de cocina. Recolección hasta el domingo, según la organizadora.',
      sourceUrl: 'https://www.instagram.com/p/DcBtglpRIpC/',
      sourceOrg: null,
      submitterNote: 'Cuenta personal/influencer, no una organización registrada; no se pudo verificar de forma independiente que el punto siga activo. Confianza baja — verificar antes de desplazarse.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de acopio Buenaventura — Sedaví (Valencia, España)',
      address: 'Avenida País Valenciano 77, Sedaví (Valencia), España',
      phone: null,
      needsText: 'Donaciones en especie (ropa, insumos) para embarcar por contenedor desde el Puerto de Valencia directamente a Buenaventura. Horario: sáb 15 ago 10:00-19:30, dom 16 ago 10:30-13:00. Sitio complementario: www.colombiasolidaria.com.',
      sourceUrl: 'https://www.facebook.com/reel/1099245816117244',
      sourceOrg: null,
      submitterNote: 'Colecta ciudadana/de la diáspora, no una ONG registrada — opción para la diáspora colombiana en España, no un punto físico en Buenaventura misma. Dos organizadoras nombradas.',
    },
    {
      kind: 'VET' as const,
      name: 'Refugio de cachorros de Doña Rita — apoyo voluntario (no monetario)',
      address: 'Barrio Santa Fe, subiendo hacia el cementerio evangélico, Buenaventura',
      phone: null,
      needsText: 'Refugio para 54 cachorros rescatados, destruido por el terremoto; se organizó una jornada de limpieza voluntaria de escombros. NO SE DA NINGÚN CANAL DE PAGO en esta publicación — solo se piden manos para ayudar.',
      sourceUrl: 'https://www.facebook.com/reel/1627273195466560/?s=single_unit',
      sourceOrg: null,
      submitterNote: 'IMPORTANTE PARA DONANTES: esta parece ser la situación real detrás de la alerta de suplantación "Albergue de Rita" ya documentada desde la pasada 63. Publicada por una persona identificable físicamente en Buenaventura, con interacción real (333 likes, 94 comparticiones). A diferencia de las publicaciones que piden dinero a nombre de "Doña Rita", esta NO pide ningún pago — solo voluntariado físico. Se incluye para que los donantes puedan distinguir la situación real de cualquier impostor que use el mismo nombre para pedir dinero.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: buenaventura.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: buenaventura.id,
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
      permalink: 'https://www.instagram.com/alcaldiabuenaventurad/p/DcG-xYplp93/',
      authorHandle: 'alcaldiabuenaventurad',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'El presidente Abelardo De La Espriella visitó Buenaventura hoy (16 de agosto), reuniéndose con la alcaldesa Ligia del Carmen Córdoba, la gobernación del Valle del Cauca y la Fuerza Pública para coordinar la respuesta de emergencia y la reconstrucción. Un comentario ciudadano (46 min) pregunta si ya es posible el acceso por tierra o mar a la ciudad, sin respuesta clara — sugiere que el acceso sigue siendo incierto. La visita explica en buena parte la oleada de cobertura del "huge update" de hoy, incluyendo un decreto formal de seguridad (0318) para el evento.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/tiemponoticiasbuenaventura/reel/DcGkA7dNcHL/',
      authorHandle: 'tiemponoticiasbuenaventura',
      category: 'NEED' as const,
      placeName: 'Juanchaco, Buenaventura (Bahía Málaga)',
      note: 'NUEVA AMENAZA, no relacionada con el daño estructural del sismo: la subida del nivel del mar está obligando a evacuar viviendas y negocios en los corregimientos costeros de Juanchaco y Ladrilleros. Un periodista ciudadano local había advertido este riesgo días antes; ahora se materializó. Corroborado el mismo día por Infobae Colombia y Caracol Radio Cali.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1111278404895901',
      authorHandle: 'Noticias Al Punto, Región Pacífico',
      category: 'OFFICIAL' as const,
      placeName: 'Vía Buenaventura–Loboguerrero–Buga',
      note: 'La vía sigue cerrada por derrumbes en el sector La Delfina y Cisneros (ambos sentidos bloqueados) — continúa el mismo patrón de reapertura y cierre ya documentado desde pasadas anteriores, sin solución duradera aún.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/EnfoqueNacionalCol/posts/pfbid02Yysxoh4Aj8bcnL8u6ZUdp7cBjqvK4gAggW4kUWb1YwKLYSDwT5T7AdmhXSRHyX1Fl',
      authorHandle: 'Enfoque Nacional',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'El Ministro del Interior, Rodrigo Lara, en visita a Buenaventura, dijo que muchas viviendas dañadas (especialmente palafíticas) podrían repararse rápido con madera/cemento/varilla donados por empresas privadas más mano de obra familiar — generó controversia pública por la frase "en dos minutos". El gobierno anunció que las donaciones de materiales de constructoras/madereras/acereras se canalizarán a través de la UNGRD o la oficina de la Presidencia/Primera Dama.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/thecreaz/posts/pfbid0bB7MF2Dmi11mG8rgXYZydkEB8GtsYWQ1ja9aYXWMfHKEhaBbrcpQV9ts6SpTjzRSl',
      authorHandle: 'Al límite',
      category: 'NEED' as const,
      placeName: 'Barrio El Progreso, Buenaventura',
      note: 'DENUNCIA SIN CONFIRMAR: residentes del barrio El Progreso alegan que ayudas/remesas donadas están siendo retenidas en la caseta comunal del barrio y no distribuidas, con presunto favoritismo hacia familiares de los encargados. Sin responsable nombrado ni cuenta identificada — se piden autoridades de control que investiguen. Tratar como alegación pendiente de confirmar.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcD9VzwOZ3Q/',
      authorHandle: 'jhon_fernando_ramos',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Buenaventura y Chocó',
      note: 'Estudiantes de la Universidad Industrial de Santander (UIS) entregaron un convoy de 20 toneladas de ayuda a Buenaventura y 8 toneladas al Chocó, tras más de 25 horas de viaje. Un comentario posterior pide donaciones (por DM) para cubrir los gastos de viaje de los estudiantes voluntarios que manejaron los camiones — canal informal, verificar directamente antes de aportar.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/939910205136469/?s=single_unit',
      authorHandle: 'Cositas',
      category: 'NEED' as const,
      placeName: 'Buenaventura (cuencas de los ríos Dagua, Calima y San Juan)',
      note: 'Advertencia sobre un riesgo compuesto de inundación además del terremoto, citando el mapeo de riesgo de la CVC en las cuencas de los ríos Dagua, Calima y San Juan, incluyendo sectores rurales como Malaguita y Santa Rosa de Guayacán — pide seguimiento gubernamental más allá de la declaratoria inicial de emergencia.',
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
        municipioId: buenaventura.id,
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
