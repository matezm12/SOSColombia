/**
 * Pass 68 (2026-08-15) — Pijao's sixth research pass and the final city
 * in round 5. Heavy dedup: three of this round's four "new" aid-point
 * leads turned out to already be on file — the MMQ "Pijao Nos Necesita"
 * Nequi drive (pass 37c), the Sociedad Quindiana de Ornitología campaign
 * (pass 54), and Pijao Trail's farm-visit solidarity effort (pass 38b) —
 * all re-confirmed/enriched rather than re-seeded. Only one aid point is
 * genuinely new: Fundación SOS Internacional's animal-rescue unit
 * ("ARCA"), distinct from the same foundation's human-medical brigade
 * already seeded in pass 38b.
 *
 * The main story this pass resolves the wildfire status left contested
 * in pass 54 (a congressman saying it "continues to advance with force"
 * vs. a same-day report claiming "extinguido"). Neither was quite right:
 * the fire saw a genuine partial containment win in its original zone
 * (Sinabrio/La Maicena) around Aug 13, but a separate front in vereda El
 * Jardín stayed active, and by Aug 14 the whole complex had reignited
 * and spread across the municipal line into Génova — ~200 hectares in
 * Pijao, ~30 in Génova, one (unoccupied) house lost, crews reduced to
 * garden hoses because trucks can't reach the terrain. As of the
 * morning of this pass (Aug 15), a sitting congressman posting from the
 * fire ground confirms it is still not extinguished.
 *
 * Missing persons and Pijao-specific scam reports were checked for a
 * sixth consecutive pass and remain genuinely empty — a valid, expected
 * null result for a town this size, not a coverage gap.
 * See wiki/17-allied-resources-and-community.md "Pass 68" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass68-pijao-round5.ts`.
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
      kind: 'VET' as const,
      name: 'Fundación SOS Internacional y Rescate Colombia — Unidad ARCA (Atención, Rescate y Cuidado Animal)',
      address: 'Vereda La Maicena y otros sectores afectados por el incendio, Pijao y Génova, Quindío (unidad móvil, sin dirección fija)',
      phone: null,
      needsText: 'Unidad veterinaria/de rescate de fauna móvil, activada en coordinación con las Gestoras Sociales municipales. En su primera intervención atendió 30 animales: 27 mascotas domésticas (perros/gatos) y 3 animales silvestres (un cuchicuchi, una ardilla y un loro), con curación de heridas, alimento y medicinas.',
      sourceUrl: 'https://www.facebook.com/Lamultitudtv/posts/pfbid0okQzjy4XgXp23hzfqk4tviejm3Li7g5UXYy6uMXEouQDk8dveRh1315QpRqGpo1Xl',
      sourceOrg: 'Fundación SOS Internacional y Rescate Colombia',
      submitterNote: 'Distinta de la brigada médica humana de la misma fundación ("Fundación SOS Internacional + Red Salud Armenia") ya sembrada en la pasada 38b — esta es una unidad especializada nueva, de rescate y cuidado animal, no antes documentada. También distinta de la brigada veterinaria departamental (30 animales/6 cachorros) y de Fundación Kenovy, ambas ya conocidas.',
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
      permalink: 'https://x.com/PactoHistorico/status/2088624831348515181',
      authorHandle: '@PactoHistorico (citando a @MiguelGrisalesS)',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao / vereda La Topacia, Génova, Quindío',
      note: 'RESUELVE EL ESTADO CONTESTADO DEL INCENDIO de la pasada 54: publicación de esta misma mañana (15 de agosto, 9:52am) del representante Miguel Grisales, desde el terreno del incendio — "Los incendios forestales en la cordillera SIGUEN AVANZANDO CON FUERZA". Confirma daños ya registrados tanto en La Topacia (Génova) como en Pijao, y pide formalmente apoyo a la UNGRD. El fuego NO está extinguido a esta fecha.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Ejercito_Div5/status/2087986798160916642',
      authorHandle: '@Ejercito_Div5',
      category: 'OFFICIAL' as const,
      placeName: 'Vereda La Maicena, Pijao, Quindío',
      note: 'Detalle nuevo no antes documentado: tropas del Batallón de Montaña No. 5 (5ª División del Ejército) apoyan activamente a Bomberos, Defensa Civil y la unidad de gestión del riesgo en las labores de extinción en La Maicena — confirma despliegue militar formal y que el incendio seguía sin controlar al 13 de agosto.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db9w2hEsq8u/',
      authorHandle: 'alcaldiadepijaoq',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao, Quindío',
      note: 'Comunicado oficial del alcalde John Jairo Restrepo (13 de agosto): el incendio en las veredas Sinabrio y La Maicena fue "parcialmente controlado" gracias al trabajo conjunto de bomberos de Pijao, La Tebaida, Buenavista, Córdoba, Génova y Armenia más el Ejército — PERO un incendio separado sigue activo en la vereda El Jardín, límite con Génova, atendido por los bomberos de Génova.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/cronicadelquindio/posts/pfbid0RAsny1g5Sex2gQ1cNe78JaBAqdcUNsEc76h5kR2DgdM6P1xiEttfKZEwe4smvLJyl',
      authorHandle: 'La Crónica del Quindío',
      category: 'OFFICIAL' as const,
      placeName: 'Génova / Pijao, Quindío',
      note: 'Reportaje de campo del 14 de agosto, la fuente más detallada de esta pasada: el incendio que inició el 11 de agosto en el sector Cueva Loca (Pijao) se reavivó durante la noche y cruzó hacia Génova (Cueva Loca, La Topacia Alta y Baja); ~200 hectáreas afectadas en Pijao y ~30 en Génova (estimación sin medición técnica); una vivienda deshabitada destruida. El alcalde de Génova, Diego Fernando Sicua Galvis, describe a la comunidad improvisando con mangueras de jardín y tanques de agua porque los carrotanques no pueden llegar al terreno.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid033CcPTqdQMxnsg3rpBA72aSiWhrZSWwBqkt4cSU79C1qrpotApfiEJS2okiiRS6uGl&id=61592658691922',
      authorHandle: 'Bomberos Voluntarios Pijao',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao, Quindío',
      note: 'Comunicado oficial del 13 de agosto: el cuerpo de bomberos dice trabajar sin descanso en contención, enfriamiento y vigilancia, declarando explícitamente que el control TOTAL aún no se ha logrado ("no bajamos la guardia"), y pide a la comunidad no difundir rumores.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@brandoncarvajal495/video/7673317876043992341',
      authorHandle: 'brandoncarvajal495',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pijao, Quindío',
      note: 'Relato de primera mano de un voluntario combatiendo el incendio: "apagamos una parte pero la otra no pudimos... el humo nos sacó" — describe el esfuerzo como en curso e incompleto, con el humo obligando a los voluntarios a retirarse. Corrobora desde el terreno la cobertura oficial y de prensa de un incendio parcialmente contenido pero aún activo.',
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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
