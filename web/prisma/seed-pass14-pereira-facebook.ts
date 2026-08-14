/**
 * Pass 14 (2026-08-14) — Facebook retry for the Pereira deep pass (pass 13's
 * facebook-pereira agent hit a transient safety-classifier block; resuming
 * the same Workflow run re-ran it successfully, plus reran the TikTok and
 * crowdfunding agents, which surfaced additional new finds beyond what pass
 * 13 already seeded). See wiki/17-allied-resources-and-community.md
 * "Pass 14" for full reasoning. Run once via
 * `npx tsx prisma/seed-pass14-pereira-facebook.ts`.
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
      kind: 'VET' as const,
      name: 'Clínica Veterinaria Visión de las Américas - Pereira',
      address: 'Carrera 13 No. 9-67, Pereira, Risaralda',
      phone: null,
      needsText: 'Atención veterinaria gratuita para mascotas de familias afectadas por el terremoto.',
      sourceUrl:
        'https://www.facebook.com/VisiondelasAmericas/posts/pfbid02bwmu2z68Tf27yBtyKF6rVsJttgBtCd5vzzJyo656N4BoSCj461zeSX7oEd3s5BVDl',
      sourceOrg: 'Clínica Veterinaria Visión de las Américas',
      submitterNote:
        'Publicado directamente por la página oficial de la clínica (no una cuenta anónima), con nombre comercial y dirección exacta. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de Acopio - Caseta Comunal de Gamma',
      address: 'Caseta Comunal, barrio Gamma, Pereira (sirve también a Corales / Conjunto Villa del Coral)',
      phone: null,
      needsText: 'Donaciones para afectados del terremoto en el sector de Corales, especialmente residentes del Conjunto Villa del Coral que perdieron sus viviendas.',
      sourceUrl:
        'https://www.facebook.com/ARobecchy/posts/pfbid02E7A1GSg1ESEME3YbQNuAvWK6VhJN11zJw1wk1gqWtaC3CvEoUc6MhwSkrAsU6r3Xl',
      sourceOrg: null,
      submitterNote:
        'Publicación individual, no institucional, sin teléfono de contacto - confianza media. Nombra un tipo de venue real (caseta comunal) y un conjunto residencial específico.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Ecoparque El Vergel',
      address: 'Ecoparque El Vergel, entre comunas Boston y Poblado, Pereira',
      phone: null,
      needsText: 'Refugio temporal habilitado por la administración para familias damnificadas. Llevar documento de identidad.',
      sourceUrl: 'https://www.tiktok.com/@concejopereira/video/7672571919627062546',
      sourceOrg: 'Concejo Municipal de Pereira',
      submitterNote: 'Fuente oficial: cuenta del Concejo de Pereira, listado itemizado de albergues con direcciones exactas. Confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Parque del Oso',
      address: 'Calle 80 No. 34-19, Pereira',
      phone: null,
      needsText: 'Refugio temporal habilitado por la administración para familias damnificadas. Llevar documento de identidad.',
      sourceUrl: 'https://www.tiktok.com/@concejopereira/video/7672571919627062546',
      sourceOrg: 'Concejo Municipal de Pereira',
      submitterNote: 'Misma fuente oficial que Ecoparque El Vergel. Confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Estadio Mora Mora',
      address: 'Carrera 11 Bis con Calle 9 Este, Pereira',
      phone: null,
      needsText: 'Refugio temporal habilitado por la administración para familias damnificadas. Llevar documento de identidad.',
      sourceUrl: 'https://www.tiktok.com/@concejopereira/video/7672571919627062546',
      sourceOrg: 'Concejo Municipal de Pereira',
      submitterNote: 'Misma fuente oficial que Ecoparque El Vergel. Confianza alta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue Plaza de Ferias (Cerritos)',
      address: 'Plaza de Ferias, Cerritos, Pereira',
      phone: null,
      needsText: 'Refugio temporal habilitado por la administración para familias damnificadas. Llevar documento de identidad.',
      sourceUrl: 'https://www.tiktok.com/@concejopereira/video/7672571919627062546',
      sourceOrg: 'Concejo Municipal de Pereira',
      submitterNote: 'Misma fuente oficial que Ecoparque El Vergel; cubre el sector de Cerritos, no reportado antes. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe - "Stand With Pereira After the Earthquake" (Jovanny Hincapie Betancur)',
      address: null,
      phone: null,
      needsText: 'Alimentos, agua, artículos de higiene y suministros de emergencia para familias en Pereira.',
      sourceUrl: 'https://www.gofundme.com/f/stand-with-pereira-after-the-earthquake',
      sourceOrg: null,
      submitterNote:
        'Organizador con narrativa personal verificable (creció y enseñó en Pereira antes de emigrar a EE.UU.). $4,386 recaudados de meta $8,000, 46 donantes nombrados. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe - "Hope for Pereira, Colombia" (Andres Rios / Help for Pereira team)',
      address: null,
      phone: null,
      needsText: 'Alojamiento de emergencia, alimentos, agua, ropa/cobijas, insumos médicos y transporte de ayuda para familias con viviendas dañadas.',
      sourceUrl: 'https://www.gofundme.com/f/hope-for-pereira',
      sourceOrg: null,
      submitterNote:
        '€3,736-3,900+ recaudados de meta €10,000 en ~99 donaciones. Co-organizador nombrado (Andres Rios) pero narrativa genérica sin beneficiarios específicos identificados. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe - Comunidad Iglesia El Renuevo, Pereira (Daniela Rodas Sanchez)',
      address: null,
      phone: null,
      needsText: 'Alojamiento temporal, alimentación y reparaciones de vivienda para familias de la comunidad de la Iglesia El Renuevo en Pereira.',
      sourceUrl: 'https://www.facebook.com/danielacsv/posts/pfbid02CH7WZepqnaAwsEHZeqg7qwR4FqewjWh5AP7bMPGr6YuAkKQzd6cEuADkwJL3Ch84l',
      sourceOrg: null,
      submitterNote:
        'Colectora individual en el extranjero (no la iglesia directamente) con 14 fotos reales de daños y comunidad local nombrada. Sin confirmación independiente de la iglesia misma. Confianza media.',
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
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/permalink.php?story_fbid=pfbid0eLUNfbW4vZ19wXo9TmP5GQMP17Fq4xzUqoXNurN9fnddjHBmfMUavfbKWeRoovyJl&id=61579207537668',
      authorHandle: 'Juan Medina / Atención Pereira',
      category: 'AID_POINT' as const,
      placeName: 'Hospital San Jorge, Pereira',
      note: 'Llamado a donación de sangre en el Hospital San Jorge, lunes a sábado 8am-5pm. Corrobora el punto ya sembrado en pass 13.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/hoydiariodelmagdalena/posts/pfbid0C65qoe8sHizhWA8MNw8t13faTPMYGpu3AkLcafj3HDqm3qazB5fXhjUEjuuMCNpPl',
      authorHandle: 'Hoy Diario del Magdalena',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hotel Dibeni, Pereira',
      note:
        'Juan Felipe Giraldo, 23, de Bogotá, sigue desaparecido/atrapado bajo el Hotel Dibeni colapsado; había viajado a Pereira para su boda, planeada para ese fin de semana. Corroborado por múltiples páginas de noticias verificadas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/VisiondelasAmericas/posts/pfbid02bwmu2z68Tf27yBtyKF6rVsJttgBtCd5vzzJyo656N4BoSCj461zeSX7oEd3s5BVDl',
      authorHandle: 'Visión de las Américas',
      category: 'AID_POINT' as const,
      placeName: 'Clínica Veterinaria Visión de las Américas, Pereira',
      note: 'Atención veterinaria gratuita para mascotas de familias afectadas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/ARobecchy/posts/pfbid02E7A1GSg1ESEME3YbQNuAvWK6VhJN11zJw1wk1gqWtaC3CvEoUc6MhwSkrAsU6r3Xl',
      authorHandle: 'Alejo Botero',
      category: 'AID_POINT' as const,
      placeName: 'Caseta Comunal de Gamma, Pereira',
      note: 'Centro de acopio para el sector Corales / Conjunto Villa del Coral.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/danielacsv/posts/pfbid02CH7WZepqnaAwsEHZeqg7qwR4FqewjWh5AP7bMPGr6YuAkKQzd6cEuADkwJL3Ch84l',
      authorHandle: 'Daniela Rodas Sanchez',
      category: 'NEED' as const,
      placeName: 'Iglesia El Renuevo, Pereira',
      note: 'GoFundMe individual para la comunidad de la Iglesia El Renuevo, con 14 fotos de daños reales.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@concejopereira/video/7672571919627062546',
      authorHandle: '@concejopereira',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira (múltiples puntos)',
      note:
        'Listado oficial del Concejo de Pereira de albergues y puntos de ayuda habilitados tras el terremoto, con direcciones exactas - la mejor fuente encontrada en esta pasada, origen de los 4 nuevos albergues sembrados arriba.',
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
