/**
 * Pass 30 (2026-08-15) — follow-up social media research pass on
 * Dosquebradas, days after the original deep pass. Per an explicit user
 * instruction, every candidate this pass was cross-checked against all 62
 * already-seeded Pereira aid points (Pereira and Dosquebradas are treated
 * by residents as one metro area) — items that explicitly serve both
 * cities are flagged as such in submitterNote rather than silently filed
 * under only one city. See wiki/17-allied-resources-and-community.md
 * "Pass 30" for full reasoning. Run once via
 * `npx tsx prisma/seed-pass30-dosquebradas-followup.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const dosquebradas = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66170' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Cámara de Comercio de Dosquebradas (CAMADO) - Sede TIP',
      address: 'Calle 35 # 16-33, Barrio Guadalupe, Dosquebradas (frente a la sede de Comfamiliar de Dosquebradas)',
      phone: '318 666 4528',
      needsText: 'Alimentos no perecederos, agua, alimento para mascotas, cobijas y colchonetas, pañales para bebés y adultos, elementos de aseo, ropa nueva o en buen estado, elementos desechables. Empresarios afiliados también aportan vehículos para recolección/entrega.',
      sourceUrl: 'https://www.tiktok.com/@camaradedosquebradas/video/7674001799640108308',
      sourceOrg: 'Cámara de Comercio de Dosquebradas',
      submitterNote:
        'Sin solapamiento con Pereira: institución propia de Dosquebradas, distinta de cualquier gremio empresarial de Pereira. Corroborado de forma independiente por Facebook (misma cuenta oficial) y TikTok, ambos con la misma dirección exacta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio - Plazoleta del CAM, Dosquebradas',
      address: 'Plazoleta del CAM (Centro Administrativo Municipal), Dosquebradas',
      phone: null,
      needsText: 'Alimentos e insumos de higiene y cuidado personal para familias damnificadas, vinculado al plan de contingencia de la Secretaría de Educación de Dosquebradas (PAE para estudiantes que no pueden asistir presencialmente).',
      sourceUrl: 'https://www.pulzo.com/nacion/terremoto-en-dosquebradas-colegios-danados-reconstruccion-y-plan-educativo-tras-sismo-PP5275066A',
      sourceOrg: 'Alcaldía de Dosquebradas / Secretaría de Educación',
      submitterNote:
        'Sin solapamiento con Pereira: el CAM es el propio centro administrativo municipal de Dosquebradas. Corroborado por tres fuentes independientes (Facebook, TikTok y el artículo de Pulzo/El Diario del Pereira citando al Secretario de Educación Homel Carmona).',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue temporal Campestre B',
      address: 'Sector Campestre B, Dosquebradas',
      phone: null,
      needsText: 'Refugio para aproximadamente 120 personas de 36 familias, alojadas actualmente en unas 47 carpas, para residentes que perdieron su vivienda o no pueden regresar a ella tras el terremoto.',
      sourceUrl: 'https://www.tiktok.com/@noticiasunoa/video/7674007831858679048',
      sourceOrg: null,
      submitterNote: 'Sin solapamiento con Pereira: "Campestre B" es un sector propio de Dosquebradas, no aparece en la lista de albergues de Pereira (Estadio Mora Mora, Parque del Oso, Ecoparque El Vergel, Plaza de Ferias Cerritos).',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Cuarto albergue temporal en adecuación - sector La Graciela',
      address: 'Sector La Graciela, Dosquebradas',
      phone: null,
      needsText: 'La Alcaldía está adecuando un cuarto espacio de albergue temporal en La Graciela para ~150 cupos adicionales, sumado a los 3 albergues ya operando en Dosquebradas (capacidad conjunta de 900 personas). Las familias reciben alojamiento, alimentación, atención en salud, apoyo psicosocial e insumos básicos.',
      sourceUrl: 'https://www.facebook.com/Noticierovivalaradio/posts/pfbid02Phh3UUSc3Pf9sK5T2TR3cLQPjmh8gUv5y5Sbt8u4wYzHAcjMetpsWTohn49q3q24l',
      sourceOrg: 'Alcaldía de Dosquebradas',
      submitterNote: 'Sin solapamiento con Pereira: los 4 albergues descritos son explícitamente "en Dosquebradas" - ninguno coincide con los albergues ya sembrados de Pereira. Corroborado también por TikTok.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Colegio María Auxiliadora - punto de mercados, ropa y duchas',
      address: 'Colegio María Auxiliadora, Dosquebradas, Risaralda',
      phone: null,
      needsText: 'Mercados (alimentos), donaciones de ropa, y servicio de duchas/baños para personas de Pereira o Dosquebradas que estén desempleadas o sean damnificadas.',
      sourceUrl: 'https://x.com/unatalvickycar/status/2088014030157787629',
      sourceOrg: null,
      submitterNote:
        'SOLAPAMIENTO EXPLÍCITO CON PEREIRA: el propio post dice que el servicio es "para las personas que viven en Pereira o Dosquebradas". El punto físico está en Dosquebradas pero sirve a ambas ciudades - no duplica ningún punto ya sembrado en la lista de Pereira, pero se marca aquí para que un revisor humano decida si también debe listarse bajo Pereira.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Fundación Porque Juntos Somos Más - Centro de Acopio',
      address: 'K16 #27-8, Dosquebradas (contiguo al Hotel Yellow)',
      phone: '315 345 0056 / 313 666 5206',
      needsText: 'Alimentos no perecederos, agua, elementos de aseo, pañales, cobijas, ropa limpia, e insumos para bebés/niños/adultos, para familias en "los albergues de Pereira y Dosquebradas". Ofrece servicio de recolección a domicilio.',
      sourceUrl: 'https://www.instagram.com/p/Db581lMIrK8/',
      sourceOrg: 'Fundación Porque Juntos Somos Más',
      submitterNote:
        'SOLAPAMIENTO EXPLÍCITO CON PEREIRA: descrito como sirviendo "los albergues de Pereira y Dosquebradas" conjuntamente, aunque el punto de acopio físico está en Dosquebradas. Confianza media: Instagram marcó la imagen como "contenido de IA", sin bandera roja en la solicitud misma (solo bienes físicos + recolección, sin pago).',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Instituto Pedagógico Horizontes - Fondo de Reconstrucción Escolar',
      address: 'Dosquebradas',
      phone: null,
      needsText:
        'Fondo de reconstrucción para un colegio con 38 años de trayectoria, con daños graves por el sismo. Canales: Corresponsal Bancolombia convenio 93344 (verificar que diga "Instituto Pedagógico Horizontes", referencia 24938705), o Nequi/Bancolombia cuenta de ahorros 72500005642, titular María Consuelo Villegas CC 24938705.',
      sourceUrl: 'https://www.instagram.com/p/Db4aoTdNfEW/',
      sourceOrg: 'Instituto Pedagógico Horizontes',
      submitterNote:
        'PRECAUCIÓN: un comentario de hace 1 día reporta que la cuenta bancaria puede estar fallando ("dice que la cuenta no puede recibir transferencias") - verificar con la institución antes de donar montos grandes. Sin solapamiento con Pereira: colegio y fondo propios de Dosquebradas.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: Donate to help our family after Colombia\'s earthquake (David Londono)',
      address: null,
      phone: null,
      needsText: 'Fondos para (1) la prima del organizador, madre soltera, y su hijo en Dosquebradas, cuyo apartamento quedó severamente dañado e inhabitable, y (2) la finca cafetera de su tía en Marsella, Risaralda, con el techo colapsado.',
      sourceUrl: 'https://www.gofundme.com/f/donate-to-help-our-family-after-colombias-earthquake',
      sourceOrg: null,
      submitterNote:
        'Campaña activa y verificable: US$2,816 recaudados de una meta de US$5,000 (57%), 46 donantes, creada hace 2 días. El organizador vive en Pereira (su hogar familiar principal está a salvo, según su propio relato) pero los daños financiados son específicamente en Dosquebradas y Marsella - distinta de todas las campañas de GoFundMe ya sembradas para Pereira.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: dosquebradas.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: dosquebradas.id,
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
      permalink: 'https://www.facebook.com/AlcaldiadeDosquebradas/posts/pfbid0377YoVkKyg7ncdyZz7Ce87Fnxdm1ucvFzbGeLy7vv1oMfqGV9A5dAUejePy7k2iQql',
      authorHandle: 'Alcaldía de Dosquebradas',
      category: 'OFFICIAL' as const,
      placeName: 'Zona rural de Dosquebradas',
      note: 'Balance oficial: "Ya hemos entregado ayudas humanitarias al 90% de la zona rural, llegando a cada rincón afectado tras el terremoto." Comentarios de residentes de sectores específicos (El Cofre, Los Pinos, Los Guamos, barrio Comuneros) señalan que sus zonas aún no han recibido ayuda - sugiere que la respuesta entró en una fase de equidad/completitud de la distribución más que de emergencia inicial.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/marchenojob/status/2087981034415473135',
      authorHandle: '@marchenojob',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas (municipio completo)',
      note: 'Balance de la administración municipal: aproximadamente 2,000 familias afectadas en Dosquebradas; operación activa de identificación de daños y atención a damnificados. Un estudiante murió y tres sedes escolares fueron destruidas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Mineducacion/status/2088308699139895601',
      authorHandle: '@Mineducacion',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas y Pereira',
      note: 'Comunicado oficial del Ministerio de Educación nombrando víctimas estudiantiles: David Ramírez (IE Fabio Vásquez Botero, Dosquebradas), junto con Luisanny Linares (IE Villa Santana, Pereira), un estudiante de la UTP, y dos de la Universidad Santiago de Cali. SOLAPAMIENTO EXPLÍCITO: un solo comunicado oficial que nombra víctimas de Dosquebradas y de Pereira conjuntamente.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/CamilaOvejas/status/2088244359791817118',
      authorHandle: '@CamilaOvejas',
      category: 'NEED' as const,
      placeName: 'Dosquebradas (registro de damnificados en línea)',
      note: 'El sistema oficial de registro de damnificados falla: el formulario se cierra solo al subir la evidencia requerida, impidiendo registrar daños a la vivienda. Etiqueta directamente a @AlcaldiaDosq y @UNGRD.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/ErnestoOrozcoD/status/2088000752526471239',
      authorHandle: '@ErnestoOrozcoD',
      category: 'OFFICIAL' as const,
      placeName: 'Ixel Moda 2026, Valledupar (donaciones destinadas a Dosquebradas)',
      note: 'La Alcaldía de Valledupar se une a un llamado de Fedemunicipios (junto con Ibagué) para organizar donaciones voluntarias específicamente para las familias de Dosquebradas en el evento Ixel Moda 2026 - solidaridad intermunicipal nueva, no reportada en la pasada anterior.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcC5clnnEjJ/',
      authorHandle: 'elpregon_noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Sector Santa Mónica, Dosquebradas',
      note: 'Inició la demolición controlada de un edificio de cuatro pisos estructuralmente comprometido por el terremoto en el sector Santa Mónica - la respuesta entra en fase activa de remoción de riesgos.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@noticiasunoa/video/7673602827880533255',
      authorHandle: '@noticiasunoa',
      category: 'NEED' as const,
      placeName: 'Conjunto Portal del Parque, Dosquebradas',
      note: 'La Torre 6 del conjunto residencial Portal del Parque sufrió colapso total; las Torres 3, 4 y 5 presentan daño estructural grave. Todo el conjunto fue evacuado; familias siguen esperando autorización para recuperar pertenencias.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCy-uhxZ_q/',
      authorHandle: 'viajandoandoeneleje',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Dosquebradas',
      note: 'Llamado por persona desaparecida: Jairo Aldana, desaparecido desde el terremoto en la zona de Dosquebradas. Familiares piden información al 323 442 9795. PRECAUCIÓN: Instagram marcó el post como "contenido de IA"; verificar antes de difundir.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8zaZJx7VM/',
      authorHandle: 'canal_vealo',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas (municipio completo)',
      note: 'La Alcaldía de Dosquebradas (vía DIGER) abrió una encuesta formal en Microsoft Forms para que los residentes reporten daños en sus viviendas y priorizar la verificación técnica - nueva fase de evaluación de daños hacia la reconstrucción.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/ejealdia/posts/pfbid0aSjdqv71pdQKpKtsckChUendnwDMTP2ExzkoUTXDih5reM8viLJ3YxYuveBVHGKFl',
      authorHandle: 'Eje al Día Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Dosquebradas (movilidad/seguridad)',
      note: 'El toque de queda (6pm-6am) y el "Día sin Carro" se extienden hasta las 11:59pm del lunes 17 de agosto (Decreto 316), para facilitar el movimiento de ambulancias y maquinaria pesada.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8qfE5xs3A/',
      authorHandle: 'hemocentrodelotun',
      category: 'NEED' as const,
      placeName: 'Hospital Santa Mónica, Dosquebradas',
      note: 'Jornada de donación de sangre con puntos en Hospital Santa Mónica (Dosquebradas) y Hemocentro del Otún (Pereira). ALERTA: comentarios recientes reportan que el punto de Dosquebradas puede ya no estar recibiendo donaciones ("no están recibiendo donaciones de sangre... el centro está colapsado") - señal de un punto de ayuda que puede necesitar actualización o retiro antes de seguir difundiéndolo.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.google.com/search?q=notihechos+Dosquebradas+%22La+Graciela%22+%22Miraflores%22+empresa+privada+tumbar',
      authorHandle: 'notihechos',
      category: 'NEED' as const,
      placeName: 'La Graciela / Miraflores, Dosquebradas',
      note: 'Denuncia sin verificar (cuenta pequeña, baja participación): una empresa privada habría intentado demoler viviendas dañadas en La Graciela y Miraflores sin permitir adecuadamente a los residentes recuperar pertenencias ni dar consentimiento. Se marca para revisión humana, no como hecho confirmado.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@radiola_tv/photo/7673329622473329940',
      authorHandle: '@radiola_tv',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Casa del padre de la cantante Francy, Dosquebradas',
      note: 'La cantante de música popular Francy viajó a la casa de su padre en Dosquebradas para recibir donaciones informales para víctimas del terremoto en el departamento.',
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
        municipioId: dosquebradas.id,
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
