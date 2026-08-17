/**
 * First Vereda seed pass (2026-08-16). The national DANE/IGAC vereda-code
 * layer is not currently reachable (checked IGAC's own MapServer -- the
 * "veredascolombia" service has been removed/renamed; sigi.igac.gov.co's
 * mirror is real but returning 500 "not started"; a regional ArcGIS copy
 * only covers Norte de Santander; datos.gov.co's candidates are either
 * gone (404) or require a login) -- so this pass seeds only veredas
 * already named in our OWN sourced data (real AidPoints and promoted
 * SocialPosts), with `codigoVereda: null`. Revisit the bulk DANE import
 * later if/when sigi.igac.gov.co comes back up (same posture as the
 * still-pending Manizales/Cali comuna-boundary servers).
 *
 * Explicitly NOT seeded this pass, left for a follow-up:
 * - "Vereda La Topacia" -- two independent posts describe it as being in
 *   Génova, Quindío, "on the border with Pijao" -- Génova isn't one of
 *   our 12 tracked municipios, and the vereda administratively belongs to
 *   it, not Pijao. Attaching it to Pijao would mislabel it.
 * - "Corregimiento de San Pedro de Ingará" (San José del Palmar) and
 *   "corregimiento de La Florida" (Pereira) -- both real, but only
 *   attested in PendingAidPoint rows still awaiting moderator approval,
 *   not yet a real AidPoint with its own Source row.
 * - "Buenaventura (veredas rurales)" -- too generic, no actual vereda name.
 * - A Manizales AidPoint about the Coliseo Mayor animal shelter matched
 *   the initial broad text search but doesn't actually name a vereda --
 *   false positive from the substring match, excluded.
 *
 * Run once via `npx tsx prisma/seed-veredas-pass1.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

function slugify(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

type VeredaDef = {
  municipioDivipola: string
  name: string
  // Either reuse an existing AidPoint's Source, or create a new one from a social post permalink
  sourceId?: string
  newSource?: { url: string; org: string; tier: number }
  linkAidPointIds?: string[]
}

const VEREDAS: VeredaDef[] = [
  { municipioDivipola: '66170', name: 'Santa Ana', sourceId: 'cmstsszfb003iw07kbqepx8c8', linkAidPointIds: ['cmstsszib003jw07kbjf2pnic'] },
  { municipioDivipola: '66170', name: 'La Esmeralda', sourceId: 'cmststsrw003mw07ktj2suua0', linkAidPointIds: ['cmststsv3003nw07kz6aex522'] },
  { municipioDivipola: '66001', name: 'El Chocho', sourceId: 'cmssax2is000k8c7khedty81w', linkAidPointIds: ['cmssax2q6000l8c7kc06suf1z'] },
  { municipioDivipola: '66001', name: 'Santa Ana Baja', sourceId: 'cmssjy5v5001v3g7ke4p3aeeb', linkAidPointIds: ['cmssjy5xa001w3g7kf780svzi'] },
  { municipioDivipola: '63548', name: 'La Mariela', sourceId: 'cmswgrtff000904l8d2x43qho', linkAidPointIds: ['cmswgrth8000a04l8wlozflk4'] },
  { municipioDivipola: '63548', name: 'La Maicena', sourceId: 'cmswgrqmm000604l87szx2jwq', linkAidPointIds: ['cmswgrqog000704l86kgwbdpw'] },
  {
    municipioDivipola: '63548',
    name: 'Sinabrio',
    newSource: { url: 'https://www.instagram.com/p/Db9w2hEsq8u/', org: 'Instagram (testigo local) — vía captura de red social', tier: 4 },
  },
  {
    municipioDivipola: '63548',
    name: 'El Jardín',
    newSource: { url: 'https://www.instagram.com/p/Db9w2hEsq8u/', org: 'Instagram (testigo local) — vía captura de red social', tier: 4 },
  },
  {
    municipioDivipola: '73001',
    name: 'Charco Rico Alto',
    newSource: { url: 'https://www.tiktok.com/@ecosdelcombeima790am/video/7673664031986568468', org: 'Ecos del Combeima 790 AM (TikTok)', tier: 4 },
  },
  {
    municipioDivipola: '17001',
    name: 'Combia Baja',
    newSource: { url: 'https://www.instagram.com/jorgeerojasg/p/Db9IrxhCVSt/', org: 'Instagram (@jorgeerojasg)', tier: 4 },
  },
  {
    municipioDivipola: '17001',
    name: 'Arabia',
    newSource: { url: 'https://www.instagram.com/jorgeerojasg/p/Db9IrxhCVSt/', org: 'Instagram (@jorgeerojasg)', tier: 4 },
  },
  {
    municipioDivipola: '17001',
    name: 'Altagracia',
    newSource: { url: 'https://www.instagram.com/jorgeerojasg/p/Db9IrxhCVSt/', org: 'Instagram (@jorgeerojasg)', tier: 4 },
  },
]

async function main() {
  const sourceCache = new Map<string, string>()
  let veredaCreated = 0
  let aidPointsLinked = 0

  for (const v of VEREDAS) {
    const municipio = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: v.municipioDivipola } })

    let sourceId = v.sourceId
    if (!sourceId && v.newSource) {
      const cacheKey = v.newSource.url
      if (sourceCache.has(cacheKey)) {
        sourceId = sourceCache.get(cacheKey)!
      } else {
        let src = await prisma.source.findFirst({ where: { url: v.newSource.url } })
        if (!src) {
          src = await prisma.source.create({ data: v.newSource })
          console.log(`Created Source: ${v.newSource.org}`)
        }
        sourceId = src.id
        sourceCache.set(cacheKey, sourceId)
      }
    }
    if (!sourceId) throw new Error(`No source resolved for vereda ${v.name}`)

    const slug = slugify(v.name)
    let vereda = await prisma.vereda.findFirst({ where: { municipioId: municipio.id, slug } })
    if (!vereda) {
      vereda = await prisma.vereda.create({
        data: { municipioId: municipio.id, name: v.name, slug, sourceId, kind: 'VEREDA' },
      })
      veredaCreated++
      console.log(`Created Vereda: ${v.name} (${municipio.name})`)
    }

    for (const aidPointId of v.linkAidPointIds ?? []) {
      await prisma.aidPoint.update({ where: { id: aidPointId }, data: { veredaId: vereda.id } })
      aidPointsLinked++
    }
  }

  console.log(`\nVereda: ${veredaCreated} created`)
  console.log(`AidPoint: ${aidPointsLinked} linked`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
