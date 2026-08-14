/**
 * Pass 18 (2026-08-14) — deep multi-agent research pass on Quibdó (X +
 * Instagram + Facebook + TikTok + GoFundMe/Vaki crowdfunding, browser-driven;
 * TikTok agent hit a transient connection error and was retried separately).
 * Fifth city in the per-city deep-pass rotation after Pereira (13-14), Cali
 * (15), Manizales (16), and Armenia (17). See
 * wiki/17-allied-resources-and-community.md "Pass 18" for full agent notes,
 * the broken-blood-bank-refrigeration finding, and rejected candidates. Run
 * once via `npx tsx prisma/seed-pass18-quibdo-deep.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Nueva ESE Hospital San Francisco de Asís - insumos médico-quirúrgicos (Barrio Kennedy)',
      address: 'Carrera 1 #31-25, Barrio Kennedy, Quibdó, Chocó',
      phone: '311 622 4483 (Edinson Blandón Gamboa, Líder de Referencia)',
      needsText:
        'Insumos médico-quirúrgicos, medicamentos esenciales, agua, cobijas: gasas, suturas, yeso, reactivos, suero antiofídico. IMPORTANTE: el hospital también es el banco de sangre designado de Quibdó, pero su unidad de refrigeración para sangre está dañada (nevera rota) desde el sismo, según 4 medios independientes (El Colombiano, Publimetro, Hechos Colombia, Qhubo Bogotá) - actualmente Quibdó NO tiene banco de sangre funcional. Cruz Roja Colombiana está evaluando puntos de recolección alternos para Chocó, pero aún sin dirección específica en Quibdó al momento de esta pasada.',
      sourceUrl: 'https://x.com/ColegioMedicoCo/status/2087330725200527689',
      sourceOrg: 'Colegio Médico Colombiano + Nueva ESE Hospital Departamental San Francisco de Asís',
      submitterNote:
        'Corroborado por Colegio Médico Colombiano (contacto y dirección exactos), teleSUR, Publimetro y Entérate Cali (desabastecimiento y sobrecupo del 245.2% en urgencias), y confirmado como hub médico activo por CAMBIO (TikTok). Confianza alta para el punto de acopio de insumos; la sangre/hemoderivados quedan marcados explícitamente como NO disponibles hasta reparación.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Hospital San Francisco de Asís de Quibdó - canal oficial de donación (vía Fundación Empresas Conscientes)',
      address: null,
      phone: null,
      needsText: 'Fondos para insumos médico-quirúrgicos: compresas estériles, gasas, suturas, yeso ortopédico, unidades de sangre y hemoderivados, reactivos de laboratorio, suero antiofídico.',
      sourceUrl: 'https://www.instagram.com/p/Db9SBQLAZq0/',
      sourceOrg: 'Fundación Empresas Conscientes (@funemco)',
      submitterNote:
        'Bre-B/Banco de Bogotá QR, Llave 0092887880, paga directamente a la cuenta del hospital. Corroborado por una carta oficial "SOLICITUD DE APOYO" del hospital fechada 10 de agosto (instagram.com/p/Db6GkiVOxhW/) con la misma lista de necesidades. Confianza alta.',
    },
    {
      kind: 'VET' as const,
      name: 'Rescate animal Mi Mejor Amigo - operativo veterinario Quibdó',
      address: null,
      phone: null,
      needsText: 'Rescate, atención veterinaria, tratamientos y alimentación para más de 100 animales afectados por el sismo en Roldanillo, Quibdó y Pereira.',
      sourceUrl: 'https://x.com/AsociacionMi/status/2087541422060691532',
      sourceOrg: 'Asociación de Protección Animal Mi Mejor Amigo (coalición de 8 organizaciones)',
      submitterNote:
        'Primer hallazgo VET para Quibdó, corroborado independientemente en X y Facebook (misma organización, mismo anuncio). Operación móvil sin dirección fija - no es un punto de recepción permanente. Confianza media.',
    },
    {
      kind: 'VET' as const,
      name: 'Colecta Solidaria PROANIMALES Quibdó y Tadó',
      address: null,
      phone: 'Nequi @3219026994 (Neira Sánchez, Quibdó) / 3145324623 (Ana M. Trujillo) / 3104623470 (Yeison Londoño)',
      needsText: '2 plantas de energía, alimento e insumos veterinarios, medicamentos (Propofol urgente), camas y cobijas para animales afectados.',
      sourceUrl: 'https://www.instagram.com/p/Db_KCIARGnz/',
      sourceOrg: 'Fundación Protectora del Pacífico + Clínica Veterinaria Zoovet, Quibdó',
      submitterNote:
        'Dos instituciones locales reales y verificables en Quibdó coordinando la colecta, contactos nombrados. Confianza media - la recepción de fondos es informal (cuentas Nequi personales) en vez de un canal institucional propio.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Fundación Banco de Alimentos de la Diócesis de Quibdó',
      address: 'Barrio Yesquita, Calle 21 #4-82, Quibdó, Chocó (segundo punto: Convento/Curia diocesana, B/Roma Cra 1 #26-91)',
      phone: null,
      needsText: 'Medicamentos, insumos médicos, alimentos no perecederos, colchones, implementos de aseo, herramientas.',
      sourceUrl: 'https://www.instagram.com/p/Db6OEHtp5Zh/',
      sourceOrg: 'Diócesis de Quibdó',
      submitterNote: 'Cuenta oficial verificada de la Diócesis, dos puntos de recepción, dos cuentas bancarias con NIT propio. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Diócesis de Quibdó - cuentas de donación (Banco de Alimentos + Pastoral Social)',
      address: null,
      phone: null,
      needsText: 'Donaciones monetarias para la campaña humanitaria de la Diócesis en respuesta al terremoto de Chocó.',
      sourceUrl: 'https://www.instagram.com/p/Db6OEHtp5Zh/',
      sourceOrg: 'Diócesis de Quibdó',
      submitterNote:
        'Dos cuentas distintas del mismo post oficial: Fundación Banco de Alimentos-Diócesis de Quibdó (NIT 902066805-8, Banco de Bogotá ahorros 578816514) y Pastoral Social-Diócesis de Quibdó (NIT 900242658-9, Bancolombia ahorros 53600002300) - ambas distintas del canal ya conocido de la Gobernación del Chocó. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'ASINCH - Asociación para la Investigación Cultural del Chocó (canal internacional/diáspora)',
      address: null,
      phone: null,
      needsText: 'Fondos para reparar vivienda dañada de artistas y estudiantes universitarios en Quibdó.',
      sourceUrl: 'https://www.instagram.com/p/Db7IkmICTGQ/',
      sourceOrg: 'ASINCH (www.asinch.org)',
      submitterNote: 'Institución cultural real con sitio propio y NIT (8180015336); código SWIFT (BBOGCOBBBO1) habilita transferencias internacionales - responde directamente al ángulo de diáspora solicitado. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Reddhhpac (Red de Derechos Humanos del Pacífico) - punto de acopio Barrio Pandeyuca',
      address: 'Calle 25 #6-58, Barrio Pandeyuca, Quibdó, Chocó',
      phone: '323 540 3547 (WhatsApp)',
      needsText: 'Alimentos no perecederos, agua potable, elementos de higiene, ropa/cobijas/colchonetas, implementos para niños y niñas.',
      sourceUrl: 'https://www.instagram.com/p/Db4EPyYiXRC/',
      sourceOrg: 'Reddhhpac (Red de Derechos Humanos del Pacífico)',
      submitterNote:
        'Punto en un barrio no cubierto antes (Pandeyuca), corroborado independientemente en Instagram y Facebook. Organización real con página activa y cuenta bancaria (Bancolombia ahorros 16200025176), aunque su mandato habitual es las comunidades del río San Juan (Istmina, Medio San Juan, Litoral San Juan), no Quibdó propiamente - la dirección específica en Quibdó viene de una sola lista comunitaria compilada, verificar antes de promover ampliamente. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio Quibdó - oficina de Francisco Vidal (Representante a la Cámara por Chocó)',
      address: 'Antigua oficina de campaña, al lado del Hotel Farallones, Quibdó, Chocó',
      phone: null,
      needsText: 'Botellas de agua, alimentos no perecederos, kits de aseo, enseres, insumos médicos, alimentos para mascotas.',
      sourceUrl: 'https://www.instagram.com/p/Db6SQgFG-Xc/',
      sourceOrg: 'Oficina del Representante Francisco Vidal',
      submitterNote: 'Cuenta de un congresista en ejercicio, identidad verificable y no anónima; dirección por referencia de un punto conocido (Hotel Farallones). Confianza media - afiliación política, tratar con la debida neutralidad.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Fundación Médicos Amigos - Misión Médica en Chocó',
      address: null,
      phone: '302 788 8662',
      needsText: 'Reclutamiento de especialistas voluntarios (intensivistas, traumatólogos, cirujanos, pediatras, psicólogos) para desplegarse a Chocó desde Bogotá; requiere cédula y certificado ReTHUS vigente.',
      sourceUrl: 'https://www.instagram.com/p/Db3_9Ohx2CF/',
      sourceOrg: 'Fundación Médicos Amigos',
      submitterNote: 'Llamado formal con requisitos de verificación profesional (ReTHUS, el registro nacional de talento humano en salud) - un nivel de rigor inconsistente con una publicación falsa. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Help My Family in Chocó" (Carolina Rojas)',
      address: null,
      phone: null,
      needsText: 'Tres viviendas familiares en Quibdó y Yuto con distintos niveles de daño (una destruida, una con grietas estructurales severas, una parcialmente demolida por orden). Vivienda temporal, demolición, reparaciones y materiales de construcción.',
      sourceUrl: 'https://www.gofundme.com/f/help-my-family-in-choco',
      sourceOrg: null,
      submitterNote: 'Organizadora nombrada (Carolina Rojas, Henderson NV - diáspora), $644 recaudados de meta $2,000, 7 donantes, creada 2 días después del sismo. Confianza media.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe: "Colombia Earthquake" (Maria Clavijo, beneficia a Cruz Roja Chocó/Quibdó)',
      address: null,
      phone: null,
      needsText: 'Ayuda humanitaria (alimentos, agua, higiene, refugio, insumos médicos/primeros auxilios) para sobrevivientes del sismo en Chocó, con la intención declarada de canalizar fondos a través de la filial de Chocó de la Cruz Roja Colombiana, con sede en Quibdó.',
      sourceUrl: 'https://www.gofundme.com/f/colombia-earthquake-vfxur',
      sourceOrg: null,
      submitterNote:
        'Organizadora nombrada (Maria Clavijo, Reino Unido), £495 recaudados de meta £900, 10 donantes. Confianza media - la campaña cubre Chocó en general (no exclusivamente Quibdó) y el traspaso a Cruz Roja es una intención declarada, no una transferencia confirmada.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Estación Terpel de Cabí - punto de acopio (pista sin corroborar)',
      address: 'Salida norte/occidente de Quibdó, sector Cabí',
      phone: null,
      needsText: 'Donación general de especie, sin necesidades itemizadas en la fuente encontrada.',
      sourceUrl: 'https://www.facebook.com/search/posts/?q=REDDHHPAZ%20Quibd%C3%B3',
      sourceOrg: null,
      submitterNote:
        'Aparece en un solo post comunitario compilado de "puntos de ayuda" (58 compartidos) junto a puntos ya verificados (Gobernación del Chocó, el hospital) - eso da algo de plausibilidad, pero no se encontró una segunda fuente independiente. Confianza baja - verificar antes de promover.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: quibdo.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: quibdo.id,
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
      permalink: 'https://x.com/teleSURtv/status/2087253057247810025',
      authorHandle: '@teleSURtv',
      category: 'NEED' as const,
      placeName: 'Hospital de Quibdó',
      note: 'El gobernador advierte sobre escasez crítica de gasas, suturas, yeso, sangre, reactivos y suero antiofídico en el hospital de Quibdó.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/PublimetroCol/status/2087615639624024428',
      authorHandle: '@PublimetroCol',
      category: 'NEED' as const,
      placeName: 'Hospital principal de Chocó',
      note: 'La nevera usada para almacenar sangre en el hospital principal de Chocó resultó dañada en el sismo.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/EnterateCali/status/2087587448096190573',
      authorHandle: '@EnterateCali',
      category: 'NEED' as const,
      placeName: 'Hospital San Francisco de Asís, Quibdó',
      note: 'Tasa de sobrecupo del 245.2% en urgencias del Hospital San Francisco de Asís tras el sismo, 76 pacientes atendidos.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/linamarcelar_/status/2087305507446878412',
      authorHandle: '@linamarcelar_',
      category: 'NEED' as const,
      placeName: 'Centro Regulador de Urgencias de Antioquia',
      note: 'Antioquia recibe heridos de Quibdó; Cruz Roja recomienda donar sangre para mantener los bancos abastecidos.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/selvaylluvia/status/2087741064392200669',
      authorHandle: '@selvaylluvia',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Zona Norte, Quibdó',
      note: 'Hilo #SOSCHOCÓ sobre Luis Esteban, residente de la Zona Norte cuya vivienda familiar heredada resultó dañada.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/ColegioMedicoCo/status/2087330725200527689',
      authorHandle: '@ColegioMedicoCo',
      category: 'AID_POINT' as const,
      placeName: 'Hospital San Francisco de Asís, Barrio Kennedy, Quibdó',
      note: 'Necesidades urgentes de insumos del hospital, con contacto y dirección específicos.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/AsociacionMi/status/2087541422060691532',
      authorHandle: '@AsociacionMi',
      category: 'AID_POINT' as const,
      placeName: 'Quibdó (operación móvil)',
      note: 'Misión veterinaria de coalición de 8 organizaciones cubriendo Quibdó, Roldanillo y Pereira.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_qsmRgM_Y/',
      authorHandle: 'calidenuncia (Crónica Digital+)',
      category: 'NEED' as const,
      placeName: 'Coliseo de Boxeo, Quibdó',
      note: 'La Defensoría del Pueblo (Iris Marín Ortiz) denuncia condiciones precarias en el único albergue de Quibdó: colchonetas insuficientes, sin espacios diferenciados para familias.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db4EPyYiXRC/',
      authorHandle: 'komuna_sinifana (Reddhhpac)',
      category: 'NEED' as const,
      placeName: 'Barrio Pandeyuca, Quibdó',
      note: 'Red de derechos humanos del Pacífico señala que Chocó fue el epicentro del sismo pero su afectación apenas ha sido visibilizada frente a otras regiones.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db-5aYvRoyN/',
      authorHandle: 'soylamismacrespa',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Lloró, Chocó (cerca de Quibdó)',
      note: 'Una brigada veterinaria planeada para Quibdó fue redirigida a Lloró al conocerse que ese municipio no tiene ninguna clínica veterinaria.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@periodicoelcolombiano/video/7673892464482159889',
      authorHandle: '@periodicoelcolombiano',
      category: 'NEED' as const,
      placeName: 'Coliseo de Boxeo, Quibdó',
      note: 'El Colombiano reporta condiciones "inhumanas" para los desplazados en el Coliseo de Boxeo: durmiendo mal y mojados, solo con la ropa que llevaban puesta.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@archivonoticiasint/video/7673713419660315905',
      authorHandle: '@archivonoticiasint',
      category: 'NEED' as const,
      placeName: 'Quibdó, Chocó',
      note: 'La emergencia empeora tras lluvias fuertes; familias con viviendas colapsadas duermen en la calle mientras la respuesta humanitaria lucha por mantenerse al día.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@soyrafapoveda/video/7673623644827946261',
      authorHandle: '@soyrafapoveda',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Barrio Las Palmas, Quibdó',
      note: 'Cobertura de esfuerzos de reconstrucción en el barrio Las Palmas, no cubierto antes.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@cncchoco/video/7673954201289968914',
      authorHandle: '@cncchoco',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó, Chocó',
      note: 'CNC Chocó cubre la segunda visita del presidente, quien anunció un plan de reconstrucción tipo "Plan Marshall" y declaró que "al Chocó lo han abandonado a su suerte".',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@estoescambio/video/7673291888560016641',
      authorHandle: '@estoescambio',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó, Chocó',
      note: 'CAMBIO reporta el cierre formal de operaciones de búsqueda y rescate en Chocó; el alcalde de Quibdó Rafael Bolaños confirma el saldo final de 9 fallecidos (cifra de la ciudad).',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@lasillavacia/video/7674006170293570836',
      authorHandle: '@lasillavacia',
      category: 'OFFICIAL' as const,
      placeName: 'Quibdó, Chocó',
      note: 'La Silla Vacía reporta que, con la búsqueda de desaparecidos ya cerrada, la emergencia entra en fase de reconstrucción.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@mayrabel.1/photo/7672563944891878664',
      authorHandle: '@mayrabel.1',
      category: 'NEED' as const,
      placeName: 'Chocó',
      note: 'Cruz Roja Colombiana estaría estableciendo puntos de recolección de sangre porque el banco de sangre de Chocó quedó completamente agotado - primera señal concreta de movilización de Cruz Roja para Chocó específicamente, sin dirección exacta en Quibdó aún.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@estoescambio/video/7673686582234205461',
      authorHandle: '@estoescambio',
      category: 'AID_POINT' as const,
      placeName: 'Hospital San Francisco de Asís, Quibdó',
      note: 'CAMBIO visita el hospital principal de Quibdó, confirmado como el hub de respuesta médica activo del departamento.',
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
        municipioId: quibdo.id,
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
