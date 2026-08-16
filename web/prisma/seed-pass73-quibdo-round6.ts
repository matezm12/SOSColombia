/**
 * Pass 73 (2026-08-16) — round 6 continues, Quibdó. Six prior passes
 * (18, 27, 36, 49, 61, 62) already covered this city extensively. A DANE
 * Colombia government graphic ("7 puntos de acopio") looked like a big
 * new find at first glance — but direct verification against prior seed
 * files showed four of its seven points were already on file: Gobernación
 * del Chocó and Centro Logístico Humanitario (pass 62), REDDHHPAC and
 * Estación Terpel de Cabí (pass 18). The Diócesis de Quibdó's Banco de
 * Alimentos and Pastoral Social accounts, re-surfaced with matching NIT
 * and account numbers, are also already on file since pass 18. None
 * re-seeded. Only three of the graphic's seven points are genuinely new:
 * Club de Leones Quibdó Monarca, Edificio Expocentro, and Punto Céntrico
 * Comunitario.
 *
 * First-ever Quibdó TollRecord: checked directly against all six prior
 * passes and confirmed a Quibdó-specific figure had never been logged
 * (only informally discussed in wiki notes). Fixed now, sourced to a
 * consolidated capital-cities damage report shared by the director of
 * Asocapitales — 9 dead, 119 injured, 9 missing, with housing/structure
 * damage figures. Note this reads lower on deaths than the ~13 figure
 * informally discussed in pass 61's notes; that number was never
 * actually logged, so there is no direct database contradiction, but the
 * discrepancy is worth flagging for a future pass to reconcile.
 *
 * The blood-bank refrigerator saga (open since pass 18) gets a partial
 * update: video evidence shows a replacement unit physically arriving at
 * the hospital, but a same-day post says the existing equipment is still
 * failing and unrepairable — arrived, not yet confirmed restored. And
 * Quibdó's only shelter, the Coliseo de Boxeo, flooded during storms on
 * top of the earthquake and had to be evacuated again — a new,
 * three-source-corroborated compounding crisis.
 * See wiki/17-allied-resources-and-community.md "Pass 73" for full
 * reasoning.
 * Run once via `npx tsx prisma/seed-pass73-quibdo-round6.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const quibdo = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27001' } })

  const sourceDefs = [
    {
      key: 'asocapitales_quibdo_toll_0816',
      url: 'https://x.com/AnSANTAMARIA/status/2089057454352892223',
      org: 'Asocapitales (Asociación Colombiana de Ciudades Capitales), "Informe de afectaciones de las ciudades capitales"',
      tier: 2,
    },
  ] as const

  const sources: Record<string, string> = {}
  for (const s of sourceDefs) {
    let src = await prisma.source.findFirst({ where: { url: s.url } })
    if (!src) {
      src = await prisma.source.create({ data: { url: s.url, org: s.org, tier: s.tier } })
      console.log(`Created Source: ${s.key}`)
    }
    sources[s.key] = src.id
  }

  const tollDefs = [
    {
      metric: 'DEATHS_REPORTED_OFFICIAL' as const,
      value: 9,
      sourceKey: 'asocapitales_quibdo_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'PRIMER REGISTRO DE TOLL específico de Quibdó — verificado directamente contra las seis pasadas anteriores (18, 27, 36, 49, 61, 62): nunca se había registrado formalmente, solo discutido de forma informal en notas del wiki (~13 muertos, convergencia de prensa citada en la pasada 61, nunca sembrada como TollRecord). Fuente: informe consolidado de Asocapitales, compartido por su director en X, "6 días después del terremoto". Quibdó es una de solo 5 capitales que siguen en alerta roja.',
    },
    {
      metric: 'INJURED' as const,
      value: 119,
      sourceKey: 'asocapitales_quibdo_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'Mismo informe consolidado de Asocapitales.',
    },
    {
      metric: 'MISSING_OFFICIAL' as const,
      value: 9,
      sourceKey: 'asocapitales_quibdo_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'Mismo informe consolidado de Asocapitales.',
    },
    {
      metric: 'VIVIENDAS_DESTRUIDAS' as const,
      value: 100,
      sourceKey: 'asocapitales_quibdo_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'Primer registro de daño habitacional específico de Quibdó: ~100 viviendas colapsadas según el informe de Asocapitales.',
    },
    {
      metric: 'VIVIENDAS_AVERIADAS' as const,
      value: 125,
      sourceKey: 'asocapitales_quibdo_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'Mismo informe: ~125 viviendas averiadas.',
    },
    {
      metric: 'EDIFICIOS_COLAPSADOS' as const,
      value: 20,
      sourceKey: 'asocapitales_quibdo_toll_0816',
      tier: 2,
      asOf: '2026-08-16T00:00:00-05:00',
      notes: 'Mismo informe: ~20 estructuras colapsadas (además de ~125 estructuras averiadas y 4 personas rescatadas).',
    },
  ]

  let tollCreated = 0
  for (const t of tollDefs) {
    const existing = await prisma.tollRecord.findFirst({
      where: { municipioId: quibdo.id, metric: t.metric, value: t.value, asOf: new Date(t.asOf) },
    })
    if (existing) continue
    await prisma.tollRecord.create({
      data: {
        municipioId: quibdo.id,
        metric: t.metric,
        value: t.value,
        sourceId: sources[t.sourceKey],
        tier: t.tier,
        asOf: new Date(t.asOf),
        notes: t.notes,
      },
    })
    tollCreated++
  }
  console.log(`TollRecord: ${tollCreated} created`)

  const aidPoints = [
    {
      kind: 'ACOPIO' as const,
      name: 'Club de Leones Quibdó Monarca — punto de acopio y donaciones en efectivo',
      address: 'Carrera 31 con calle 1a, Quibdó',
      phone: '+57 310 824 0059',
      needsText: 'Punto de acopio oficial (parte de la red actualizada listada por DANE Colombia el 16 de agosto). También recibe donaciones en efectivo: cuenta corriente Banco de Bogotá 578349508. El número y la cuenta fueron corroborados de forma independiente por dos creadores de TikTok distintos.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'Club de Leones Quibdó Monarca',
      submitterNote: 'Organización cívica internacional establecida (Club de Leones) con capítulo local en Quibdó; dirección confirmada por gráfico oficial de DANE Colombia, canal monetario corroborado por dos fuentes independientes en TikTok. No confirmado directamente por canales propios de la organización — verificar antes de transferir montos grandes.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Edificio Expocentro — punto de acopio',
      address: 'Carrera 8 #16-79, Torre 1, Oficina 304, Centro, Quibdó',
      phone: null,
      needsText: 'Uno de los puntos de acopio actualizados listados oficialmente para Quibdó.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'DANE Colombia / Alcaldía de Quibdó',
      submitterNote: 'Gráfico oficial de DANE Colombia (16 de agosto), corroborado de forma idéntica por dos agentes de esta pasada de forma independiente.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto Céntrico Comunitario',
      address: 'Carrera 7 #28-58, Quibdó',
      phone: null,
      needsText: 'Uno de los puntos de acopio actualizados listados oficialmente para Quibdó.',
      sourceUrl: 'https://x.com/DANE_Colombia/status/2089017701192565164',
      sourceOrg: 'DANE Colombia / Alcaldía de Quibdó',
      submitterNote: 'Mismo gráfico oficial de DANE Colombia.',
    },
    {
      kind: 'HEALTH' as const,
      name: 'Laboratorio Departamental de Salud Pública del Chocó — insumos de laboratorio',
      address: null,
      phone: '+57 310 751 7567',
      needsText: 'Materiales e insumos de laboratorio urgentes, lista suministrada por la Dra. Nayade Córdoba, Coordinadora del Laboratorio Departamental de Salud Pública.',
      sourceUrl: 'https://www.instagram.com/p/DcAKzHTtlyf/',
      sourceOrg: 'Laboratorio Departamental de Salud Pública del Chocó',
      submitterNote: 'Nombra a una funcionaria específica por cargo, con número de celular directo para coordinar donaciones; publicado por un tercero en su representación, no verificado más allá de ese detalle.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Brigada Humanitaria Cali → Chocó/Quibdó (Casa de los Títeres)',
      address: 'Casa de los Títeres, Carrera 9 #4-55, San Antonio, Cali',
      phone: '315 473 7320 / 318 261 9259 / 313 665 8516',
      needsText: 'Herramientas e insumos médicos; la brigada envía la ayuda hacia Quibdó, Yotoco, Norte del Valle y Buenaventura.',
      sourceUrl: 'https://www.instagram.com/p/Db_ApZajjTN/',
      sourceOrg: 'Uramba Centro de Pensamiento (Cali)',
      submitterNote: 'Colectivo cultural de Cali organizando un relevo activo de ayuda específicamente destinado a Quibdó, con dirección concreta en Cali y tres números de teléfono distintos.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'La2bleM S.A.S. — Campaña Todos Unidos por Quibdó',
      address: null,
      phone: null,
      needsText: 'Cuenta Bancolombia 141-000042-76, titular La2bleM S.A.S. Insumos médicos y de alimentación para Quibdó.',
      sourceUrl: 'https://www.instagram.com/p/Db6NsN5MlWB/',
      sourceOrg: 'La2bleM S.A.S.',
      submitterNote: 'Cuenta a nombre de una empresa (no una persona natural), pero es una marca de ropa pequeña sin verificación independiente de que esté realmente distribuyendo lo recaudado. Se incluye para que quien modere lo revise, no como canal plenamente verificado.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki — reconstruir el hogar de JohnFredy y su familia, Quibdó',
      address: 'Barrio Las Palmas, Quibdó',
      phone: null,
      needsText: 'Campaña de Vaki para reconstruir el hogar de JohnFredy y su familia, dañado por el terremoto del 10 de agosto.',
      sourceUrl: 'https://x.com/kevinlexv/status/2088751644276093228',
      sourceOrg: null,
      submitterNote: 'Familia beneficiaria y barrio nombrados, plataforma real (Vaki) — pero es una publicación individual de una cuenta pequeña y de bajo alcance (~30 vistas), sin verificación independiente de que los fondos lleguen a la familia. Confianza baja.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'GoFundMe — Ayúdame a reconstruir los hogares de mi familia en Chocó (Jusesky Cuesta Alvarez)',
      address: null,
      phone: null,
      needsText: 'Campaña individual en GoFundMe (meta $6,000) para reconstruir viviendas familiares dañadas por el terremoto en el Chocó.',
      sourceUrl: 'https://www.facebook.com/juseskycuestaalvarez/posts/pfbid0349YWT1u9AzXhXJ1zSm6sSVJYHFRp8SaWPT2sNCcXH74DTkEMvdXFLpbks1FKXAgWl',
      sourceOrg: null,
      submitterNote: 'Organizador nombrado con perfil personal de Facebook y fotos familiares, enlace directo a GoFundMe — campaña personal, no institucional, sin verificación independiente más allá de la publicación misma.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio "Colombia, un solo corazón" (Primera Dama)',
      address: 'Calle 27A #23-44, Barrio Los Ángeles, sector San Gabriel, Quibdó',
      phone: '310 805 0535 (Minerva Palacio)',
      needsText: 'Alimentos no perecederos, kits de higiene, ropa de cama y ropa para familias desplazadas por el terremoto.',
      sourceUrl: 'https://www.agenciapi.co/noticia/regiones/un-solo-corazon-la-campana-para-ayudar-los-damnificados-por-el-sismo-cuentas-y-municipios-donde-donar',
      sourceOrg: 'Oficina de la Primera Dama (Ana Lucía Pineda) — campaña "Colombia, un solo corazón"',
      submitterNote: 'Campaña nacional oficial; dirección, sector y persona de contacto corroborados de forma independiente por agenciapi.co y referenciados en cobertura de Infobae/El Tiempo sobre la misma campaña, que ya ha entregado 170+ toneladas de ayuda a Quibdó.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Étnica TV (canal comunitario del Chocó) — donaciones en efectivo',
      address: null,
      phone: '+57 316 432 1667',
      needsText: 'Donaciones en efectivo para distribución de ayuda en el Chocó: cuenta de ahorros Davivienda 016300667876.',
      sourceUrl: 'https://www.tiktok.com/@rossylemos/video/7673324568727112968',
      sourceOrg: 'Étnica TV',
      submitterNote: 'El mismo número de teléfono y cuenta bancaria fueron listados de forma independiente por dos creadoras de TikTok distintas con tres días de diferencia — reduce pero no elimina el riesgo. No confirmado por ningún canal gubernamental ni hospitalario. Dado el escándalo activo de cuentas personales (caso Benavides) y el fraude de QR conocido en este evento, tratar como pista de menor certeza y verificar de forma independiente antes de enviar dinero.',
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
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/VoragineCo/posts/pfbid0372XUkttYefRyyUkVr6F1oC67wywG45U18BYMGRnSwyKpa8nNsdRc7nX37Ni1fqPel',
      authorHandle: 'Vorágine',
      category: 'NEED' as const,
      placeName: 'Quibdó, Chocó — Coliseo de Boxeo',
      note: 'CRISIS COMPUESTA NUEVA: el único albergue de Quibdó (Coliseo de Boxeo) se inundó durante una tormenta, encima del daño ya causado por el terremoto, obligando a las familias desplazadas a evacuar de nuevo. Corroborado de forma independiente por NotimovilChocó y por la cuenta verificada de El Espectador en TikTok, que además describe a vecinos de la zona norte organizando su propio sistema de ayuda mutua (ollas compartidas entre cuatro casas, colchones repartidos a mano).',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/932610899160056',
      authorHandle: 'Noriel Garcia Garcia',
      category: 'NEED' as const,
      placeName: 'Hospital San Francisco de Asís, Quibdó',
      note: 'ACTUALIZACIÓN PARCIAL sobre la nevera de banco de sangre (pendiente desde la pasada 18): video del 15 de agosto muestra la llegada física de una nevera especializada para hemocomponentes al hospital, gestionada por empresarios de Medellín y la oficina de la Primera Dama — pero el mismo 16 de agosto seguía circulando activamente una publicación de El Colombiano describiendo el banco de sangre como aún no funcional, y una publicación separada en X (andres_bohorqu, misma fecha) afirma que el equipo actual sigue fallando y ya no es reparable mediante mantenimiento correctivo. Conclusión: el equipo llegó físicamente, pero la restauración completa del banco de sangre NO está confirmada.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@odbenavidesa/video/7674382050874477841',
      authorHandle: '@odbenavidesa (Óscar Benavides)',
      category: 'OFFICIAL' as const,
      placeName: 'Chocó',
      note: 'Respuesta pública del congresista Óscar Benavides a la investigación de la Corte Suprema (sin resolución aún, sigue en revisión preliminar según Infobae/El Granadino): la llama "matoneo judicial", dice que la recolección ya supera los $700 millones COP (subiendo desde los $300M ya conocidos), que cada peso está siendo rastreado y se hará público, y que viajará personalmente al Chocó para verificar la entrega de la ayuda.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/estoescambio/posts/pfbid0iQUbn2mEos3K4zHgG2qqAm3WmW4AKiYdi366TDnqwWy4uvfwTeL6toFYwNwejuU6l',
      authorHandle: 'Cambio',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Zona Minera, Quibdó',
      note: 'Reportaje de la revista Cambio desde la Zona Minera de Quibdó: viviendas inhabitables, riesgo de nuevos deslizamientos, y familias que no saben dónde vivirán — retrato de la fase de reconstrucción semanas después del sismo.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_-LwcNlrI/',
      authorHandle: '@elmurcy_',
      category: 'NEED' as const,
      placeName: 'Barrio Las Terrazas, Quibdó',
      note: '40 viviendas evacuadas en el barrio Las Terrazas de Quibdó; familias durmiendo en andenes o con vecinos mientras esperan alimento, suministros y evaluaciones técnicas. Comentarios añaden que el barrio El Poblado también está muy afectado y piden mapas georreferenciados/censo.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/elcontrastenoti/status/2089058734035104209',
      authorHandle: '@elcontrastenoti',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Quibdó, Chocó',
      note: 'Llegó a Quibdó el primer camión de ayuda humanitaria enviado desde Pasto (Nariño), recibido con aplausos por familias afectadas — solidaridad interdepartamental seis días después del sismo.',
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
