/**
 * Pass 17 (2026-08-14) — deep multi-agent research pass on Armenia (X +
 * Instagram + Facebook + TikTok + GoFundMe/Vaki crowdfunding, browser-driven).
 * Fourth city in the per-city deep-pass rotation after Pereira (13-14), Cali
 * (15), and Manizales (16). See wiki/17-allied-resources-and-community.md
 * "Pass 17" for full agent notes, the Fundación Kenovy donation-status
 * resolution, and rejected candidates. Run once via
 * `npx tsx prisma/seed-pass17-armenia-deep.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const armenia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63001' } })

  const aidPoints = [
    {
      kind: 'BLOOD_DONATION' as const,
      name: 'Cruz Roja Colombiana - Banco Regional de Sangre, Armenia',
      address: 'Av. Bolívar #23 Norte - 60, Armenia, Quindío',
      phone: '316 478 1842 / 300 648 1293',
      needsText: 'Donación de sangre (O+ específicamente solicitado) para reponer reservas agotadas por la atención de víctimas del terremoto.',
      sourceUrl: 'https://www.instagram.com/p/Db37kZAFRll/',
      sourceOrg: 'Banco Nacional de Sangre + Cruz Roja Colombiana',
      submitterNote:
        'Cierra el vacío más importante señalado para Armenia (cero puntos de donación de sangre confirmados hasta esta pasada). Corroborado en 3 plataformas: gráfico oficial conjunto de Banco Nacional de Sangre/Cruz Roja Colombiana (Instagram, 22.6K likes), Kienyke (X, medio de noticias establecido) y teleSUR (Facebook, compartiendo el mismo gráfico oficial con lista de puntos en Bogotá/Medellín/Cartagena/Villavicencio/Manizales/Armenia/Cali). Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Fundación Kenovy Colombia (Armenia)',
      address: 'Armenia, Quindío (dirección exacta no publicada; solo redes sociales)',
      phone: '300 901 8232 (Nequi / Daviplata / Bre-B) + 310 283 8356 (Nequi)',
      needsText:
        'Refugio de rescate/rehabilitación animal con 300+ animales, con infraestructura destruida por el terremoto. Actualmente funciona además como centro de acopio de agua para Pijao/Génova. Necesita: agua, comida y suministros veterinarios para mascotas, malla eslabonada, casetas para perros, alimento, tejas, voluntarios para remoción de escombros, y donaciones monetarias vía Nequi/Daviplata/Bre-B 300 901 8232, Bancolombia Ahorros 912835785-72, Banco Caja Social 24129850032, Banco Popular Ahorros 500807801371, Llave/Tag Aval @BPJVG492, Western Union (internacional).',
      sourceUrl: 'https://www.instagram.com/p/DcBmQs_xxmE/',
      sourceOrg: 'Fundación Kenovy Colombia',
      submitterNote:
        'RESOLUCIÓN de un hallazgo previo: una pasada anterior enfocada en Manizales había marcado el número Bre-B de Kenovy como reportado "roto/inexistente" por terceros. Esta pasada lo verificó independientemente en 3 de 5 agentes (X, Instagram, crowdfunding): el mismo número (300 901 8232) aparece activo y estable en la biografía oficial de @fundacionkenovycolombia (93.4K seguidores, cuenta con verificación azul, publicando desde meses antes del sismo) y en múltiples publicaciones a lo largo de varios meses, no solo relacionadas con el terremoto. Ningún comentario en ninguna plataforma reporta el canal como roto. Los agentes de Facebook y TikTok no pudieron confirmar NI refutar el estado del canal desde sus respectivas plataformas (no encontraron el dato, ni a favor ni en contra). Daño real confirmado independientemente por El Tiempo, TV Azteca, BluRadio, Las2orillas y RTVC Noticias (medio público estatal). Veredicto: organización real, dañada de verdad, y su canal de donación SÍ funciona. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de Convenciones de Armenia - punto central de acopio departamental',
      address: 'Centro de Convenciones del Quindío, Armenia',
      phone: null,
      needsText: 'Ayuda humanitaria general (recepción, clasificación y despacho) para los municipios del Quindío más golpeados por el terremoto; se solicitan voluntarios de logística. Alimentos no perecederos, agua, cobijas.',
      sourceUrl: 'https://www.facebook.com/permalink.php?story_fbid=pfbid025k3aHRnDFdvpaX48z73wyjnT1LMdgaaetv5uK3QsAj9cmp6FRFQT9aRcab9jMK3pl&id=61574909973919',
      sourceOrg: 'Unidad de Gestión del Riesgo del Departamento del Quindío',
      submitterNote:
        'El hub central del departamento, distinto y de mayor escala que cualquier punto ya conocido (Castellana, Limonar, Power Music Center, Jeisson & Jonny). Corroborado independientemente en Facebook (NC Quindío) y TikTok (Noticias UNOA + una cuenta ciudadana citando a la misma Unidad de Gestión del Riesgo departamental). Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Cuerpo Oficial de Bomberos de Armenia - punto de recolección local',
      address: 'Sede del Cuerpo Oficial de Bomberos, Armenia (dirección exacta no dada)',
      phone: null,
      needsText: 'Colchonetas, cobijas, alimentos no perecederos y kits de aseo para familias de Armenia afectadas.',
      sourceUrl: 'https://www.facebook.com/permalink.php?story_fbid=pfbid025k3aHRnDFdvpaX48z73wyjnT1LMdgaaetv5uK3QsAj9cmp6FRFQT9aRcab9jMK3pl&id=61574909973919',
      sourceOrg: 'Cuerpo Oficial de Bomberos de Armenia + Secretaría de Desarrollo Social',
      submitterNote: 'Mismo post de NC Quindío que confirma el Centro de Convenciones; activado bajo articulación de la Secretaría de Desarrollo Social. Confianza media - falta dirección exacta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio - Junta de Acción Comunal Barrio Santander',
      address: 'Salón Comunal de la Escuela del Barrio Santander, Armenia',
      phone: '310 330 6165',
      needsText: 'Alimentos no perecederos (arroz, pastas, atún/sardinas enlatadas, leche en polvo, aceite, azúcar, sal, cereal) y artículos de aseo (jabón, papel higiénico, pañales, toallas húmedas, detergente). Recepción lunes a domingo 8:00am-6:00pm.',
      sourceUrl:
        'https://www.facebook.com/permalink.php?story_fbid=pfbid0Dguskg2CZqg2kSF8UJr8xbpy1WJuNXjzmRckKKmiVuubGbMaH1be6FEi45vUWqYVl&id=61593321565895',
      sourceOrg: 'Junta de Acción Comunal Barrio Santander',
      submitterNote: 'Respaldo institucional real (junta de acción comunal, no un individuo anónimo), dirección y teléfono específicos, barrio nuevo no cubierto antes. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'El Quindío Nos Necesita - Punto de acopio Rincón Santo',
      address: 'Carrera 11 #26-65, Barrio Rincón Santo, centro de Armenia',
      phone: null,
      needsText: 'Alimentos no perecederos, colchones, agua, artículos de higiene personal para entrega directa a familias afectadas. Monetario: Davivienda ahorros 488400622871, Bancolombia ahorros 06992264509, Llave Aval 1094939593.',
      sourceUrl: 'https://www.instagram.com/p/Db8VnpHhHlB/',
      sourceOrg: null,
      submitterNote: 'Grupo grassroots organizado por Maria Giraldo y amigos, dirección precisa en un barrio no cubierto antes (Rincón Santo/Centro). Sin reportes de enlace de pago roto en comentarios. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Rotaract/Rotary Armenia - Recolección de ayudas',
      address: 'Armenia, Quindío (dirección exacta del punto no dada; contactar por DM)',
      phone: null,
      needsText: 'Alimentos no perecederos, artículos de aseo/limpieza, artículos para niños y bebés, cobijas, colchonetas, comida para mascotas.',
      sourceUrl: 'https://www.instagram.com/p/Db9Aec_Au7w/',
      sourceOrg: 'Rotaract Armenia + Rotarios Armenia + Rotaract Armenia Capital',
      submitterNote: 'Clubes cívicos reales con afiliación internacional (Rotary/Rotaract), no cuentas anónimas. Confianza media - el post no da una dirección concreta de recolección.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Jornada Departamental de Salud Mental - Hospital Mental de Filandia Quindío',
      address: 'Punto de partida: Consulta Externa, Armenia, Quindío',
      phone: null,
      needsText: 'Unidad móvil de salud gratuita para personas afectadas por el sismo: psicología, trabajo social, enfermería, medicina y psiquiatría (virtual). Inicia 14 de agosto de 2026, 8:00 AM, recorriendo todo el territorio quindiano.',
      sourceUrl: 'https://www.facebook.com/hmfQuindio/posts/pfbid02VR2wU8fissz6Xeyrqm8R3t75V8g5SEpkjrbvj8s3CKWh9B2NY2tHq4gLjdkJ4xmLl',
      sourceOrg: 'Hospital Mental de Filandia Quindío (E.S.E.)',
      submitterNote: 'Hospital público real (Empresa Social del Estado), brigada pública explícitamente para el sismo, a diferencia de la brigada de la Universidad del Quindío ya conocida que solo atiende dentro del campus. Confianza alta.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Hospital San Juan de Dios de Armenia - puesto de respuesta de emergencia',
      address: 'Hospital San Juan de Dios, Armenia, Quindío',
      phone: null,
      needsText: 'Despliegue documentado de Cruz Roja Colombiana, el Batallón de Servicios No. 8 del Ejército, y el equipo de búsqueda y rescate CAUTE Emergencias sin Fronteras, además de unidades móviles de baño, en este hospital público tras el sismo.',
      sourceUrl: 'https://www.tiktok.com/@elizabethmarin098/video/7673888767530257685',
      sourceOrg: null,
      submitterNote: 'Video de un solo creador (no institucional) pero nombra tres respondedores institucionales reales y verificables. Confianza media - vale la pena corroborar horarios/acceso público.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Fundación Covida - Armenia',
      address: 'Sede al norte de Armenia, Quindío (dirección exacta no publicada)',
      phone: null,
      needsText:
        'Centro de rehabilitación (30+ años operando en Armenia) para niños, jóvenes y adultos con discapacidad física, cognitiva y del desarrollo. Un muro principal de sus instalaciones colapsó en el terremoto, forzando la suspensión de operaciones. Donaciones para reparar el muro y equipo dañado; emite certificados de donación tributaria.',
      sourceUrl: 'https://vaki.co/vaki/FundacionCovidaColombia',
      sourceOrg: 'Fundación Covida',
      submitterNote:
        'El hallazgo de crowdfunding más sólido de esta pasada. Campaña Vaki verificada, US$16,199 recaudados de 442 donantes nombrados. Corroborado independientemente por El Quindiano (con archivo de cobertura de Covida desde 2018, citando al director financiero Santiago Meneses por nombre), Las2orillas, 180 Grados Quindío y NCQuindio - los cuatro medios reportando el mismo colapso de muro. Sitio propio (www.fundacioncovida.com) y correo institucional para certificados tributarios. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Help Our Family in Armenia, Colombia Rebuild After the Earth" (Valentina Barrera)',
      address: null,
      phone: null,
      needsText: 'Reparación de vivienda y reemplazo de pertenencias dañadas para los hermanos de la organizadora y sus familias en Armenia.',
      sourceUrl: 'https://www.gofundme.com/f/help-our-family-in-armenia-colombia-rebuild-after-the-earth',
      sourceOrg: null,
      submitterNote:
        'Organizadora nombrada (Valentina Barrera, Las Vegas NV - diáspora), sistema de pago verificado de GoFundMe con garantía de protección de donación. $710 recaudados de meta $1,500, 7 donaciones. Beneficiarios específicos nombrados, sin lenguaje de urgencia vago. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki: Renacer-Armenia (Paula Bello)',
      address: null,
      phone: null,
      needsText: 'Familia en Armenia que perdió su vivienda, pertenencias y mascotas en el terremoto; la familia está confirmada a salvo.',
      sourceUrl: 'https://vaki.co/vaki/renacer-armenia',
      sourceOrg: null,
      submitterNote:
        'Organizadora verificada en Vaki (Paula Bello). US$378 recaudados de 7 donantes nombrados con fechas incrementales plausibles, cierra 26 ago 2026. Una lectura inicial de un agente mostró "0 donantes" (snippet obsoleto de Google) pero tres agentes independientes que revisaron la página en vivo (Instagram, crowdfunding, Facebook) confirman la tracción real. Sin lenguaje de urgencia ni enlace roto. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Earthquake Relief for Pereira & Armenia, Colombia" (Juan Jose Garcia)',
      address: null,
      phone: null,
      needsText: 'Ayuda para familias afectadas en Pereira Y Armenia conjuntamente (no exclusivo de Armenia).',
      sourceUrl: 'https://www.gofundme.com/f/earthquake-relief-for-pereira-armenia-colombia',
      sourceOrg: null,
      submitterNote:
        'Organizador identificado en Reino Unido con 24 donaciones reales (£606 de meta £5,000), pero los fondos se canalizan a través de "un familiar" no nombrado en la región, sin institución verificable - mecanismo de custodia de fondos débil. Confianza baja - incluido para que el admin decida, con la advertencia explícita.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: armenia.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: armenia.id,
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
      permalink: 'https://x.com/kienyke/status/2087191669997244712',
      authorHandle: '@kienyke',
      category: 'AID_POINT' as const,
      placeName: 'Armenia - Cruz Roja Colombiana',
      note: 'Cruz Roja Colombiana pide donación de sangre; puntos habilitados en Bogotá, Medellín, Cali, Manizales, Armenia, Cartagena y Villavicencio.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/GilsGinni/status/2087631007293772253',
      authorHandle: '@GilsGinni',
      category: 'AID_POINT' as const,
      placeName: 'Fundación Kenovy, Armenia',
      note: 'Hilo compilado de rescate animal: la Fundación Kenovy en Armenia perdió su refugio; da el número Bre-B/Nequi/Daviplata 3009018232.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db37kZAFRll/',
      authorHandle: 'banconacionaldesangre / cruzrojacol',
      category: 'AID_POINT' as const,
      placeName: 'Armenia - Banco Regional de Sangre',
      note: 'Post oficial conjunto nombrando el punto de donación de sangre de Armenia (Av. Bolívar #23 Norte-60) junto a Manizales y Cali.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcBmQs_xxmE/',
      authorHandle: 'fundacionkenovycolombia',
      category: 'AID_POINT' as const,
      placeName: 'Fundación Kenovy Colombia, Armenia',
      note: 'Publicación oficial de Kenovy operando como centro de acopio de agua para Pijao/Génova, con múltiples canales de donación activos.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8I9rSkZwP/',
      authorHandle: 'estefaniamartinez.oficial',
      category: 'AID_POINT' as const,
      placeName: 'Armenia, Quindío (varios sitios)',
      note:
        'Carrusel "Armenia se une para ayudar" nombrando varios sitios/personas necesitando ayuda: Doña Hilda, Los Naranjos, Fundación Tizu, Villa Carolina, El Berlín, Fundación Oki Doki, más una caseta comunal en La Isabela y Fundación Manos Unidas de Dios mencionada en comentarios. Ninguno verificado individualmente aún - lista de pistas para una futura pasada.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/teleSUR/posts/pfbid02QtvtjjJcnqXjpCi1xK774HfJuMxn5WGmQQ3UMHdVTvRTS3D54G36NBURo3p5eiLXl',
      authorHandle: 'teleSUR',
      category: 'AID_POINT' as const,
      placeName: 'Banco Regional Armenia',
      note: 'teleSUR compartiendo el gráfico oficial "Puntos de Donación" de Cruz Roja Colombiana con el punto de Armenia.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/permalink.php?story_fbid=pfbid0Dguskg2CZqg2kSF8UJr8xbpy1WJuNXjzmRckKKmiVuubGbMaH1be6FEi45vUWqYVl&id=61593321565895',
      authorHandle: 'Junta de Acción Comunal Barrio Santander',
      category: 'AID_POINT' as const,
      placeName: 'Salón Comunal Escuela Barrio Santander',
      note: 'Nuevo punto de acopio barrial con teléfono y horario de recepción.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid025k3aHRnDFdvpaX48z73wyjnT1LMdgaaetv5uK3QsAj9cmp6FRFQT9aRcab9jMK3pl&id=61574909973919',
      authorHandle: 'NC Quindío',
      category: 'AID_POINT' as const,
      placeName: 'Centro de Convenciones / Bomberos Armenia',
      note: 'Medio regional reportando el Centro de Convenciones como hub departamental principal, y el Cuerpo de Bomberos como punto local paralelo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/hmfQuindio/posts/pfbid02VR2wU8fissz6Xeyrqm8R3t75V8g5SEpkjrbvj8s3CKWh9B2NY2tHq4gLjdkJ4xmLl',
      authorHandle: 'Hospital Mental de Filandia Quindío',
      category: 'AID_POINT' as const,
      placeName: 'Consulta Externa, Armenia',
      note: 'Anuncio oficial de brigada móvil de salud mental/médica gratuita para afectados por el sismo, iniciando 14 de agosto.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/TransmisoraQuindio/posts/pfbid02dFnVU3PGc5wZ7mgugDnyPd6GRmThZznhiUwbfFEnTmx7GZA9Lh9TsqAEfekZ5B3Bl',
      authorHandle: 'Transmisora Quindío',
      category: 'OFFICIAL' as const,
      placeName: 'Puesto de Mando Unificado, Quindío',
      note: 'Balance oficial de la Secretaría de Salud del Quindío: 64 heridos en Armenia, 40 en Quimbaya, 24 en Circasia.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/permalink.php?story_fbid=pfbid028zDMRPYnziC9cF9DRC7cX2tSvuQQTDnUaNE3XuTTak5K7NNC75HDEKRbD5QMSrMWl&id=100047441090970',
      authorHandle: 'Entérate Quindío',
      category: 'OFFICIAL' as const,
      placeName: 'Instituto Nacional de Medicina Legal',
      note: 'Herramienta oficial de reporte de personas desaparecidas del Instituto Nacional de Medicina Legal y Ciencias Forenses, sin período de espera requerido.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/ArmeniaQuindioc/posts/pfbid02iNBVqKNi3LewojpFEJHpbfU67pBuBPkwVhejxR1xrDiWiR4GJ7M3Vevd9dbGHeC7l',
      authorHandle: 'Armenia Quindío',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Zonas rurales de Armenia',
      note: 'Publicación viral con fotos de viviendas rurales destruidas, pidiendo no olvidar las zonas rurales en la respuesta al terremoto.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink:
        'https://www.facebook.com/groups/2121443294755261/?multi_permalinks=4529832533916313&hoisted_section_header_type=recently_seen',
      authorHandle: 'Luisa Fernanda Londoño V.',
      category: 'NEED' as const,
      placeName: 'Armenia, Quindío (diáspora Texas)',
      note: 'GoFundMe de diáspora (meta $1,240) publicado en un grupo de mamás latinas en Texas, para familiares en Armenia que lo perdieron todo.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@juanjo.garzon1/video/7673543868004060436',
      authorHandle: '@juanjo.garzon1',
      category: 'AID_POINT' as const,
      placeName: 'Armenia / Quimbaya',
      note: 'Lista curada "cómo ayudar" nombrando Cruz Roja Armenia y el Centro de Convenciones como puntos habilitados.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@vianmq/video/7672971479012674837',
      authorHandle: '@vianmq',
      category: 'NEED' as const,
      placeName: 'Conjunto Alejandría, sur de Armenia',
      note: 'Residente denuncia que el conjunto fue "totalmente abandonado" por las entidades de ayuda; sin pérdidas humanas pero sin atención institucional.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@tatinavarro72/video/7672565238310423829',
      authorHandle: '@tatinavarro72',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hospital La Sagrada Familia, Armenia',
      note: 'Tributo al personal médico del Hospital La Sagrada Familia por su labor durante el caos del sismo.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@elizabethmarin098/video/7673888767530257685',
      authorHandle: '@elizabethmarin098',
      category: 'AID_POINT' as const,
      placeName: 'Hospital San Juan de Dios, Armenia',
      note: 'Metraje del despliegue de Cruz Roja, Ejército y CAUTE Emergencias sin Fronteras en el hospital.',
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
        municipioId: armenia.id,
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
