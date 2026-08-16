/**
 * Pass 78 (2026-08-16) — round 6 continues, Pijao. Six prior passes
 * (37, 38, 39, 44, 54, 68) already covered this dual earthquake+wildfire
 * crisis city. All five research agents converged independently on the
 * same story — El Quindiano's "Génova registra 500 afectaciones por el
 * terremoto y Pijao 217, además afrontan incendios" (2026-08-15) — giving
 * this pass unusually strong corroboration for a small town.
 *
 * TOLL: first-ever precise Pijao earthquake housing-damage figure beyond
 * the pass-38a baseline (73 predios afectados, 7 colapsados, as of Aug
 * 12) — the Alcaldía's own updated count now stands at 217 viviendas
 * (114 urban + 103 rural), a real escalation from four more days of
 * damage assessment, not a contradiction. Logged as a new row per the
 * project's append-only toll discipline.
 *
 * AID POINTS: two new, both run directly by the Alcaldía itself rather
 * than the NGO/private drives seeded in prior passes — a construction-
 * materials collection point tied to the 217-home damage count, and a
 * separate bank-transfer key for fire-relief donations.
 *
 * WILDFIRE STATUS: still NOT extinguished as of the most recent evidence
 * (Aug 15) — unchanged from pass 68's "reignited, spread into Génova"
 * status, but with real new detail: a sitting congressman (Miguel
 * Grisales) posted from the fire ground requesting AERIAL firefighting
 * because ground crews still can't reach the terrain, and relayed a new,
 * serious claim from local residents that the fires may have been
 * deliberately set — he's formally asked Policía/Fiscalía to
 * investigate. Reported as an allegation under investigation, not as an
 * established fact. A new compounding hazard also surfaced: Pijao is now
 * also dealing with windstorms ("fuertes vendavales") on top of the
 * quake and fire.
 * See wiki/17-allied-resources-and-community.md "Pass 78" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass78-pijao-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pijao = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63548' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de Acopio Municipal de Pijao (Secretaría de Gobierno)',
      address: 'Secretaría de Gobierno, Alcaldía de Pijao, Quindío',
      phone: null,
      needsText: 'Materiales de reconstrucción para las 217 viviendas afectadas (114 urbanas, 103 rurales, algunas inhabitables): tejas de zinc, tejas de eternit, tejas de barro, plástico, ladrillo y cemento. También, por un volante oficial de la Alcaldía, artículos de emergencia para familias damnificadas: alimentos no perecederos, colchones/colchonetas, agua potable y cobijas.',
      sourceUrl: 'https://elquindiano.com/noticia/273232/genova-registra-500-afectaciones-por-el-terremoto-y-pijao-217-ademas-afrontan-incendios/',
      sourceOrg: 'Administración Municipal de Pijao',
      submitterNote: 'Corroborado de forma independiente por los cinco agentes de esta pasada, todos citando el mismo artículo de El Quindiano, y reforzado por un volante oficial de la Alcaldía reposteado en X. Distinto de los cuatro puntos de ayuda ya conocidos (colecta Nequi de MMQ, campaña de la Sociedad Quindiana de Ornitología, esfuerzo de Pijao Trail, brigadas médica y ARCA de Fundación SOS Internacional) — este es el primer centro de acopio dirigido directamente por el gobierno municipal.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Alcaldía de Pijao — llave de transferencia @GLP760 (ayuda incendio La Maicena)',
      address: null,
      phone: null,
      needsText: 'Llave de transferencia bancaria publicada en la cuenta oficial de Instagram de la Alcaldía (@alcaldiadepijaoq) para donaciones monetarias destinadas a familias y animales afectados por el incendio de La Maicena.',
      sourceUrl: 'https://x.com/unamarcelita/status/2088235787242328197',
      sourceOrg: 'Alcaldía de Pijao',
      submitterNote: 'Conocido solo por un repost de segunda mano de la cuenta amplificadora @unamarcelita (133K seguidores, patrón ya usado en hallazgos previos de este proyecto), con el nombre de cuenta y diseño de la alcaldía visibles en la imagen incrustada. Confianza media por ser una fuente secundaria, no un fetch directo de la cuenta oficial. Distinto de la colecta Nequi de MMQ "Pijao Nos Necesita" ya conocida — este canal lo administra directamente el gobierno municipal.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: pijao.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pijao.id,
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
      permalink: 'https://x.com/MiguelGrisalesS',
      authorHandle: '@MiguelGrisalesS',
      category: 'OFFICIAL' as const,
      placeName: 'Vereda La Topacia, Génova (límite con Pijao)',
      note: 'El representante a la Cámara por el Quindío, Miguel Grisales, publica desde la zona del incendio (15 de agosto): el fuego "sigue avanzando con fuerza" pese al trabajo de bomberos y Defensa Civil, y pide apoyo AÉREO de la Fuerza Aérea y UNGRD porque el acceso terrestre sigue siendo imposible por el terreno. Añade un hallazgo nuevo: reportes de la población de que los incendios serían "presuntamente provocados", y solicita formalmente a la Policía y la Fiscalía investigar. Se documenta como denuncia bajo investigación, no como hecho confirmado.',
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
        municipioId: pijao.id,
        placeName: p.placeName ?? undefined,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    postsCreated++
  }
  console.log(`PendingSocialPost: ${postsCreated} created`)

  const sourceUrl = 'https://elquindiano.com/noticia/273232/genova-registra-500-afectaciones-por-el-terremoto-y-pijao-217-ademas-afrontan-incendios/'
  const sourceOrg = 'El Quindiano, citando a la Alcaldía de Pijao'
  let src = await prisma.source.findFirst({ where: { url: sourceUrl } })
  if (!src) {
    src = await prisma.source.create({ data: { url: sourceUrl, org: sourceOrg, tier: 2 } })
    console.log('Created Source: elquindiano_pijao_217viviendas_0815')
  }

  const tollDefs = [
    {
      metric: 'VIVIENDAS_AVERIADAS' as const,
      value: 217,
      asOf: '2026-08-15T12:00:00-05:00',
      tier: 2,
      notes: 'Cifra actualizada de la propia Alcaldía de Pijao, vía El Quindiano: "217 viviendas han resultado afectadas por el terremoto: 114 en zona urbana y 103 en zona rural, algunas de ellas con daños estructurales que las hacen inhabitables." Aumento real frente al conteo de la pasada 38a (73 predios afectados, 7 colapsados, 12 de agosto) tras cuatro días adicionales de evaluación de daños, no una contradicción. La fuente no desglosa cuántas de las 217 son colapso total frente a daño parcial — se registra bajo VIVIENDAS_AVERIADAS como total combinado, con esta ambigüedad documentada aquí para que una futura pasada la resuelva si aparece un desglose oficial.',
    },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: pijao.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: pijao.id,
        metric: t.metric,
        value: t.value,
        sourceId: src.id,
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    tollCreated++
  }
  console.log(`TollRecord: ${tollCreated} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
