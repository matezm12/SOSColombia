/**
 * Pass 49 (2026-08-15) — fifth city in the fourth research round, Quibdó.
 * Three prior rounds (passes 18, 27, 36) already covered this city
 * exhaustively. This pass had a specific priority carried over from
 * Cali's round-4 pass (46): dig into Congressman Óscar Benavides's
 * earthquake-donation-fraud scandal. Verdict, cross-confirmed by all 5
 * agents: it's the SAME formal Corte Suprema complaint pass 36 already
 * logged (same magistrate, Francisco Farfán), not a second scandal — but
 * this pass filled in every name pass 36 left as a placeholder: the
 * denunciante (Daniel David Martínez), the disputed account holder (José
 * Francisco Ibalde Ibarra), and the specific charges requested (estafa,
 * captación masiva de dinero, peculado por apropiación). Benavides has
 * still published no accounting, only a verbal promise. Not re-seeded as
 * a new scandal — see the wiki for the full detail update instead.
 * Genuinely new this round: a 5-agent-corroborated Vaki solar-lighting
 * campaign tied to Quibdó's own municipal government office, a national
 * police fraud alert, and the Chocó governor's detailed reconstruction
 * requests to the president.
 * See wiki/17-allied-resources-and-community.md "Pass 49" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass49-quibdo-round4.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  const aidPoints = [
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Una Luz de Esperanza (Vaki) — iluminación solar para Quibdó',
      address: 'En línea (Vaki); distribución coordinada con la Oficina de Gestión Social de Quibdó',
      phone: null,
      needsText: 'Meta de $100M COP para instalar 300 puntos de iluminación solar exterior en barrios de Quibdó sin energía; ya entregaron 150+ power banks solares con linterna. Organizado por Juliana, GSS Global Solar Solution, MUN Entertainment y Juanpa Vargas, con identificación de beneficiarios e instalación coordinadas directamente con la Oficina de Gestión Social del municipio. Cierra 16 de agosto de 2026 (plazo inminente).',
      sourceUrl: 'https://vaki.co/vaki/UNALUZDEESPERANZA',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por los cinco agentes de esta pasada — corroboración excepcional. US$12,478 recaudados de meta US$32,097, 427 donantes con marcas de tiempo del mismo día. Socios corporativos/de influencia nombrados y coordinación institucional explícita con una oficina municipal real para la entrega — un canal concreto y verificable, no un llamado vago.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help Rebuild a Home After the Chocó, Colombia Earthquake (Ximena Rojas Chacon)',
      address: null,
      phone: null,
      needsText: 'Reconstruir/reparar la vivienda de una familia de 7 personas (4 niños) en Quibdó y reemplazar enseres básicos perdidos (camas, artículos del hogar).',
      sourceUrl: 'https://www.gofundme.com/f/help-rebuild-a-home-after-the-choco-colombia-earthquake',
      sourceOrg: null,
      submitterNote: 'Encontrada de forma independiente por cuatro de los cinco agentes de esta pasada. Tres organizadoras nombradas de la diáspora (Hamburgo, Londres, Gold Coast), €532 recaudados de meta €7,000, 14 donantes, creada hace 2 días. Compromiso explícito de publicar actualizaciones de transferencia/uso de fondos. Confianza media dado que es una recaudación personal de la diáspora sin respaldo institucional que verifique la situación de la familia de forma independiente.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Sí Mujer — "Mujeres que Reconstruyen"',
      address: null,
      phone: 'Bre-B 0092891400',
      needsText: 'Donaciones monetarias para financiar organizaciones locales lideradas por mujeres haciendo trabajo de recuperación/reconstrucción tras el terremoto en Buenaventura, Quibdó y el norte del Valle del Cauca. Cuentas: Bre-B 0092891400, Banco de Occidente cuenta de ahorros 027 843 531, PayPal internacional vía el aliado PCDN (paypal.biz/pcdnglobal).',
      sourceUrl: 'https://www.instagram.com/p/Db_KH7AO2Ml/',
      sourceOrg: 'Fundación Sí Mujer',
      submitterNote: 'Fundación establecida (fundacionsimujer.org, correo de contacto real), datos bancarios/Bre-B/PayPal explícitos, etiquetada por 3 organizaciones aliadas identificables (Libre de Culpa, Se Lo Explico Con Plastilina, PCDN), publicada hace ~2 días. No encontrada en ninguna pasada anterior tras verificar contra el documento wiki completo.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'EDS Synergia S.A.S. — recolección para reconstrucción de vivienda',
      address: 'Quibdó, Chocó (estación de gasolina/energía local)',
      phone: null,
      needsText: 'Donaciones monetarias para la reconstrucción de viviendas de familias afectadas. Bancolombia cuenta de ahorros 53600008129, titular EDS SYNERGIA S.A.S., NIT 901.543.852.',
      sourceUrl: 'https://www.instagram.com/p/Db6m3YNnxmG/',
      sourceOrg: 'EDS Synergia S.A.S.',
      submitterNote: 'Negocio local real con NIT y cuenta bancaria verificables, PERO la publicación misma está marcada por Instagram como "contenido de IA" — se registra a confianza reducida siguiendo la práctica ya establecida de este proyecto para contenido marcado como IA con una señal institucional real de fondo, no descartado directamente.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: quibdo.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: quibdo.id,
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
      permalink: 'https://www.infobae.com/colombia/2026/08/15/radican-denuncia-contra-oscar-benavides-ante-la-corte-suprema-tras-pedir-donaciones-a-traves-de-sus-cuentas-personales-para-victimas-del-terremoto/',
      authorHandle: 'Infobae Colombia',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó / Corte Suprema de Justicia',
      note: 'ACTUALIZACIÓN DE LA HISTORIA BENAVIDES (misma denuncia ya registrada en la pasada 36, con nombres y detalle que antes faltaban): denuncia formal de 21 páginas radicada el 14 de agosto ante la Sala de Instrucción de la Corte Suprema (magistrado Francisco Farfán, ya conocido). El denunciante es Daniel David Martínez, abogado recién graduado. La denuncia identifica por primera vez al titular de la cuenta que habría recibido las donaciones: José Francisco Ibalde Ibarra, aliado político de Benavides y candidato a la Cámara por la misma circunscripción especial afro (Consejo Comunitario El Naranjo) — contradice la versión pública de la asesora de UTL de Benavides, Laura Camila Vargas, de que el dinero iba a una fundación. Se pide investigar por estafa, captación masiva de dinero (Código Penal art. 316) y peculado por apropiación, y remitir copias a la Fiscalía. Benavides respondió negando responsabilidad y calificando la denuncia de "matoneo judicial". NO se ha publicado ninguna rendición de cuentas formal — solo la promesa verbal de una futura "rendición de cuentas peso por peso" vía "Asociación BNL2". La cifra recaudada sigue en ascenso, ahora reportada en más de $700 millones COP / 40+ toneladas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1539691523936558',
      authorHandle: 'Óscar Benavides',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó',
      note: 'Video propio de Óscar Benavides (14 de agosto), publicado en medio de la controversia: anuncia la salida de 35 toneladas de ayuda al Chocó en 4 camiones, mostrando actividad continua en el terreno en paralelo a la disputa legal — sin abordar la denuncia ni presentar cuentas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://cambiocolombia.com/pais/articulo/2026/8/pilas-no-caiga-en-estafas-con-falsas-campanas-de-ayudas-para-las-victimas-del-terremoto',
      authorHandle: 'Policía Nacional / Centro Cibernético Policial (vía Cambio Colombia)',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (incluye Chocó/Quibdó)',
      note: 'Alerta nacional de la Policía Nacional/Dijín (~14-15 de agosto): advierten sobre campañas falsas de solidaridad, suplantación de organizaciones de ayuda, y uso de cuentas personales, enlaces de WhatsApp y códigos QR para solicitar pagos fraudulentos bajo la excusa del terremoto. Canal de denuncia: WhatsApp CAI Virtual 323 2733411. Recomiendan donar solo vía Cruz Roja, alcaldías, gobernaciones, Defensa Civil o la iniciativa "Colombia, un solo corazón" de la Primera Dama y sus aliados nombrados (Fundación Colombia, Luz y Sonrisas, El Minuto de Dios, ABACO).',
    },
    {
      platform: 'X' as const,
      permalink: 'https://caracol.com.co/2026/08/15/gobernadora-del-choco-detallo-plan-de-reconstruccion-del-departamento-e-hizo-peticion-al-gobierno/',
      authorHandle: 'Caracol Radio / Gobernadora Nubia Carolina Córdoba',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó (departamental, incluye Quibdó)',
      note: 'La gobernadora del Chocó confirma el cierre formal de labores de búsqueda y rescate en todo el departamento; pide al Gobierno nacional asistencia técnica en ingeniería estructural (en vez de los pequeños equipos propios del departamento) para 29 municipios en 5 subregiones afectadas; discute un subsidio de arriendo, pidiendo explícitamente que se calibre según el mercado real de Quibdó y no una tarifa nacional homogénea; confirma la estructuración de un rol de "gerente" de enlace entre la Nación y el territorio.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/riverosalazar/posts/pfbid0rTEutEVzfLX7BN3Eqdn5TzjXkrW77uttuZZMJZNev9kBWEP9h73WKkEqcLL5HN2jl',
      authorHandle: 'Cristiam Salazar',
      category: 'NEED' as const,
      placeName: 'Colombia (alcance nacional, relevante para donantes del Chocó)',
      note: 'NUEVO PATRÓN DE ESTAFA: publicación nombra 4 contactos reportados por fraude de donaciones — teléfono +57 318 002 6009 (se hace pasar por donante y luego pide dinero para "transporte"), +57 305 290 2157 (se hace pasar por coronel), +57 312 459 3066 (se hace pasar por policía), y cuenta Nequi 324 338 2738 — describe un patrón de llamadas hechas desde cárceles pidiendo que se envíen/transporten donaciones que luego se quedan sin entregar.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db5qnkBIpP7/',
      authorHandle: '@cncchoco',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Quibdó',
      note: 'Luis Alberto "Lucho" Rivas Salguero, reportado desaparecido desde el terremoto, fue hallado muerto tras 12+ horas de búsqueda. Testigos relatan que sacó a una persona atrapada de los escombros, regresó por una segunda, y la estructura colapsó sobre él — una muerte de héroe local de rescate. Corroborado de forma independiente por un segundo medio local de Quibdó.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1740925260552645',
      authorHandle: 'sportymas',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó / Eje Cafetero / Valle del Cauca',
      note: 'Nicky Jam y Grupo Argos lanzan "Adopta un Hogar", comprometiendo inicialmente $13.000 millones COP (~US$4.16M) para reparar y reconstruir viviendas afectadas por el terremoto en Chocó, el Eje Cafetero y el Valle del Cauca. Corroborado de forma independiente por El Colombiano, Blu Radio, Semana y Yahoo. NO sembrado como punto de ayuda porque aún no tiene un mecanismo de aplicación/beneficiario direccionado al público — solo un anuncio institucional por ahora, vale la pena rastrear si abre un proceso concreto.',
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
