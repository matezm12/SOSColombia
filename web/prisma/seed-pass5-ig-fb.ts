/**
 * One-off loader for pass 5 (2026-08-14) — Instagram + Facebook, searched
 * directly via the user's own logged-in browser sessions. See
 * wiki/17-allied-resources-and-community.md "Pass 5" for context, including
 * an important misinformation finding NOT reflected in this seed data.
 * Run once via `npx tsx prisma/seed-pass5-ig-fb.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  const socialPosts = [
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db68UEQIHwx/',
      authorHandle: '@fundacionplataformas',
      category: 'AID_POINT',
      municipioId: manizales.id,
      placeName: 'Fundación Plataformas — punto de acopio',
      note: 'Fundación Plataformas activó su red solidaria para el terremoto. Punto de acopio: Calle 47 #34-20, Prado Medio, Manizales. Donación en efectivo: llave Bre-B @NDQ443. Cuenta con etiqueta de ubicación real de Instagram ("Manizales, Caldas - Colombia"), no solo texto — confianza alta. Ver también PendingAidPoint del mismo lugar.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db6KdtZRx_l/',
      authorHandle: '@bancodealimentosmanizales',
      category: 'AID_POINT',
      municipioId: manizales.id,
      placeName: 'Banco Arquidiocesano de Alimentos de Manizales — punto de acopio',
      note: 'Banco Arquidiocesano de Alimentos de Manizales (red ABACO, Cáritas Arquidiocesana) — centro de acopio en Calle 49 #27A-85 / Faneón, Manizales. Tel. 310 418 4472. Cuentas: Bancolombia 373-0000-0261, Banco Caja Social 230-0242-2995 (NIT 890.800.981). Explícitamente NO reciben medicamentos/ropa/alimentos perecederos — reglas claras, institución establecida (ABACO ya está en nuestro registro de fuentes como org tier 1). Confianza muy alta. Ver también PendingAidPoint del mismo lugar.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db4L3yjxBk2/',
      authorHandle: '@mariapaz_buitrago',
      category: 'NEED',
      municipioId: null,
      placeName: '¡Manizales nos necesita! — ubicación en disputa',
      note: 'ADVERTENCIA: titular dice "¡MANIZALES NOS NECESITA!" con dirección "Cra. 22 #67A-179", pero comentarios en la propia publicación cuestionan la ubicación ("Buenos días, ¿en Bogotá, dónde?", "¿La dirección es en Bogotá?") — sugiere que la dirección real podría estar en Bogotá, no Manizales, pese al mensaje. Sin municipioId dado que no se pudo confirmar la ciudad real. Revisar con cuidado antes de aprobar — no confirmar como Manizales sin verificación adicional.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db8uTzPkQC-/',
      authorHandle: '@laplazadewein',
      category: 'NEED',
      municipioId: null,
      placeName: null,
      note: 'Cuenta verificada (marca "wein", insumos médicos) publica lista de necesidades médicas urgentes (soluciones salinas, medicamentos no controlados, insumos médicos) — donaciones dirigidas a Pereira, Manizales, Cali y Quibdó (Chocó). Sin dirección específica en esta publicación (remite a otras láminas del carrusel). Confianza media — informativo pero no muy accionable sin punto de entrega concreto.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db8jlH5O4qk/',
      authorHandle: '@jeissonyjonnyasesores',
      category: 'AID_POINT',
      municipioId: pereira.id,
      placeName: 'Jeisson & Jonny Asesores de Imagen — sedes Armenia y Pereira',
      note: 'Salones de belleza (negocio real, cuenta verificada, etiquetada "Pereira Risaralda") convirtieron sus DOS sedes — Armenia y Pereira — en centros de acopio, 8:00 a.m. a 4:00 p.m., lista de necesidades (medicamentos, alimentos, alimento para perros, pañales, aseo para niños). Direcciones exactas no visibles en esta lámina. Sede Pereira usada como municipioId principal — también aplica a Armenia. Confianza alta.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db6E-_PljQj/',
      authorHandle: '@arcadejuana.col',
      category: 'NEED',
      municipioId: quibdo.id,
      placeName: 'Hospital San Francisco de Asís de Quibdó — insumos urgentes',
      note: 'El Hospital San Francisco de Asís de Quibdó (único hospital de segundo nivel del departamento) solicitó apoyo urgente por déficit de medicamentos e insumos médico-quirúrgicos. Arca de Juana (colectivo, con periodista @disruptivaaa_ acreditado) recolecta insumos — punto de acopio en Bogotá: Carrera 84 #74-20, barrio Almería-Engativá. Tel. +57 314 219 1646, llave @3219698742, PayPal isaivmiv@gmail.com. 21K+ likes — alto alcance. Municipio destino (Quibdó) usado como municipioId aunque el punto de acopio físico está en Bogotá. Confianza alta.',
    },
    {
      platform: 'FACEBOOK',
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0Nuw2gJpzoseTzirFsHiHzRWKezeUUtjfw9aHosR42cWut5cDtHRgDKuLah24GJXwl&id=100067553431817',
      authorHandle: 'Mujeres Imparables',
      category: 'AID_POINT',
      municipioId: quibdo.id,
      placeName: 'Chocó de Pie — centros de acopio en Quibdó (Rosales y Silencio)',
      note: 'Cuenta verificada "Mujeres Imparables", en coalición con JMD La Voz e Imparables y La Voz del Pacífico — campaña "Chocó de Pie" con DOS centros de acopio reales en Quibdó: Rosales Cll 21 (en toda la esquina, casa verde de 2 pisos), tel. 323 395 7912; y Silencio Cra 8 #28-45B, tel. 320 286 5158. Aporte económico: Bancolombia cuenta de ahorros 536-000159-59. Direcciones específicas en Quibdó mismo (no un punto externo) — confianza alta. Ver también los 2 PendingAidPoint del mismo lugar.',
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

  // ── Concrete addresses worth their own PendingAidPoint rows too ────────
  const aidPointDefs = [
    {
      name: 'Fundación Plataformas — punto de acopio',
      municipioId: manizales.id,
      address: 'Calle 47 #34-20, Prado Medio, Manizales',
      sourceUrl: 'https://www.instagram.com/p/Db68UEQIHwx/',
      note: 'Red solidaria activada tras el terremoto. Donación en efectivo: llave Bre-B @NDQ443. Cuenta con etiqueta de ubicación real de Instagram.',
    },
    {
      name: 'Banco Arquidiocesano de Alimentos de Manizales',
      municipioId: manizales.id,
      address: 'Calle 49 #27A-85 / Faneón, Manizales',
      sourceUrl: 'https://www.instagram.com/p/Db6KdtZRx_l/',
      note: 'Red ABACO / Cáritas Arquidiocesana. Solo alimentos no perecederos y elementos de aseo — NO medicamentos/ropa/perecederos. Tel. 310 418 4472.',
    },
    {
      name: 'Centro de acopio Rosales (Chocó de Pie)',
      municipioId: quibdo.id,
      address: 'Calle 21, esquina, casa verde de 2 pisos, Rosales, Quibdó',
      sourceUrl: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0Nuw2gJpzoseTzirFsHiHzRWKezeUUtjfw9aHosR42cWut5cDtHRgDKuLah24GJXwl&id=100067553431817',
      note: 'Campaña "Chocó de Pie" (Mujeres Imparables + JMD La Voz + Imparables y La Voz del Pacífico). Tel. 323 395 7912.',
    },
    {
      name: 'Centro de acopio Silencio (Chocó de Pie)',
      municipioId: quibdo.id,
      address: 'Carrera 8 #28-45B, Silencio, Quibdó',
      sourceUrl: 'https://www.facebook.com/permalink.php?story_fbid=pfbid0Nuw2gJpzoseTzirFsHiHzRWKezeUUtjfw9aHosR42cWut5cDtHRgDKuLah24GJXwl&id=100067553431817',
      note: 'Campaña "Chocó de Pie" (Mujeres Imparables + JMD La Voz + Imparables y La Voz del Pacífico). Tel. 320 286 5158.',
    },
  ] as const

  let aidCreated = 0
  for (const p of aidPointDefs) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: p.name, municipioId: p.municipioId } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: p.municipioId,
        kind: 'ACOPIO',
        name: p.name,
        address: p.address,
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
