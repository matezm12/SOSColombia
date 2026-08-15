/**
 * Pass 36 (2026-08-15) — third research pass on Quibdó, run within ~24h of
 * the pass-27 follow-up. No brand-new aid points this time — every
 * channel checked (blood-bank fridge, Thaar Wajaphasim, GoFundMe) was
 * either unchanged or a status update to something already on file. The
 * real news is institutional: a presidential visit, a formal Supreme
 * Court complaint against the congressman previously flagged for
 * donation misuse, and a shelter that flooded overnight. See
 * wiki/17-allied-resources-and-community.md "Pass 36" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass36-quibdo-round3.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  const socialPosts = [
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/jean.pierre.serna/posts/justicia-una-colecta-para-ayudar-a-los-damnificados-del-terremoto-en-choc%C3%B3-termi/1072278548512291/',
      authorHandle: 'RunRunPolítico (Jean Pierre Serna)',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó / Corte Suprema de Justicia',
      note: 'ESCALACIÓN: se presentó una denuncia formal ante la Sala de Instrucción de la Corte Suprema contra el representante Óscar David Benavides Ángulo por su colecta de ayuda tras el terremoto (300M+ COP recaudados). Presentada por Daniel David Martínez, señala a José Francisco Ibalde Ibarra como vinculado a la cuenta usada, con posibles cargos de estafa, captación masiva de dinero y peculado por apropiación. Caso asignado al magistrado Francisco Farfán. El exfiscal general Francisco Barbosa también pidió públicamente una investigación.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@odbenavidesa/video/7674075628869618964',
      authorHandle: '@odbenavidesa (Óscar Benavides)',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó / Bogotá',
      note: 'Respuesta desafiante del congresista tras la denuncia ante la Corte Suprema: dice que los fondos pasan por "Asociación BNL2" y las cuentas de su representante legal, no las suyas, y afirma que la colecta ya superó los $700 millones de pesos y 40+ toneladas de ayuda (frente a los ~$300M reportados en la pasada anterior) llegando a 3,500+ personas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/NoticiasRCN/status/2088472049836593521',
      authorHandle: '@NoticiasRCN',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó',
      note: 'El presidente Abelardo de la Espriella visitó Quibdó, confirmando el inicio formal de la fase de reconstrucción (búsqueda y rescate cerrada), anunciando una gerencia especial para el Chocó y decretos de emergencia económica para la próxima semana. Autoridades locales señalan que al menos 100 viviendas de Quibdó deben demolerse por riesgo estructural; la lluvia complica actualmente la logística de ayuda.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBTrnkv8ot/',
      authorHandle: 'alcaldiadequibdo',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó',
      note: 'Decreto No. 0294 (13 de agosto) de la Alcaldía de Quibdó adoptando medidas especiales de orden público para la visita presidencial.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCSO3LEm3Q/',
      authorHandle: 'antamanece',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó / Chocó',
      note: 'La Gobernadora del Chocó confirmó que la fase de búsqueda y rescate en el departamento está formalmente cerrada, con un saldo de 13 fallecidos. La Primera Dama anunció 12 camiones de alimentos/aseo/kits nocturnos en camino a municipios afectados, más un vehículo Polaris donado a las autoridades.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcC3wBMsjmX/',
      authorHandle: 'idubogota',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó',
      note: 'El IDU, IDIGER y Camacol de Bogotá enviaron una delegación de ingenieros estructurales al Chocó para evaluar la infraestructura dañada y apoyar la planeación de la reconstrucción, dirigida a la Gobernadora Nubia Córdoba.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBWesFFjvR/',
      authorHandle: 'alcaldiadequibdo',
      category: 'NEED' as const,
      placeName: 'Coliseo de Boxeo / Coliseo del Jardín, Quibdó',
      note: 'Una "contingencia" nocturna en un albergue temporal existente (aparentemente el Coliseo de Boxeo, que se inundó durante una tormenta) forzó la reubicación de emergencia de familias al "Coliseo del Jardín" con apoyo del gremio de taxistas y la Policía Nacional. La Gobernación activó nuevos puntos de albergue y 7 puntos de conectividad Starlink en varios municipios del Chocó. Precaución: un albergue ya conocido presentó una falla que requirió evacuación de emergencia.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1299911395374486',
      authorHandle: 'Revista. chocó',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Quibdó',
      note: 'Cuatro personas reportadas como desaparecidas en Quibdó fueron encontradas con vida y sin afectaciones - reencuentro familiar documentado en video.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@estrella.com510/video/7673660219876068616',
      authorHandle: 'ESTRELLA (repost de Canal Caracol)',
      category: 'NEED' as const,
      placeName: 'El Piñal, Quibdó',
      note: 'Residentes del barrio El Piñal dicen que, pese a los anuncios oficiales de "300 carpas" y albergues, la ayuda no ha llegado a su zona, por lo que están reuniendo dinero entre vecinos para alquilar una retroexcavadora y remover escombros por su cuenta.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.gofundme.com/f/el-mundo-mira-al-choco',
      authorHandle: 'Fundación Tierra Grata',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó (campaña ya sembrada)',
      note: 'ACTUALIZACIÓN DE ESTADO: el GoFundMe "El mundo mira al Chocó" pasó de "casi financiado" a mostrarse "100% completo" - $99,602 de una meta de $100,000, 1,784 donaciones. Sigue activo y aceptando donaciones.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/fetquibdo/',
      authorHandle: 'fetquibdo',
      category: 'OFFICIAL' as const,
      placeName: 'Fundación Escuela Taller de Quibdó (canal ya sembrado)',
      note: 'ACTUALIZACIÓN DE ESTADO: la fundación reporta un total acumulado de $40,199,500 COP recaudados a la fecha vía Bancolombia 53602082156, amplificado por aliados nacionales (Oxfam Intermón, Escuela Taller de Tumaco, cooperativa Confiar).',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.instagram.com/p/DcCqz7POqwP/',
      authorHandle: 'andresguryrodriguez',
      category: 'NEED' as const,
      placeName: 'Hospital San Francisco de Asís, Quibdó',
      note: 'PISTA SIN CONFIRMAR: el noveno camión de ayuda de un concejal de Medellín hacia el Chocó podría incluir una nevera de reemplazo para el banco de sangre (según un fragmento de transcripción de video, no confirmado en el pie de foto ni en cobertura de prensa). La nevera del Hospital San Francisco de Asís sigue reportada como dañada sin reparación ni reemplazo confirmado a la fecha de esta pasada - no tratar como resuelto hasta verificación directa.',
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
        municipioId: quibdo.id,
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
