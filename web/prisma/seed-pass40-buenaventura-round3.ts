/**
 * Pass 40 (2026-08-15) — third research pass on Buenaventura, run within
 * ~24h of the pass-28 follow-up. The hospital ship "Benkos Biohó"
 * accountability story from pass 28 resolves: DIMAR's own account
 * confirms it's now operating a surgical unit at a dedicated Buenaventura
 * pier. A new, Buenaventura-specific QR-donation scam surfaced (distinct
 * from the Pereira one already documented) targeting a separate Jhonny
 * Rivera relief effort. Casualty figures remain unresolved and, if
 * anything, more fragmented than before — deliberately left undocumented
 * in TollRecord rather than forced to one number. See
 * wiki/17-allied-resources-and-community.md "Pass 40" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass40-buenaventura-round3.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const buenaventura = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76109' } })

  const aidPoints = [
    {
      kind: 'HEALTH' as const,
      name: 'Buque Hospital Benkos Biohó (Muelle de Señalización Marítima del Pacífico - DIMAR)',
      address: 'Muelle de Señalización Marítima del Pacífico (SEMAP), operado por DIMAR, Buenaventura',
      phone: null,
      needsText: 'Buque hospital ahora confirmado operando activamente: quirófano abierto, atendiendo pacientes del terremoto. Coordinación conjunta entre DIMAR, el Ministerio de Salud, la Alcaldía de Buenaventura y el Hospital Luis Ablanque de la Plata.',
      sourceUrl: 'https://www.facebook.com/DimarColombia/posts/pfbid02MZX5E3JrV9LTGetoEhZKsBsXbrTq77TdCZV88wAHDEbZdjtwFxECKstQoNGVrPC8l',
      sourceOrg: 'Dirección General Marítima (DIMAR)',
      submitterNote:
        'RESUELVE la controversia de rendición de cuentas documentada en la pasada 28 (el buque llevaba días sin desplegarse por contratos de personal no renovados). Confirmado por DIMAR (autoridad marítima oficial), el interventor del hospital (Dacio Saá Carabalí) y el Capitán de Puerto, y corroborado por el propio Gustavo Petro reconociendo que se contrató al personal. La disputa política sobre de quién fue la culpa del retraso continúa, pero el estado operativo (el buque ya atiende pacientes) está confirmado por múltiples fuentes institucionales independientes.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fondo de Reconstrucción S.O.S. Pacífico (Manos Visibles)',
      address: 'Donaciones vía manosvisibles.org (PSE, tarjeta débito/crédito); operaciones confirmadas en terreno en Buenaventura',
      phone: 'BIZUM 608416996 · NEQUI 3042676204 · PayPal (por DM)',
      needsText: 'Cuatro líneas: (1) salud mental, con la organización MentalMente; (2) reparación no estructural de vivienda en Buenaventura y Chocó, vía "Espacios de Vida" en alianza con la Escuela Taller de Buenaventura; (3) apoyo psicosocial para niñez y madres gestantes ("Tejido Social"), priorizando barrios de Buenaventura donde la ayuda ha sido insuficiente; (4) centros comunitarios de conectividad (antenas satelitales, paneles solares).',
      sourceUrl: 'https://www.valoraanalitik.com/tras-el-terremoto-lanzan-un-fondo-para-reconstruir-choco-y-buenaventura-estas-seran-las-cuatro-prioridades/',
      sourceOrg: 'Corporación Manos Visibles (presidenta Paula Moreno, ex Ministra de Cultura)',
      submitterNote:
        'ONG establecida con 16+ años de trayectoria en equidad afrocolombiana/indígena en el Pacífico. Corroborado por Valora Analitik, Yahoo Noticias y Zonabien (fuentes independientes, mismo día), y por la propia Paula Moreno confirmando en persona desde Buenaventura ("Manos a la obra. Ya estamos en Buenaventura"). Ya movilizó 35+ toneladas de ayuda a Quibdó y San José del Palmar.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: buenaventura.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: buenaventura.id,
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
      permalink: 'https://x.com/petrogustavo/status/2088451679280664612',
      authorHandle: '@petrogustavo',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'El expresidente Gustavo Petro reconoce que el gobierno actual finalmente contrató al personal de salud del buque hospital Benkos Biohó, que ahora "zarpa a servir al pueblo del Pacífico colombiano" - mantiene viva la disputa política sobre la responsabilidad del retraso, aunque el estado operativo del buque ya está confirmado por fuentes institucionales.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/monita.mol.castellanos/posts/pfbid02F558hSjiPzpHwfw1EebPrL6Pdt4hu4fbzgGZ3uzBqAVQm2rJy6QH2oar2xQKmo4Dl',
      authorHandle: 'Monita Mol Castellanos',
      category: 'NEED' as const,
      placeName: 'Buenaventura',
      note: 'NUEVA ESTAFA (distinta de la ya documentada en Pereira): estafadores copiaron el llamado real de donación del cantante Jhonny Rivera para el terremoto en Buenaventura (con un número Nequi propio) y circulan un código QR falsificado bajo su nombre. Corroborado por el propio Jhonny Rivera en su cuenta verificada y por Noticias RCN. Verificar cualquier QR/canal de donación directamente con fuentes oficiales antes de donar.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/libiamosquerav/status/2088520535797895352',
      authorHandle: '@libiamosquerav',
      category: 'NEED' as const,
      placeName: 'Buenaventura',
      note: 'Las cifras de víctimas para Buenaventura siguen sin resolverse - de hecho, más fragmentadas que antes: en esta sola pasada circularon cifras distintas de 10, 13, 16, 22 y 26 muertos atribuidas específicamente a Buenaventura, ninguna de fuente oficial única y consolidada. No se registra ninguna como TollRecord dado el desacuerdo activo entre fuentes.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/NotiAlPunto/posts/pfbid02gGdYmkMYmW21SLKHsDyp71RNmtgnY2MBw3MhPv2aCCeiuiALbdNkcqYeWzysY9s5l',
      authorHandle: 'Noticias Al Punto, Región Pacífico',
      category: 'OFFICIAL' as const,
      placeName: 'Barrio Lleras (comuna 3), Buenaventura',
      note: 'El Ministro del Interior Rodrigo Lara y el Vicepresidente José Manuel Restrepo visitaron el Puesto de Mando Unificado de Buenaventura y recorrieron el barrio Lleras (comuna 3, barrio palafítico), donde más de 800 viviendas fueron destruidas o colapsadas. Familias siguen bajo carpas necesitando albergue, alimentación y baños portátiles; el Ministerio de Vivienda liderará una fase de reconstrucción una vez se estabilice la respuesta de emergencia, con participación de la comunidad dado el carácter palafítico del barrio.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.telesurtv.net/colombia-emergencia-vivienda-buenaventura-sismo/',
      authorHandle: 'teleSUR',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'Citando a la Alcaldía Distrital de Buenaventura: 3,956 viviendas reportadas destruidas o dañadas, generando una emergencia habitacional que está desplazando a familias de sus hogares.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCSONZm1Qi/',
      authorHandle: 'soydebuenaventura',
      category: 'OFFICIAL' as const,
      placeName: 'Valle del Cauca (departamental)',
      note: 'La Gobernadora del Valle del Cauca, Dilian Francisca Toro, declaró 3 días de duelo oficial y convocó un Minuto de Silencio departamental para el sábado 15 de agosto a las 12:00 m., citando más de 150 muertos en el departamento por el terremoto - cifra departamental, no resuelve el conflicto de cifras específico de Buenaventura.',
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
        municipioId: buenaventura.id,
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
