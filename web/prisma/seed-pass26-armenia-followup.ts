/**
 * Pass 26 (2026-08-14) — follow-up social media research pass on Armenia,
 * days after the original deep pass (wiki pass 17). Surfaces a genuinely
 * new shelter (Coliseo del Sur), a cluster of institutional acopio points
 * (Diócesis, teachers' union, departmental government), a new animal-welfare
 * crisis (Fundación Oki Doki), and confirms Fundación Covida's Vaki campaign
 * is still active with funds visibly being spent. See
 * wiki/17-allied-resources-and-community.md "Pass 26" for full reasoning.
 * Run once via `npx tsx prisma/seed-pass26-armenia-followup.ts`.
 */
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 })
const prisma = new PrismaClient({ adapter })

async function main() {
  const armenia = await prisma.municipio.findFirstOrThrow({ where: { divipolaCode: '63001' } })

  const aidPoints = [
    {
      kind: 'ALBERGUE' as const,
      name: 'Albergue temporal - Coliseo del Sur (Armenia)',
      address: 'Coliseo del Sur, Armenia, Quindío',
      phone: null,
      needsText: 'Colchonetas urgentes para familias que continúan llegando; refugio para quienes perdieron su vivienda o cuya casa fue señalada como insegura tras inspección.',
      sourceUrl: 'https://www.tiktok.com/@stefannycastellanosm/video/7673334781010038023',
      sourceOrg: null,
      submitterNote: 'Corroborado independientemente por al menos 3 cuentas distintas de TikTok en una ventana de 2 días, todas describiendo el mismo sitio con detalles consistentes. Aparenta ser un albergue genuinamente nuevo, no registrado antes. Confianza media.',
    },
    {
      kind: 'VET' as const,
      name: 'Fundación Oki Doki - Hogar de Paso (310 animales)',
      address: 'Punto de donación: Punto de Información de Unicentro Armenia',
      phone: '314 631 1455',
      needsText:
        'Concentrado para perros/gatos, medicamentos veterinarios (clorhexidina, gasas, guantes, doxiciclina, cefalexina, meloxicam inyectable, vacunas, jeringas, multivitamínicos, desparasitantes). El refugio (310 animales) tiene su estructura comprometida y no puede reubicarse.',
      sourceUrl: 'https://www.instagram.com/p/Db89FFciYzj/',
      sourceOrg: 'Fundación Oki Doki + Unicentro Armenia (punto de recolección)',
      submitterNote:
        'Confirmado por la cuenta oficial del centro comercial Unicentro Armenia, que aloja un punto de recolección formal en su punto de información. ADVERTENCIA: un comentario reportó que una llave/Nequi previamente circulada "no sirve" - la llave oficial corregida es 320 625 7637, a nombre de la fundadora Jacqueline. Verificar datos de pago directamente con la fundación antes de enviar dinero. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Diócesis de Armenia - Banco de Alimentos (punto de acopio)',
      address: 'Calle 21 #12-08, Armenia, Quindío',
      phone: null,
      needsText: 'Alimentos, agua, cobijas, colchonetas.',
      sourceUrl: 'https://www.instagram.com/p/Db_W2mRIJMN/',
      sourceOrg: 'Diócesis de Armenia',
      submitterNote: 'Cuenta oficial de la Diócesis (Pastoral Social/Banco de Alimentos), dirección específica. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Diócesis de Armenia - Pastoral Social (punto de acopio)',
      address: 'Calle 23, entre carreras 12 y 13, Armenia, Quindío',
      phone: null,
      needsText: 'Alimentos, agua, cobijas, colchonetas.',
      sourceUrl: 'https://www.instagram.com/p/Db_W2mRIJMN/',
      sourceOrg: 'Diócesis de Armenia',
      submitterNote: 'Segundo punto físico del mismo post oficial de la Diócesis. Confianza alta.',
    },
    {
      kind: 'MONETARY_DONATION' as const,
      name: 'Diócesis de Armenia - aporte económico',
      address: null,
      phone: null,
      needsText: 'Cuenta de ahorros Banco Caja Social N.º 24145028022.',
      sourceUrl: 'https://www.instagram.com/p/Db_W2mRIJMN/',
      sourceOrg: 'Diócesis de Armenia',
      submitterNote: 'Cuenta bancaria publicada por la propia institución. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'SUTEQ - Sindicato Único de Trabajadores de la Educación del Quindío (Donatón)',
      address: 'Sede SUTEQ, Cra. 13 #9-51, Armenia, Quindío',
      phone: null,
      needsText: 'Alimentos no perecederos, agua, implementos de aseo. Recepción 8am-6pm hasta el 21 de agosto.',
      sourceUrl: 'https://www.instagram.com/p/Db9HpPqGUMj/',
      sourceOrg: 'SUTEQ',
      submitterNote: 'Sindicato establecido, dirección y fecha de cierre específicas. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Gobernación del Quindío - Centro de Convenciones (acopio oficial)',
      address: 'Centro de Convenciones, Armenia, Quindío',
      phone: null,
      needsText: 'Alimentos no perecederos, colchones y colchonetas, agua, cobijas.',
      sourceUrl: 'https://www.instagram.com/p/Db9BeNqpsZa/',
      sourceOrg: 'Gobernación del Quindío',
      submitterNote: 'Centro de respuesta oficial departamental. Confianza alta.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Casa Rosa Experiencias (centro de acopio)',
      address: 'Calle 4 norte #13-58, Sector Fundadores, Armenia, Quindío (diagonal a la notaría 5)',
      phone: null,
      needsText: 'Punto de acopio en un espacio de eventos local.',
      sourceUrl: 'https://www.instagram.com/p/Db8jma_xLjg/',
      sourceOrg: null,
      submitterNote: 'Negocio local, dirección precisa. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'OVNI Club (centro de acopio)',
      address: 'Carrera 14 #21N-54, diagonal al portal del Quindío, Armenia',
      phone: '318 869 0565 / 300 472 2466',
      needsText: 'Agua, alimentos no perecederos, ropa/cobijas, kits de aseo, guantes.',
      sourceUrl: 'https://www.instagram.com/p/Db84yFKM5-0/',
      sourceOrg: null,
      submitterNote: 'Club local, dirección y dos teléfonos. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Casa Bistrea - Auditorio Colegio Rufino Sur (acopio + comidas calientes)',
      address: 'Auditorio Colegio Rufino Sur, Cra. 27 #22-21, Armenia, Quindío',
      phone: '314 814 6067',
      needsText: 'Alimentos, agua, aseo, ropa, cobijas, medicamentos, implementos de cocina, comida para mascotas.',
      sourceUrl: 'https://www.instagram.com/p/Db87HgYPgiR/',
      sourceOrg: null,
      submitterNote: 'Restaurante local también organizando preparación de comidas calientes. Confianza media.',
    },
    {
      kind: 'ACOPIO' as const,
      name: 'Punto de acopio Barrio Galán',
      address: 'Carrera 17 #3-73, Barrio Galán, Armenia, Quindío',
      phone: null,
      needsText: 'Alimentos no perecederos, aseo, pañales, linternas, pilas, carpas, colchones.',
      sourceUrl: 'https://www.instagram.com/p/Db6YSx2H1Ll/',
      sourceOrg: null,
      submitterNote: 'Cuenta individual, pero con dirección específica. Confianza media.',
    },
  ]

  let aidCreated = 0
  for (const a of aidPoints) {
    const existing = await prisma.pendingAidPoint.findFirst({ where: { name: a.name, municipioId: armenia.id } })
    if (existing) continue
    await prisma.pendingAidPoint.create({
      data: {
        municipioId: armenia.id,
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
      permalink: 'https://x.com/RadioChiriqui/status/2088445623313867037',
      authorHandle: '@RadioChiriqui',
      category: 'OFFICIAL' as const,
      placeName: 'Colombia (nacional)',
      note: 'Cifras oficiales actualizadas de UNGRD (14 de agosto): 287 muertos, 3,975 heridos, 378 desaparecidos, 56,448 familias damnificadas a nivel nacional.',
    },
    {
      platform: 'X' as const,
      permalink: 'https://x.com/Alejandra_1795/status/2088020244065350066',
      authorHandle: '@Alejandra_1795',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia (entre las cámaras afectadas)',
      note: 'Confecámaras reporta ~270,000 negocios y 1.4M empleos en riesgo en las zonas más golpeadas; las cámaras de Cali/Pereira/Manizales/Armenia concentran el 70%. Gobierno declara emergencia económica y crea el "Fondo Milagro".',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/reel/DcCahRZR4ja/',
      authorHandle: '@santiagomeneses11 / @fundacioncovida',
      category: 'AID_POINT' as const,
      placeName: 'Fundación Covida, Armenia',
      note: 'ACTUALIZACIÓN DE ESTADO: video "Día 4" mostrando avance físico real (demolición del muro de la piscina y el muro perimetral) - confirma que la campaña Vaki ya sembrada sigue activa y los fondos se están usando visiblemente.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/DcCDh5yk6Yj/',
      authorHandle: 'semarmenia',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia',
      note: 'Comunicado oficial de la Secretaría de Educación: la mayoría de sedes escolares calificadas "verde", 7 "naranja", ninguna "roja"; sin clases 18-21 agosto, docentes regresan el 18 con apoyo psicosocial.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db9ogQijGuk/',
      authorHandle: 'unhombrepelibroso',
      category: 'NEED' as const,
      placeName: 'Conjunto Residencial Las Vegas, Armenia',
      note: 'Residentes de un conjunto dañado siguen esperando ayuda; adultos mayores sin dónde ir, otros rechazados en arriendos por tener mascotas.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db8I9rSkZwP/',
      authorHandle: 'estefaniamartinez.oficial',
      category: 'AID_POINT' as const,
      placeName: 'Armenia (varios sitios)',
      note: 'Carrusel con alto alcance compilando familias/lugares específicos que necesitan ayuda: Doña Hilda, comedor Los Naranjos, Fundación Tizu, Villa Carolina, El Berlín, Fundación Oki Doki.',
    },
    {
      platform: 'INSTAGRAM' as const,
      permalink: 'https://www.instagram.com/p/Db_KhqTxW9e/',
      authorHandle: 'leidyosoriohenao',
      category: 'NEED' as const,
      placeName: 'Fundación Oki Doki, Armenia',
      note: 'El techo del refugio está cerca del colapso; menciona un segundo refugio dañado ("Animalandia") con su propio Nequi/Bancolombia.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/QuindioAlDiaCanalNoticias/posts/pfbid0vchmq6abSrCSCjSs4xNMhEQxHB4zeaWUGmpts588eUf1kRZXJJzamuM1D9DFjvh8l',
      authorHandle: 'Quindío Al Día Canal Noticias',
      category: 'HUMAN_INTEREST' as const,
      placeName: 'Armenia',
      note: '"Armenia, dos días después": vecinos limpiando, comerciantes reabriendo, familias rescatando lo que pueden - invoca el terremoto de 1999 como prueba de que la ciudad se reconstruye.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/reel/1081897867835192',
      authorHandle: 'Quindío 24 Horas',
      category: 'OFFICIAL' as const,
      placeName: 'Quindío',
      note: 'El gobierno anuncia subsidios de arriendo para familias que perdieron completamente su vivienda; más de 6,000 viviendas afectadas en el Quindío.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/ElQuindianoNoticias/posts/pfbid0A2AuV7SKwcCF9j42AKkeVMEfVv7jdQzuR5yxqMRvkwDsVQRj94ywDbN6gM8KALeil',
      authorHandle: 'El Quindiano',
      category: 'OFFICIAL' as const,
      placeName: 'Quindío',
      note: '~70% de instituciones educativas del Quindío con daños; inspecciones técnicas en cada sede del 12 al 15 de agosto antes de reanudar clases presenciales.',
    },
    {
      platform: 'FACEBOOK' as const,
      permalink: 'https://www.facebook.com/permalink.php?story_fbid=pfbid02KPvkzyN2rouGsvu4pNx1kj9auM9kgSeeNdw6svyDEj1sHpQAYEHc84CGCafnyLtYl&id=61574909973919',
      authorHandle: 'NC Quindío',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia, Calarcá, Montenegro',
      note: 'La Cámara de Comercio de Armenia y del Quindío encuestó 1,600+ comerciantes: 84% reportó daños por el sismo.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@stefannycastellanosm/video/7673334781010038023',
      authorHandle: '@stefannycastellanosm',
      category: 'AID_POINT' as const,
      placeName: 'Coliseo del Sur, Armenia',
      note: 'Albergue temporal requiriendo colchonetas para familias que continúan llegando.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@cncquindio/video/7673029923174354197',
      authorHandle: '@cncquindio',
      category: 'OFFICIAL' as const,
      placeName: 'Quindío',
      note: 'Visita presidencial al Quindío con compromisos de subsidios de vivienda/arriendo; el gobernador pide apoyo urgente para 4 acueductos municipales; ~70% de infraestructura departamental afectada.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@periodicoelcolombiano/video/7673934279109381397',
      authorHandle: '@periodicoelcolombiano',
      category: 'OFFICIAL' as const,
      placeName: 'Armenia',
      note: 'Armenia con graves daños estructurales: evacuaciones en el norte de la ciudad, Universidad del Quindío permanece cerrada.',
    },
    {
      platform: 'TIKTOK' as const,
      permalink: 'https://www.tiktok.com/@redmasnoticias/video/7674001720652893448',
      authorHandle: '@redmasnoticias',
      category: 'OFFICIAL' as const,
      placeName: 'Quindío y departamentos vecinos',
      note: 'Claro Colombia reporta 86% de sus estaciones base reactivadas en Chocó, Caldas, Quindío, Risaralda y Valle del Cauca.',
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
        municipioId: armenia.id,
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
