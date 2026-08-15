/**
 * Pass 33b (2026-08-15) — third research pass on Cali, run within ~24h of
 * the pass-24 follow-up. Closes out the trillizas Saavedra missing-persons
 * story, surfaces the city's official 24-hour donation hub ("Casa Grande
 * de la Solidaridad"), a new door-to-door fake-census scam warning from
 * the Alcaldía itself, and two new individual-family Vaki campaigns. See
 * wiki/17-allied-resources-and-community.md "Pass 33" for full reasoning
 * (see also seed-pass33a-cali-toll-update.ts for the casualty-figure
 * update from this same pass). Run once via
 * `npx tsx prisma/seed-pass33b-cali-round3.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cali = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Casa Grande de la Solidaridad (Ciudadela Petronio Álvarez)',
      address: 'Ciudadela Petronio Álvarez, Cali',
      phone: null,
      needsText: 'Centro oficial de coordinación de donaciones y voluntariado para toda la ciudad, funcionando las 24 horas. El recinto (antes "Casa Grande del Pacífico") fue convertido en el punto único oficial de ayuda/voluntariado de Cali, descrito por el Alcalde como el epicentro de la unión y generosidad donde caleños, empresas, ciudades hermanas y países aliados canalizan apoyo.',
      sourceUrl: 'https://x.com/alejoeder/status/2088510639035589082',
      sourceOrg: 'Alcaldía de Santiago de Cali (Alcalde Alejandro Eder)',
      submitterNote:
        'Confianza media sobre la fecha exacta de apertura: el anuncio del alcalde en su recorrido con el presidente es reciente (minutos antes de esta pasada), pero al menos otro hallazgo sugiere que el centro pudo haber abierto 2-3 días antes, posiblemente ya activo desde antes de la pasada 24. Se siembra aquí por primera vez porque no se había registrado con este nombre específico. Corroborado por la página oficial de la Alcaldía de Cali y la Secretaría de Cultura de Cali.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Ayudemos a Juan David, Valentina y Salomón',
      address: null,
      phone: null,
      needsText: 'Refugio, alimentación, ropa, insumos para bebé y atención médica para un padre y su hijo de 3 meses (Salomón) que perdieron su hogar; la madre del bebé, Valentina, permanece desaparecida bajo los escombros.',
      sourceUrl: 'https://vaki.co/vaki/ayudemos-a-juan-david-y-salom-n',
      sourceOrg: null,
      submitterNote:
        'Campaña real y específica (nombres concretos, historia verificable), en la misma plataforma Vaki que Casa Mangle. Nota de fecha: un agente la vio como recién publicada (~8h), otro sugiere que pudo existir desde ~2 días antes (posiblemente ya activa en la pasada 24) - se incluye de todas formas por la calidad de la información, con esta ambigüedad de fecha señalada explícitamente.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Reconstruyamos un hogar - Familia Anita, Mario, Isabella y Juan',
      address: 'Cali, Valle del Cauca',
      phone: null,
      needsText: 'Familia afectada por el terremoto del 10 de agosto de 2026 en Cali que perdió todo; recaudación para reconstruir su hogar.',
      sourceUrl: 'https://vaki.co/vaki/reconstruyamos-hogar',
      sourceOrg: null,
      submitterNote: 'Campaña nueva (~1 día de antigüedad al momento de la revisión), distinta de Casa Mangle y de la campaña colectiva "Colombianos Unidos por la reconstrucción de hogares". Confianza media: no se pudo confirmar con mayor precisión el momento exacto de creación.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: cali.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: cali.id,
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
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiascaracol/video/7673699673370004756',
      authorHandle: '@noticiascaracol',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Cuarto de Legua, Cali (Edificio María Alvira)',
      note: 'Se resuelve el caso de las "trillizas Saavedra": el cuerpo de Isabella Saavedra Caicedo fue hallado la noche del 13 de agosto entre los escombros. De las cinco personas de la familia Saavedra Caicedo, solo sobrevivió Ana María (23), protegida por una puerta de madera que cayó sobre ella; sus padres Jairo y Vicky y sus hermanas gemelas Sofía e Isabella murieron. Búsqueda y rescate para esta familia concluida oficialmente. Corroborado ampliamente (Blu Radio, NTN24, RCN, Telemundo, El País Cali, Portal al Día, Córdoba En Línea).',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.semana.com/nacion/cali/articulo/cali-actualiza-balance-tras-el-terremoto-110-muertos-115-desaparecidos-y-1410-heridos/202637/',
      authorHandle: 'Semana / Alcaldía de Santiago de Cali',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'Balance oficial actualizado de Cali (14 de agosto, ~5pm): 110 muertos, 115 desaparecidos, 1,410 heridos, 89 estructuras afectadas (46 en colapso total). Cifras registradas como nuevos TollRecord en la pasada 33a - ver ese script para el detalle de la fila conflictiva (104 muertos) reportada por otra fuente el mismo día.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.elpais.com.co/cali/autoridades-de-cali-confirman-96-muertos-y-alertan-sobre-censos-falsos-tras-el-sismo-1442.html',
      authorHandle: 'El País Cali',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'Alerta oficial de la Alcaldía: personas se están haciendo pasar por censadores estadísticos puerta a puerta - un vector de estafa distinto de las ya documentadas estafas de código QR de donaciones. Los equipos municipales legítimos usan solo documentos físicos, nunca QR ni verificación telefónica.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/alejoeder/status/2088510639035589082',
      authorHandle: '@alejoeder',
      category: 'OFFICIAL' as const,
      placeName: 'Cali',
      note: 'El Alcalde Alejandro Eder, tras la reunión del PMU con el presidente De la Espriella, pidió redirigir la deuda de $2 billones de pesos de EMCALI (empresa de servicios públicos de Cali) hacia la reconstrucción de la ciudad, y solicitó facultades especiales para ello.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/search?q=Canchas%20Panamericanas%20albergue%20Cali%20cierre',
      authorHandle: 'secprensasv (Secretaría de Prensa de El Salvador)',
      category: 'OFFICIAL' as const,
      placeName: 'Canchas Panamericanas, Cali',
      note: 'La misión humanitaria oficial de El Salvador (enviada por el presidente Bukele) fue registrada preparando y distribuyendo paquetes de ayuda en el albergue de Canchas Panamericanas, confirmando que el albergue sigue activo y ahora recibe una delegación internacional.',
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
        municipioId: cali.id,
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
