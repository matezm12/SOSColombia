/**
 * Pass 41 (2026-08-15) — third research pass on Popayán, run within ~24h
 * of the pass-29 follow-up. A quieter city, as expected, but still
 * surfaced a genuinely strong new find (an elder-care home whose chapel
 * collapsed, well-corroborated across five independent sources) plus two
 * new organizations joining the Popayán-helps-Chocó mutual-aid story.
 * See wiki/17-allied-resources-and-community.md "Pass 41" for full
 * reasoning. Run once via `npx tsx prisma/seed-pass41-popayan-round3.ts`.
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
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Hogar San Vicente de Paúl de Popayán',
      address: 'Carrera 8 N 10-25, Popayán, Cauca',
      phone: '602 833 9804 · 304 550 6808 · 304 482 2420',
      needsText: 'Hogar geriátrico cuya capilla y techo colapsaron en el sismo. Necesita alimentos, medicamentos, pañales, ropa y aportes monetarios para reconstruir el techo y seguir atendiendo a sus residentes. NIT 891580012. Banco AV Villas: cuenta corriente 25129410-4 (donaciones), cuenta de ahorros 25204087-8 (bonos/fondo de emergencia). Correos: Contafundacionsanvicente@hotmail.com (contabilidad), Fhsvp@hotmail.com (secretaría).',
      sourceUrl: 'https://www.tiktok.com/@informatecauca/video/7673722117325720853',
      sourceOrg: 'Fundación Hogar San Vicente de Paúl de Popayán',
      submitterNote:
        'Hallazgo genuinamente nuevo, no reportado en las dos pasadas anteriores. Corroborado de forma independiente a través de múltiples fuentes: FAMVIN (sitio internacional de noticias de la familia vicentina), un post de la Tercera División del Ejército sobre soldados ayudando a despejar escombros en el sitio, la página de Facebook propia de la fundación, un registro empresarial en Portafolio.co con el mismo NIT y dirección, y una cuenta de Instagram vicentina (@corazondepaul) pidiendo apoyo. Registro de donaciones con NIT y cuentas bancarias reales publicado directamente en la fuente.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Secretaría de Cultura y Turismo Popayán - punto de acopio "Párchate con Cultura"',
      address: 'Calle 25 N # 7-81, Ciudad Moderna, Popayán',
      phone: null,
      needsText: 'Colecta general de solidaridad para familias afectadas por el terremoto, organizada por la Secretaría municipal de Cultura y Turismo bajo su marca habitual "Párchate con Cultura".',
      sourceUrl: 'https://www.facebook.com/reel/1675233103585022',
      sourceOrg: 'Secretaría de Cultura y Turismo de Popayán',
      submitterNote: 'Página oficial de la secretaría municipal (9.3K seguidores), distinta de los tres puntos ya sembrados (Casa de la Moneda/Gobernación, Junta Pro Semana Santa, banco de alimentos de la Arquidiócesis) - institución nueva para esta pasada.',
    },
    {
      kind: 'VET' as const,
      name: 'Centro de Acopio Popayán - insumos para mascotas (Tigresas de la Patria + Comedog + Salvando Huellitas)',
      address: 'Edificio Ikonos, Local 10, Carrera 10 # 15N-93 (diagonal al sector Boulevard, Recinto Ferial), Popayán',
      phone: '311 340 4077 · 310 840 3189 · 315 577 5030',
      needsText: 'Insumos para mascotas de familias afectadas por el terremoto, organizado conjuntamente por el Centro de Acopio de las Tigresas de la Patria, Fundación Comedog y Salvando Huellitas. Horario: 8:00 a.m. - 7:00 p.m.',
      sourceUrl: 'https://x.com/CarlosJulianMG/status/2088442756645495210',
      sourceOrg: 'Tigresas de la Patria / Fundación Comedog / Salvando Huellitas',
      submitterNote: 'Primera categoría VET/mascotas encontrada para Popayán en las tres pasadas. Confianza media: cuenta pequeña y personal (28 vistas), sin corroboración independiente de un segundo post en esta pasada, pero con dirección, tres teléfonos y organizaciones nombradas.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto vecinal - Salón comunal, Barrio La Paz',
      address: 'Salón comunal del barrio La Paz, Popayán',
      phone: null,
      needsText: 'Vecinos organizando recepción de ayudas para damnificados del sismo (insumos exactos no especificados en la publicación).',
      sourceUrl: 'https://www.instagram.com/popayanco/reel/DcBcCkRud99/',
      sourceOrg: null,
      submitterNote: 'Punto de acopio vecinal genuinamente nuevo, distinto de los tres ya sembrados. Confianza media: reportado por una cuenta comunitaria local activa (@popayanco), pero sin lista específica de insumos ni segunda fuente.',
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
      permalink: 'https://www.instagram.com/p/DcCyktqjXqW/',
      authorHandle: 'gobcauca',
      category: 'OFFICIAL' as const,
      placeName: 'Casa de la Moneda, Popayán',
      note: 'ACTUALIZACIÓN DE ESTADO: la colecta médica de la Casa de la Moneda, ya marcada como "etapa final" en la pasada 29, fue extendida un día más - hoy (15 de agosto) es su día final real, de 9am a 7pm, aún solicitando insumos médicos con urgencia.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/PoliciaPopayan/status/2088377307979255844',
      authorHandle: '@PoliciaPopayan',
      category: 'OFFICIAL' as const,
      placeName: 'Popayán',
      note: 'La Policía Metropolitana de Popayán anunció que prepara, junto con otras instituciones y la comunidad, un envío de ayudas para familias damnificadas - nuevo actor institucional en el esfuerzo de ayuda de Popayán no visto en pasadas anteriores.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@criccolombia/video/7674051881651457288',
      authorHandle: '@criccolombia',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Popayán → Chocó',
      note: 'El Consejo Regional Indígena del Cauca (CRIC) organizó una "minga humanitaria": una comisión de consejeros, autoridades indígenas y la Guardia Indígena partió de Popayán hacia el Chocó para apoyar a las comunidades afectadas - actor nuevo y distinto en la historia de ayuda mutua Popayán-Chocó (las pasadas anteriores solo tenían al consejo de juventud y una colecta comunitaria de 7 toneladas).',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/stories/103366445956375/UzpfSVNDOjEwMTk4MTUyMDc1NDg5MDU=/',
      authorHandle: 'Noticias Cauca',
      category: 'OFFICIAL' as const,
      placeName: 'Popayán → Chocó',
      note: 'Actualización de la colecta del Consejo Municipal de Juventud de Popayán: los camiones ya partieron rumbo al Chocó con más de 7 toneladas recolectadas; la colecta sigue activa hasta el próximo lunes (no ha cerrado). Otros reportes citan una cifra mayor y aún no confirmada de "35+ toneladas" en cuatro camiones - posible sobreestimación o una segunda colecta, no se pudo verificar con un enlace limpio en esta pasada.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/photo/?fbid=1698982148649109&set=a.134652328415440',
      authorHandle: 'Desaparecidos Cti Popayan',
      category: 'NEED' as const,
      placeName: 'Torre Molinos, Popayán',
      note: 'Volante oficial de la Fiscalía/CTI: Francisco Javier Manquillo Tonguino, 32 años, desaparecido desde el 13 de agosto en la panadería Maxipan, sector Torre Molinos (caso SIRDEC 2026D008384). El volante no menciona el terremoto como causa - se registra con esa salvedad, no como caso confirmadamente relacionado al sismo.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCJCXEqRex/',
      authorHandle: 'gabyquiroz111',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'CC Campanario, Popayán',
      note: 'Emprendedoras de un congreso de la Fundación Mundo Mujer en Popayán, varias provenientes de Cali, Quibdó, Pereira y Manizales que perdieron su vivienda o negocio en el terremoto, organizan una feria este fin de semana en el CC Campanario pidiendo al público de Popayán comprarles - ángulo de recuperación económica no visto en pasadas anteriores.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBmtBdR4Vh/',
      authorHandle: 'darii.rivera_',
      category: 'NEED' as const,
      placeName: 'Popayán',
      note: 'Difusión de recursos oficiales reales de salud mental para afectados por el sismo: línea de teleorientación en salud mental 313 479 2875 (lunes a viernes 7am-4pm) y la línea nacional de apoyo emocional 24/7, el 106.',
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
