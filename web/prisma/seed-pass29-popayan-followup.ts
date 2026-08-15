/**
 * Pass 29 (2026-08-15) — follow-up social media research pass on Popayán,
 * days after the original deep pass. The standout new development is
 * MinCultura's first official cultural-heritage damage balance naming
 * Popayán's historic center among 12 affected nationally — a strong
 * heritage-restoration "new phase" signal fitting this colonial city.
 * Also surfaces Popayán institutions (its own Holy Week heritage
 * organization, its municipal youth council) organizing to help harder-hit
 * cities like Chocó, echoing Popayán's own history as the epicenter of the
 * 1983 quake that shaped Colombia's seismic building code. See
 * wiki/17-allied-resources-and-community.md "Pass 29" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass29-popayan-followup.ts`.
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
      name: 'Casa de la Moneda - Gobernación del Cauca (etapa final de la colecta)',
      address: 'Casa de la Moneda, Carrera 11 # 3-45, Centro, Popayán, Cauca',
      phone: null,
      needsText:
        'Insumos médicos urgentes (tapabocas N95, ampolletas de adrenalina y otros insumos listados en el flyer oficial) para familias afectadas por el terremoto. La Gobernación del Cauca enmarcó este llamado explícitamente como la "etapa final" de su colecta, funcionando el sábado de 9:00 a.m. a 7:00 p.m.',
      sourceUrl: 'https://www.facebook.com/GobCauca/posts/pfbid02MmRVx8aHgEgy6DoBkv6AeGVvG6J9oVFdtitpuhvgmgQizxqyNFQ2txtcKJXjirFGl',
      sourceOrg: 'Gobernación del Cauca',
      submitterNote:
        'Página oficial verificada, publicado apenas ~2 horas antes de esta revisión (el hallazgo más fresco de la pasada). Es continuación/evolución del punto de acopio en el mismo edificio reportado 4 días antes por otra cuenta - se sembró solo esta versión más reciente y específica para evitar duplicar el mismo punto dos veces.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio Junta Permanente Pro Semana Santa + Banco Arquidiocesano de Alimentos',
      address: 'Casa de la Junta Permanente Pro Semana Santa, Calle 5 #4-51, Centro, frente al Paraninfo Francisco José de Caldas, Popayán, Cauca',
      phone: null,
      needsText: 'Guantes de protección, tapabocas, elementos de protección, artículos de limpieza, agua potable, alimentos no perecederos, y medicamentos/insumos médicos no vencidos, para damnificados del terremoto.',
      sourceUrl: 'https://www.instagram.com/p/DcBbiv9O6mK/',
      sourceOrg: 'Junta Permanente Pro Semana Santa + Manos de Oro + Arquidiócesis de Popayán + Grupo Juvenil FJPPSS',
      submitterNote:
        'Alianza de cuatro cuentas institucionales identificables, publicado apenas 14 horas antes de esta revisión. La Junta Permanente Pro Semana Santa es la organización real que dirige las procesiones de Semana Santa de Popayán (Patrimonio Cultural Inmaterial de la Humanidad, UNESCO) - encaja directamente con el ángulo de instituciones patrimoniales de Popayán movilizándose para el terremoto.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Banco de Alimentos Arquidiocesano de Popayán (alianza LeaPaz)',
      address: 'Carrera 7A # 3-59, Barrio Centro, Popayán, Cauca',
      phone: null,
      needsText: 'Alimentos y otros insumos para familias damnificadas. Aportes económicos vía cuenta de ahorros Bancolombia 865-000-178-39, parte de la campaña regional LeaPaz - Legado y Acciones para la Paz (también activa en Pasto/Nariño).',
      sourceUrl: 'https://www.facebook.com/arquidiocesisdepopayan/posts/pfbid02aRXuATuLBHJub6MD3WJfmHpZMWtNnYSfmN9fuEZ9Mc6CnmrCPRS579dyPMQTZxrwl',
      sourceOrg: 'Arquidiócesis de Popayán + LeaPaz',
      submitterNote: 'Página oficial verificada de la Arquidiócesis (20K seguidores), publicado hace 2 días, con dirección y cuenta bancaria concretas.',
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
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/GobCauca/posts/pfbid02MmRVx8aHgEgy6DoBkv6AeGVvG6J9oVFdtitpuhvgmgQizxqyNFQ2txtcKJXjirFGl',
      authorHandle: 'Gobernación del Cauca',
      category: 'AID_POINT' as const,
      placeName: 'Casa de la Moneda, Popayán',
      note: 'Anuncio oficial de la "etapa final" de la colecta departamental de ayuda, solicitando insumos médicos urgentes.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBbiv9O6mK/',
      authorHandle: 'grupo_juvenil_fjppss',
      category: 'AID_POINT' as const,
      placeName: 'Popayán, Cauca',
      note: 'La Junta Permanente Pro Semana Santa (organización patrimonial de las procesiones de Semana Santa) abre un punto de acopio junto al banco de alimentos arquidiocesano.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/arquidiocesisdepopayan/posts/pfbid02aRXuATuLBHJub6MD3WJfmHpZMWtNnYSfmN9fuEZ9Mc6CnmrCPRS579dyPMQTZxrwl',
      authorHandle: 'Arquidiócesis de Popayán',
      category: 'AID_POINT' as const,
      placeName: 'Popayán, Cauca',
      note: 'Banco de alimentos arquidiocesano en alianza con la iniciativa regional LeaPaz, con dirección y cuenta bancaria.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/photo/?fbid=1693639852771314&set=a.489025026566142',
      authorHandle: 'Planeta Informativo',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hogar San Vicente de Paúl, Popayán',
      note: 'Actualización: más de 60 abuelos se benefician de la recuperación de la capilla del Hogar San Vicente de Paúl - la torre-campanario colapsada fue despejada (más de una tonelada de escombros, con apoyo del Ejército) y la capilla reabrió, aunque la evaluación estructural formal sigue pendiente y persiste un llamado abierto a donaciones/voluntariado para la reparación completa. Corroborado por un post independiente de Cauca Noticias Radio y TV documentando la remoción de escombros por el Ejército (Batallón de Apoyo de Acción Integral y Desarrollo N.3).',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://caracol.com.co/2026/08/15/el-otro-impacto-del-terremoto-estos-son-los-danos-que-deja-en-el-patrimonio-cultural-de-colombia/',
      authorHandle: 'Caracol Radio',
      category: 'OFFICIAL' as const,
      placeName: 'Popayán (sector antiguo) y patrimonio cultural nacional',
      note: 'Primer balance oficial de MinCultura sobre daños al patrimonio cultural: 40 Bienes de Interés Cultural de carácter nacional afectados en 7 departamentos (22 daño alto, 13 medio, 5 bajo); de 15 centros históricos en la zona del sismo, 12 resultaron afectados, incluyendo explícitamente "el sector antiguo de Popayán"; 39 edificaciones religiosas dañadas. La ministra Paola Holguín anuncia una "Red de Profesionales" y una resolución para agilizar las reparaciones locativas - la señal más clara de una fase de restauración patrimonial iniciando.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/reel/DcBvDF_xk-h/',
      authorHandle: 'proclamadelpacifico',
      category: 'OFFICIAL' as const,
      placeName: 'Popayán, Cauca',
      note: 'Balance oficial: Popayán reporta daños materiales pero NO registra muertos ni heridos por el sismo - cifra actualizada y específica para la ciudad, distinta del balance departamental del Cauca (239 muertos/3,755 heridos/287 desaparecidos) reportado días antes por la misma cuenta.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8nrqlKGqq/',
      authorHandle: 'cmjpopayan',
      category: 'OFFICIAL' as const,
      placeName: 'Popayán → Chocó',
      note: 'El Consejo Municipal de Juventud de Popayán recluta 4 conductores voluntarios para llevar ayuda a Chocó, con combustible y hospedaje cubiertos - Popayán actuando como ciudad de apoyo, no solo receptora.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0NHtoDu3a8HWmKgLRLsLHzUs54YS4WoHnM4vunE5RTVKiM8AXHU2MG8JQGqGv3w4el&id=100088490588217',
      authorHandle: 'Noticias Cauca',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Popayán → Chocó',
      note: '"Unidos por Chocó": jóvenes de Popayán organizaron su propia colecta y reunieron más de 7 toneladas de ayuda para enviar a Chocó, cargadas en camiones - alto compromiso orgánico (~3K reacciones, 126 comentarios, 278 compartidos).',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8VCGfFgdD/',
      authorHandle: 'arquidiocesisdepopayan_oficial',
      category: 'OFFICIAL' as const,
      placeName: 'El Tambo, Cauca',
      note: 'La Arquidiócesis de Popayán envía un mensaje de solidaridad y oración a la comunidad parroquial afectada de El Tambo, Cauca.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/noaptoco/status/2087503793172652180',
      authorHandle: '@noaptoco',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Popayán',
      note: 'Columna de opinión que compara explícitamente el terremoto de 2026 con el de Popayán en 1983, atribuyendo a ese desastre el origen del código sísmico colombiano (Decreto Ley 400 de 1984); critica la respuesta actual como menos estructural que la reconstrucción del Eje Cafetero tras Armenia 1999.',
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
