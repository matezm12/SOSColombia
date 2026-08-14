/**
 * Pass 16 (2026-08-14) — deep multi-agent research pass on Manizales (X +
 * Instagram + Facebook + TikTok + GoFundMe/Vaki crowdfunding, browser-driven).
 * Third city in the per-city deep-pass rotation after Pereira (13-14) and
 * Cali (15). See wiki/17-allied-resources-and-community.md "Pass 16" for full
 * agent notes, the two-funds-not-a-contradiction reasoning, and rejected
 * candidates. Run once via `npx tsx prisma/seed-pass16-manizales-deep.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })

  const aidPoints = [
    {
      kind: 'VET' as const,
      name: 'Unidad de Protección Animal (UPA) - Alcaldía de Manizales',
      address: 'Refugio en el Coliseo Mayor (Unidad Deportiva Palogrande), Manizales',
      phone: '314 532 7443',
      needsText: 'Alimento y suministros veterinarios para animales albergados junto a familias desplazadas en el Coliseo Mayor (18 perros y 3 gatos bajo monitoreo veterinario continuo); también distribuye comida para mascotas puerta a puerta en barrios y veredas afectadas vía patrullas de Carabineros.',
      sourceUrl: 'https://www.facebook.com/BCNoticiasManizales/posts/pfbid0NNUosB71H4pyE46QPMXjARL12mnDxdKQ17ETCmoeY2BiSCgn1LBDuJHeqDFrqayLl',
      sourceOrg: 'Alcaldía de Manizales (Unidad de Protección Animal) + Policía Nacional (Carabineros y Protección Ambiental)',
      submitterNote:
        'El hallazgo VET más sólido de esta pasada: programa oficial municipal, no una cuenta anónima. Coordina con la Secretaría de Medio Ambiente y realiza censo de campo en comunas afectadas. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Centro Veterinario Santa Mónica (CVSM)',
      address: 'Cra 15a #74a-31, Barrio Alta Suiza, Manizales',
      phone: '314 815 2207 / 872 8290',
      needsText: 'Consulta gratuita (chequeo general, curación de heridas, medicamentos básicos) para mascotas afectadas por el terremoto. Los dueños deben presentarse en persona; aplica solo a mascotas afectadas por el sismo.',
      sourceUrl: 'https://x.com/Marce_Tabares/status/2087565184235712643',
      sourceOrg: 'Centro Veterinario Santa Mónica',
      submitterNote: 'Flyer de un profesional veterinario, dirección exacta y dos teléfonos, condiciones de elegibilidad específicas. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Movet Express Manizales (Clínicas Movet)',
      address: 'Calle 70 #18-165, Manizales',
      phone: null,
      needsText: 'Atención veterinaria gratuita para mascotas afectadas por el terremoto, por orden de llegada, hasta el sábado 15 de agosto, 10:00 a.m.-6:00 p.m.',
      sourceUrl: 'https://www.instagram.com/p/Db6zssREc-_/',
      sourceOrg: 'Clínicas Movet',
      submitterNote: 'Cadena de clínicas veterinarias establecida y multi-sede; dirección y horario específicos, sin solicitud de pago. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'ABC Veterinarios',
      address: 'Carrera 23 #75a-97, Manizales, Caldas',
      phone: 'WhatsApp 323 525 3891 (clínica) / Nequi 301 480 2723 (donaciones)',
      needsText: "Clínica dañada por el terremoto que sigue ofreciendo atención gratuita a mascotas afectadas ('víctimas peludas'); solicita donaciones para sostener la atención gratuita.",
      sourceUrl: 'https://x.com/Sra_Fulanita/status/2087982175433998607',
      sourceOrg: 'ABC Veterinarios',
      submitterNote:
        'Clínica real confirmada vía su propio perfil de Instagram (instagram.com/abcveterinarios, 801 seguidores, dirección coincide). El dato de Nequi para donaciones viene de un post de terceros, no de la cuenta propia de la clínica - verificar antes de publicar prominentemente. Confianza media.',
    },
    {
      kind: 'VET' as const,
      name: 'Refugio animal en El Arenillo (doña Lucía, ~120 perros y gatos)',
      address: 'Sector El Arenillo, Manizales (dirección exacta no dada)',
      phone: '313 736 4536 (Camila)',
      needsText: 'Refugio dirigido por una fundadora de edad avanzada con limitaciones físicas, cuidando ~120 perros y gatos; necesita voluntarios para limpieza, insumos de aseo, concentrado, y donaciones monetarias. Jornada de apoyo anunciada para el viernes 14 de agosto.',
      sourceUrl: 'https://www.instagram.com/p/Db9sUD1MsK8/',
      sourceOrg: null,
      submitterNote:
        'Cuenta de noticias/comunidad local con contacto nombrado, cantidad de animales y evento con fecha específica - no es una publicación viral vaga. Sin nombre de fundación/entidad legal formal, por lo que se trata como pista real pero no tan sólida como las clínicas. Confianza media.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Corporación Red Afecto - Brigadas de Afecto Manizales',
      address: 'Punto de encuentro: puerta principal, "Coliseo Manizales" (venue no del todo desambiguado de los coliseos ya conocidos de Palogrande)',
      phone: '311 236 8511',
      needsText: "Brigadas de apoyo psicosocial ('afectoterapia') - acompañamiento, escucha activa y soporte emocional para personas y familias afectadas. Reclutan profesionales, terapeutas y voluntarios capacitados; iniciaron el 12 de agosto a las 10 a.m.",
      sourceUrl: 'https://www.tiktok.com/@dr.afecto/video/7673187501317868818',
      sourceOrg: 'Corporación Red Afecto',
      submitterNote:
        'Organización nombrada con contacto real y punto/hora de encuentro específicos. Confianza media únicamente porque no se pudo desambiguar si "Coliseo Manizales" es el mismo venue que los coliseos Mayor/Menor de Palogrande ya conocidos, o un tercer sitio distinto.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Cámara de Comercio de Manizales - Fondo Solidario Comunitario "Juntos por Manizales"',
      address: null,
      phone: null,
      needsText: 'Donaciones monetarias para familias, negocios e infraestructura afectados por el terremoto del 10 de agosto.',
      sourceUrl: 'https://www.facebook.com/CCManizales/posts/pfbid0WgRaBYkSAuxoQxNJTCC8mVy1wZX2Nxeix47FoGZCRJCwMS7x6U2odPjNJ4eEgoNkl',
      sourceOrg: 'Cámara de Comercio de Manizales por Caldas + Cruz Roja Colombiana Seccional Caldas + Alcaldía de Manizales',
      submitterNote:
        'Banco Davivienda, Cuenta Corriente 0560085569997514, Llave Bre-B @8908010426. Titular: Cámara de Comercio de Manizales por Caldas. Recibos vía contactenos@ccm.org.co para certificados tributarios. NOTA: la Cámara de Comercio parece administrar DOS fondos distintos con datos bancarios diferentes - este es el fondo comunitario general (con Cruz Roja Caldas + Alcaldía). Ver el segundo fondo empresarial abajo. No se trata de una contradicción a resolver, sino de dos campañas reales y separadas bajo la misma cámara - confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Cámara de Comercio de Manizales - Fondo Solidario por los Empresarios de Caldas',
      address: null,
      phone: null,
      needsText: 'Donaciones para un fondo de solidaridad empresarial, para que negocios y emprendedores de Caldas afectados por el terremoto puedan recuperarse, seguir pagando empleados y mantenerse activos en la economía del departamento.',
      sourceUrl: 'https://www.instagram.com/p/DcBofJgFULD/',
      sourceOrg: 'Cámara de Comercio de Manizales por Caldas + Cámara de Comercio de Chinchiná + Secretaría de Desarrollo, Empleo e Innovación de Caldas',
      submitterNote:
        'Banco Davivienda, Cuenta Corriente 084369996537, Llave Bre-B @DAVICCMPC. Donaciones internacionales — Código SWIFT: CAFECOBB. Datos cruzados de forma idéntica en 4 cuentas de medios regionales independientes (Canal Telecafé, BUM Television, El Expreso Día, Emisora UM FM) en las últimas 24h - el fondo empresarial, distinto del fondo comunitario de arriba (otros socios: Chinchiná + Secretaría de Desarrollo en vez de Cruz Roja + Alcaldía). Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Donación terremoto Casa Manizales (Mariana Montes González)',
      address: null,
      phone: null,
      needsText: 'Apartamento en Manizales con paredes agrietadas, techo colapsado y electrodomésticos/enseres perdidos tras el sismo del 10 de agosto; la familia se está quedando con familiares mientras busca un lugar seguro donde vivir.',
      sourceUrl: 'https://vaki.co/vaki/donaci-n-terremoto-casa-manizales',
      sourceOrg: null,
      submitterNote:
        'Cuenta verificada en Vaki, video con hechos específicos del sismo (M7.4, 10 de agosto, epicentro Chocó), 21 donantes nombrados con contribuciones fechadas, US$986 recaudados de meta US$10,000. También acepta Nequi 313 661 9200. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Ayúdanos a reconstruir el hogar de nuestra Mamá en Manizales (Jose Ivan Vallejo Velez)',
      address: null,
      phone: null,
      needsText: 'Vivienda familiar en Manizales severamente dañada y evacuada tras el sismo; la familia está coordinando con aseguradoras y busca fondos para costos que el seguro no cubra.',
      sourceUrl: 'https://vaki.co/vaki/reconstruyamos-el-hogar-familiar-tras-el-terremoto-de-colombia',
      sourceOrg: null,
      submitterNote:
        'Cuenta verificada en Vaki, transparencia explícita sobre reclamos de seguro en curso (para evitar duplicar ayuda) - un nivel de detalle inusual en una estafa. Al revisar la página en vivo: 148 donantes, US$8,760 recaudados, cierra 26 sept 2026 (un chequeo anterior vía snippet cacheado de Google mostró incorrectamente "0 donantes" - dato obsoleto, superado por la lectura directa de la página). Confianza media.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: manizales.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: manizales.id,
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
      permalink: 'https://x.com/Marce_Tabares/status/2087565184235712643',
      authorHandle: '@Marce_Tabares',
      category: 'AID_POINT' as const,
      placeName: 'Centro Veterinario Santa Mónica, Manizales',
      note: 'Flyer de consulta veterinaria gratuita para mascotas afectadas por el terremoto.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/4PatasRevista/status/2087263786835103795',
      authorHandle: '@4PatasRevista',
      category: 'AID_POINT' as const,
      placeName: 'Fundación Ángeles de la Calle, Manizales',
      note:
        'Confirmación independiente (Revista 4 Patas citando a Semana.com) de que este refugio, ya registrado como AidPoint con estado UNCONFIRMED, sufrió daños reales por el terremoto y sigue necesitando apoyo - útil para actualizar su confianza, no para crear un duplicado.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Asocapitales/status/2087926414502744490',
      authorHandle: '@Asocapitales',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales (y otras ciudades)',
      note:
        'Lista multi-ciudad de canales oficiales de donación publicada por la Asociación Colombiana de Ciudades Capitales. El número específico que dio para Manizales resultó distinto del confirmado independientemente por 4 medios regionales - se usó la versión más corroborada en los puntos de ayuda sembrados arriba.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db3o0gMlBVT/',
      authorHandle: 'fundacionopam',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales / Cali',
      note: 'Fundación OPAM anuncia que está evaluando animales afectados en Manizales y Cali antes de actuar, coordinando con actores locales.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db41yvSOBVH/',
      authorHandle: 'noticias.buga1',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Centro Histórico, Manizales',
      note: 'Búsqueda de Jeimy Damaris Díaz Sánchez (24), vista por última vez en el Centro Histórico durante el sismo. Caso sin resolver al momento del hallazgo.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db4BeP1Ca4e/',
      authorHandle: 'noticias_cauca',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Universidad de Caldas, Manizales',
      note: 'Búsqueda de Lizeth Sofía Mera Mora (22), estudiante de la Universidad de Caldas. Un comentario muy respaldado confirma que YA FUE ENCONTRADA - caso resuelto, se conserva para evitar reportarlo como activo por error.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8lkodxCvf/',
      authorHandle: '96mauros',
      category: 'NEED' as const,
      placeName: 'Chipre, Manizales',
      note:
        'Caso de Germán Ceballos (Cra. 7C #11-11, Chipre): vivienda dañada, convive con dos hermanas, una con discapacidad. Fuerte corroboración de vecinos en comentarios. Nequi 319 397 4182.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db4VuZkNxG6/',
      authorHandle: 'ericarincon.co',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Manizales (Solferino, Centenario, Villamaría)',
      note: 'Profesional de estructuras ofreciendo evaluaciones gratuitas de seguridad estructural a residentes que no pueden pagar una.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/RedVoxNoticias/posts/pfbid0278RWbMdEh6rWwZYEfsjsqrZr1pqe2H4uHmZuEfTumqd4cVDFX2FUz45zYbrddG2bl',
      authorHandle: 'Red Vox Noticias',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Plaza Bolívar, Manizales',
      note: 'Búsqueda de Luis Albeiro Murillo Velázquez, visto por última vez en Plaza Bolívar tras el sismo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/permalink.php?story_fbid=pfbid02ca2r8GfJgTbqjRJHfwKxQTeqQUSv3EVLXDhZzcmq4smkX4G78km9tHAX1UqWudHel&id=100066816641661',
      authorHandle: 'En La Tribuna',
      category: 'NEED' as const,
      placeName: 'Chipre Viejo, Manizales',
      note: 'Residentes de Chipre Viejo piden inspecciones técnicas tras detectar grietas y deterioro en fachadas de vivienda antigua.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/BCNoticiasManizales/posts/pfbid0NNUosB71H4pyE46QPMXjARL12mnDxdKQ17ETCmoeY2BiSCgn1LBDuJHeqDFrqayLl',
      authorHandle: 'BC Noticias Manizales',
      category: 'AID_POINT' as const,
      placeName: 'Coliseo Mayor, Manizales',
      note: 'Cobertura de la Unidad de Protección Animal (UPA) de la Alcaldía atendiendo animales albergados junto a familias desplazadas.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBofJgFULD/',
      authorHandle: 'canaltelecafe',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales / Caldas',
      note: 'Gráfico oficial con los datos bancarios del Fondo Solidario por los Empresarios de Caldas.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/canaltelecafe/p/DcBm_l6pmYB/',
      authorHandle: 'canaltelecafe',
      category: 'OFFICIAL' as const,
      placeName: 'Manizales / Pereira / Armenia',
      note: '"El Eje Te Necesita" - telemaratón/donatón televisado uniendo Manizales, Pereira y Armenia, sábado 15 de agosto 2-6pm.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@dr.afecto/video/7673187501317868818',
      authorHandle: '@dr.afecto',
      category: 'AID_POINT' as const,
      placeName: 'Manizales',
      note: 'Corporación Red Afecto reclutando profesionales y voluntarios para brigadas de apoyo psicosocial.',
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
        municipioId: manizales.id,
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
