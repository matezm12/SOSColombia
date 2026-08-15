/**
 * Pass 51 (2026-08-15) — seventh city in the fourth research round,
 * Popayán. Four prior passes (9, 11, 20, 29, 41) already covered this
 * MODERADA-severity city, historically the thinnest of the tracked
 * cities. This round bucked that pattern: an official Alcaldía "Centros
 * de Acopio Popayán SOS" campaign graphic (restaurants/bars serving as
 * donation drop-offs) went out Aug 13 and was still being actively
 * reshared by 7+ independent accounts as of this pass — a genuinely new
 * finding beyond the three previously-seeded points (S.C.A.R.E./ACSC
 * Popayán, Polideportivo de La Paz, CRIC). Several near-duplicate agent
 * findings tracing back to this same campaign graphic were consolidated
 * into one aid point rather than seeded separately. Crowdfunding remains
 * a confirmed, repeatedly-verified absence: no Popayán-specific GoFundMe
 * or Vaki campaign exists, consistent with every prior pass on this city.
 * See wiki/17-allied-resources-and-community.md "Pass 51" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass51-popayan-round4.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const popayan = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '19001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Red de Centros de Acopio Popayán — campaña oficial de la Alcaldía',
      address: 'Old Jack (Villa del Viento); El Sabio Gastrobar (Cra. 8 #10N-06); Chilango (Cra 6 #37 An-26); El Aguante (Boulevard Rousse); Antojadas (Barrio Ciudad Jardín); Ikonos Plaza Comercial (Cra 10 #16N-27, Local 5); más puntos satélite de concesionarios (Fratelli Motos, Infinity Cars Popayán, Aristi Motos)',
      phone: null,
      needsText: 'Alimentos, agua y bebidas, productos de aseo, según el gráfico oficial de la Alcaldía. Casa de la Moneda (Cra. 11 #3-45), ya conocida desde pasadas anteriores, cerraba su campaña justo el 15 de agosto (día de esta pasada) y para entonces ya solo aceptaba medicamentos, la comida ya estaba cubierta — el resto de la red permanece activa.',
      sourceUrl: 'https://www.instagram.com/p/Db_kgAXvE2M/',
      sourceOrg: 'Alcaldía de Popayán',
      submitterNote: 'Traza a un gráfico oficial publicado por la propia cuenta de la Alcaldía de Popayán (@alcaldia_de_popayan) el 13 de agosto, titulado "Centros de Acopio en Popayán SOS". Reposteado de forma independiente por la Policía Metropolitana de Popayán y al menos 7 cuentas comunitarias más entre el 12 y el 15 de agosto, además de una red satélite de concesionarios de motos/carros posteando sus propias direcciones en la misma ventana. Genuinamente nuevo más allá de los tres puntos ya sembrados (S.C.A.R.E./ACSC Popayán, Polideportivo de La Paz, CRIC) — restaurantes/bares como puntos de acopio es una categoría no vista en pasadas anteriores. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Ikonos Centro Empresarial — campaña "Colombia, Un Solo Corazón"',
      address: 'Carrera 10 con Calle 15 Norte #59, detrás de ZOLUNA BAR, Popayán, Cauca',
      phone: null,
      needsText: 'Alimentos no perecederos, medicamentos y otros elementos de primera necesidad para familias damnificadas por el terremoto en el Cauca.',
      sourceUrl: 'https://x.com/MeridianoR_CO/status/2088304651347050656',
      sourceOrg: 'Colombia, Un Solo Corazón (Primera Dama Ana Lucía Pineda)',
      submitterNote: 'Parte de la campaña nacional "Colombia, Un Solo Corazón" liderada por la primera dama, con 30+ puntos de acopio en todo el país; llegó a Popayán el 14 de agosto. POSIBLE SUPERPOSICIÓN A VERIFICAR: la dirección es distinta a la de Ikonos Plaza Comercial (Cra 10 #16N-27) listada en la red de restaurantes-acopio arriba, pero ambas mencionan "Ikonos" en Popayán — podría tratarse del mismo complejo con dos puntos/campañas distintos, o de una confusión de nombres. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio Municipal — Ciudad Moderna (Alcaldía de Popayán)',
      address: 'Calle 25 N° 7-81, Ciudad Moderna, diagonal al Centro Comercial Campanario, Popayán, Cauca',
      phone: null,
      needsText: 'Donaciones generales para familias afectadas por el terremoto. Punto abierto hasta el 21 de agosto, 8:00am-5:00pm diario, campaña #PopayánSolidaria.',
      sourceUrl: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0Bzd8fWQ8sXQhMsz3zG5Usew5kn3S3fc2JVaz8EgwU2W5fapbNAUZ7GqjquwcMSuBl&id=61550986837240',
      sourceOrg: 'Alcaldía de Popayán',
      submitterNote: 'Corroborado de forma independiente por dos cuentas distintas el mismo día (una ciudadana/voluntaria y la página oficial "Secretaría del Deporte y Recreación Popayán"), ambas con la misma dirección exacta y etiquetadas #AlcaldíaDePopayán / #PopayánSolidaria. Distinto de los otros puntos ya conocidos. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de acopio Movilidad Segura (Alcaldía de Popayán)',
      address: 'Sede de Movilidad Segura, Popayán (dirección exacta no dada en la publicación)',
      phone: null,
      needsText: 'Alimentos, agua, kits de aseo y demás elementos de primera necesidad.',
      sourceUrl: 'https://www.instagram.com/reel/DcEXxSsudvw/',
      sourceOrg: 'Alcaldía de Popayán',
      submitterNote: 'Publicado por @popayanco, una cuenta que se presenta como canal cívico/municipal de Popayán, indicando que la Alcaldía activó este punto en su sede de Movilidad Segura. Fuente única esta pasada, no verificada de forma independiente contra una segunda fuente — confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio Pacto Histórico Popayán',
      address: 'Sede del Pacto Histórico en Popayán (una fuente da Calle 3 #7-72; otra da una dirección distinta en Carrera 17A para una oficina relacionada "Pacto Histórico Cauca" — direcciones inconsistentes entre fuentes, posiblemente dos sedes relacionadas)',
      phone: null,
      needsText: 'Ayuda humanitaria general para damnificados del terremoto.',
      sourceUrl: 'https://www.instagram.com/p/Db6HzDHxcaC/',
      sourceOrg: 'Pacto Histórico Popayán',
      submitterNote: 'Reportado de forma independiente por dos cuentas de Instagram, más cobertura de prensa regional sobre congresistas del Pacto Histórico donando parte de su salario a las víctimas. Confianza media dada la inconsistencia de dirección entre fuentes — no se pudo confirmar una dirección única y limpia en el tiempo disponible.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Supertiendas San Diego (todas las sedes en Popayán)',
      address: 'Cualquier sede de Supertiendas San Diego en Popayán (cadena con 35 años en la ciudad; direcciones exactas por sede no listadas en la publicación)',
      phone: null,
      needsText: 'Agua potable y alimentos no perecederos, ropa para todas las edades, colchones y frazadas, medicamentos e insumos médicos, artículos de limpieza, kits de primeros auxilios, palas, linternas, pilas.',
      sourceUrl: 'https://www.instagram.com/p/Db6wz7Cyvfw/',
      sourceOrg: 'Supertiendas San Diego',
      submitterNote: 'Cadena de supermercados local ya establecida ("35 años en Popayán"), lista de necesidades desglosada, etiquetada/interactuada por otras cuentas locales reales. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Banco de Alimentos de la Arquidiócesis de Popayán (vía Cámara de Comercio del Cauca)',
      address: 'Cra 3a #3-30, Barrio Centro, Popayán (punto secundario en Santander de Quilichao: Sede Cámara de Comercio del Cauca, Calle 4 No. 8-10, Barrio Centro)',
      phone: null,
      needsText: 'Alimentos no perecederos y agua, elementos de aseo, guantes y tapabocas.',
      sourceUrl: 'https://www.instagram.com/p/Db9HYIem5u5/',
      sourceOrg: 'Cámara de Comercio del Cauca / Arquidiócesis de Popayán',
      submitterNote: 'Publicado por la Cámara de Comercio del Cauca (@cccauca), etiquetado por la Arquidiócesis de Popayán y Confecámaras (federación nacional de cámaras) — pareja institucional creíble. Distinto de los tres puntos ya sembrados en pasadas anteriores. Alta confianza.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: popayan.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: popayan.id,
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
      permalink: 'https://www.instagram.com/p/DcCTyhyhoZ5/',
      authorHandle: 'redmuncolombia',
      category: 'AID_POINT' as const,
      placeName: 'Terraplaza Centro Comercial, Popayán',
      note: 'Jornada Solidaria puntual (domingo 16 de agosto, 9:00am-12:00pm) para recibir, clasificar y organizar donaciones, con componente de salud mental y una jornada deportiva solidaria. Organizada junto con IM Dance, Cruz Roja Colombiana Seccional Cauca y COTELCO Cauca Joven — la participación de la Cruz Roja es una señal fuerte de credibilidad. Evento puntual, no un sitio permanente; verificar vigencia antes de aprobar dado que la fecha ya pudo haber pasado.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/corazondepaul1/posts/pfbid02R2aLQPR3TQdRDiRtwhT6HihCPqj24L1zrmg9GL8tKqeziKMxCTwWamQrAgspPM44l',
      authorHandle: 'Corazón de Paúl',
      category: 'NEED' as const,
      placeName: 'Hogar/Fundación San Vicente de Paúl, Popayán',
      note: 'Un hogar geriátrico de la Familia Vicentina en Popayán sufrió daños en el sismo; la publicación pide solidaridad y apoyo para sus residentes de edad avanzada, pero pide explícitamente que cualquier ayuda se coordine directamente con la institución y las autoridades en vez de entregarse directamente — no se da dirección ni teléfono, así que se registra como alerta de necesidad, no como punto de ayuda accionable. La Alcaldía de Popayán reportedly visitó el sitio para evaluar necesidades.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/PoliciaPopayan/status/2088377307979255844',
      authorHandle: '@PoliciaPopayan',
      category: 'OFFICIAL' as const,
      placeName: 'Popayán',
      note: 'La Policía Metropolitana de Popayán anuncia que se preparan para enviar cargamentos de ayuda a familias afectadas por el terremoto, en coordinación con instituciones y la comunidad. Anuncio general, sin dirección ni instrucciones concretas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/MeridianoRegionalCO/posts/pfbid01CCGLEsyanH3217oqCBN5LEaMgEzKZx7ivSFwQ9ZAdSACL7aUtua56Ek8i5ft3ZBl',
      authorHandle: 'Meridiano Regional',
      category: 'OFFICIAL' as const,
      placeName: 'Popayán, Cauca',
      note: 'La campaña nacional "Colombia, un solo corazón", liderada por la primera dama Ana Lucía Pineda, llegó a Popayán a recolectar donaciones para familias afectadas por el terremoto — desarrollo de fase de recuperación que muestra compromiso continuo del Gobierno nacional con la ciudad.',
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
        municipioId: popayan.id,
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
