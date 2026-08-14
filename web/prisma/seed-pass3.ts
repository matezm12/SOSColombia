/**
 * One-off loader for the third research pass (2026-08-14) — TikTok, Facebook,
 * X/Twitter, and new allied-resource sites. See
 * wiki/17-allied-resources-and-community.md "Pass 3" for full context.
 * Run once via `npx tsx prisma/seed-pass3.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const cali = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76001' } })
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })
  const armenia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63001' } })
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  // ── Allied resources ─────────────────────────────────────────────────
  const alliedResourceDefs = [
    {
      name: 'Desaparecidos.co',
      url: 'https://desaparecidos.co',
      org: 'Independiente — plataforma ciudadana sin atribución visible',
      description:
        'Segundo registro independiente de personas desaparecidas/reencuentro familiar para este sismo — ~4.890 casos en 8 ciudades, más localizador de hospitales, recursos legales y búsqueda de mascotas perdidas.',
      category: 'AID_DIRECTORY' as const,
      hostingNoCustomDomain: false,
      tier: 4,
      notes:
        'Verificado en vivo con conteos de casos activos e incrementando, distintos de los números de Colombia Te Busca. Referencia números de emergencia reales (123/112/119/132/144/141). Sin atribución de autoría visible en el sitio — tratar el origen como desconocido aunque el contenido parece legítimo.',
    },
    {
      name: 'Colombia Te Busca',
      url: 'https://colombiatebusca.com',
      org: 'Plataforma ciudadana voluntaria (soporte técnico: Software Para Ti)',
      description:
        'Registro de personas desaparecidas/reencuentro familiar, ahora activamente usado para casos del sismo (muchas entradas etiquetadas "Terremoto"), con botones de compartir por WhatsApp/X por cada listado.',
      category: 'AID_DIRECTORY' as const,
      hostingNoCustomDomain: false,
      tier: 4,
      notes:
        'Ya citado como fuente (tier 5) para una cifra específica en el registro de investigación — esta entrada lo agrega como recurso completo al directorio /recursos. Confirmado en vivo (2026-08-13): 5.353 personas registradas (4.239 desaparecidas, 1.110 localizadas). Página de Facebook activa: facebook.com/colombiatebuscaoficial.',
    },
    {
      name: 'Terremoto Colombia 2026 (dashboard + directorio)',
      url: 'https://terremoto-colombia-2026.vercel.app',
      org: 'Independiente — desarrollador individual (GitHub: jdramirezzu)',
      description:
        'Panel de cifras oficiales de víctimas/daños con seguimiento en el tiempo, más un directorio de canales oficiales verificados para reportar daños, pedir ayuda, donar y ser voluntario, cruzando UNGRD/SGC/Cruz Roja/Defensa Civil.',
      category: 'AID_DIRECTORY' as const,
      hostingNoCustomDomain: true,
      tier: 4,
      notes:
        'En vivo y funcional, cita fuentes reales (El Tiempo, Semana, director de UNGRD), cubre los 5 departamentos correctos. El propio sitio se describe como "en construcción" — no verificado en profundidad contra fuentes primarias.',
    },
    {
      name: 'Terremoto Colombia (estimación de daños satelital)',
      url: 'https://terremotocolombia.vercel.app',
      org: 'Independiente — desarrollador individual (Jorge Galindo)',
      description:
        'Cuantifica el impacto del sismo usando datos satelitales Copernicus EMS Rapid Mapping (EMSR916) y USGS ShakeMap combinados con estadísticas de vulnerabilidad de vivienda en 650 municipios; se actualiza diariamente vía GitHub Actions.',
      category: 'MAP_TRACKER' as const,
      hostingNoCustomDomain: true,
      tier: 5,
      notes:
        'En vivo y funcional, usa productos de datos satelitales reales con atribución, epicentro/magnitud/fecha correctos. Construido por un desarrollador individual, no una universidad/institución — el propio sitio se etiqueta como "estimación-proxy", no verdad de campo. Análogo grassroots al dataset de daño de edificios de Microsoft AI for Good ya documentado en wiki/13-opensource-tools.md.',
    },
  ]

  for (const r of alliedResourceDefs) {
    const existing = await prisma.alliedResource.findFirst({ where: { url: r.url } })
    if (existing) {
      console.log(`Skipping AlliedResource ${r.name} — already seeded`)
      continue
    }
    await prisma.alliedResource.create({
      data: {
        name: r.name,
        url: r.url,
        org: r.org,
        description: r.description,
        category: r.category,
        hostingNoCustomDomain: r.hostingNoCustomDomain,
        tier: r.tier,
        notes: r.notes,
        lastCheckedAt: new Date('2026-08-14'),
      },
    })
    console.log(`Created AlliedResource: ${r.name}`)
  }

  // ── Community embeds (PendingSocialPost) ────────────────────────────
  const socialPosts = [
    // TikTok
    {
      platform: 'TIKTOK',
      permalink: 'https://www.tiktok.com/@musicalifyco/video/7672817132932959509',
      authorHandle: '@musicalifyco',
      category: 'HUMAN_INTEREST',
      municipioId: quibdo.id,
      placeName: null,
      note: 'Cobertura del futbolista Jhon Arias (oriundo de Quibdó) y su esposa Alejandra Ayala, quienes fletaron aviones privados con médicos e insumos hacia hospitales de Quibdó dañados por el sismo. Corroborado por 8+ medios (El Espectador, Infobae, Vanguardia, RCN Deportes). Confianza alta.',
    },
    {
      platform: 'TIKTOK',
      permalink: 'https://www.tiktok.com/@noti90minutos/video/7672834416812510484',
      authorHandle: '@noti90minutos',
      category: 'AID_POINT',
      municipioId: cali.id,
      placeName: 'Ciudadela Petronio Álvarez (Unidad Deportiva Alberto Galindo)',
      note: 'Anuncia que la Ciudadela Petronio Álvarez en Cali comenzó a operar como centro de acopio desde el miércoles 12 de agosto de 2026. Publicado por 90 Minutos, medio establecido de Cali/Valle del Cauca (274.5K seguidores). Ver también PendingAidPoint del mismo lugar. Confianza media-alta.',
    },
    {
      platform: 'TIKTOK',
      permalink: 'https://www.tiktok.com/@cambiamoscolombia/video/7673188327528451349',
      authorHandle: '@cambiamoscolombia',
      category: 'NEED',
      municipioId: quibdo.id,
      placeName: null,
      note: '"Quibdó pide ayuda urgente tras el terremoto" — residentes describen necesidad urgente de agua, medicamentos, alimentos y suministros básicos. Cuenta de noticias independiente identificable, no solicita dinero directamente (reduce riesgo de estafa). Confianza media.',
    },
    {
      platform: 'TIKTOK',
      permalink: 'https://www.tiktok.com/@full_cali/video/7672450503560711431',
      authorHandle: '@full_cali',
      category: 'HUMAN_INTEREST',
      municipioId: cali.id,
      placeName: null,
      note: 'Reporta "cientos de voluntarios" trabajando entre escombros horas después del sismo M7.4. Cuenta de periodismo ciudadano establecida en Cali que suele etiquetar cuentas oficiales de la ciudad. Confianza media.',
    },
    // Facebook
    {
      platform: 'FACEBOOK',
      permalink: 'https://www.facebook.com/profile.php?id=61576985583491',
      authorHandle: 'Kilele - Fundación',
      category: 'AID_POINT',
      municipioId: quibdo.id,
      placeName: 'Fundación Kilele',
      note: 'Fundación pequeña de Quibdó (salud mental juvenil, educación, cultura) publicó "Juntos por Quibdó. Juntos por Chocó." con enlace de donación/llave Bre-B funcional. Tiene sitio propio (fundacionkilele.org) con página de donación en vivo, misión preexistente al sismo. Confianza alta.',
    },
    {
      platform: 'FACEBOOK',
      permalink: 'https://www.facebook.com/profile.php?id=100068557176693',
      authorHandle: 'Fundación CHOCÓ TE Quiere',
      category: 'AID_POINT',
      municipioId: quibdo.id,
      placeName: 'Fundación CHOCÓ TE Quiere',
      note: 'ONG local de Quibdó (1.6K seguidores) publicó "Un granito de esperanza" tras el sismo, con contacto de donación por WhatsApp público. Ubicación etiquetada en Quibdó, misión de bienestar comunitario preexistente. Confianza media-alta.',
    },
    {
      platform: 'FACEBOOK',
      permalink: 'https://www.facebook.com/udecaldas',
      authorHandle: 'Universidad de Caldas (página oficial)',
      category: 'OFFICIAL',
      municipioId: manizales.id,
      placeName: 'Coliseo Universidad de Caldas (sector Velódromo)',
      note: 'Página oficial de la universidad (84K seguidores) publicó "Comunicado Institucional No. 3" confirmando la activación de su Coliseo como centro de acopio, con 300+ voluntarios. Corroborado por artículo independiente de La Patria. Ver también PendingAidPoint del mismo lugar. Confianza alta.',
    },
    {
      platform: 'FACEBOOK',
      permalink: 'https://www.facebook.com/photo/?fbid=1713031534202029&set=a.464227399082455',
      authorHandle: 'ACOPI Caldas (acopiseccionalcaldas)',
      category: 'NEED',
      municipioId: manizales.id,
      placeName: 'ACOPI Caldas',
      note: 'Asociación regional de pequeñas/medianas empresas (9.4K seguidores, oficina física en Av. Panamericana) publicó "¡Tu ayuda es vital!" invitando a la comunidad empresarial a su campaña de solidaridad. Sitio propio (acopicaldas.org.co), dirección física verificable. Confianza alta.',
    },
    {
      platform: 'FACEBOOK',
      permalink: 'https://www.facebook.com/630CAFESEISTREINTACAFE',
      authorHandle: 'Comunicaciones Seistreintacafé (630 Café)',
      category: 'OFFICIAL',
      municipioId: manizales.id,
      placeName: null,
      note: 'Medio comunitario de Manizales (4.3K seguidores, sitio propio 630cafe.com.co) republica gráficas actualizadas de horarios/direcciones de centros de acopio de la Alcaldía de Manizales (La Avanzada, Chipre, Milán, Av. Santander) y lista de necesidades actuales. Coincide con gráficas oficiales de la Alcaldía. Confianza alta — útil como fuente agregada, direcciones exactas no capturadas (solo nombres de barrio).',
    },
    {
      platform: 'FACEBOOK',
      permalink: 'https://www.facebook.com/FUNDACIONMANOSUNIDASDDIOS',
      authorHandle: 'Fundación Manos Unidas de Dios',
      category: 'NEED',
      municipioId: armenia.id,
      placeName: 'Fundación Manos Unidas de Dios',
      note: 'ONG de cuidado del adulto mayor en Armenia (5.4K seguidores) solicita apoyo post-sismo, conectada con una página de ayuda eclesiástica internacional. Sitio propio (fundacionmanosunidasdedios.org), misión preexistente al sismo. Confianza media-alta.',
    },
    {
      platform: 'FACEBOOK',
      permalink: 'https://www.facebook.com/profile.php?id=100023152181503',
      authorHandle: 'Comunidad La Finca y Zona Norte Madrid',
      category: 'AID_POINT',
      municipioId: null,
      placeName: 'Salón Social Manzana 2, La Finca, Madrid (Cundinamarca)',
      note: 'Página comunitaria de barrio en Madrid, Cundinamarca (no España — corrección de una lectura inicial errónea; no es un grupo de la diáspora) organiza "Colombia Nos Necesita", jornada de donación en especie (12-17 agosto), solo artículos, no dinero. Logística verificable (dirección exacta, fechas). Madrid, Cundinamarca no está en nuestra tabla de municipios (fuera de la zona roja) — sin municipioId, ubicación en placeName. Confianza alta.',
    },
  ] as const

  let created = 0
  let skipped = 0
  for (const p of socialPosts) {
    const existing = await prisma.pendingSocialPost.findFirst({ where: { permalink: p.permalink } })
    if (existing) {
      skipped++
      continue
    }
    await prisma.pendingSocialPost.create({
      data: {
        platform: p.platform,
        permalink: p.permalink,
        authorHandle: p.authorHandle,
        category: p.category,
        municipioId: p.municipioId,
        placeName: p.placeName ?? undefined,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    created++
  }
  console.log(`PendingSocialPost: ${created} created, ${skipped} already present`)

  // ── Additional aid-point candidates (real places, dual-seeded alongside
  // their social-post embeds) ─────────────────────────────────────────
  const aidPointDefs = [
    {
      name: 'Ciudadela Petronio Álvarez (Unidad Deportiva Alberto Galindo)',
      municipioId: cali.id,
      sourceUrl: 'https://www.tiktok.com/@noti90minutos/video/7672834416812510484',
      note: 'Centro de acopio activo desde el 12 de agosto de 2026, según 90 Minutos (medio local establecido de Cali/Valle del Cauca).',
    },
    {
      name: 'Coliseo Universidad de Caldas (sector Velódromo)',
      municipioId: manizales.id,
      sourceUrl: 'https://www.facebook.com/udecaldas',
      note: 'Centro de acopio activado por la Universidad de Caldas (Comunicado Institucional No. 3), 300+ voluntarios. Corroborado por La Patria.',
    },
  ]
  let aidCreated = 0
  for (const p of aidPointDefs) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: p.name, municipioId: p.municipioId } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: p.municipioId,
        kind: 'ACOPIO',
        name: p.name,
        sourceUrl: p.sourceUrl,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    aidCreated++
  }
  console.log(`PendingAidPoint: ${aidCreated} created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
