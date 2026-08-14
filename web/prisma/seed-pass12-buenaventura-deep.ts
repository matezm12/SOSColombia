/**
 * One-off loader for pass 12 (2026-08-14) — deep Instagram dive on
 * Buenaventura specifically turned up a very rich results page (this city
 * clearly has strong grassroots social-media activity). See
 * wiki/17-allied-resources-and-community.md "Pass 12" for a broken-donation
 * finding NOT reflected in this seed data. Run once via
 * `npx tsx prisma/seed-pass12-buenaventura-deep.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const buenaventura = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76109' } })

  // ── New aid point: PCN (Proceso de Comunidades Negras) ─────────────────
  const existingAid = await prisma.pendingAidPoint.findFirst({
    where: { name: 'Oficina del PCN — Proceso de Comunidades Negras', municipioId: buenaventura.id },
  })
  if (!existingAid) {
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: buenaventura.id,
        kind: 'ACOPIO',
        name: 'Oficina del PCN — Proceso de Comunidades Negras',
        address: 'Calle 4 #16-90, Barrio Santa Rosa, Parte Media, Buenaventura',
        sourceUrl: 'https://www.instagram.com/p/Db6FLU5OX7I/',
        submitterNote:
          'Proceso de Comunidades Negras (PCN) — organización afrocolombiana de alcance nacional, con peso institucional real en el Pacífico. Cuenta bancaria: Banco Caja Social, cuenta corriente 21004290174. Contacto (ABEDUA): 300 480 6118. Cuenta activa en comentarios confirmando que siguen recibiendo ayudas 1 día después de publicado. Confianza alta.',
        origin: 'AUTOMATION_SWEEP',
        status: 'PENDING',
      },
    })
    console.log('Created PendingAidPoint: PCN Buenaventura')
  } else {
    console.log('Skipping PCN Buenaventura — already seeded')
  }

  // ── Community embeds ─────────────────────────────────────────────────
  const socialPosts = [
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db6FLU5OX7I/',
      authorHandle: '@vigiaafro (PCN)',
      category: 'AID_POINT',
      municipioId: buenaventura.id,
      placeName: 'Oficina del PCN — Proceso de Comunidades Negras',
      note: 'Proceso de Comunidades Negras, organización afrocolombiana nacional. Banco de donaciones para damnificados del terremoto en Buenaventura.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db6PpYsEj1v/',
      authorHandle: '@camarabuenaventura + @bancodealimentosbtura',
      category: 'AID_POINT',
      municipioId: buenaventura.id,
      placeName: 'Corredor humanitario — Diócesis de Buenaventura',
      note: 'Cámara de Comercio de Buenaventura + Confecámaras se suman al corredor humanitario liderado por la Diócesis de Buenaventura. MISMA dirección que el Banco de Alimentos de Buenaventura ya sembrado en pass 6 (Av. Simón Bolívar #47C-70) — no se creó un PendingAidPoint duplicado, pero esta publicación añade cuenta bancaria (Banco Caja Social 24136600305, titular Diócesis de Buenaventura) y contacto (Sonia Suárez, 310 830 8316) que no teníamos antes.',
    },
    {
      platform: 'INSTAGRAM',
      permalink: 'https://www.instagram.com/p/Db6giufvfJb/',
      authorHandle: '@samuelsuarez10_sb',
      category: 'NEED',
      municipioId: buenaventura.id,
      placeName: null,
      note: 'Cuenta verificada, autor dice que Buenaventura es "mi tierra". Denuncia que 30 horas después del sismo la ayuda aún no llegaba, y que la vía terrestre que conecta Buenaventura con el resto del país seguía cerrada. No es un canal de donación — es un llamado de atención sobre la brecha de respuesta, con corroboración en los comentarios de otros usuarios locales.',
    },
  ] as const

  let postsCreated = 0
  for (const p of socialPosts) {
    const existing = await prisma.pendingSocialPost.findFirst({ where: { permalink: p.permalink } })
    if (existing) {
      postsCreated += 0
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
