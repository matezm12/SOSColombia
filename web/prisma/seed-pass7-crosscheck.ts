/**
 * One-off loader for pass 7 (2026-08-14) — continuing pass 6's approach:
 * mine already-trusted sources (Cuidar a Colombia's raw data, Acopio
 * Colombia's live search) for our EXISTING tracked cities specifically
 * (Quibdó, Cali, Manizales, Pereira), which hadn't been searched
 * city-by-city on Acopio Colombia before. See
 * wiki/17-allied-resources-and-community.md "Pass 7" for context.
 * Run once via `npx tsx prisma/seed-pass7-crosscheck.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const pereira = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '66001' } })
  const cali = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76001' } })
  const manizales = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '17001' } })
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  const SRC = 'https://emergency-rosy.vercel.app'

  const aidPointDefs = [
    {
      name: 'Punto de Solidaridad Quibdó',
      municipioId: quibdo.id,
      address: 'Calle 27A #23-44, Barrio Los Ángeles, sector San Gabriel, Quibdó',
      note: 'Verificado en Acopio Colombia. Agua potable, alimentos no perecederos, elementos de aseo.',
    },
    {
      name: 'Antigua Licorera del Valle',
      municipioId: cali.id,
      address: 'Carrera 1 #26-85, Cali',
      note: 'Verificado en Acopio Colombia. Agua potable, alimentos no perecederos, colchonetas.',
    },
    {
      name: 'Plazoleta Jairo Varela',
      municipioId: cali.id,
      address: 'Avenida 2 Norte #10N-1, frente al Centro Administrativo Municipal (CAM), Cali',
      note: 'Verificado en Acopio Colombia. Agua, suero oral (tipo Electrolit), cascos.',
    },
    {
      name: 'Banco de Alimentos de Cali (Acopio Colombia)',
      municipioId: cali.id,
      address: 'Calle 24 #6-103, Cali',
      note: 'Estado "Reportado" en Acopio Colombia (no verificado directamente por la fuente aún). Agua embotellada, alimentos no perecederos. Nombre distinto del "Banco de Alimentos de Cali" institucional si ya existe uno separado en nuestros registros — revisar antes de aprobar para evitar duplicado.',
    },
    {
      name: 'Escuela Nacional del Deporte',
      municipioId: cali.id,
      address: 'Calle 9 #34-01, Cali',
      note: 'Estado "Reportado" en Acopio Colombia (no verificado directamente). Agua, suero oral (tipo Electrolit), cascos.',
    },
    {
      name: 'Sr Buñuelo Manizales',
      municipioId: manizales.id,
      address: 'Carrera 23 #60-26, Manizales',
      note: 'Verificado en Acopio Colombia. Agua, alimentos, medicamentos e insumos médicos. Lunes a domingo 9am-6pm (sin confirmar).',
    },
    {
      name: 'Complejo Bodeguero Alpaca — Bodega 01',
      municipioId: pereira.id,
      address: 'Vía La Romelia – El Pollo, Vereda Santa Ana Baja, a la altura del Hotel Tángara, Pereira',
      note: 'Verificado en Acopio Colombia. Agua potable, alimentos no perecederos, elementos de aseo.',
    },
    {
      name: 'CAFE Comuna del Café',
      municipioId: pereira.id,
      address: 'Carrera 3 con calle 59A, sector A del Parque Industrial, Pereira',
      note: 'Estado "Reportado" en Acopio Colombia. Probablemente parte de la red CAFE (Comfamiliar) ya mencionada en wiki/13a-mapadelterremoto-watch.md ("más allá de la red original de 7 CAFE") — esta es una dirección específica dentro de esa red que no teníamos capturada.',
    },
    {
      name: 'CAFE Consota',
      municipioId: pereira.id,
      address: 'Manzanas 7 y 8 de Villa Consota, sector Cuba, Pereira',
      note: 'Estado "Reportado" en Acopio Colombia. Misma red CAFE que el punto anterior — dirección específica no capturada previamente.',
    },
  ] as const

  let created = 0
  for (const p of aidPointDefs) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: p.name, municipioId: p.municipioId } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: p.municipioId,
        kind: 'ACOPIO',
        name: p.name,
        address: p.address,
        sourceUrl: SRC,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    created++
  }
  console.log(`PendingAidPoint (cross-check): ${created} created`)

  // ── ONE Inversión Social — Chocó-targeted monetary donation channel,
  // found in Cuidar a Colombia's raw "canales" data, not yet in our records. ──
  const existingMonetary = await prisma.pendingAidPoint.findFirst({
    where: { name: 'ONE Inversión Social — Una noche por Chocó', municipioId: quibdo.id },
  })
  if (!existingMonetary) {
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: quibdo.id,
        kind: 'MONETARY_DONATION',
        name: 'ONE Inversión Social — Una noche por Chocó',
        sourceUrl: 'https://somosone.com.co/una-noche-por-choco',
        submitterNote:
          'Campaña específica para familias damnificadas del Chocó, articulada por ONE con Sankofa Danzafro, La Pascasia y Corporación Presentes. Cuenta de ahorros Bancolombia 85004761966, llave Bre-B @oneinversion, NIT 901177509-5 (publicados en el dominio oficial de ONE). Desde el exterior enlaza el recaudo de Caring for Colombia. Encontrado en el dataset de Cuidar a Colombia (fuente_oficial).',
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    console.log('Created PendingAidPoint: ONE Inversión Social (Quibdó, MONETARY_DONATION)')
  } else {
    console.log('Skipping ONE Inversión Social — already seeded')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
