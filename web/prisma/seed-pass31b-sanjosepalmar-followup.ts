/**
 * Pass 31b (2026-08-15) — follow-up social media research pass on San José
 * del Palmar, the earthquake's epicenter and the final city in the
 * second-round follow-up sweep across all nine tracked cities. As expected
 * for a small, remote, thinly-covered municipality, no new physical aid
 * points were found inside the town itself — the pass instead surfaces the
 * town's transition out of acute isolation (one-lane road reopened after
 * being fully cut off, first aid deliveries, an active air bridge) and
 * updated official figures. See wiki/17-allied-resources-and-community.md
 * "Pass 31" for full reasoning. Run once via
 * `npx tsx prisma/seed-pass31b-sanjosepalmar-followup.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const sjp = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '27660' } })

  const aidPoints = [
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Vaki para San José del Palmar, Chocó (Epicentro del terremoto)',
      address: null,
      phone: null,
      needsText: 'Reconstrucción de viviendas y espacios comunitarios, y apoyo a familias afectadas en San José del Palmar.',
      sourceUrl: 'https://vaki.co/vaki/vaki-para-san-jos-del-palmar-choc-epicentro-del-terremoto',
      sourceOrg: 'Valentina Jurado (@mamadeamara)',
      submitterNote:
        'Campaña genuinamente nueva (no existía en la pasada original), creada el 11 de agosto por una organizadora con una conexión personal previa al pueblo (lo visitó tres meses antes del sismo). PRECAUCIÓN - cifras en conflicto entre agentes: uno reportó US$46,464 recaudados de una meta de US$9,629 con 1,827 contribuyentes; dos agentes distintos vieron la página con cero donaciones ("Sé el primer Vaker"). Podría ser una diferencia de momento de verificación (crecimiento rápido) o un artefacto de caché de la sesión compartida de navegador - verificar el estado actual antes de citar una cifra específica. Es una campaña individual, no institucional, por lo que se mantiene en confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Proceso de Comunidades Negras (PCN) - Centro de acopio independiente para el Chocó',
      address: 'Calle 12D #1A-10, Candelaria centro, Bogotá',
      phone: null,
      needsText: 'Alimentos no perecederos, medicinas, kits de higiene, agua para la respuesta al terremoto en Chocó (incluye el área de San José del Palmar) y Buenaventura.',
      sourceUrl: 'https://www.telesurtv.net/colombia-organizacion-popular-sostiene-choco/',
      sourceOrg: 'Proceso de Comunidades Negras (PCN)',
      submitterNote:
        'El punto físico de acopio está en Bogotá, no dentro de San José del Palmar mismo - se sembró aquí porque explícitamente recolecta y canaliza ayuda hacia el Chocó/zona del epicentro, bajo el lema "el pueblo salva al pueblo", en respuesta a lo que la organización describe como ayuda estatal "fragmentada". Corroborado por múltiples medios (teleSUR, Noticias Caracol, NTN24) y un post de Instagram de un miembro de PCN con la dirección exacta.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: sjp.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: sjp.id,
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
      permalink: 'https://www.facebook.com/MintransporteColombiaoficial/posts/pfbid027Vq1d5Z4evNxjFf67JSt59MmEDaHMgeAUB5AgzvP7hZbXgikcDZ6dnD8aw6b8vHSl',
      authorHandle: 'Ministerio de Transporte Colombia',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar, Chocó',
      note: '"¡Logramos habilitar la vía de acceso al municipio de San José del Palmar, epicentro del sismo!" El único acceso terrestre al pueblo, cortado por derrumbes desde el 10 de agosto, reabrió a un carril el 13 de agosto. Trabajo continúa para la recuperación total del corredor.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@unicef_es/video/7673800630430895382',
      authorHandle: '@unicef_es',
      category: 'NEED' as const,
      placeName: 'San José del Palmar, Chocó (zona rural)',
      note: 'UNICEF España matiza la noticia de la vía: más de 45 derrumbes distintos siguen dejando a miles de familias completamente aisladas en las zonas rurales del municipio, incluso con la vía principal parcialmente reabierta.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1976218473079842',
      authorHandle: 'Noticias Caracol',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar, Chocó',
      note: '"San José del Palmar, Chocó, epicentro del terremoto...comienza a recibir las primeras ayudas destinadas a las familias damnificadas" - primeros envíos de ayuda organizada llegando al pueblo epicentro, coincidiendo con la reapertura de la vía.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.fac.mil.co/es/noticias/puente-aereo-fortalece-la-respuesta-al-terremoto-en-el-suroccidente',
      authorHandle: 'Fuerza Aeroespacial Colombiana',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'Puente aéreo activo: aeronaves de ala fija y rotativa realizan misiones continuas de reconocimiento y ayuda sobre San José del Palmar y otros municipios. El Ejército Nacional trasladó 12 toneladas de ayuda humanitaria específicamente a San José del Palmar; Chocó recibió su primera entrega aérea de médicos e insumos médicos.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.telesurtv.net/colombia-organizacion-popular-sostiene-choco/',
      authorHandle: 'teleSUR',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Chocó (epicentro: San José del Palmar)',
      note: '"El pueblo salva al pueblo": comunidades del Chocó reportan que la ayuda estatal llega "fragmentada". Cifras propias del Chocó (distintas de los totales nacionales): 29 municipios afectados, 43,000+ personas afectadas, 14 muertos confirmados en el departamento. El gobierno nacional limitó la ayuda internacional aceptada a solo Israel, Ecuador, El Salvador y Estados Unidos, generando críticas.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://www.telesurtv.net/colombia-eleva-a-288-los-fallecidos-y-reduce-a-202-los-desaparecidos-tras-el-terremoto/',
      authorHandle: 'teleSUR / UNGRD',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (epicentro: San José del Palmar)',
      note: 'Balance nacional de UNGRD, corte 14 de agosto 4:30pm: 288 muertos (+3 frente al boletín matutino), 202 desaparecidos (baja fuerte desde 379), 4,018 heridos, 354 rescatados con vida, 145,601 damnificados en 448 municipios de 15 departamentos. San José del Palmar se cita consistentemente como el epicentro.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db686BLOb7J/',
      authorHandle: 'moniyi',
      category: 'NEED' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'PRECAUCIÓN: gráfico de solicitud de donación dirigido a una cuenta Bancolombia de "ASOPERCHO" (Asociación de Personerías del Chocó). Instagram marcó el post como "contenido de IA"; un comentario reporta que se le pidió al donante suministrar el nombre completo y teléfono del titular de la cuenta para "verificar" la transferencia - una solicitud inusual que generó sospecha. Aunque ASOPERCHO parece corresponder a una asociación real, la publicación en sí no está verificada y se repite idéntica en varias cuentas no relacionadas. No tratar como canal de donación confirmado sin verificación directa con ASOPERCHO.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1392247252787732',
      authorHandle: 'Noticias NVC',
      category: 'OFFICIAL' as const,
      placeName: 'San José del Palmar / corredor Cartago-Chocó',
      note: 'Alerta de estafa: "¡ATENCIÓN! NO SE DEJE ENGAÑAR: EL ICBF NO ESTÁ PIDIENDO DINERO" - se está suplantando al ICBF (instituto de bienestar familiar) para solicitar dinero relacionado con la respuesta al terremoto.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/MJDuzan',
      authorHandle: '@MJDuzan (María Jimena Duzán)',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'San José del Palmar, Chocó',
      note: 'El programa "A Fondo" de la periodista María Jimena Duzán entrevistó a Sara Meneses, sobreviviente del municipio más cercano al epicentro, sobre cómo el departamento y sus residentes están sobrellevando la situación cinco días después del sismo.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@infobaecolombia/video/7673550713645042965',
      authorHandle: '@infobaecolombia',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'San José del Palmar, Chocó',
      note: '"Este es San José del Palmar, el aislado pueblo del Chocó que fue el epicentro del terremoto de 7,4 en Colombia" - pieza de reportaje/explicativo sobre el pueblo mismo, su aislamiento e historia, señal de que la cobertura mediática nacional ahora profundiza en esta pequeña localidad días después del sismo.',
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
        municipioId: sjp.id,
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
