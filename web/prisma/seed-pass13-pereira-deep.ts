/**
 * Pass 13 (2026-08-14) — deep multi-agent research pass on Pereira specifically
 * (Workflow: X + Instagram + TikTok + GoFundMe/Vaki crowdfunding, browser-driven,
 * logged-in sessions where applicable). Facebook agent hit a transient safety-
 * classifier block and was not retried in this pass. See
 * wiki/17-allied-resources-and-community.md "Pass 13" for full agent notes,
 * rejected candidates, and reasoning. Run once via
 * `npx tsx prisma/seed-pass13-pereira-deep.ts`.
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
      kind: 'BLOOD_DONATION' as const,
      name: 'Hospital Universitario San Jorge de Pereira - Banco de Sangre',
      address: 'Carrera 4 #24-88, Pereira, Risaralda',
      phone: '606 880 1629 ext. 0601',
      needsText:
        'Donantes de sangre de todo tipo, con mayor urgencia O+ y O-. Horario: lunes a sábado, 8:00 a.m. a 5:00 p.m. Requisitos: 18-65 años, peso mínimo 50kg, buen estado de salud, documento de identidad.',
      sourceUrl: 'https://www.instagram.com/p/Db3-ssuRK9i/',
      sourceOrg: 'Hospital Universitario San Jorge (@hospitaluniversitariosanjorge)',
      submitterNote:
        'Corroborado independientemente por El Tiempo en TikTok (video en el exterior del hospital mostrando largas filas de donantes: https://www.tiktok.com/@eltiempo/video/7673224555728538900) y por un gráfico multi-ciudad "Colombia nos necesita" que lista la misma dirección junto a entradas verificables para Bogotá, Cali y Manizales. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Consultas Veterinarias Gratis - Dra. Luisa Fernanda López',
      address: null,
      phone: '320 694 8438',
      needsText:
        'Consultas veterinarias gratuitas para perros y gatos afectados por el terremoto en Pereira. Contactar por WhatsApp/llamada para coordinar.',
      sourceUrl: 'https://www.instagram.com/p/Db8qOtSqYZj/',
      sourceOrg: null,
      submitterNote:
        'Profesional individual identificada, número de contacto verificable, sin solicitud de dinero. Confianza media.',
    },
    {
      kind: 'VET' as const,
      name: 'PPAA - Asociación de Protección y Bienestar Animal (puntos de acopio Pereira)',
      address: 'Carrera 10 bis No. 32-68, Pereira; y Calle 85 No. 40-75, Pereira',
      phone: null,
      needsText:
        'Medicamentos, material de curaciones, cobijas, toallas, transportadoras, correas y accesorios para animales afectados/refugios de mascotas. También reciben donación económica: Bancolombia cuenta de ahorros 852-000183-1, NIT 900.270.02-6, a nombre de Asociación PPAA.',
      sourceUrl: 'https://www.instagram.com/p/Db6II6plNN6/',
      sourceOrg: 'Asociación PPAA',
      submitterNote: 'Dos direcciones físicas y NIT registrado como respaldo institucional. Confianza media.',
    },
    {
      kind: 'VET' as const,
      name: 'Adóptame Pereira - Puntos de acopio animal',
      address: 'Pereira y Dosquebradas (punto mencionado en comentarios: Cra 5 con Cll 34)',
      phone: '311 750 1104',
      needsText:
        'Agua, concentrado y comida húmeda para perro y gato, arena para gatos, lazos y correas, guacales, suero fisiológico, gasas, tapabocas, comida enlatada AD. También buscan hogares de paso y voluntarios. Donaciones: Bancolombia Ahorros 725-116346-70, llave 3117501104.',
      sourceUrl: 'https://www.instagram.com/p/Db9duMOF7_Z/',
      sourceOrg: '@adoptamepereira_',
      submitterNote:
        'Cuenta geolocalizada preexistente (no creada para el sismo), 1000+ likes, múltiples comentarios confirmando donaciones ya entregadas. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Puesto veterinario de emergencia - Parque Olaya Herrera',
      address: 'Parque Olaya Herrera, Pereira',
      phone: null,
      needsText:
        'Atención veterinaria gratuita para animales afectados por el terremoto: servicio veterinario, medicina, radiografías y ecografías. También reciben donaciones de medicina y alimento para los animales.',
      sourceUrl: 'https://www.tiktok.com/@danielvideosquevenden/video/7673247843628420372',
      sourceOrg: null,
      submitterNote: 'Video en sitio, 15.3K likes, 539 comentarios, punto público conocido. Confianza media-alta.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Puesto médico de emergencia - Coliseo Mayor de Pereira',
      address: 'Coliseo Mayor, Pereira',
      phone: null,
      needsText:
        'Decenas de profesionales y estudiantes de enfermería atienden pacientes en un puesto de ayuda improvisado en el Coliseo Mayor, tras el colapso operativo de la Clínica Comfamiliar; también ofrecen atención de salud mental a los afectados.',
      sourceUrl: 'https://www.tiktok.com/@france24_es/video/7673669990809111830',
      sourceOrg: null,
      submitterNote:
        'Corroborado independientemente por France 24 Español, El Espectador y kienyke sobre la misma reubicación de pacientes de Comfamiliar. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Kathryn Winn - "Help Pereira Families Recover" (GoFundMe)',
      address: null,
      phone: null,
      needsText: 'Necesidades esenciales, vivienda temporal, reparaciones y otras necesidades urgentes para familias en Pereira.',
      sourceUrl: 'https://www.gofundme.com/f/help-pereira-families-recover',
      sourceOrg: null,
      submitterNote:
        'Organizadora identificada con vínculo personal verificable con Pereira. $2,916 recaudados de meta $6,500, 27 donantes nombrados. Insignia GoFundMe Giving Guarantee. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Cristian David Parra Machado - "Emergency earthquake support for Pereira, Colombia" (GoFundMe)',
      address: null,
      phone: null,
      needsText: 'Plan por fases: suministros de emergencia, limpieza/saneamiento, y reconstrucción estructural para familias de Pereira.',
      sourceUrl: 'https://www.gofundme.com/f/emergency-earthquake-support-for-pereira-colombia',
      sourceOrg: null,
      submitterNote:
        'Organizador con biografía específica (nacido y criado en Pereira, familia aún reside allí). $959 AUD de meta $6,000 AUD, 24 donantes, presupuesto de tres fases. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Estefany Moreno & Diana Castro - "Help My Hometown Pereira, Colombia After the Earthquake" (GoFundMe)',
      address: null,
      phone: null,
      needsText:
        'Alimentos, agua potable, artículos de higiene, pañales para familias afectadas en Pereira; también menciona apoyo a refugios de animales.',
      sourceUrl: 'https://www.gofundme.com/f/help-my-hometown-pereira-colombia-after-the-earthquake',
      sourceOrg: null,
      submitterNote:
        'Co-organizadoras con pérdida personal específica y hermana actualmente en Pereira evaluando necesidades. $1,233 recaudados de meta $2,200, 22 donantes. Compromiso explícito de publicar fotos/recibos. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki - Fondo de emergencias universitarias (Universidad Tecnológica de Pereira)',
      address: null,
      phone: null,
      needsText:
        'Apoyo de emergencia (meta declarada: ~30 estudiantes en 30 días) para estudiantes de la UTP cuyas residencias/hogares comunitarios quedaron estructuralmente dañados e inhabitables.',
      sourceUrl: 'https://vaki.co/es/vaki/Fondo-emergencias-universitarias',
      sourceOrg: null,
      submitterNote:
        'Institución real y verificable (UTP), meta de beneficiarios concreta. Sin confirmación independiente de que sea una campaña oficial sancionada por la UTP - tratar como recaudación individual/estudiantil que referencia la UTP, no como canal oficial. Confianza media.',
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
      permalink: 'https://x.com/BluRadioCo/status/2087574901758603380',
      authorHandle: '@BluRadioCo',
      category: 'AID_POINT' as const,
      placeName: 'Centro de Pereira - puntos de donación de sangre',
      note:
        'BluRadio Colombia reporta puntos de donación de sangre operativos en el centro de Pereira. No nombra una institución/dirección específica (por eso no se creó un PendingAidPoint separado), pero corrobora la actividad ya registrada en el Hospital San Jorge.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Canal1_Col/status/2088009113632374947',
      authorHandle: '@Canal1_Col',
      category: 'OFFICIAL' as const,
      placeName: 'Risaralda (incl. Pereira) - coordinación del sistema de salud',
      note:
        'MinSalud, PAHO/OMS y Cruz Roja coordinando una estrategia reforzada de respuesta en salud para Chocó, Risaralda y Valle del Cauca. Mensaje oficial departamental, no un punto específico en Pereira.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db-18orRNkw/',
      authorHandle: 'convivenciarockfest',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira, Risaralda',
      note:
        'Repost de comunicado oficial de la Alcaldía de Pereira: lista preliminar de personas reportadas desaparecidas, con líneas reales de contacto: Fiscalía 122, línea nacional gratuita 01 8000 919 748.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db5sULqs937/',
      authorHandle: 'smorales121',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pereira (Galicia, Boston, El Remanso, Providencia, Gaviotas)',
      note:
        'Residente de Pereira ofreciendo buscar/contactar familiares desaparecidos. 4,750+ likes, hilo de comentarios extenso con confirmaciones de primera mano de varios barrios ("estamos bien, solo sin señal").',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db9AlF9MnJW/',
      authorHandle: 'd_______reyes',
      category: 'NEED' as const,
      placeName: 'Álamos, Pereira',
      note:
        'Colapso de edificio de vivienda estudiantil en Álamos, búsqueda y rescate activa, se pide no enviar más voluntarios sin entrenamiento al sitio. Corroborado por un comentario independiente.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db622QMDaBe/',
      authorHandle: 'nataliasophiaparra',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira (junto a Chocó, Manizales, Armenia, Cali)',
      note:
        'Rutas de apoyo en salud mental post-sismo: Línea 106 (Salud Mental), nacional y real, más recordatorio de la línea 123 para emergencias.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@eltiempo/video/7673224555728538900',
      authorHandle: '@eltiempo',
      category: 'AID_POINT' as const,
      placeName: 'Hospital San Jorge, Pereira',
      note: 'El Tiempo, video en sitio: largas filas de voluntarios donando sangre a las afueras del Hospital San Jorge.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@danielvideosquevenden/video/7673247843628420372',
      authorHandle: '@danielvideosquevenden',
      category: 'AID_POINT' as const,
      placeName: 'Parque Olaya Herrera, Pereira',
      note: 'Puesto veterinario de emergencia en el Parque Olaya Herrera, video en sitio (15.3K likes).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@france24_es/video/7673669990809111830',
      authorHandle: '@france24_es',
      category: 'AID_POINT' as const,
      placeName: 'Coliseo Mayor, Pereira',
      note: 'France 24 Español: puesto médico improvisado en el Coliseo Mayor tras el colapso operativo de la Clínica Comfamiliar.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiascaracol/video/7673882671080017160',
      authorHandle: '@noticiascaracol',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pereira (colapso de hotel, centro de Pereira)',
      note:
        'Búsqueda de Juan Felipe Giraldo, 24 años, desaparecido tras el colapso de un hotel el 10 de agosto. Caso corroborado independientemente por La FM y Telemedellín.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@sebastiangonzalezs019/video/7673294338457341191',
      authorHandle: '@sebastiangonzalezs019',
      category: 'NEED' as const,
      placeName: 'Barrio Cuba (sector 2.500 Lotes), Pereira',
      note:
        'Centro de acopio mencionado en el sector 2.500 Lotes, barrio Cuba. Cuenta personal, sin entidad organizadora identificada - marcado como pista a confirmar, no como punto de ayuda verificado.',
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
