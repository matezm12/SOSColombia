/**
 * One-off loader for pass 6 (2026-08-14) — deep dive into already-known
 * sources (Cuidar a Colombia's raw dataset, Acopio Colombia's live site) for
 * cities beyond our original 8. Found strong, officially-sourced evidence
 * that Buenaventura deserves to be a tracked Municipio, not just an
 * incidental mention. See wiki/17-allied-resources-and-community.md
 * "Pass 6" for full reasoning, including why other candidate cities were
 * NOT added. Run once via `npx tsx prisma/seed-pass6-buenaventura.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const valle = await prisma.department.findFirstOrThrow({ where: { divipolaCode: '76' } })
  let buenaventura = await prisma.municipio.findFirst({ where: { divipolaCode: '76109' } })
  if (!buenaventura) {
    buenaventura = await prisma.municipio.create({
      data: {
        name: 'Buenaventura',
        divipolaCode: '76109',
        departmentId: valle.id,
        severityLabel: 'CRITICA',
        redAlert: false, // not part of the original official 5-city red-alert list — CRITICA severity is a separate, broader signal, see wiki note
        lat: 3.88,
        lng: -77.031,
      },
    })
    console.log('Created Buenaventura municipio')
  } else {
    console.log('Buenaventura already exists')
  }

  // ── Pending aid points — 3 independently-sourced Buenaventura acopio
  // points, 2 of them cross-confirmed across two different allied sites. ──
  const aidPointDefs = [
    {
      name: 'Banco de Alimentos de Buenaventura',
      address: 'Avenida Simón Bolívar #47C-70, Buenaventura',
      sourceUrl: 'https://www.instagram.com/p/Db3yn-LDvL-/',
      note: 'Red ABACO (misma red que el Banco de Alimentos de Manizales ya aprobado). Solo alimentos no perecederos y elementos de primera necesidad — no perecederos ni productos vencidos. Fuente: publicación oficial de ABACO Colombia, vía el dataset de Cuidar a Colombia (cuidarcolombia.vercel.app/data/app.json).',
    },
    {
      name: 'Centro de acopio La Licorera',
      address: 'La Licorera, Buenaventura (dirección exacta no capturada)',
      sourceUrl: 'https://valledelcauca.gov.co/publicaciones/90177/todos-somos-valle-activado-centro-de-acopio-de-ayudas-en-la-licorera-para-los-damnificados-de-terremoto/',
      note: 'Fuente oficial: Gobernación del Valle del Cauca, campaña "Todos Somos Valle". Confirma necesidades básicas y recepción especial destinada a Buenaventura, ciudad con seguimiento prioritario (aeropuerto solo vuelos humanitarios, ~20 derrumbes en la vía a Cali, 3 fallecidos en los túneles del corredor).',
    },
    {
      name: 'Centro multimodal de Puente Nayero',
      address: 'Carrera 16 A1 sur, barrio La Playita - Puente de los Nayeros, Buenaventura',
      sourceUrl: 'https://emergency-rosy.vercel.app/centros/centro-multimodal-de-puente-nayero-buenaventura-k4kv',
      note: 'Organización responsable: Corporación Corhapep. Tel. 302 491 0444. Agua, alimentos, aseo e higiene. Lunes a domingo 7am-10pm (sin confirmar en las últimas 48h por la fuente — verificar antes de ir). Cross-confirmado independientemente en el dataset de Cuidar a Colombia bajo el mismo nombre.',
    },
  ] as const

  let created = 0
  for (const p of aidPointDefs) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: p.name, municipioId: buenaventura.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: buenaventura.id,
        kind: 'ACOPIO',
        name: p.name,
        address: p.address,
        sourceUrl: p.sourceUrl,
        submitterNote: p.note,
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    created++
  }
  console.log(`PendingAidPoint (Buenaventura): ${created} created`)

  // ── The ABACO Instagram post is also worth a community embed. ──────────
  const existingPost = await prisma.pendingSocialPost.findFirst({
    where: { permalink: 'https://www.instagram.com/p/Db3yn-LDvL-/' },
  })
  if (!existingPost) {
    await prisma.pendingSocialPost.create({
      data: {
        platform: 'INSTAGRAM',
        permalink: 'https://www.instagram.com/p/Db3yn-LDvL-/',
        authorHandle: 'ABACO Colombia',
        category: 'AID_POINT',
        municipioId: buenaventura.id,
        placeName: 'Banco de Alimentos de Buenaventura',
        submitterNote:
          'Publicación oficial de la red ABACO anunciando el centro de acopio de Buenaventura. Encontrada vía el dataset de Cuidar a Colombia, que la cita como fuente_oficial.',
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    console.log('Created PendingSocialPost: ABACO Buenaventura')
  } else {
    console.log('Skipping PendingSocialPost ABACO Buenaventura — already seeded')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
