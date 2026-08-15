/**
 * Pass 23b (2026-08-14) — follow-up social media research pass on Pereira,
 * days after the original deep passes (13-14), to catch content posted
 * since then. The response has visibly entered a reconstruction/recovery
 * phase: new crowdfunding campaigns framed around rebuilding rather than
 * emergency relief, evolving scam reports, school-reopening status, and a
 * status correction on an already-known acopio point (still needed, not
 * "enough donations" as rumored). See
 * wiki/17-allied-resources-and-community.md "Pass 23" for full reasoning,
 * including a significant casualty-figure update logged separately via
 * seed-pass23a-toll-update-aug14.ts. Run once via
 * `npx tsx prisma/seed-pass23b-pereira-followup.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })

  const aidPoints = [
    {
      kind: 'HEALTH' as const,
      name: 'Acompañamiento psicológico gratuito - Dr. Carlos Hurtado y Dra. Yamile Hasbon',
      address: null,
      phone: '300 511 8589 (WhatsApp)',
      needsText: 'Apoyo psicológico gratuito, incluso a domicilio, para personas y familias de Pereira afectadas emocionalmente por el terremoto (miedo, ansiedad, insomnio, niños con crisis nocturnas).',
      sourceUrl: 'https://www.instagram.com/p/Db_Bwr0EWfA/',
      sourceOrg: null,
      submitterNote: 'Profesionales nombrados, decenas de respuestas orgánicas de residentes con síntomas reales, servicio gratuito sin solicitud de dinero. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'JumpFit by Felina - jornada de donación de alimento para mascotas',
      address: 'Mall Batará Plaza, Pereira',
      phone: null,
      needsText: 'Alimento Purina u otro alimento para mascotas afectadas por el terremoto, aceptado como entrada a clases especiales de fitness, sábado 15 de agosto.',
      sourceUrl: 'https://www.instagram.com/p/Db_nZpOxQZE/',
      sourceOrg: null,
      submitterNote: 'Evento puntual de un día en un mall real e identificable, sin solicitud de dinero. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de Acopio - Universidad Libre Pereira, Sede Belmonte',
      address: 'Universidad Libre Pereira, Sede Belmonte, Pereira (dirección exacta no confirmada)',
      phone: null,
      needsText: 'Punto de acopio general en el campus Belmonte de la Universidad Libre Pereira.',
      sourceUrl: 'https://www.tiktok.com/@aguipriv/video/7673945984145116437',
      sourceOrg: 'Universidad Libre Pereira',
      submitterNote: 'Video de una persona individual mostrando el montaje real del punto, no confirmado aún por la cuenta oficial de la universidad (@unilibrepereira), que publicó un aviso más vago sobre el mismo tema. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Convite por los afectados del terremoto en Pereira',
      address: null,
      phone: null,
      needsText:
        'Campaña de fase de reconstrucción/recuperación económica (no ayuda de emergencia): bonos de mercado canjeables solo en negocios locales de Pereira (no cadenas), bonos de arriendo pagados directamente a arrendadores, bonos de reparación de vivienda/negocio, y bonos de cuidado de mascotas.',
      sourceUrl: 'https://vaki.co/vaki/convite-pereira',
      sourceOrg: null,
      submitterNote:
        'Organizadoras verificadas en Vaki (Nati Montoya, Valen Zuluaga, Diani Franco, Evelyn H). Divulga comisiones (Vaki 6% + pasarela ~4%, ~90% llega a las familias), compromiso de reportes semanales con recibos, se enmarca en el "convite" histórico real de Pereira de 1945 que construyó el aeropuerto Matecaña. ~86 donantes, más de COP $14.9M recaudados y creciendo con donaciones del mismo día. Confianza media-alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Ayudemos a la familia Millán a reconstruir su hogar',
      address: null,
      phone: null,
      needsText: 'Reconstrucción de vivienda para la familia Millán de Pereira, incluye un familiar de edad avanzada que necesita medicación continua.',
      sourceUrl: 'https://vaki.co/vaki/ayudemos-a-la-familia-mill-n-a-reconstruir-su-hogar',
      sourceOrg: null,
      submitterNote: 'Organizadora verificada en Vaki (Monica Pineda), 62 donantes con actividad del mismo día. Historia específica y consistente. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Fondo de emergencia para estudiantes de Pereira (UTP)',
      address: null,
      phone: null,
      needsText: 'Apoyo declarado para ~30 estudiantes de la Universidad Tecnológica de Pereira (UTP) desplazados tras el colapso de residencias/hogares comunitarios.',
      sourceUrl: 'https://vaki.co/vaki/Fondo-emergencias-universitarias',
      sourceOrg: null,
      submitterNote:
        'PRECAUCIÓN: pese a la insignia "verificada" en Vaki, la página tiene US$0 recaudados y 0 donantes tras 4 días, y el texto es genérico ("acepta tarjetas internacionales, transparencia absoluta") con patrón de plantilla; sin afiliación verificable con la UTP pese a nombrarla. Incluir solo como pista a verificar independientemente contra los canales propios de la UTP, no al mismo nivel de confianza que las otras campañas Vaki de esta pasada. Confianza baja-media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Solidaridad por Colombia - "Caminata de la Solidaridad 2026"',
      address: null,
      phone: null,
      needsText: '100% de lo recaudado en la Caminata de la Solidaridad 2026 destinado a afectados; 1,500 kits de emergencia ya en camino a Cali, Pereira y Buenaventura, con meta de 10,000 kits.',
      sourceUrl: 'https://x.com/CanalTreceCO/status/2087926709790151107',
      sourceOrg: 'Fundación Solidaridad por Colombia',
      submitterNote: 'Cuenta oficial de un canal nacional verificado (Canal Trece); la legitimidad/trayectoria de la fundación en sí no se verificó de forma independiente en esta pasada. Sin dirección local de entrega. Confianza media - verificar antes de promover ampliamente.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: pereira.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pereira.id,
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
      permalink: 'https://x.com/MarioJPenton/status/2088445571954851972',
      authorHandle: '@MarioJPenton',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'El presidente recorrió Pereira y calificó la situación de "apocalíptica"; anunció que las necesidades de Pereira/Risaralda se integrarán a medidas económicas nacionales de emergencia para financiar la reconstrucción.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/NotiExpressColo/status/2088335697975423142',
      authorHandle: '@NotiExpressColo (vía EFE)',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pereira',
      note: 'Pereira intensifica la remoción de escombros y comienza a reanudar actividades diarias; el centro de la ciudad permanece cerrado específicamente para agilizar esa limpieza.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/RedMasNoticias/status/2088326876657799306',
      authorHandle: '@RedMasNoticias',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pereira',
      note: 'Comerciantes de Pereira ya trabajan en un plan propio para contribuir a la reconstrucción y reactivar la actividad económica.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Ejercito_CAAID/status/2088219834093883588',
      authorHandle: '@Ejercito_CAAID',
      category: 'AID_POINT' as const,
      placeName: 'Albergue Olaya, Pereira',
      note: 'Soldados del Comando de Acción Integral del Ejército realizan actividades con niños y familias en el Albergue Olaya - confirma que el albergue sigue abierto y activo con apoyo psicosocial añadido.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/CanalTreceCO/status/2087926709790151107',
      authorHandle: '@CanalTreceCO',
      category: 'AID_POINT' as const,
      placeName: 'Cali, Pereira, Buenaventura',
      note: 'Campaña "Caminata de la Solidaridad 2026" de la Fundación Solidaridad por Colombia, con 1,500 kits de emergencia en camino.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcAUpbEORYN/',
      authorHandle: 'amasiismotel',
      category: 'NEED' as const,
      placeName: 'Motel Ámasiis, Pereira',
      note: 'ACTUALIZACIÓN DE ESTADO: el motel que albergaba a equipos de rescate y misión médica anuncia el cierre de su servicio público regular de nuevo por nuevas restricciones de movilidad, pero mantiene habitaciones para rescatistas y personal médico de otras ciudades.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCwzV7xl-9/',
      authorHandle: 'elsanjuaneronoticias',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'Cemento País despachó tres tractomulas de cemento a la Alcaldía de Pereira y canales de la Presidencia para apoyar la reconstrucción de vivienda dañada.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db-upBpTGHw/',
      authorHandle: 'poderinformativocol',
      category: 'NEED' as const,
      placeName: 'Pereira',
      note: 'Denuncia viral de que un supermercado de Pereira habría exigido membresía paga para poder comprar insumos de donación durante la emergencia - genera controversia pública, testimonio único sin corroborar.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/NoticiasUnoaOficial/posts/pfbid0uPptPZkrwAETZDgC2mmJH2YpNYV8eU2DuipoZNV6m89KXNsy8U5aZ8UaiiD2Jqbdl',
      authorHandle: 'Noticias UNOA',
      category: 'NEED' as const,
      placeName: 'Expofuturo, Pereira',
      note: 'CORRECCIÓN DE ESTADO sobre un punto de acopio ya conocido: los coordinadores desmienten el rumor de que Expofuturo ya tiene "suficientes donaciones" - agua, alimentos, aseo e insumos básicos siguen siendo necesarios por semanas/meses, ya que el punto abastece también a otros municipios y albergues.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/telemedellin.tv/posts/pfbid0CUgzcMj7d5codQiXdsWPaXjqkbQXLdj8CQU8swKEoBMivhRrJUCfuHWrcr9Lx9C8l',
      authorHandle: 'TM+ Telemedellín',
      category: 'NEED' as const,
      placeName: 'Pereira',
      note: 'Un voluntario denuncia que una alerta de personas atrapadas entre escombros en Pereira era falsa, y que rescatistas/maquinaria movilizados terminaron siendo usados para recuperar la caja registradora de un negocio. Corroborado por otras dos páginas regionales.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/dsp.D.D/posts/pfbid0QSW5ZuZKZ5zZfvwgs84Wwc59rd2yHzHuhnuu4t29xpDSJKjvtNHUTWbA7xjyzwAZl',
      authorHandle: 'David S. Perez',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'Alerta de estafa: sitio falso que suplanta a Prosperidad Social (dominio falso "prosperidadsocialgov.co" vs. el real "prosperidadsocial.gov.co") ofreciendo un supuesto subsidio de $860,000 COP para robar datos personales.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/Taxistas2020/posts/pfbid02yUvLzLPQzVhMDP4sEUSSa6RTLrM1deXcAgQXBozt8CVu1G62oemdeMXtDiGuLxbgl',
      authorHandle: 'Amarillos de Oro news',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'Balance actualizado del PMU (Puesto de Mando Unificado) del alcalde Mauricio Salazar, con cifras detalladas de daños y afectados (ver también las cifras oficiales registradas por separado).',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0sM7dHGMqo9cuvV2o45s9tKU8DKAC3fHj9HgoJq5vGFQR5KKH29QmJ8hfJDQ6Y5DCl&id=100094364551001',
      authorHandle: 'Secretaría de Salud de Pereira',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira (albergues)',
      note: 'Descripción oficial de las operaciones de albergue en curso, incluyendo apoyo psicosocial dedicado a niños vía la Policía de Infancia y Adolescencia.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1678233543280127',
      authorHandle: 'Alcaldía de Pereira',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: '67 instituciones educativas están siendo evaluadas estructuralmente antes de autorizar el regreso a clases presenciales. Corroborado por el Diario del Otún y la Gobernación de Risaralda.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@caracolradio/video/7674050138662309141',
      authorHandle: '@caracolradio',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (nacional, cubre Pereira)',
      note: 'La Policía Nacional emitió una alerta formal advirtiendo sobre estafadores que operan esquemas falsos de donación para el terremoto.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@radiola_tv/video/7673983056365112597',
      authorHandle: '@radiola_tv',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'El cantante Jhonny Rivera, quien convirtió su hotel en Pereira en albergue/acopio, denuncia públicamente que estafadores están solicitando donaciones falsas en su nombre.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@sidssy/video/7674044315118750996',
      authorHandle: '@sidssy',
      category: 'NEED' as const,
      placeName: 'Centro, Pereira',
      note: '~1,500 familias de vendedores informales del centro de Pereira perdieron su lugar de trabajo tras el sismo; se afirma que la Alcaldía no tiene un plan de asistencia para ellos.',
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
        municipioId: pereira.id,
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
