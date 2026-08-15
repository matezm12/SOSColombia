/**
 * Pass 50 (2026-08-15) — sixth city in the fourth research round,
 * Buenaventura. Prior rounds (passes 6, 11, 12, 19, 28, 40) already
 * covered this city exhaustively. This pass specifically re-checked the
 * open question from pass 12: whether Manos Visibles' broken QR/Nequi
 * donation link is fixed. Verdict, from two independent agents that dug
 * into it directly: still NOT confirmed fixed — a 23-year-established
 * NGO commenter reported the QR still fails to scan, and at least three
 * different Nequi numbers are now circulating under the Manos Visibles
 * name (their own official one, plus two others of uncertain origin),
 * which is itself a new impersonation-adjacent risk. Donors should be
 * steered to Manos Visibles' PSE/credit-card portal (via web.afrus.org,
 * linked from linktr.ee/manosvisibles) rather than any Nequi number.
 * Also found: a strong new Vaki campaign from a genuine pre-existing
 * Buenaventura NGO, a tragic missing-persons resolution (a man who
 * pulled someone from rubble and later died of his injuries), and a
 * still-unstable road-isolation picture — a partial reopening reported
 * Aug 13, followed by reports of fresh landslides blocking the corridor
 * again by Aug 14-15.
 * See wiki/17-allied-resources-and-community.md "Pass 50" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass50-buenaventura-round4.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const buenaventura = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76109' } })

  const aidPoints = [
    {
      kind: 'ALBERGUE' as const,
      name: 'Corporación Manglaria (Manglaria Pacífico)',
      address: 'Carrera 56B #5-92, Buenaventura, Valle del Cauca',
      phone: '313 448 0019 (Nequi)',
      needsText: 'Albergue temporal y centro de acopio abierto tras el sismo. Recibe alimentos no perecederos, agua potable, productos de higiene, cobijas/colchonetas, o aportes vía Nequi.',
      sourceUrl: 'https://www.instagram.com/p/Db4mysTN6p0/',
      sourceOrg: 'Corporación Manglaria',
      submitterNote: 'Organización cultural/comunitaria local ya establecida en Buenaventura (253 publicaciones, cuenta anterior al terremoto, dirección en el perfil coincide exactamente con la publicación). Publicado desde la cuenta propia de la organización, no un volante reposteado. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Espacio La Barca (con Yunta Studio) — camión hacia Buenaventura',
      address: 'Diagonal 42A #20-45, Bogotá (punto de recolección; camión envía a Buenaventura)',
      phone: '315 680 8350',
      needsText: 'Llenando un camión de 3 toneladas que sale para Buenaventura, según una lista de necesidades curada por @yunta_studio (organización con sede en Buenaventura que mapeó los barrios más afectados). Horario: vie/sáb 2-9pm, dom 9am-12pm. También lleva paquetes marcados para familias específicas nombradas.',
      sourceUrl: 'https://www.instagram.com/p/DcBbIiekV9c/',
      sourceOrg: 'Espacio La Barca',
      submitterNote: 'Espacio La Barca es un espacio cultural bogotano ya establecido (916 publicaciones, 18.2K seguidores, dirección/teléfono/grupo de WhatsApp coincidentes con el perfil). Nombra un socio específico en Buenaventura haciendo evaluación de necesidades en vez de solo pedir dinero. Confianza media-alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'LaCasita Azul (punto de acopio en Bogotá para Buenaventura)',
      address: 'Carrera 20 #45A-33, Bogotá',
      phone: null,
      needsText: 'Alimentos no perecederos, artículos de higiene, insumos médicos, guantes/tapabocas/toldillos, purificadores de agua, pañales/fórmula. No se aceptan ropas. Horario 10am-7pm; primer envío a Buenaventura salió el 14 de agosto.',
      sourceUrl: 'https://www.instagram.com/p/Db8tFGDJoAh/',
      sourceOrg: null,
      submitterNote: 'Dirección, horario y lista de artículos específicos con exclusiones explícitas (una lista genérica sin exclusiones suele ser señal de alerta); publicado por una cuenta personal pequeña, por lo que no se puede verificar como organización — pide bienes, no dinero, y da una fecha de envío reciente y concreta. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación VIP (Taxis VIP) — Buenaventura nos necesita',
      address: null,
      phone: 'Bre-B @vip557',
      needsText: 'Donaciones monetarias y en especie (alimentos, agua, artículos de higiene), con prioridad declarada en proteger a niños, niñas y familias afectadas. La plataforma de taxis VIP dona el 30% de las ganancias de sus viajes durante la campaña.',
      sourceUrl: 'https://fundacionvip.org',
      sourceOrg: 'Fundación VIP',
      submitterNote: 'Dominio propio (fundacionvip.org), corroborado por una publicación de la página oficial de Facebook de Taxis VIP (480+ reacciones). El sitio declara explícitamente que nunca solicita contraseñas, códigos de verificación ni PINs, y da una llave Bre-B (no una cuenta personal) — coincide con las recomendaciones antifraude de la Policía vistas en esta misma ronda. No encontrada en las tres pasadas anteriores.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Manos Visibles — Fondo de Reconstrucción "S.O.S. Pacífico / Espacios de Vida"',
      address: null,
      phone: null,
      needsText: 'Reconstrucción de vivienda dañada/insegura en Buenaventura (reparación de muros/fachadas, restauración de habitabilidad, evaluaciones de arquitectos voluntarios), en alianza con la Escuela Taller de Buenaventura y ADEC. Meta de 100 viviendas, 25 ya recuperadas al 13 de agosto.',
      sourceUrl: 'https://www.facebook.com/ManosVisibles/posts/pfbid0QPSmihhqEtoNmhkgGPeSD8KAAi9LW7d5ijj6a1q5iXjKD55nAjGr61aUvD5ZRtBWl',
      sourceOrg: 'Manos Visibles',
      submitterNote: 'IMPORTANTE — el enlace de pago QR/Nequi señalado como roto en la pasada 12 sigue SIN confirmarse arreglado: una comentarista de una ONG ya establecida de 23 años (Corporación Vínculos) reportó hace ~1 día que el QR sigue fallando al escanear para Nequi. Además, circulan al menos tres números Nequi distintos bajo el nombre de Manos Visibles esta semana (3125849268, el propio de su página de Facebook vinculado a esta meta de 25 viviendas; 3135834185; y 3222625071 atribuido a un "Rescatista Juan Diego") — inconsistencia que representa un riesgo de suplantación, no confirmable como legítima ninguna salvo la primera. RECOMENDACIÓN PARA DONANTES: usar el portal PSE/tarjeta de Manos Visibles (vía web.afrus.org, enlazado desde linktr.ee/manosvisibles) en vez de cualquier número Nequi suelto.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Vanguardia Pacífica — Vaki "Apoya a las víctimas del terremoto en Buenaventura"',
      address: null,
      phone: null,
      needsText: 'Ayuda a las víctimas del terremoto en Buenaventura, recaudada por una fundación pacífica ya establecida.',
      sourceUrl: 'https://vaki.co/vaki/terremoto-buenaventura',
      sourceOrg: 'Fundación Vanguardia Pacífica',
      submitterNote: 'Encontrada de forma independiente por dos de los cinco agentes de esta pasada. Fundación Vanguardia Pacífica es una ONG real y preexistente en Buenaventura (organiza el festival cultural "Manglar Fest" desde hace años, NIT/teléfono verificables en Informa Colombia) — no creada para el terremoto. La directora Karem Ríos aparece personalmente en cámara. Insignia verificada de Vaki, US$664 recaudados de 16 donantes nombrados, última contribución solo 3 horas antes de esta revisión — actividad genuinamente activa. Corroborada por 5+ reposteos independientes en Instagram del mismo video original. Alta confianza.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help 3 Families Rebuild in Buenaventura (Emmanuel Reina Lopez)',
      address: null,
      phone: null,
      needsText: 'Fase de reconstrucción (no respuesta de emergencia): tres familiares del organizador en Buenaventura necesitan materiales de construcción, mano de obra pagada para reconstruir/reparar sus casas, y vivienda temporal durante las obras.',
      sourceUrl: 'https://www.gofundme.com/f/help-3-families-rebuild-in-buenaventura',
      sourceOrg: null,
      submitterNote: 'Organizador nombrado, $1,570 recaudados de meta $3,000, 8 donantes, publicada hace ~1 día. Verificación estándar de GoFundMe, no verificada de forma independiente más allá de la plataforma misma. Confianza media.',
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
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/carolina.rivillas.16/posts/pfbid02VAQBcDB2KFUbB4SHFu2WDWCZz8uYbxTrceQM6igsed1tKefEmHUnyhRN2zFF8Q9Pl',
      authorHandle: 'Carolina Rivillas',
      category: 'NEED' as const,
      placeName: 'Buenaventura',
      note: 'Llamado público etiquetando a la Alcaldía de Buenaventura, UNGRD y las Fuerzas Militares: tres derrumbes siguen bloqueando la vía al mar, impidiendo que camiones de comida y medicina lleguen a Buenaventura/Chocó, calificando los anuncios de ayuda internacional como "atascados en Bogotá" — la vía al mar había sido reportada como reabierta con paso controlado el 13 de agosto (Revista Semana), pero esta publicación y otras del 14-15 de agosto describen nuevos derrumbes cerrándola de nuevo; tratar la situación como inestable, no resuelta.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid04VRRd7RMADvLSeiAs9mRgZqU7MswZHHY7BqPYWr1oFnWuAZKDCECJ5cCwL5A8br3l&id=61571881636838',
      authorHandle: 'Sebas JL (grupo "Buenaventura dice")',
      category: 'NEED' as const,
      placeName: 'Buenaventura',
      note: 'Primer reporte de fraude/desvío de donación específico de Buenaventura encontrado: $400,000 COP destinados a víctimas del terremoto se enviaron por error a un número Nequi equivocado, perteneciente a un individuo nombrado (Deivis José Puello Ruiz) que presuntamente se demoró en devolverlo tras ser contactado.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@telesurclips/video/7673242439590694151',
      authorHandle: 'telesurclips',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Barrio Rockefeller, Buenaventura',
      note: 'RESOLUCIÓN trágica de persona desaparecida: Libardo Brochero Gutiérrez, de 70 años, fue rescatado con vida de los escombros en el Barrio Rockefeller tras ~30 horas atrapado, y murió horas después. Corroborado ampliamente (El Tiempo, teleSUR en Facebook/Instagram/TikTok, Diario La Verdad y más), todos reportando el mismo nombre, edad, barrio y cronología.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@tercer.canal/video/7673177910177500436',
      authorHandle: 'tercer.canal',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura y municipios periféricos, Valle del Cauca',
      note: 'El diputado del Valle del Cauca Esteban Oliveros declaró en el programa regional "De Frente" que la ayuda no está llegando a los municipios periféricos/zonas rurales de Buenaventura — señal oficial y nombrada de una brecha de distribución, distinta de la ya conocida advertencia del Ministro del Interior sobre uso político de la ayuda.',
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
