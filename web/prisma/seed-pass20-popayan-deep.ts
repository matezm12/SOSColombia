/**
 * Pass 20 (2026-08-14) — deep multi-agent research pass on Popayán (X +
 * Instagram + Facebook + TikTok + GoFundMe/Vaki crowdfunding, browser-driven).
 * Seventh city in the per-city deep-pass rotation. Popayán has MODERADA
 * severity (not on the original red-alert list, 1 confirmed death), so
 * results here are genuinely thinner than the CRITICA cities — several
 * categories (missing persons, crowdfunding) came back honestly empty. See
 * wiki/17-allied-resources-and-community.md "Pass 20" for full agent notes
 * and the Casa de la Moneda address discrepancy. Run once via
 * `npx tsx prisma/seed-pass20-popayan-deep.ts`.
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
      kind: 'BLOOD_DONATION' as const,
      name: 'Jornadas Extramurales de Donación de Sangre - Hospital Universitario San José',
      address: '12 ago: frente a Bancolombia (Parque Caldas); 13 ago: frente a Juan Valdez (Parque Caldas); 16 ago: frente al Hotel San Martín, Popayán',
      phone: null,
      needsText:
        'Donación de sangre (unidad móvil del banco de sangre del Hospital San José), 8:00 a.m. a 4:00 p.m. El 16 de agosto se combina con un "Social Run" de 5km solidario organizado junto al Hotel San Martín y RTC Running Club.',
      sourceUrl: 'https://www.instagram.com/p/Db8Icv2OxEI/',
      sourceOrg: 'Hospital Universitario San José de Popayán',
      submitterNote: 'Primer punto de donación de sangre confirmado para Popayán. Cuenta oficial del hospital, corroborada por un segundo post independiente (Hotel San Martín + RTC Running Club) sobre el mismo evento del 16 de agosto. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Fundación CASA K - Rescate Animal Popayán',
      address: 'Popayán, Cauca (dirección exacta no publicada)',
      phone: '318 779 0332',
      needsText: 'Atención veterinaria y recolección de insumos para animales afectados por el terremoto; el equipo viaja a Cali para atender animales heridos/atrapados.',
      sourceUrl: 'https://www.facebook.com/alejandra.cabrerabaez.3/posts/pfbid0yYJmKqgbCok14LQkvcdrBiNaVV89ScU9c7uQVGQfegskqAKz5FC6eKw1eYzwSujol',
      sourceOrg: 'Fundación CASA K',
      submitterNote: 'Encontrada independientemente en Instagram, Facebook y TikTok (3 de 5 agentes) - corroboración fuerte para una organización local. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Jóvenes Animalistas Popayán - colecta para mascotas afectadas',
      address: null,
      phone: '305 938 9027 (Jorge Rosero)',
      needsText: 'Alimento para perros/gatos, medicamentos, cobijas, collares/correas, productos de limpieza, apoyo económico para transporte y atención veterinaria.',
      sourceUrl: 'https://www.instagram.com/p/Db3gOojRcOT/',
      sourceOrg: 'Jóvenes Animalistas Popayán',
      submitterNote: 'Responsable nombrado, respuestas reales por WhatsApp en comentarios a preguntas de donantes; no ofrece cuenta bancaria, solo especie/WhatsApp, lo que reduce el riesgo de estafa. Confianza media.',
    },
    {
      kind: 'VET' as const,
      name: 'Pet and Pet - recolección y atención veterinaria (Barrio La Ximena)',
      address: 'Carrera 6 #45N-55, Barrio La Ximena, Popayán',
      phone: '300 695 6560 (Ales) / 300 234 7552 (Narda)',
      needsText:
        'Recolección de insumos de bienestar animal y atención veterinaria para mascotas afectadas; el equipo también viaja a Buenaventura/Chocó. Datos de pago del mismo flyer: Bancolombia ahorros 61700041513, Nequi/Daviplata 350 505 6588, PayPal manejohdfc@gmail.com.',
      sourceUrl: 'https://www.facebook.com/alejandra.cabrerabaez.3/posts/pfbid0yYJmKqgbCok14LQkvcdrBiNaVV89ScU9c7uQVGQfegskqAKz5FC6eKw1eYzwSujol',
      sourceOrg: 'Pet and Pet',
      submitterNote: 'Encontrado independientemente en Facebook y TikTok. Barrio no cubierto antes (La Ximena). Confianza media.',
    },
    {
      kind: 'VET' as const,
      name: 'Puntos de acopio veterinario - Veterinaria Patitas y Clínica Dr. Arbeláez',
      address: 'Popayán (direcciones exactas no dadas en el post)',
      phone: null,
      needsText: 'Suero, sondas, medicamentos veterinarios, comida para perros/gatos, camas, cobijas, correas, tapabocas - insumos para animales afectados, recolección hasta el sábado 12:00 p.m. Parte de una jornada conjunta con una oficina de Caracol Radio y una feria de adopción en Santa Clara.',
      sourceUrl: 'https://www.instagram.com/p/Db8k9g2s4Sg/',
      sourceOrg: null,
      submitterNote:
        'Cuenta geolocalizada en Popayán, clínicas reales etiquetadas directamente (incluyendo @dr.arbelaezclinicaveterinaria), 136 likes con comentarios orgánicos; un posible donante preguntó por cuenta bancaria y no se ofreció ninguna (solo especie), reduciendo el riesgo de estafa. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Donación económica Nequi - Facultad de Ingeniería Civil, Universidad del Cauca (Fotoclub Popayán)',
      address: 'En especie: Oficina 445, Facultad de Ingeniería Civil, Universidad del Cauca, Popayán',
      phone: '301 530 8803 (Nequi, a nombre del Profesor Diego Martínez)',
      needsText: 'Aportes económicos vía Nequi (se compran víveres no perecederos que se entregan a la Defensoría del Pueblo de Popayán); en especie: alimentos enlatados, elementos de aseo, elementos de primeros auxilios.',
      sourceUrl: 'https://www.instagram.com/p/Db8eGjeljCA/',
      sourceOrg: 'Facultad de Ingeniería Civil, Universidad del Cauca',
      submitterNote: 'Cuenta institucional anclada (Facultad de Ingeniería Civil), responsable nombrado, fondos destinados a la Defensoría del Pueblo - concreto y no anónimo. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Ruta Pacífica de las Mujeres - Regional Cauca',
      address: 'Calle 3 #1-68, Edificio Casa del Virrey, Popayán',
      phone: 'Nequi 316 212 9433 (Valentina Aldana)',
      needsText: 'Insumos médicos, artículos de higiene personal, alimentos no perecederos, insumos de rescate y power banks; la organización transporta personalmente los bienes al Valle del Cauca y Eje Cafetero. También: cuenta de ahorros Bancolombia, llave/alias @rutapacifica.',
      sourceUrl: 'https://www.facebook.com/popayanmomos2.0/posts/pfbid0zPEUpdod7bdc8WrswqfdmvjV7yaBXs2VPweJfykeb33z1gU13YEZd5Hhapp1HSd5l',
      sourceOrg: 'Ruta Pacífica de las Mujeres, Regional Cauca',
      submitterNote: 'Organización regional de derechos de la mujer establecida (30 años), titular de Nequi nombrado, dirección específica en Popayán. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio Universidad del Cauca - Facultad de Ciencias Humanas y Sociales',
      address: 'Salón 104, Sala de Exposiciones, Sede Alterna de la Facultad de Ciencias Humanas y Sociales, Universidad del Cauca, Popayán',
      phone: null,
      needsText: 'Donaciones en especie (alimentos no perecederos, equipo de rescate, kits de primeros auxilios, carpas/colchonetas/cobijas, elementos de aseo, agua) para comunidades afectadas, hasta el 19 de agosto de 2026.',
      sourceUrl: 'https://www.instagram.com/fac_humanas_unicauca/p/Db8fsWJIIu1/',
      sourceOrg: 'Universidad del Cauca (#UnicaucaSolidaria)',
      submitterNote:
        'Confirma que la Universidad del Cauca sí organizó una respuesta institucional, como se pidió verificar en esta pasada. Corroborado por ~10 universidades más a nivel nacional reposteando la misma campaña, y por la Facultad de Ciencias Agrarias participando bajo el mismo hashtag. Encontrado independientemente en Instagram y TikTok. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Universidad del Cauca - Facultad de Ciencias Agrarias (circular oficial)',
      address: 'Oficina de la Secretaría General (Cristina Canencio), Facultad de Ciencias Agrarias, Universidad del Cauca, Popayán',
      phone: null,
      needsText: 'Elementos de aseo, alimentos no perecederos, insumos de primeros auxilios/botiquín, ropa en buen estado, abierto a estudiantes/personal/docentes hasta el jueves 4pm.',
      sourceUrl: 'https://www.facebook.com/facaunicauca/posts/pfbid0udNKrhLv42PHWXrGRUh5nPHyJ3YRpRTU4Gz1pWc5HwmJqDQj7kFeDVV54MAhiCRFl',
      sourceOrg: 'Facultad de Ciencias Agrarias, Universidad del Cauca',
      submitterNote: 'Circular oficial con número de memorando (No. 8.9-12.2/008, 11 agosto 2026) y responsable nombrado - distinto de la Facultad de Ciencias Humanas y Sociales. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Recorrido Solidario por comunas de Popayán',
      address:
        'Ruta a pie/vehicular, sábado 15 de agosto 1:00 p.m.: Lomas de Granada, María Occidente, Las Palmas, Santa Elena, El Obando, La Esmeralda, Chirimía, Galería de la 13, Centro Histórico, Galería del barrio Bolívar, Bello Horizonte, La Paz',
      phone: null,
      needsText: 'Alimentos no perecederos y agua embotellada, elementos de aseo personal, carpas/aislantes/colchonetas/cobijas, medicamentos básicos.',
      sourceUrl: 'https://www.instagram.com/p/DcB03h5vF8y/',
      sourceOrg: null,
      submitterNote: 'Ruta móvil (no un punto fijo), pero nombra directamente varias comunas específicas que la pasada pedía verificar (La Esmeralda, Bello Horizonte, La Paz, entre otras). Publicación muy reciente (7h antes de la búsqueda). Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Donatón Solidario - Centro Comercial Monserrat Plaza',
      address: 'Centro Comercial Monserrat Plaza, Vía al Bosque, Popayán',
      phone: null,
      needsText: 'Guantes de carnaza, sogas, palas, bebidas hidratantes, alimentos no perecederos, elementos de aseo, insumos hospitalarios, pañales, cobijas, colchonetas, ropa en buen estado, medicamentos. 13-16 de agosto, 8:00 a.m. a 10:00 p.m.',
      sourceUrl: 'https://www.instagram.com/p/Db9pnsjIFtM/',
      sourceOrg: 'Centro Comercial Monserrat Plaza',
      submitterNote: 'Cuenta oficial del centro comercial, dirección/horario/fechas específicos. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Alcaldía de Popayán - Punto de acopio Ciudad Moderna',
      address: 'Ciudad Moderna S.A.S. E.S.P., Calle 25 Norte - Lote 2, Dirección Territorial de INVIAS, diagonal al Centro Comercial Campanario, Popayán',
      phone: null,
      needsText: 'Alimentos no perecederos, utensilios de aseo, agua embotellada, alimentos para mascotas, implementos de seguridad, medicamentos, cobijas y colchonetas, para familias en Quibdó, Cali y el Eje Cafetero.',
      sourceUrl: 'https://www.instagram.com/secplaneacionpopayan/p/Db62vDHGtBB/',
      sourceOrg: 'Alcaldía de Popayán (Secretaría de Planeación)',
      submitterNote: 'Cuenta oficial municipal verificada, co-marca con Canal 29 y 105.1FM Popayán. Encontrado independientemente en Instagram y TikTok. Confianza alta.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Casa de la Moneda - insumos médicos/salud (Primera Dama del Cauca)',
      address: 'Carrera 11 con Calle 3, Popayán',
      phone: null,
      needsText:
        'Insumos médicos específicos (tapabocas N95, ampollas de adrenalina, antisépticos/yodopovidona, torniquetes, catéteres #14/#16, analgésicos inyectables, cánulas Guedel, collares cervicales, acetaminofén en jarabe, campos estériles, yesos) para organismos de socorro y personal de salud atendiendo víctimas del terremoto.',
      sourceUrl: 'https://www.facebook.com/noti.cauca.2025/posts/pfbid0EguMTXRdNJV7ST85EEFtwbrhWxM1n8kzTQSX9QEm3yAYznvcLyFuhfx8rjF76vmNl',
      sourceOrg: 'Oficina de la Primera Dama del Departamento del Cauca',
      submitterNote:
        'ATENCIÓN: la dirección dada aquí (Carrera 11 con Calle 3) difiere de la ya registrada para "Casa de la Moneda" como punto de acopio (Carrera 7 Calle 4 Esquina, de una pasada anterior). Puede ser el mismo edificio descrito desde otra esquina de la cuadra colonial, o un error de una de las dos fuentes - no se asume ninguna de las dos opciones. Sembrado como un punto HEALTH distinto (insumos médicos específicos, no acopio general) en vez de fusionarlo silenciosamente. Verificar dirección exacta antes de aprobar. Confianza media.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Fundación Hogar para Ancianos San Vicente de Paúl',
      address: 'Popayán (dirección exacta no dada en el video/post)',
      phone: null,
      needsText:
        'Hogar de cuidado para adultos mayores en Popayán cuyo techo sufrió daños graves por el terremoto; necesita alimentos, medicinas, pañales, ropa y contribuciones monetarias para reparar el techo y seguir cuidando a sus residentes. No es un albergue para desplazados por el sismo, sino una institución de cuidado preexistente dañada por el sismo.',
      sourceUrl: 'https://www.facebook.com/reel/1562676278647524',
      sourceOrg: 'Fundación Hogar para Ancianos San Vicente de Paúl',
      submitterNote:
        'Institución real y verificable, daño específico y plausible (techo), difundido por una página de noticias identificable (Infórmate Cauca). Los datos de pago se muestran solo en el video, no verificados independientemente. Alcaldía de Popayán ya hizo una visita de inspección según un post relacionado de Instagram. Confianza media.',
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
      permalink: 'https://www.instagram.com/p/Db8Icv2OxEI/',
      authorHandle: 'hospital_sanjose_popayan',
      category: 'AID_POINT' as const,
      placeName: 'Hospital Universitario San José, Popayán',
      note: 'Jornadas extramurales de donación de sangre en tres puntos de la ciudad.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db9hlfxiOrj/',
      authorHandle: 'rteam_club / hotelsanmartinpopayan',
      category: 'AID_POINT' as const,
      placeName: 'Hotel San Martín, Popayán',
      note: 'Social Run solidario en alianza con el banco de sangre del hospital.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db3gOojRcOT/',
      authorHandle: 'jovenes_animalistas_popayan',
      category: 'AID_POINT' as const,
      placeName: 'Popayán',
      note: 'Colecta de insumos para mascotas afectadas, con responsable y teléfono nombrados.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8k9g2s4Sg/',
      authorHandle: 'comedogpopayan',
      category: 'AID_POINT' as const,
      placeName: 'Veterinaria Patitas / Dr. Arbeláez, Popayán',
      note: 'Puntos de acopio veterinario en Popayán para animales damnificados.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/fac_humanas_unicauca/p/Db8fsWJIIu1/',
      authorHandle: 'fac_humanas_unicauca',
      category: 'AID_POINT' as const,
      placeName: 'Universidad del Cauca',
      note: 'Punto de acopio como parte de la campaña #UnicaucaSolidaria.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8eGjeljCA/',
      authorHandle: 'fotoclubpopayan',
      category: 'AID_POINT' as const,
      placeName: 'Facultad de Ingeniería Civil, Universidad del Cauca',
      note: 'Donación vía Nequi a nombre de un profesor identificado, fondos hacia la Defensoría del Pueblo.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcB03h5vF8y/',
      authorHandle: 'baescauca',
      category: 'AID_POINT' as const,
      placeName: 'Varias comunas de Popayán',
      note: 'Recorrido solidario recogiendo donaciones por barrios específicos de Popayán.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db9pnsjIFtM/',
      authorHandle: 'monserratplazacc',
      category: 'AID_POINT' as const,
      placeName: 'Centro Comercial Monserrat Plaza, Popayán',
      note: 'Donatón Solidario del 13 al 16 de agosto.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db6HzDHxcaC/',
      authorHandle: 'corazondepaul',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hogar San Vicente de Paúl, Popayán',
      note: 'Denuncia de daños estructurales en el ancianato tras el sismo; la Alcaldía ya hizo una visita de inspección.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/secplaneacionpopayan/p/Db62vDHGtBB/',
      authorHandle: 'secplaneacionpopayan',
      category: 'OFFICIAL' as const,
      placeName: 'Ciudad Moderna, Popayán',
      note: 'Anuncio oficial de la Alcaldía de un nuevo punto de acopio.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/universidadelcauca/',
      authorHandle: 'universidadelcauca',
      category: 'OFFICIAL' as const,
      placeName: 'Universidad del Cauca',
      note: 'Cuenta institucional bajo cuyo hashtag #UnicaucaSolidaria varias facultades organizaron puntos de acopio.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/facaunicauca/posts/pfbid0udNKrhLv42PHWXrGRUh5nPHyJ3YRpRTU4Gz1pWc5HwmJqDQj7kFeDVV54MAhiCRFl',
      authorHandle: 'facaunicauca',
      category: 'AID_POINT' as const,
      placeName: 'Facultad de Ciencias Agrarias, Universidad del Cauca',
      note: 'Circular oficial estableciendo un centro de acopio en la Facultad.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/alejandra.cabrerabaez.3/posts/pfbid0yYJmKqgbCok14LQkvcdrBiNaVV89ScU9c7uQVGQfegskqAKz5FC6eKw1eYzwSujol',
      authorHandle: 'Felizmente Adoptados',
      category: 'AID_POINT' as const,
      placeName: 'Popayán (Pet and Pet + Fundación CASA K)',
      note: 'Lista curada de organizaciones de bienestar animal de Popayán recibiendo ayuda para animales afectados.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/popayanmomos2.0/posts/pfbid0zPEUpdod7bdc8WrswqfdmvjV7yaBXs2VPweJfykeb33z1gU13YEZd5Hhapp1HSd5l',
      authorHandle: 'Momazos finos Popayán (repost de Ruta Pacífica de las Mujeres)',
      category: 'AID_POINT' as const,
      placeName: 'Calle 3 #1-68, Popayán',
      note: 'Flyer de recolección con dirección específica y datos bancarios de Ruta Pacífica de las Mujeres, Regional Cauca.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/noti.cauca.2025/posts/pfbid0EguMTXRdNJV7ST85EEFtwbrhWxM1n8kzTQSX9QEm3yAYznvcLyFuhfx8rjF76vmNl',
      authorHandle: 'Noticauca Cauca',
      category: 'AID_POINT' as const,
      placeName: 'Casa de la Moneda, Popayán',
      note: 'Llamado urgente por insumos médicos específicos, organizado por la oficina de la Primera Dama del Cauca.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1562676278647524',
      authorHandle: 'Infórmate Cauca',
      category: 'AID_POINT' as const,
      placeName: 'Fundación Hogar para Ancianos San Vicente de Paúl, Popayán',
      note: 'Reportaje en video sobre el daño al techo del hogar y su llamado a la solidaridad.',
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
