/**
 * Pass 60 (2026-08-15) — first deep multi-platform social research pass
 * on Ibagué, Tolima, matching the methodology used for the other ten
 * tracked cities (X + Instagram + Facebook + TikTok + crowdfunding). The
 * TikTok agent hit a session-wide capacity limit mid-run and did not
 * complete (its angle is deferred to a follow-up pass); the other four
 * agents finished and corroborated each other heavily — the same handful
 * of official acopio points (Parque Deportivo, Banco Arquidiocesano de
 * Alimentos, Gobernación del Tolima, La Estación mall, Casa Loma/Plazas
 * del Bosque) turned up independently across three or four agents each,
 * which is why most entries below carry high confidence despite this
 * being a first pass with no prior-round baseline.
 *
 * No TollRecord seeded this pass: the only Ibagué-specific quantified
 * figures found (48 families preventively evacuated with no structural
 * compromise found, ~32 property inspections) don't map cleanly onto
 * this project's TollMetric enum without overstating severity, so — per
 * the same discipline applied to Pijao's hectares-burned figures — they
 * are documented in the wiki narrative instead of forced into an
 * ill-fitting metric. Every other quantified figure surfaced (Tolima's
 * 224 damaged homes/16 hospitals, 800+ fire-displaced families, 46/47
 * municipios en alerta roja, the national 294/3,935/320 toll) is
 * explicitly department- or country-wide, not Ibagué-specific, and is
 * not attached to this municipio's toll history.
 *
 * Also NOT seeded: a "centro de acopio" at an "Instituto Tecnológico
 * Gustavo A. Madero," which two of four agents independently flagged as
 * likely misinformation — it uses Mexican address conventions ("colonia",
 * "Avenida ... Poniente") foreign to Colombia, is not mentioned anywhere
 * on the Alcaldía de Ibagué's own verified channels, and is being spread
 * by aggregator pages reposting identical text. Documented as a donor
 * caution in the wiki, not seeded as a real aid point.
 * See wiki/17-allied-resources-and-community.md "Pass 60" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass60-ibague-deep.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const ibague = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '73001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Parque Deportivo de Ibagué — Centro de Acopio (Alcaldía de Ibagué)',
      address: 'Parque Deportivo, Ibagué, Tolima',
      phone: null,
      needsText: 'Alimentos no perecederos, cobijas, kits de aseo, colchonetas, carpas; también materiales de reconstrucción (cemento, ladrillo, tejas de zinc, tubería, alambres, picas y palas). Abierto fines de semana 8:00am-6:00pm. Es el centro principal de acopio de la ciudad — la Alcaldía confirma que desde aquí se canalizan ayudas también hacia San Luis, Chocó, Cali y Pereira.',
      sourceUrl: 'https://www.facebook.com/alcaldiaibague/posts/pfbid02brKEmKdbioNeWenYfmRXtqYyR66L9h9KZjg1uoTuWnccAoHXUBz5EpyXidiM7eYql',
      sourceOrg: 'Alcaldía de Ibagué',
      submitterNote: 'Encontrado de forma independiente por los cuatro agentes de esta pasada (X, Instagram, Facebook, crowdfunding) — corroboración excepcionalmente fuerte. Publicado directamente en la página oficial verificada de la Alcaldía de Ibagué, confirmado también por Caracol Radio y varios medios locales (El Olfato, El Calvo, Pijao Informa) durante varios días consecutivos.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Banco Arquidiocesano de Alimentos de Ibagué / Pastoral Social — campaña "Tendamos nuestra mano solidaria a Colombia"',
      address: 'Carrera 4A Estadio #23-42, Ibagué',
      phone: 'WhatsApp 316 423 7289',
      needsText: 'Alimentos no perecederos (arroz, fríjoles, lentejas, avena, atún, sardinas, pastas, aceite, azúcar, sal, harina, leche en polvo, galletas) dentro de fecha de vencimiento, y ropa nueva sin uso. Una segunda publicación de la misma organización amplió la campaña a alimento para ganado y animales de familias campesinas afectadas por los incendios forestales del Tolima. También reciben aportes económicos: Bancolombia cuenta de ahorros 4356-8800-762, titular Pastoral Social, NIT 809.012.633, llave @pastoralibague.',
      sourceUrl: 'https://elcronista.co/destacadas/como-donar-en-ibague-para-ayudar-a-los-damnificados-del-terremoto',
      sourceOrg: 'Arquidiócesis de Ibagué — Pastoral Social',
      submitterNote: 'Encontrado de forma independiente por los cuatro agentes. Fuente nombrada (padre José Ferney Quimbayo Gárrido, director del Banco Arquidiocesano) en un artículo con firma de El Cronista (medio local de Ibagué/Tolima), corroborado por la propia página oficial de Pastoral Social de Ibagué y por el barrido nacional de Asocapitales de puntos de acopio en ciudades capitales.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Gobernación del Tolima — Punto de donaciones (sede central)',
      address: 'Primer piso, sede de la Gobernación del Tolima, Ibagué',
      phone: null,
      needsText: 'Alimentos no perecederos, kits de higiene, insumos médicos para familias desplazadas por los incendios forestales y el terremoto. Horario 7:00am-6:00pm. Las donaciones se concentran allí antes de trasladarse a los municipios afectados.',
      sourceUrl: 'https://elolfato.com/ibague/parque-deportivo-es-el-nuevo-punto-de-acopio-para',
      sourceOrg: 'Gobernación del Tolima',
      submitterNote: 'Corroborado por tres de los cuatro agentes (Instagram, Facebook, crowdfunding) citando El Olfato, la Secretaría de Salud del Tolima y varias cuentas locales, todas con la misma dirección y horario.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro Comercial La Estación — Punto de acopio',
      address: 'Calle 60 #12-224, Piso 1 (frente a Vélez), Ibagué',
      phone: null,
      needsText: 'Carpas, colchonetas, cobijas, mercados no perecederos, kits de aseo, agua. Horario extendido 10:00am-7:00pm hasta el domingo 16 de agosto.',
      sourceUrl: 'https://www.facebook.com/laestacioncc',
      sourceOrg: 'Centro Comercial La Estación',
      submitterNote: 'Encontrado de forma independiente por los cuatro agentes, con la misma dirección exacta repetida por la propia página del centro comercial, El Olfato y varias cuentas de Instagram (multicentrocc, laprofetatiana).',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Casa Loma — Punto de acopio (jornada Presidencia/primera dama)',
      address: 'Calle 116 #48-49, barrio San Francisco de Aparco, Ibagué',
      phone: '320 884 1094',
      needsText: 'Agua, alimentos no perecederos, elementos de primeros auxilios y productos de higiene personal. Ligado a la campaña de solidaridad de la primera dama Ana Lucía Pineda junto con Asocapitales; se advierte explícitamente NO consignar dinero, solo entregar ayudas en especie en el sitio físico.',
      sourceUrl: 'https://www.instagram.com/regionescp/',
      sourceOrg: 'Presidencia de la República (Gerencia de Regiones) / Asocapitales',
      submitterNote: 'Misma dirección y teléfono confirmados de forma independiente por Ecos del Combeima (radio local), Asocapitales y la cuenta oficial de la Presidencia (regionescp) — corroboración cruzada fuerte pese a ser una campaña puntual ligada a una visita, no una institución permanente.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Plazas del Bosque — Punto de acopio (jornada Presidencia/primera dama)',
      address: 'Avenida Ambalá #69-80, Ibagué',
      phone: null,
      needsText: 'Ayuda humanitaria general para familias afectadas por el terremoto, pareado con el punto de Casa Loma dentro de la misma campaña.',
      sourceUrl: 'https://www.instagram.com/asocapitales_/',
      sourceOrg: 'Presidencia de la República (Gerencia de Regiones) / Asocapitales',
      submitterNote: 'Listado junto a Casa Loma por Asocapitales y por la cuenta regional de la Presidencia como los dos puntos oficiales de esta campaña en Ibagué.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Benemérito Cuerpo de Bomberos Voluntarios de Ibagué — apoyo y voluntariado para incendios forestales',
      address: 'Calle 113 Sur, barrio San Francisco de Aparco, Ibagué',
      phone: '300 973 7272 / bvibague.1@yahoo.com',
      needsText: 'Se necesitan voluntarios mayores de edad, sin problemas respiratorios ni cardíacos, para apoyar el control de incendios forestales en Ibagué y el Tolima; también se reciben donaciones para equipar a los bomberos. Líneas de emergencia: 0800-888-38346 (FUEGO), 100, 911.',
      sourceUrl: 'https://www.instagram.com/bomberosvoluntariosibague/',
      sourceOrg: 'Benemérito Cuerpo de Bomberos Voluntarios de Ibagué',
      submitterNote: 'Cuenta institucional oficial y verificable (718 publicaciones, cuenta de X vinculada @BVIbague), reportando haber atendido 11 incendios forestales; corroborada por El Hormiguero Tolima y La Voz Mayor del Tolima con los mismos requisitos de voluntariado.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Puntos de acopio en el barrio Ambato (2 puntos)',
      address: 'Barrio Ambato, Ibagué (direcciones exactas no publicadas)',
      phone: null,
      needsText: 'Donaciones generales para familias afectadas por el terremoto.',
      sourceUrl: 'https://www.facebook.com/alcaldiaibague/',
      sourceOrg: 'Alcaldía de Ibagué',
      submitterNote: 'Anunciado directamente por la página oficial de la Alcaldía de Ibagué ("Hemos habilitado dos puntos de acopio en Ambato"), pero la publicación capturada no incluía las direcciones exactas — se incluye con esta salvedad explícita en vez de descartarlo, dado que la fuente es oficial.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: ibague.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: ibague.id,
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
      permalink: 'https://www.facebook.com/reel/942376805551626',
      authorHandle: 'El Irreverente Ibagué',
      category: 'NEED' as const,
      placeName: 'Parque Deportivo, Ibagué',
      note: 'Brecha logística concreta: la solidaridad ciudadana ha acumulado un gran volumen de donaciones en el Parque Deportivo, pero los organizadores no tienen suficiente transporte para llevarlas a los municipios afectados. Encontrado de forma independiente por tres de los cuatro agentes de esta pasada.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/CaracolRadio/status/2088665999469932791',
      authorHandle: '@CaracolRadio',
      category: 'NEED' as const,
      placeName: 'Palacio de Justicia, Ibagué',
      note: 'Funcionarios del Palacio de Justicia de Ibagué temen por su vida porque el edificio desarrolló grietas estructurales tras el sismo (especialmente en el cuarto piso); audiencias y términos judiciales suspendidos, Asonal Judicial convocó un plantón por temor a un colapso.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8Uv1KP9XW/',
      authorHandle: 'aguapanelazoibague',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Catedral de Ibagué, Calle 10',
      note: 'El tradicional encuentro comunitario semanal "Jueves de Aguapanelazo" (13 de agosto, 7:00pm, frente a la Catedral) pidió explícitamente a los asistentes traer una donación para las víctimas del terremoto junto con compartir aguapanela y pan.',
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
        municipioId: ibague.id,
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
