/**
 * Pass 43 (2026-08-15) — third and final research pass of this round on
 * San José del Palmar, the earthquake's epicenter. As expected for a
 * small, remote town already covered by two thorough passes, this one
 * found little — but a genuine new grassroots supply drive for a rural
 * corregimiento surfaced, plus a quantified aid-delivery milestone and
 * fresh (though unverified) detail on the rural-isolation situation. See
 * wiki/17-allied-resources-and-community.md "Pass 43" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass43-sanjosepalmar-round3.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const sjp = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27660' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Envío solidario - Consejo Comunitario Afrodescendiente de San Pedro de Ingará',
      address: 'Corregimiento de San Pedro de Ingará, San José del Palmar, Chocó (envío organizado desde Bogotá)',
      phone: 'Gabriela: 304 384 2972',
      needsText: 'Campaña para financiar un viaje en camión que lleve insumos de primera necesidad específicamente al Consejo Comunitario Afrodescendiente de San Pedro de Ingará, un corregimiento rural de San José del Palmar.',
      sourceUrl: 'https://www.instagram.com/p/Db_sG1OJaXx/',
      sourceOrg: 'Consejo Comunitario Afrodescendiente de San Pedro de Ingará',
      submitterNote:
        'Campaña de base genuinamente nueva, no vista en las dos pasadas anteriores, organizada por cuentas culturales/comunitarias de Bogotá (@pajarostejedores, coetiquetando @mestizocentrocultural, @chocografiando, @pactohistoricosuba, entre otras). Distinta del punto de acopio ya conocido del Proceso de Comunidades Negras en Bogotá. Apunta directamente a la brecha de verificación rural que las pasadas anteriores dejaron abierta. Confianza media: organización y contacto específicos nombrados, pero es una campaña informal, no institucional.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: sjp.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: sjp.id,
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
      permalink: 'https://www.facebook.com/reel/1564610611882721/',
      authorHandle: 'RTA Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'Más de 50 toneladas de ayuda humanitaria han llegado a San José del Palmar - primera cifra concreta de entregas, más allá del hallazgo vago de "las primeras ayudas llegaron" de la pasada 31. No se pudo corroborar con una segunda fuente independiente en esta pasada.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@unicef_es/video/7673800630430895382',
      authorHandle: '@unicef_es',
      category: 'NEED' as const,
      placeName: 'San José del Palmar, Chocó (zona rural)',
      note: 'UNICEF España confirma más de 45 derrumbes bloqueando vías y dejando a miles de familias completamente aisladas en las zonas rurales - primera cifra concreta de derrumbes, actualiza el hallazgo genérico de "zonas rurales aún en verificación" de la pasada 31.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/MirenAVer/status/2088459085851029725',
      authorHandle: '@MirenAVer',
      category: 'NEED' as const,
      placeName: 'Corredor Nóvita - San José del Palmar',
      note: 'PRECAUCIÓN - sin verificar: cuenta personal/activista describe la vía rural entre Nóvita y San José del Palmar como el "verdadero epicentro", citando 22 veredas aisladas y 45 derrumbes en ese corredor específico, con riesgo de avalancha en Nóvita. Primera mención de cifras concretas (22 veredas, 45 derrumbes) para este corredor - coincide aproximadamente con el conteo de derrumbes de UNICEF España, pero sin respaldo institucional propio.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://vaki.co/vaki/vaki-para-san-jos-del-palmar-choc-epicentro-del-terremoto',
      authorHandle: 'Valentina Jurado (@mamadeamara)',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar (campaña ya sembrada)',
      note: 'ACTUALIZACIÓN DE ESTADO: la campaña Vaki ya sembrada sigue activa, ahora con US$46,480 recaudados de 1,828 donantes (cierra el 19 de agosto), con donaciones registradas apenas 4-5 horas antes de esta revisión - sigue recibiendo aportes activamente.',
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
        municipioId: sjp.id,
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
