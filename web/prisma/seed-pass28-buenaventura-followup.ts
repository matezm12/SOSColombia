/**
 * Pass 28 (2026-08-15) — follow-up social media research pass on Buenaventura,
 * days after the original deep pass. Strongest find is a cross-platform
 * accountability story (hospital ship "Benkos Biohó" never deployed to
 * Buenaventura despite being built for exactly this), plus updated but
 * conflicting official casualty figures, a fresh national scam alert, a
 * fishing-economy-specific relief call, and port-recovery news. See
 * wiki/17-allied-resources-and-community.md "Pass 28" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass28-buenaventura-followup.ts`.
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
      kind: 'ACOPIO' as const,
      name: 'Fedepazcifico + Centro para la Justicia Marina - apoyo a comunidades pesqueras de Buenaventura',
      address: 'Ciudadela Colpuertos, Etapa 4, Casa #18, Buenaventura',
      phone: '314 820 3439 (Nequi - Mónica Mosquera) / 317 657 6186 (Nequi - Hanna Potes)',
      needsText:
        'Alimentos no perecederos, elementos de aseo, pañales, ropa en buen estado, medicamentos no vencidos, y aportes económicos vía Nequi, para familias bonaverenses del sector pesquero artesanal (zona urbana y rural) afectadas por el terremoto.',
      sourceUrl: 'https://www.instagram.com/p/DcBmo0UkayH/',
      sourceOrg: 'Fedepazcifico (Federación de Pescadores Artesanales del Litoral Pacífico Colombiano)',
      submitterNote:
        'Primer hallazgo específico para la economía pesquera de Buenaventura. Corroborado independientemente en X, Instagram y Facebook, todos citando el mismo relevo de Centro para la Justicia Marina (ONG real de defensa marina) a nombre de su aliada Fedepazcifico, que no tiene cuenta propia verificable. Cuentas Nequi personales (no institucionales) mantienen la confianza en media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Corredor Humanitario - Diócesis de Buenaventura + Cámara de Comercio / Confecámaras',
      address: 'Cra 47 #47C-70, interior Colegio Seminario San Buenaventura - Casa de Encuentro Heriberto Correa Yepes (antiguo Bagnoregio), Buenaventura',
      phone: '310 830 8316 (Sonia Suárez)',
      needsText:
        'Alimentos no perecederos (arroz, aceite, pasta, lentejas, fríjol, avena, leche), elementos de aseo (jabón, cepillos, crema dental, toallas higiénicas, pañales), mantas y colchonetas. Donación económica: Banco Caja Social, cuenta de ahorros 24136600305, titular Diócesis de Buenaventura.',
      sourceUrl: 'https://www.instagram.com/p/Db6PpYsEj1v/',
      sourceOrg: 'Diócesis de Buenaventura + Cámara de Comercio de Buenaventura + Confecámaras',
      submitterNote: 'Alta confianza: coordinación institucional conjunta (gremio empresarial + iglesia católica), dirección y cuenta bancaria concretas.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de acopio PCN/ABEDUA - Barrio Santa Rosa',
      address: 'Calle 4 #16-90, Barrio Santa Rosa, Buenaventura',
      phone: '300 480 6118 (ABEDUA)',
      needsText: 'Agua potable, víveres no perecederos (arroz, enlatados, panela), ropa limpia en buen estado, kits de aseo. Donación económica: Banco Caja Social, cuenta corriente 21004290974.',
      sourceUrl: 'https://www.instagram.com/p/Db6FLU5OX7I/',
      sourceOrg: 'Proceso de Comunidades Negras (PCN) / ABEDUA',
      submitterNote: 'Organización afrocolombiana de derechos históricamente establecida; comentarios de hace 2 días confirman que el punto sigue activo recibiendo donaciones y voluntariado.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Comisión Intereclesial de Justicia y Paz - reconstrucción rural en Chocó y Buenaventura',
      address: null,
      phone: null,
      needsText:
        'Reconstrucción de viviendas, escuelas, espacios comunitarios y hogares de cuidado de primera infancia en comunidades rurales de Chocó y Buenaventura dañadas por el sismo. Cuenta de Ahorros Banco de Occidente 256-958190, titular Comisión Intereclesial de Justicia y Paz, NIT 830101557.',
      sourceUrl: 'https://www.instagram.com/p/Db9BiwixQN5/',
      sourceOrg: 'Comisión Intereclesial de Justicia y Paz',
      submitterNote:
        'ONG de derechos humanos colombiana de larga trayectoria, coetiquetada por aliados creíbles (Amnistía Internacional Américas, PBI Colombia, delegación de la UE). Apunta explícitamente a zonas rurales menos visibles - el hallazgo de equidad más fuerte de esta pasada. Cubre tanto Chocó como Buenaventura; sembrado aquí porque esta pasada corresponde a Buenaventura.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Tractomula Bogotá - Buenaventura (Dahauslab.co, distribuido por AMUCIB y Pacífico Somos Todos)',
      address: 'Puntos de acopio en Bogotá: Hotel Click Clack (Cra 11 #93-77, 8am-8pm) y Casa Azul (Cra 20 #45A-33, 10am-7pm)',
      phone: null,
      needsText:
        'Alimentos no perecederos, agua y filtros potabilizadores, carpas, colchonetas, cobijas, elementos de aseo, insumos médicos básicos, pañales, herramientas para remoción de escombros, plantas de energía. Donación económica: Davivienda, cuenta de ahorros 488474795371.',
      sourceUrl: 'https://www.instagram.com/p/Db_fTH3j9Aq/',
      sourceOrg: 'Dahauslab.co / La Cerería Colombia',
      submitterNote: 'Camión programado a salir de Bogotá el 16 de agosto hacia zonas de difícil acceso de Buenaventura, con socios locales de distribución nombrados (AMUCIB, Pacífico Somos Todos). Confianza media: organizador es colectivo pequeño, no ONG registrada.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'FOCUSA - Fundación para el Fortalecimiento Comunitario, Social y Ambiental',
      address: null,
      phone: '316 873 6271 / 310 470 5297',
      needsText: 'Alimentos no perecederos, elementos de aseo, colchonetas, ropa en buen estado, apoyo logístico de transporte. Donación económica vía GoFundMe (gofund.me/af9caf6b4) o cuenta de ahorros Davivienda 216000917940.',
      sourceUrl: 'https://www.instagram.com/p/Db6G4cih5Vx/',
      sourceOrg: 'FOCUSA (NIT 900485168-4)',
      submitterNote: 'Confianza media-baja: cuenta pequeña (6 likes), Instagram marcó la imagen del flyer como "contenido de IA", sin verificación independiente más allá de este post. Se incluye por tener NIT publicado y canal bancario concreto, pero se recomienda verificar antes de donar montos grandes.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Ayuda humanitaria en Buenaventura - apoya a los líderes, lideresas y sus familias',
      address: null,
      phone: null,
      needsText: 'Apoyo económico para líderes y lideresas sociales y sus familias afectados por el terremoto en Buenaventura.',
      sourceUrl: 'https://vaki.co/vaki/ayuda-humanitaria-en-buenaventura-apoya-a-los-l-deres-lideresas-y-sus-familias-afectados-por-el-terremoto',
      sourceOrg: 'Erika Parrado / Corporación Memoria y Paz + Universidad Javeriana',
      submitterNote:
        'Campaña activa de alta confianza: organizadora verificada, US$8,389 recaudados de 168 Vakers, con una contribución registrada apenas 53 minutos antes de la revisión. Copromocionada por Corporación Memoria y Paz y la Facultad de Ciencias Sociales de la Universidad Javeriana. Enfoque explícito en líderes/lideresas comunitarios, no ayuda genérica - encaja con el ángulo de equidad de esta ciudad. Nota: el enlace truncado que circula en algunos resultados de búsqueda da error 404; solo la URL completa arriba funciona.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Terremoto Buenaventura (campaña general)',
      address: null,
      phone: null,
      needsText: 'Donaciones monetarias generales para víctimas del terremoto en Buenaventura.',
      sourceUrl: 'https://vaki.co/vaki/terremoto-buenaventura',
      sourceOrg: null,
      submitterNote: 'Campaña activa y verificada (organizador con check azul), creada el 12 de agosto, US$644 recaudados de 15 Vakers, con donaciones registradas el mismo día de esta revisión. Escala pequeña pero genuinamente activa.',
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
      permalink: 'https://x.com/petrogustavo/status/2088431259470970903',
      authorHandle: '@petrogustavo',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'El expresidente Gustavo Petro denuncia que el gobierno actual "no sabe siquiera que hay un buque-hospital en Buenaventura" (Benkos Biohó, construido por más de 82 mil millones de pesos) porque no se renovaron los contratos del personal de salud a bordo - dice que muchas víctimas del terremoto en el litoral Pacífico se hubieran podido salvar si hubiera estado operando.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@alibantuashanti/video/7673569171309055252',
      authorHandle: '@alibantuashanti',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'Denuncia corroborada de forma independiente (4,748 likes): el buque-hospital Benkos Biohó no ha sido desplegado en Buenaventura pese al llamado público del expresidente Petro. Historia de rendición de cuentas cruzada entre X y TikTok.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/tiempo.noticias.buenaventura/posts/pfbid02F7UV7uLkpV7Z3tkyDEc5rkonKaX8RNVhg3PHGWybtQewAEpnwEWGDtBVFNBix8ZCl',
      authorHandle: 'Tiempo Noticias Buenaventura',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'Balance oficial del Distrito Especial de Buenaventura, 14 de agosto: 10,148 familias/viviendas afectadas, 954 viviendas destruidas, 9,194 viviendas dañadas, 26 muertos, 433 heridos. NOTA: cifra en conflicto con un reporte de Red+ Noticias de ~2 días antes citando 16 muertos/258 heridos/7,150+ viviendas afectadas - ambas lecturas se documentan aquí sin forzar un solo número, mismo criterio aplicado en Cali (pasada 24) y Manizales (pasada 25).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@redmasnoticias/video/7673286973158608129',
      authorHandle: '@redmasnoticias',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'Cifras oficiales distritales (fecha anterior al balance del 14 de agosto): 16 muertos, 258 heridos, 7,150+ viviendas afectadas; sistema hospitalario al 100% de capacidad. Ver nota de conflicto en el balance del 14 de agosto arriba.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/2308893659935622',
      authorHandle: 'Ministerio del Interior (Colombia)',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'El Ministro del Interior Rodrigo Lara y el Vicepresidente José Manuel Restrepo visitan el Puesto de Mando Unificado de Buenaventura para revisar la respuesta al terremoto.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@redmasnoticias/video/7673930500268051732',
      authorHandle: '@redmasnoticias',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'El Ministro del Interior, hablando desde Buenaventura, advierte que la ayuda "no puede usarse con fines políticos" y pide denunciar cualquier irregularidad en su distribución - corroborado por al menos dos medios más en la misma ventana de 24 horas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1776936813309375',
      authorHandle: 'Noticias Caracol',
      category: 'NEED' as const,
      placeName: 'Buenaventura',
      note: 'Más de 2,800 estudiantes de Buenaventura afectados por el terremoto; entrevista sobre qué sigue para la recuperación educativa en la ciudad.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@pluralidadz/video/7673968867563113736',
      authorHandle: '@pluralidadz',
      category: 'OFFICIAL' as const,
      placeName: 'Buenaventura',
      note: 'Fase de reconstrucción: el Ministro de Vivienda Rodrigo Lara plantea un modelo de materiales-más-mano-de-obra - cementeras donarán insumos, familias afectadas aportarán trabajo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://elcolombiano.com/negocios/cafe-colombiano-retoma-exportaciones-por-buenaventura-tras-terremoto',
      authorHandle: 'El Colombiano',
      category: 'OFFICIAL' as const,
      placeName: 'Puerto de Buenaventura',
      note: 'Las exportaciones de café colombiano retoman operación gradual por el Puerto de Buenaventura tras haber quedado paralizadas por el terremoto.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://mundomaritimo.cl/noticias/cma-cgm-advierte-retrasos-en-el-puerto-de-buenaventura-tras-terremoto-en-colombia',
      authorHandle: 'Mundo Marítimo',
      category: 'OFFICIAL' as const,
      placeName: 'Puerto de Buenaventura',
      note: 'La naviera CMA CGM reporta que la recuperación operativa del Puerto de Buenaventura avanza gradualmente pero sigue siendo compleja: retorno de contenedores, flujo de carga y transporte terrestre aún con demoras.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/lecny.tatiz/posts/pfbid0BSWt7vWPvvGKsPjr9wbvqseiZVoMeXySr1qDjjJPxyo2qVZJrCh2CJ3AAJkLCtskl',
      authorHandle: 'Tatiana Zapata',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Buenaventura (Terminal TCBUEN)',
      note: 'Relato personal con fotos: la terminal de contenedores TCBUEN seguía sin servicio días después del sismo por réplicas continuas; crítica por reenviar trabajadores portuarios antes de que sea seguro.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/2230892091077935',
      authorHandle: 'Noticias Al Punto, Región Pacífico',
      category: 'NEED' as const,
      placeName: 'Buenaventura',
      note: 'Una vivienda ya afectada por el sismo colapsó por completo cinco días después - el riesgo estructural sigue materializándose en la ciudad.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://caracolradio.com/2026/08/policia-alerta-por-estafas-con-falsas-ayudas-tras-el-terremoto',
      authorHandle: 'Caracol Radio / Dijín',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (nacional, aplica a Buenaventura)',
      note: 'La Dijín alerta sobre estafadores que inventaron una falsa "Oficina Desarrolladora de Gobierno" y un funcionario ficticio ("Ricardo Suárez"), creando campañas solidarias falsas que canalizan donaciones a cuentas personales. Corroborado por El Tiempo y CAMBIO Colombia en la misma ventana de horas - aplica precaución a cualquier colecta etiquetada para Buenaventura que solo pida transferencias a cuentas personales.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://elcolombiano.com/colombia/comunidades-indigenas-y-afro-del-pacifico-las-mas-dificiles-de-alcanzar-tras-el-terremoto',
      authorHandle: 'El Colombiano',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Buenaventura y comunidades indígenas/afro del Pacífico',
      note: 'Historia de equidad reciente: comunidades indígenas y afrocolombianas del Pacífico, incluida Buenaventura, son las más difíciles de alcanzar con ayuda; Iglesia y organizaciones de derechos humanos señalan brechas entre los conteos oficiales preliminares y lo que reportan las comunidades en terreno - extiende a Buenaventura el patrón ya documentado en Chocó.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@telesurclips/video/7673864357255580936',
      authorHandle: '@telesurclips',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Barrio El Campín, Buenaventura',
      note: 'En medio de "negligencia y abandono de las autoridades locales" y falta total de agua, luz y gas, jóvenes del barrio El Campín organizaron su propia respuesta comunitaria de emergencia.',
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
