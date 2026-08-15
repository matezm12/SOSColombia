/**
 * Pass 54 (2026-08-15) — final city in the fourth research round, and
 * Pijao's fifth overall research pass (after passes 37, 38, 39, and 44).
 * Explicitly scoped as a LIGHT status-check, not another deep dive, given
 * how much attention this city has already received. It surfaced more
 * than expected: the fire situation is genuinely contested within this
 * same round — a sitting congressman posted from the fire ground today
 * saying it "continues to advance with force" and alleging possible
 * arson, while a separate same-day report claims it was "extinguido."
 * Both are logged rather than resolved one way. The long-standing empty
 * livestock/animal-casualty gap (checked and confirmed empty across four
 * prior passes) finally has a real answer: a departmental vet brigade
 * treated 30 animals and rescued 6 puppies plus a pregnant dog in vereda
 * La Maicena — outcome is treatment/rescue, not confirmed deaths. Missing
 * persons and Pijao-specific scam reports remain genuinely empty after
 * this fifth check.
 * See wiki/17-allied-resources-and-community.md "Pass 54" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass54-pijao-round4.ts`.
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
      name: 'Sociedad Quindiana de Ornitología + Birding & Herping — Campaña de Solidaridad',
      address: 'Armenia: Oficina Birding & Herping, Urb. Mercedes del Norte, Manzana 8 casa 14A piso 1. Circasia: Casa de Germán Gallego, Cra 19 #7-53, barrio Centro (al lado del encierradero)',
      phone: 'Cristian López 313 794 3070 / Germán Gallego 318 604 0147 / Andrea Beltrán 312 470 5873',
      needsText: 'Agua potable, alimentos no perecederos, higiene personal, medicamentos/primeros auxilios, toallas/colchones/sábanas/cobijas, ropa en buen estado, insumos para mascotas, materiales de construcción. También aporte económico por Nequi/Daviplata/Bre-B, con recogida a domicilio coordinable.',
      sourceUrl: 'https://www.instagram.com/p/DcBd4nEzTlM/',
      sourceOrg: 'Sociedad Quindiana de Ornitología / Birding & Herping',
      submitterNote: 'Encontrada de forma independiente por dos de los cinco agentes de esta pasada (Instagram y Facebook). Organización local ya establecida, co-etiquetada por Corpoquindío (la autoridad ambiental regional, un ente gubernamental), tres coordinadores nombrados con teléfonos personales, dos direcciones físicas concretas. Nombra explícitamente "los incendios en Pijao" como parte de lo que apoya la campaña (junto con daños más amplios del terremoto en Quindío) — no es exclusiva de Pijao pero sí lo cubre concretamente. Alta confianza.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'La Cía Coffee — colecta para Pijao',
      address: 'Pijao, Quindío (punto exacto no indicado — contactar por Instagram para coordinar entrega); recepción 8am-5pm',
      phone: null,
      needsText: 'Alimentos no perecederos, agua/bebidas hidratantes, kits de aseo, cobijas/sábanas/colchonetas, ropa y zapatos, medicamentos básicos, alimento para mascotas y animales de campo, herramientas para remoción de escombros, velas, crema Verdemint para animales quemados. Dinero vía enlace de pago Wompi y llave Bre-B @lopez8367.',
      sourceUrl: 'https://www.instagram.com/p/Db9VcdMhCsb/',
      sourceOrg: 'La Cía Coffee',
      submitterNote: 'Negocio cafetero de Quindío ya reconocido, alto engagement (849 me gusta, decenas de comentarios), describe una visita en terreno a Pijao y usa un enlace de pago Wompi (procesador legítimo de Bancolombia) en vez de una cuenta personal suelta. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Xportiva / La Rueda, Pórtico — colecta solidaria para Pijao',
      address: 'La Rueda, Pórtico (Restaurante El Pórtico), Km 20 Carretera Central del Norte (Cra 7), sentido norte-sur',
      phone: null,
      needsText: 'Alimentos no perecederos y comida para mascotas, higiene/hidratación/primeros auxilios, carpas/sleeping bags/cobijas, estufas portátiles y utensilios de cocina, linternas/pilas/power banks, ropa y pañales de bebé/leche de fórmula (urgente), herramientas de construcción/rescate. Dinero vía llave Bre-B @samir30302.',
      sourceUrl: 'https://www.instagram.com/p/Db_8MVmRGv9/',
      sourceOrg: null,
      submitterNote: 'Campaña conjunta de cuatro marcas/cuentas de la comunidad deportiva (Xportiva, La Rueda, Oceanman Colombia, Xterra Colombia) con dirección física concreta, término de búsqueda en Waze, y horario claro de fin de semana — un punto de recolección solidario fuera del Quindío alimentando ayuda específicamente hacia Pijao. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Colecta "Familias Rurales de Pijao" — Dr. Juan Pablo Molina & La Finca de Ellas',
      address: 'Punto de entrega: Zonata Centro Médico, Local 107, Armenia, Quindío (ayudas destinadas específicamente a la zona rural de Pijao)',
      phone: '312 606 3344 (WhatsApp, para coordinar entrega)',
      needsText: 'Víveres y hogar: alimentos no perecederos, agua, leche en polvo, pañales y crema para niños, aseo, insumos de cocina y lavado. Animales: comida para perros, gatos y gallinas. Emergencias: linternas recargables, pilas, silbatos, colchonetas, tapabocas, pastillas potabilizadoras de agua. Contra incendios: mangueras, extintores, canecas, apagafuegos. Primeros auxilios: alcohol, desinfectante, micropore. Ropa para hombre, mujer y bebés; botas talla 37-41.',
      sourceUrl: 'https://www.instagram.com/drjuanpablomolina/reel/DcBQ2QduyM7/',
      sourceOrg: null,
      submitterNote: 'Publicado por un cirujano verificado de Armenia (47.5K seguidores), co-organizado con "La Finca de Ellas" y otras 3 cuentas. Lista de necesidades muy desglosada, WhatsApp funcional, dirección física concreta de entrega. 984 me gusta / 407 compartidos. Alta confianza-media.',
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
      permalink: 'https://x.com/MiguelGrisalesS/status/2088592692024422890',
      authorHandle: '@MiguelGrisalesS',
      category: 'NEED' as const,
      placeName: 'La Topacia (Génova) / Pijao',
      note: 'DESARROLLO NUEVO (hoy, 15 de agosto): el representante a la Cámara Miguel Grisales, publicando desde el terreno quemado, afirma que los incendios en la cordillera "siguen avanzando con fuerza", llegando a La Topacia (Génova) y Pijao con daño ambiental serio; residentes sospechan que pudieron ser provocados intencionalmente. Pide formalmente a Bomberos, Fuerza Aérea y UNGRD apoyo aéreo para extinguir, y a Policía/Fiscalía investigar posible incendio provocado. CONTRADICCIÓN A REGISTRAR: un reporte separado del mismo día (video de Facebook de Señal Región/Río Noticias.Co, ~20h de antigüedad, sin enlace permanente capturado por el agente de esta pasada) afirma que el incendio ya fue "extinguido" con inspecciones preventivas completadas. Ambas versiones circulan el mismo día; no se resuelve cuál es correcta — quien modere debería buscar el video directamente si quiere confirmar.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1554671676452667',
      authorHandle: 'Alcaldía Municipal de Pijao Quindío / Alcalde John Jairo Restrepo',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao',
      note: 'CONTRAPARTE de la publicación de Grisales, misma fecha aproximada: video propio del alcalde confirmando que la Brigada de Atención y Prevención de Desastres del Ejército se desplazó a las veredas La Maicena y El Sinabrio para monitorear e inspeccionar los focos activos y recopilar información técnica — esto es monitoreo/inspección, no necesariamente confirmación de que el fuego siga fuera de control. El gobernador del Quindío visitó Pijao y se sostuvo videollamada con la Ministra del Trabajo Natalia López Fuentes, quien recibió un balance del proceso de caracterización de familias afectadas.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid033CcPTqdQMxnsg3rpBA72aSiWhrZSWwBqkt4cSU79C1qrpotApfiEJS2okiiRS6uGl&id=61592658691922',
      authorHandle: 'Bomberos Voluntarios Pijao',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao',
      note: 'Comunicado formal del 13 de agosto: los Bomberos Voluntarios de Pijao siguen desplegados sin interrupción haciendo control, enfriamiento y vigilancia para prevenir reactivación del fuego, declarando explícitamente que AÚN NO han alcanzado "control total" de la situación a esa fecha. Agradecen a la comunidad por hidratación y víveres para las propias cuadrillas — indica necesidad continua de insumos para los bomberos mismos.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1766128027869680',
      authorHandle: 'Federación Colombiana de Ganaderos (FEDEGAN)',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao (zona rural)',
      note: 'FEDEGAN lanzó #SOSGanadero y envió un profesional de campo (Sebastián Puerta) a Pijao y otros municipios de la cordillera específicamente a evaluar el impacto rural/ganadero del terremoto y los incendios, citando el riesgo a la infraestructura rural tradicional en bahareque/guadua. No da aún una cifra de pérdidas de ganado ni mecanismo de donación — primera señal de un ente ganadero nacional involucrándose activamente con la situación rural de Pijao.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/QuindioNoticias/status/2088395586290540634',
      authorHandle: '@QuindioNoticias',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Vereda La Maicena, Pijao',
      note: 'RESUELVE el ángulo de "pérdidas de ganado/animales" que cuatro pasadas anteriores encontraron vacío: el equipo PYBA (Protección y Bienestar Animal) de la Gobernación del Quindío atendió a 30 perros y gatos quemados/afectados por el incendio en La Maicena con atención veterinaria, medicación y alimento, y rescató 6 cachorros más una perra gestante a un hogar de acogida — junto con la Universidad Alexander von Humboldt y la Policía Nacional (carabineros). El resultado es tratamiento/rescate, no muertes confirmadas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://cronicadelquindio.com/opinion/editorial/despues-del-temblor/',
      authorHandle: 'La Crónica del Quindío (editorial)',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao / Génova, Quindío',
      note: 'Editorial publicado HOY (15 de agosto) con las cifras más precisas hasta ahora: ~230 hectáreas quemadas en el sur del Quindío en total (~200 ha en Pijao, ~30 ha en Génova, preliminar). Ruta del fuego confirmada: Cueva Loca → La Topacia Alta/Baja → La Maicena, cruzando el límite municipal hacia Génova. Una vivienda deshabitada perdida, cinco familias en alto riesgo, pérdidas de cultivos de plátano/café/cítricos/aguacate. El combate lo hacen Bomberos Voluntarios de Génova Y Caicedonia (Valle del Cauca), Policía, Ejército y campesinos con mangueras improvisadas/tanques cargados a mano/motobombas — ningún carrotanque puede llegar al terreno. CRÍTICO: el editorial afirma explícitamente que la operación "exige apoyo aéreo" y que el alcalde de Génova lo está pidiendo al gobierno departamental/nacional — es decir, el apoyo aéreo AÚN NO se había entregado al 15 de agosto, lo cual precisa (no solo reconfirma) el hallazgo de "probablemente no entregado" de pasadas anteriores, ahora con una declaración oficial local en el registro. También señala un vacío estructural: al 15 de agosto no existe un canal claro de ayuda para familias campesinas que perdieron su cosecha — ningún programa de compensación por pérdida agrícola en la zona del incendio.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/UDEGERD/posts/pfbid0HKgt14JLA47ST7ZLfTRhocrKEcpy6taHfbuuVgTBX48CBmvS4DnTYnUsiq5SmvBHl',
      authorHandle: 'Udegerd Quindío',
      category: 'OFFICIAL' as const,
      placeName: 'Pijao',
      note: 'Nueva herramienta oficial: un código QR/formulario específico para Pijao donde los residentes con vivienda dañada por el terremoto pueden autorreportar la afectación para que Udegerd programe visitas técnicas — no es un punto de ayuda en sí, sino un nuevo mecanismo gubernamental para entrar a la lista de evaluación de reconstrucción.',
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
