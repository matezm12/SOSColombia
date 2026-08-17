/**
 * Pass 84 (2026-08-17) — three Medellín-based acopio points, per a
 * resource the user was sent directly, researched and entered on request.
 * All three go into the pending moderation queue, same as pass 83's
 * INTECS entry — not auto-published.
 *
 * NOT added: Medellín as a tracked city. The user's original instinct was
 * to add Medellín itself with its own severity/toll assessment, but
 * nothing in this project's research — six-plus rounds across every
 * tracked city, plus this pass's own fresh search — has ever placed
 * Medellín (Antioquia) among the earthquake-affected departments (Chocó,
 * Valle del Cauca, Risaralda, Caldas, Quindío, Tolima only). Medellín is
 * acting as a donor/staging city here, the same role Pamplona plays for
 * Argelia (pass 82) or Cali/Buga/Salento/Pitalito played as collection
 * points for Argelia — none of those were added as tracked disaster
 * cities either. These three points are attached to the beneficiary city
 * instead, per that established pattern.
 *
 * Beneficiary: BUENAVENTURA, sourced two ways — (1) Fundación Juntos Se
 * Puede's own Instagram post naming the Tranvía Plaza point explicitly:
 * "Organización y cargue de ayudas para su traslado hacia Buenaventura",
 * and (2) the three points' addresses independently confirmed, with
 * matching street numbers, in Movilizatorio's "Directorio Ayudas
 * Colombia" — a curated, purpose-built donation directory for this
 * earthquake covering Bogotá/Medellín/Cali/Manizales/Quibdó. Some
 * adjacent posts frame the same Medellín corridor as feeding Chocó
 * relief broadly rather than Buenaventura specifically (Kambirí's own
 * Afro-Colombian, Pacific-coast identity fits either); Buenaventura was
 * chosen as the specific attribution here because it's the one point
 * with a direct, dated quote naming it, not because the other framing is
 * wrong — flagged in each submitterNote so a moderator with better
 * information can correct it.
 * Run once via `npx tsx prisma/seed-pass84-buenaventura-medellin-acopio.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const buenaventura = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '76109' } })

  const aidPoints = [
    {
      name: 'Red de Mujeres Kambirí — punto de acopio (Medellín, para Buenaventura/Pacífico)',
      address: 'Calle 58 #41-64, Medellín (buscar en Maps como "Carabantú")',
      phone: null,
      needsText: 'Cargue y descarga de ayudas para su traslado hacia el Pacífico. Horario desde las 10:00 a.m. Cupo reportado de 50 voluntarios para labores de descarga.',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'Red Nacional de Mujeres Afrocolombianas Kambirí (redkambiri.org, @red_nal_kambiri)',
    },
    {
      name: 'Centro Comercial Tranvía Plaza — punto de acopio (Medellín, para Buenaventura)',
      address: 'Carrera 40 #48-95, Local 323, Medellín',
      phone: null,
      needsText: 'Organización y cargue de ayudas para su traslado hacia Buenaventura. Horario desde las 9:30 a.m.',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'Centro Comercial Tranvía Plaza (@tranviaplaza_cc), en coordinación con Fundación Juntos Se Puede',
    },
    {
      name: 'Colectivo AfroUdeA — punto de acopio (Universidad de Antioquia, Medellín, para Buenaventura/Pacífico)',
      address: 'Universidad de Antioquia, bajos del Bloque 9, Medellín',
      phone: '311 450 5940 (Ximena Hernández)',
      needsText: 'Punto de acopio estudiantil afrodescendiente, horario 9am-5pm.',
      sourceUrl: 'https://movilizatorio.org/directorio-ayudas-colombia/',
      sourceOrg: 'Colectivo AfroUdeA, Universidad de Antioquia',
    },
  ] as const

  const submitterNote = 'Compartido directamente por el usuario (un contacto le envió esta convocatoria de voluntariado). Los tres puntos están confirmados de forma independiente en el "Directorio Ayudas Colombia" de Movilizatorio (curaduría dedicada a esta emergencia), con direcciones que coinciden con el texto original. El destino específico "Buenaventura" viene de una publicación de Instagram de Fundación Juntos Se Puede citando textualmente el punto de Tranvía Plaza ("cargue de ayudas para su traslado hacia Buenaventura") — otras publicaciones relacionadas enmarcan el mismo corredor de Medellín como apoyo al Pacífico/Chocó en términos más amplios, no específicamente a Buenaventura. Confirmar destino exacto antes de aprobar si es posible. Medellín en sí NO aparece en ninguna investigación de este proyecto como ciudad afectada por el sismo — actúa como ciudad donante/de acopio, no como ciudad damnificada; por eso este punto se siembra bajo Buenaventura, no bajo un nuevo "Medellín" en el sistema.'

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: buenaventura.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: buenaventura.id,
        kind: 'ACOPIO',
        name: a.name,
        address: a.address ?? undefined,
        phone: a.phone ?? undefined,
        needsText: a.needsText,
        sourceUrl: a.sourceUrl,
        sourceOrg: a.sourceOrg ?? undefined,
        submitterNote,
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
