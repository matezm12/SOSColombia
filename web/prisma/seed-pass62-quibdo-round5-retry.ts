/**
 * Pass 62 (2026-08-15) — round 5, Quibdó, retry synthesis. Covers the
 * four angles (X, Instagram, Facebook, TikTok) that failed in pass 61
 * due to a session capacity limit; all four completed cleanly on retry.
 *
 * Most important finding: the hospital's own official channel
 * (@nuevaesehdsfa) posted an anti-fraud notice naming ONE authorized
 * donation account and explicitly stating no other accounts, phone
 * numbers, or intermediaries are authorized. A separate, independently-
 * sourced Facebook post shows a graphic impersonating the hospital
 * stamped "FALSO" by its own poster. Taken together, this casts real
 * doubt on the "vía Fundación Empresas Conscientes" donation channel
 * seeded back in pass 18 — that channel is NOT deleted (this project
 * never overwrites prior records), but is flagged here and in the wiki
 * for a human moderator to weigh against the hospital's own current
 * statement before approving future donations through it.
 *
 * Also caught: the Óscar Benavides fraud story has materially escalated
 * (a formal Corte Suprema investigation, not just a promised "Veeduría
 * Ciudadana"), a second and distinct scam vector (fake/altered QR codes,
 * flagged publicly by singer Jhonny Rivera, not Quibdó-exclusive), and a
 * hopeful sign on the hospital's broken blood-bank refrigerator problem
 * documented in pass 18 — a replacement unit was just delivered.
 *
 * One duplicate caught and skipped: an Instagram repost of the
 * hospital's Barrio Kennedy supply-needs point (same address, same
 * named contact, same phone) that pass 18 already seeded under a
 * different name string — not re-created despite the differing name.
 * See wiki/17-allied-resources-and-community.md "Pass 62" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass62-quibdo-round5-retry.ts`.
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
      name: 'Nueva ESE Hospital San Francisco de Asís — cuenta oficial única autorizada (aviso antifraude)',
      address: null,
      phone: '310 523 3104 (única línea autorizada)',
      needsText: 'Banco de Bogotá cuenta de ahorros No. 578818437, titular Nueva ESE Hospital Departamental San Francisco de Asís, NIT 901.108.114-5 (también código QR en la publicación). El hospital declara explícitamente que esta es la ÚNICA cuenta/línea autorizada para donaciones en efectivo y que ninguna otra cuenta, número telefónico o intermediario tiene autorización.',
      sourceUrl: 'https://www.instagram.com/p/Db_C4WrR3k1/',
      sourceOrg: 'Nueva ESE Hospital Departamental San Francisco de Asís',
      submitterNote: 'IMPORTANTE PARA MODERACIÓN: esta declaración antifraude del propio hospital, junto con una publicación de Facebook independiente que muestra un gráfico falso suplantando al hospital (sellado "FALSO" por quien lo publicó) y otra que confirma que Facebook mismo marcó como "AI content" las publicaciones de "Fundación Empresas Conscientes" citadas en la pasada 18, ponen en duda el canal "vía Fundación Empresas Conscientes" ya sembrado en esa pasada (Llave 0092887880). No se elimina ese registro anterior — este proyecto nunca sobrescribe — pero se recomienda a quien modere priorizar esta cuenta oficial única y revisar el canal antiguo con precaución antes de aprobarlo.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Gobernación del Chocó — punto de acopio',
      address: 'Calle 31 - Edificio La Confianza, Quibdó',
      phone: null,
      needsText: 'Agua, alimentos no perecederos, kits de hábitat y aseo, insumos médicos, alimento para mascotas, enseres.',
      sourceUrl: 'https://www.instagram.com/p/Db4y_C-N6fX/',
      sourceOrg: 'Gobernación del Chocó',
      submitterNote: 'Publicación enmarcada explícitamente como guía antifraude ("Puntos Oficiales y Donaciones Seguras"), nombrando la sede propia de la Gobernación — dirección de un edificio gubernamental, verificable de forma independiente.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro Logístico Humanitario (Antigua Bodega Postobón)',
      address: 'Km 4, vía Quibdó - Yuto',
      phone: null,
      needsText: 'Agua, alimentos no perecederos, kits de hábitat y aseo, insumos médicos, alimento para mascotas, enseres.',
      sourceUrl: 'https://www.instagram.com/p/Db4y_C-N6fX/',
      sourceOrg: null,
      submitterNote: 'Misma fuente que el punto de la Gobernación del Chocó (guía antifraude "Puntos Oficiales y Donaciones Seguras"); dirección industrial concreta y verificable, consistente con cómo suelen instalarse los centros logísticos humanitarios.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio — Iglesia San José Obrero (Barrio Obrero, Quibdó)',
      address: 'Iglesia San José Obrero, Barrio Obrero, Quibdó',
      phone: null,
      needsText: 'Donaciones generales para familias del Chocó afectadas por el terremoto, recolectadas en una iglesia del barrio.',
      sourceUrl: 'https://www.instagram.com/p/DcCY8CWKN61/',
      sourceOrg: 'Iglesia San José Obrero',
      submitterNote: 'Publicada 1 día antes de esta pasada con horario concreto de esa misma semana (hoy 4-9pm, sábado 15 de agosto desde las 2pm) — puede tratarse de una jornada puntual más que un punto permanente; quien modere debe confirmar vigencia si se aprueba después de esas fechas.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Alcaldía de Quibdó — Fondo de Reconstrucción "Quibdó necesita de todos"',
      address: null,
      phone: null,
      needsText: 'Donaciones económicas: Banco de Bogotá, Cuenta Corriente No. 578446940, a nombre de "Corporación de la fe – Diócesis de Quibdó", NIT 818.002.136-1 (también código QR en la publicación). Segunda modalidad: bonos para materiales de construcción, canjeables en ferreterías locales a nombre de la Alcaldía de Quibdó, para apoyar la reparación de viviendas afectadas. Parte de la campaña oficial #QuibdóUnidoResponde.',
      sourceUrl: 'https://www.instagram.com/p/Db9CMa9P9fU/',
      sourceOrg: 'Alcaldía de Quibdó',
      submitterNote: 'Publicado por la cuenta oficial verificada @alcaldiadequibdo. Canal de reconstrucción municipal distinto del banco de alimentos de la Diócesis ya sembrado en pasadas anteriores. Un comentario público preguntó "¿Es confiable esta publicación??" — reflejo de la cautela ciudadana generada por el escándalo Benavides en paralelo; la cuenta en sí es la oficial del gobierno municipal, pero se recomienda a los donantes verificar el número de cuenta directamente con la Alcaldía antes de transferencias grandes.',
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
      permalink: 'https://x.com/LauraMosquera/status/2088757722258759919',
      authorHandle: '@LauraMosquera',
      category: 'NEED' as const,
      placeName: 'Hospital Departamental San Francisco de Asís, Quibdó',
      note: 'Pide difusión para una necesidad puntual de equipo médico del hospital, dañado por fluctuaciones de energía tras el sismo: centrífuga de 24 tubos, agitador de Mazzini, pleurovac pediátrico/adulto, tubos a tórax, monitores de signos vitales (x4), camillas pediátricas (x6), entre otros.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/AREA32OFICIAL/status/2088745193453256776',
      authorHandle: '@AREA32OFICIAL',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hospital San Francisco de Asís, Quibdó',
      note: 'Posible buena noticia sobre el problema del banco de sangre no funcional documentado desde la pasada 18: la Fundación del Dr. Camilo Prieto entregó una nevera especializada para almacenar sangre al hospital, con video de la entrega. Contrastar con el reporte de El Colombiano (también de esta misma pasada) de hace 3 días, que aún describía el banco de sangre como no funcional — la nevera pudo haber llegado justo después.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/ColombiaOscura/status/2088762046758174729',
      authorHandle: '@ColombiaOscura',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Mera, Quibdó',
      note: 'Video del grupo juvenil voluntario "Los Bárbaros" descargando camiones de ayuda humanitaria llegados desde Bogotá — 23 vehículos descargados en dos días.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/LiianDavid/posts/pfbid036hde6bgSCby1pfrNg8wUaKagUVDmyXYEU9jp4bgPpws6bCaEQoUBDwPt8DnMpZPdl',
      authorHandle: 'Elgie David Hernandez Hernandez',
      category: 'NEED' as const,
      placeName: 'Quibdó, Chocó',
      note: 'Alerta pública: estafadores están recirculando el volante real de necesidades del hospital para pedir donaciones a cuentas no afiliadas al Hospital San Francisco de Asís. La imagen adjunta es el volante real "SE NECESITA URGENTE" sellado "FALSO" en rojo. Corrobora directamente el aviso antifraude oficial del hospital sembrado en esta misma pasada.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/NotiRadar360/posts/pfbid033CPihS7rWLR6MdLPQeMWXkGz4rrEsj6Eq1iWnsR5raCGTxD4fk3uADt1azB3BFs4l',
      authorHandle: 'NotiRadar 360',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó',
      note: 'Escalada material del caso Benavides más allá de la "Veeduría Ciudadana" prometida (pasada 49/61): la Corte Suprema de Justicia abrió investigación formal tras denuncia de Daniel David Martínez, exigiendo trazabilidad bancaria/contable de los más de $300 millones COP recaudados y pidiendo examinar la conducta de Laura Camila Vargas y Francisco Ibalde. Benavides responde calificándolo de "matoneo judicial" y dice que los fondos se manejan a través de una fundación y la "Asociación BNL2", actualmente en auditoría.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@reddeveeduriasdec/video/7673905506422934802',
      authorHandle: 'reddeveeduriasdec (Pablo Bustos, Red de Veedurías de Colombia)',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó',
      note: 'El jefe de la Red de Veedurías de Colombia confirma la investigación de la Corte Suprema sobre la recolección de fondos de Benavides y anuncia que la Red prepara acciones disciplinarias/éticas adicionales, explicando la base legal (los servidores públicos no pueden solicitar/manejar personalmente donaciones para desastres).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@musicalifyco/video/7674304002581875969',
      authorHandle: 'musicalifyco',
      category: 'NEED' as const,
      placeName: 'Colombia (incluye Chocó)',
      note: 'Nuevo vector de estafa distinto al caso Benavides y al del volante falso del hospital: el cantante Jhonny Rivera alertó sobre códigos QR alterados/falsos usados para desviar donaciones del terremoto, e instó a verificar los canales oficiales antes de escanear cualquier QR. No es exclusivo de Chocó, pero relevante para donantes de esta ciudad.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8gfPmCtnX/',
      authorHandle: 'elcolombiano_',
      category: 'NEED' as const,
      placeName: 'Hospital San Francisco de Asís, Quibdó',
      note: 'El hospital sigue sin banco de sangre funcional por falta de una unidad de refrigeración especializada, obligando a traer sangre desde otras ciudades para uso inmediato en medio de muchos pacientes traumatizados. Publicado hace 3 días — contrastar con el reporte más reciente (mismo día de esta pasada) de que ya llegó una nevera especializada donada.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db3_9Gxx0yv/',
      authorHandle: 'afrofaster',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Quibdó / Chocó',
      note: 'Publicación de un creador nativo del Chocó, con fuerte reacción orgánica (5.9K likes, 1.7K comentarios), señalando que el epicentro real del sismo fue en el Chocó (San José del Palmar, Nóvita, Río Iró, Quibdó) pero la región recibe menos atención mediática y de ayuda que Manizales, Pereira o Cali; los comentarios preguntan repetidamente dónde donar específicamente para que llegue al Chocó.',
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
