/**
 * Pass 69 (2026-08-16) — first city in the sixth research round, Pereira.
 * The user flagged a "huge update today" — this pass confirms real
 * movement: the earthquake's date has advanced to Aug 16 in the sources
 * themselves, and this round's five agents surfaced an official 7-point
 * Alcaldía acopio network (via a DANE Colombia graphic) that, despite
 * one agent's caution that it was probably already known, checked
 * directly against all five prior rounds' seed files and confirmed
 * genuinely new — none of the seven named points had been seeded before.
 *
 * Two leads were caught and dropped as duplicates: the "Angie y Thiago"
 * GoFundMe/Vaki campaign (already seeded pass 45) and the Hospital San
 * Jorge blood-donation point (already seeded pass 13, corroborated pass
 * 14, this round's find is a third re-confirmation of the same Mon-Sat
 * 8am-5pm hours). One notable non-Pereira item was explicitly excluded:
 * the Óscar Benavides Corte Suprema fraud complaint, which belongs to
 * Chocó/Quibdó's storyline (already tracked there since pass 49) — a
 * crowdfunding agent surfaced it again as if new to Pereira, but it
 * isn't Pereira-specific and is out of scope here.
 *
 * No TollRecord logged this pass: Pereira-specific death/injury figures
 * are genuinely inconsistent across same-day sources this round (67 to
 * 94 dead depending on outlet and hour) — the two most-corroborated
 * numbers (94 dead / 259 injured) are documented in the wiki and as a
 * flagged social post, not forced into the toll history, consistent
 * with this project's discipline on contested figures.
 * See wiki/17-allied-resources-and-community.md "Pass 69" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass69-pereira-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio Consota',
      address: 'Manzana 7 y Manzana 8, Villa Consota, Cuba, Pereira',
      phone: null,
      needsText: 'Uno de los 7 puntos de la red oficial de acopio habilitada por la Alcaldía de Pereira.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'DANE Colombia / Alcaldía de Pereira',
      submitterNote: 'Parte de un gráfico oficial de DANE Colombia (cuenta gubernamental verificada) publicado el 16 de agosto, "Red de 7 puntos de acopio habilitados por la Alcaldía". Verificado directamente contra las cinco pasadas anteriores de Pereira — ninguno de los 7 puntos con este nombre había sido sembrado antes, pese a que un agente de esta misma ronda sospechó que podría tratarse de la red "café" ya conocida.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio Perla del Otún',
      address: 'Diagonal a la iglesia de los 2.500 Lotes, Cuba, Pereira',
      phone: null,
      needsText: 'Uno de los 7 puntos de la red oficial de acopio habilitada por la Alcaldía de Pereira.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'DANE Colombia / Alcaldía de Pereira',
      submitterNote: 'Mismo gráfico oficial que el punto Consota.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio El Remanso',
      address: 'Avenida Principal del barrio El Remanso, junto al Centro de Salud, Pereira',
      phone: null,
      needsText: 'Uno de los 7 puntos de la red oficial de acopio habilitada por la Alcaldía de Pereira.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'DANE Colombia / Alcaldía de Pereira',
      submitterNote: 'Mismo gráfico oficial que el punto Consota.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio Kennedy',
      address: 'Parque principal de Kennedy, Pereira',
      phone: null,
      needsText: 'Uno de los 7 puntos de la red oficial de acopio habilitada por la Alcaldía de Pereira.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'DANE Colombia / Alcaldía de Pereira',
      submitterNote: 'Mismo gráfico oficial que el punto Consota.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio Café Ormaza',
      address: 'Calle 3 Bis # 5-38, avenida del Río, Pereira',
      phone: null,
      needsText: 'Uno de los 7 puntos de la red oficial de acopio habilitada por la Alcaldía de Pereira.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'DANE Colombia / Alcaldía de Pereira',
      submitterNote: 'Mismo gráfico oficial que el punto Consota.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio Café San Nicolás',
      address: 'Carrera 14 Bis # 28-38, antigua Estación de Policía, Pereira',
      phone: null,
      needsText: 'Uno de los 7 puntos de la red oficial de acopio habilitada por la Alcaldía de Pereira.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'DANE Colombia / Alcaldía de Pereira',
      submitterNote: 'Mismo gráfico oficial que el punto Consota.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de Acopio Comuna del Café',
      address: 'Carrera 3 con calle 59A, sector A, Parque Industria, Pereira',
      phone: null,
      needsText: 'Uno de los 7 puntos de la red oficial de acopio habilitada por la Alcaldía de Pereira.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'DANE Colombia / Alcaldía de Pereira',
      submitterNote: 'Mismo gráfico oficial que el punto Consota.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Centro de acopio comunitario Barrio Providencia',
      address: 'Barrio Providencia, Pereira (dirección exacta no publicada)',
      phone: null,
      needsText: 'Donaciones generales y suministros de alimento para una olla comunitaria organizada por la comunidad; también cuenta con un puesto de primeros auxilios.',
      sourceUrl: 'https://x.com/teleSURtv/status/2089040692618162230',
      sourceOrg: null,
      submitterNote: 'Reportado por teleSUR (medio internacional verificado) el 16 de agosto con video en sitio; la comunidad organizó el punto por su cuenta.',
    },
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue improvisado Parque La Libertad',
      address: 'Parque La Libertad, Pereira (cerca de la comuna Villasantana)',
      phone: null,
      needsText: 'Decenas de familias desplazadas de la comuna Villasantana durmiendo en el parque, sitio completamente oscuro de noche; reporte corroborante indica que el sitio está desbordado y necesita medicinas y asistencia urgente.',
      sourceUrl: 'https://x.com/pereiraenvivo/status/2088827068029063390',
      sourceOrg: null,
      submitterNote: 'Corroborado independientemente por Pereira En Vivo (medio local verificado, con líneas de WhatsApp propias) y por un reporte de Clarín el mismo día describiendo el mismo parque como desbordado.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'El Barista Álamos / Pull & Run — Centro de Acopio',
      address: 'Calle 14 #27-17, Pereira, Risaralda',
      phone: 'WhatsApp @jennyfermonar (Jennifer Monar)',
      needsText: 'Alimentos no perecederos, agua, ropa y otros elementos de primera necesidad. Recepción a partir de las 3:00 p.m.',
      sourceUrl: 'https://www.instagram.com/p/Db_SC95Rjwv/',
      sourceOrg: 'El Barista Álamos (Ruta del Café) / Pull & Run',
      submitterNote: 'Negocio local real (parte de la cadena Ruta del Café), co-etiquetado por un club de running y una página de barrio; contacto nombrado y dirección concreta.',
    },
    {
      kind: 'VET' as const,
      name: 'Protección Felina Pereira — busca nueva sede',
      address: 'Pereira, Risaralda (sede anterior quedó inhabitable; buscan casa o bodega grande)',
      phone: 'WhatsApp 321 801 7478',
      needsText: 'Su sede quedó inhabitable por el terremoto. Necesitan una casa o bodega grande (con patio/zona amplia, espacio seguro y cerrado) en alquiler, préstamo o donación para reubicar el refugio felino.',
      sourceUrl: 'https://www.instagram.com/p/Db_2cy-R6KZ/',
      sourceOrg: 'Protección Felina Pereira',
      submitterNote: 'Cuenta establecida de rescate felino (@proteccionfelinaper), etiquetando activamente al alcalde y al gobernador; comentarios con actividad de hace apenas 1 hora al momento de la verificación.',
    },
    {
      kind: 'VET' as const,
      name: 'Hospital Veterinario MedicalVet + Cruz Roja + Ejevet — "Kilómetro Cero"',
      address: 'Punto de acopio: Hospital Veterinario MedicalVet, Pitalito, Huila (transportan ayuda hacia Chocó, Caldas, Risaralda/Pereira, Valle y Quindío)',
      phone: '311 835 4876',
      needsText: 'Alimento seco y húmedo para mascotas, cobijas, kits de aseo; también realizan cirugías ortopédicas para caninos/felinos con fracturas trasladables.',
      sourceUrl: 'https://www.instagram.com/p/Db_LNXKTZzv/',
      sourceOrg: 'Hospital Veterinario MedicalVet / Cruz Roja Colombiana / Ejevet',
      submitterNote: 'Alianza institucional entre una cadena veterinaria nombrada, la Cruz Roja Colombiana y una clínica veterinaria local. El punto físico de recepción está en Pitalito, Huila (no en Pereira misma) — es un punto alimentador que transporta la ayuda hacia Pereira y otras ciudades.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help Pereira, Colombia Rebuild After the Earthquake (Yannin Garcia)',
      address: null,
      phone: null,
      needsText: 'Alimentos, agua potable, pañales y artículos de higiene para familias desplazadas; apoyo específico para adultos mayores del Centro de Bienestar de Ancianos San José que no tienen respaldo familiar.',
      sourceUrl: 'https://www.gofundme.com/f/help-pereira-colombia-rebuild-after-the-earthquake-ms5nh',
      sourceOrg: null,
      submitterNote: 'Campaña activa: meta $9,000, $2,525 recaudados de 24 donantes al momento de la verificación. Organizadora (Alexandria, VA) planea viajar personalmente a Colombia para distribuir la ayuda con un contacto local en Pereira.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Help My Loved Ones Rebuild Their Lives After Earthquake (Paola Silva)',
      address: null,
      phone: null,
      needsText: 'Costos de vivienda temporal y reconstrucción de una casa con daño estructural; apoyo a la fundación de rescate animal Siempre a Tu Lado (escasez de alimento); reparación del hogar de ancianos San José, cuyos residentes se refugian temporalmente en una iglesia.',
      sourceUrl: 'https://www.gofundme.com/f/help-pereira-earthquake-survivors-rebuild',
      sourceOrg: null,
      submitterNote: 'Campaña activa: meta $5,000, $2,931 recaudados de 42 donantes. Nombra beneficiarios concretos y verificables (vivienda familiar, una fundación animal ya conocida por su escasez de comida, y el hogar de ancianos San José).',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — familia Toro (reconstrucción de vivienda)',
      address: null,
      phone: null,
      needsText: 'Fondos para reconstruir la vivienda destruida de la familia Toro en Pereira.',
      sourceUrl: 'https://www.tiktok.com/@sv__m/video/7673713377151208724',
      sourceOrg: null,
      submitterNote: 'Apelación personal nombrando a una familia específica, enlazando a una campaña de Vaki (plataforma colombiana real y verificable) en la biografía de la cuenta, en vez de un simple número de cuenta.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: pereira.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: pereira.id,
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
      permalink: 'https://www.facebook.com/reel/1589736866208976',
      authorHandle: 'SVC Noticias',
      category: 'OFFICIAL' as const,
      placeName: 'Centro de acopio Expofuturo, Pereira',
      note: 'ESCALADA del caso Expofuturo más allá de "se nombró a una senadora" (ya conocido desde la pasada 55): denuncia en video que ahora afirma directamente que la senadora María Irma Noreña (esposa del alcalde Mauricio Salazar) "se adueñó de las ayudas humanitarias" donadas en el centro Expofuturo, condicionando su entrega a que ella autorice. Corroborado de forma independiente por el periodista Luis David Caro en X, quien pide formalmente una investigación de la Procuraduría (@PGN_COL). Un post de un ciudadano (Gilberto Pulgarin) ofrece una nota de cautela: aclara que no se ha probado que alguien esté robando la ayuda. No se encontró apertura formal de investigación de la Procuraduría sobre este caso específico — las alegaciones siguen sin comprobarse públicamente a la fecha de esta pasada.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/lafm/status/2089029038757077480',
      authorHandle: '@lafm',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'El DNP (Departamento Nacional de Planeación) advierte que reconstruir Pereira podría costar más de $10 billones de pesos — nueva estimación de la fase de reconstrucción. Complementa el nombramiento de Julián Buitrago (nativo de Pereira, exsecretario de Planeación de la ciudad) como nuevo director del DNP para liderar la reconstrucción; Buitrago advirtió que las estimaciones iniciales de daño podrían quedarse cortas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/mexicotimes/status/2088725967233786205',
      authorHandle: '@mexicotimes',
      category: 'NEED' as const,
      placeName: 'Hotel Dibeni, Pereira',
      note: 'Nuevo caso de personas desaparecidas: Mario Alberto Zapata Verdier (57) y Brenda Eloísa Flores Reyes (42), pareja mexicana de Durango, siguen desaparecidos tras el colapso del Hotel Dibeni (el mismo hotel del caso ya cerrado de Juan Felipe Giraldo, pero una pareja distinta y aún sin resolver). Última comunicación: un mensaje minutos antes del sismo. La Cancillería de México activó búsqueda formal el 14 de agosto. Línea consular de emergencia de la embajada: +57 313 878 6028 (también WhatsApp), útil para cualquiera con información.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/FrecuenciaDigitalRadioQ/posts/pfbid02Jbd7ZWdnuow83QnRRC1ERuFuM4yWY82a1DqhWZxE8FFpXM1z1pYGCaFy8DnAfUfel',
      authorHandle: 'Hechos Colombia',
      category: 'NEED' as const,
      placeName: 'Eje Cafetero / Pereira',
      note: 'Nuevo caso de persona desaparecida: la familia de Frandiney Noreña (sin relación aparente con la senadora del caso Expofuturo) no ha podido contactarlo desde el sismo del 10 de agosto; tampoco hay noticias de sus contactos en Pereira. Se pide compartir cualquier información con la familia o las autoridades.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/ElBETTOTELODICE/posts/pfbid02WgrvYqnfyV2ZmnQZEC1rXfF7bGJkC1RTMYq7SAAEL6wpDzQKrZ1LtPbFnThm9uNnl',
      authorHandle: 'Informate con Betto',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Hotel Dibeni, Cra 8 #15-55, Pereira',
      note: 'Cierre trágico de otro caso: Juan Fernando Rodríguez Álvarez, trabajador de una tienda de celulares oriundo de Ibagué, se hospedaba en el Hotel Dibeni cuando ocurrió el sismo. Tras días de búsqueda intensa por familiares y amigos que difundieron su foto en redes, las autoridades confirmaron que fue hallado muerto entre los escombros — es la TERCERA víctima identificada del Hotel Dibeni, distinta del caso ya documentado de Juan Felipe Giraldo.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/RisaraldaEnVivoOficial/posts/pfbid02cw14VerEc7Kx7SxQ3RXMLk3FJAq3DM1HUieEkMTjtpn2KjjH5vTAYYXs2iET5Qfml',
      authorHandle: 'Risaralda En Vivo',
      category: 'NEED' as const,
      placeName: 'Centro (calles 7-8), Pereira',
      note: 'DENUNCIA CONTESTADA, no confirmada: comerciantes reportan que 12 personas haciéndose pasar por "Topos" (rescatistas voluntarios) entraron a un edificio dañado por el sismo entre las calles 7 y 8 del centro de Pereira con el pretexto de buscar sobrevivientes, pero presuntamente robaron mercancía por más de $5.000.000 COP. Un comentario destacado cuestiona si se trata de un rumor para desacreditar denuncias legítimas ya presentadas contra la alcaldía — tratar como alegación en disputa activa, no como hecho establecido.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/Lindaprada00/posts/pfbid02b4zaLT4EHfkTfd44jvGbm51etg5FuKobArJDVSivytJwHhDAkb8GPUPmuEjoi259l',
      authorHandle: 'Linda Prada',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Pereira',
      note: 'Historia de sobreviviente: "William" cayó del quinto piso de su edificio en colapso, sobrevivió agarrándose de un cable de internet que amortiguó la caída, y luego volvió a los escombros para ayudar a sacar a su esposa, hallada con vida con fracturas en ambas piernas y un golpe en la cabeza, ahora en UCI en el Hospital Universitario San Jorge. La pareja, casada 39 años, perdió su casa y todas sus pertenencias. No se da un canal de donación concreto, por lo que se registra como interés humano, no como punto de ayuda verificado.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid022Dc2YWCK2Rp3ANgee1Prp9i4cv1a4TrM5he4aCQJJjJdUUS1d3HcQkdCJpQB93C4l&id=61592985050177',
      authorHandle: 'información actual',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'Desarrollo de reconstrucción: el alcalde de Pereira, Mauricio Salazar, anunció que los fondos presupuestados para la "Fiesta de la Cosecha" se redirigirán a familias afectadas por el terremoto: subsidio de arriendo de $500.000 COP/mes por 3 meses, exención de pago de servicios públicos durante ese período, y $1.000.000 COP en capital semilla para más de 3.000 vendedores informales para reactivar su sustento.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/eldiariodelotun/posts/pfbid02fSgtbFJgtiFCM2PJx13kPGdCE1emC4RrcBRHvWzCN7CMky3W6jRYKiwgUDnHJSL9l',
      authorHandle: 'Diario del Otún',
      category: 'OFFICIAL' as const,
      placeName: 'Pereira',
      note: 'El gobierno nacional estudia subsidios de arriendo y una posible congelación de cánones de arrendamiento para los damnificados del terremoto en Pereira — complementa el anuncio municipal de redirección de fondos del mismo día.',
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
        municipioId: pereira.id,
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
