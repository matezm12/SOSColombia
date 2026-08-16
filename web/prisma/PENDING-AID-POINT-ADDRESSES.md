# Puntos de ayuda pendientes de geocodificar

Estado al 2026-08-16: **167 de 235** AidPoints ya tienen coordenadas y se ven en el mapa de su ciudad. Quedan **68**, listados abajo por categoría para que sea fácil decidir qué hacer con cada uno cuando tengas tiempo.

Cómo aplicar lo que encuentres: una vez tengas una dirección o coordenada confiable para alguno de estos, dile a Claude "geocodifica [nombre del punto] en [dirección/coordenadas]" o edítalo directo en la base de datos (`AidPoint.lat` / `AidPoint.lng`, tabla en Supabase). Ya existe un script reutilizable en `prisma/apply-researched-addresses-batch2.ts` como referencia de patrón (geocodifica vía Nominatim + valida distancia contra el centroide del municipio antes de guardar).

---

## A. Tienen dirección real, pero ningún geocodificador (Nominatim + Photon, 2 motores, ~6 intentos cada uno) la resolvió

Estas son las más prometedoras para resolver a mano — probablemente solo hace falta buscar el sitio directo en Google Maps y copiar las coordenadas.

- **Banco Arquidiocesano de Alimentos de Manizales** — Calle 49 #27A-85 / Faneón, Manizales
- **Coliseo Universidad de Caldas (sector Velódromo)** — sin dirección capturada; dos fuentes dan direcciones distintas para el mismo lugar (Calle 65 #26-10 vs Calle 57 entre carreras 25-26) — hay que confirmar cuál es la correcta antes de geocodificar
- **Juguetes por Colombia** (Manizales) — Sector de El Cable, Manizales (dirección exacta no dada)
- **Refugio animal en El Arenillo** (doña Lucía, ~120 perros y gatos, Manizales) — Sector El Arenillo (dirección exacta no dada)
- **Animal Gym** (Pereira) — Manzana 16 casa 9 campestre A
- **CAFE El Remanso** (Pereira) — Avenida principal del barrio El Remanso, junto al Centro de Salud
- **Centro Acopio Corales** (Pereira) — Manzana 13 casa 19, cerca al parque Las Iguanas
- **Centro de Acopio - Caseta Comunal de Gamma** (Pereira) — Caseta Comunal, barrio Gamma
- **Centro de Acopio Voluntario** (Pereira) — Mz 3 casa 32 piso 2, Santa Fe/Cuba
- **Óptica Bustamante** (Pereira) — Jardín 2 etapa, manzana 14 casa 21
- **JumpFit by Felina** (Pereira) — "Mall Batará Plaza" — ⚠️ este nombre de centro comercial no aparece en ningún geocodificador; vale la pena confirmar que el nombre esté bien escrito o si es un apodo local de otro mall
- **Pet and Pet** (Popayán, Barrio La Ximena) — Carrera 6 #45N-55 — un intento previo cayó en el barrio equivocado (San Fernando Norte) y se revirtió a propósito; hace falta una búsqueda más precisa
- **Universidad del Cauca - Facultad de Ciencias Agrarias** (Popayán) — solo hay descripción de oficina, no dirección de calle
- **Casa de acopio La Licorera** (Buenaventura) — dirección exacta no capturada; ⚠️ ver nota en categoría D, puede que el punto real esté en Cali, no Buenaventura
- **Puntos de acopio en el barrio Ambato (2 puntos)** (Ibagué) — direcciones exactas no publicadas
- **Casa de paso/tránsito - Comuna 1** (Cali) — confirmado que no existe un refugio fijo único, solo un censo puerta a puerta

## B. Sin dirección — hace falta contactar directamente o revisar redes sociales de nuevo más adelante

Ya se buscó en web + Instagram/Facebook/TikTok/X dos veces sin éxito. Probablemente solo se resuelvan si alguien manda un mensaje directo a la organización o encuentra un post nuevo.

- **Bienestar Animal (programa municipal)** (Armenia) — confirmado que no existe un centro físico separado, es un programa de la Secretaría de Gobierno
- **Fundación Kenovy Colombia** (Armenia) — refugio confirmado en vereda Altos de los Guevara, sin dirección exacta
- **Rotaract/Rotary Armenia** — club confirmado real, sin dirección de reunión publicada
- **"Un Solo Corazón" (Tigresas Moviéndose con Corazón)** (Buenaventura) — solo canal bancario internacional
- **Fundación Salvando Huellitas Buenaventura** — ubicación oculta a propósito por seguridad de los animales
- **Refuerzo médico nacional a Buenaventura** — hospital de campaña confirmado real ("zona portuaria" cerca Barrio Lleras) pero sin sitio exacto
- **Veterinary Cat Medical Care** (Buenaventura) — sin rastro de este evento específico
- **Colecta vereda Santa Ana** (Dosquebradas) — solo "vereda Santa Ana"
- **Mariana Pulido - Salón Dadá Vintage** (Dosquebradas) — confirmado que es una tienda solo-online, sin local físico real
- **Paraíso Canino** (Dosquebradas) — ⚠️ la única cuenta real de "Paraíso Canino" encontrada está en Pereira, no Dosquebradas — revisar si el registro original tiene la ciudad equivocada
- **Fundación Ángeles de la Calle** (Manizales) — Instagram revisado, sin dirección
- **Acompañamiento psicológico gratuito - Dr. Carlos Hurtado y Dra. Yamile Hasbon** (Pereira) — probablemente oferta remota, sin consultorio físico
- **Consultas Veterinarias Gratis - Dra. Luisa Fernanda López** (Pereira) — sin presencia web/social encontrada
- **Fundación CASA K** (Popayán) — Instagram @casak.rescate confirmado, bio sin dirección
- **Jóvenes Animalistas Popayán** — ningún grupo con este nombre exacto encontrado
- **ORIQUIN** (Pijao) — resguardo indígena de Tatadrúa, sin coordenadas publicadas de límites del resguardo
- **ASINCH** (Quibdó) — canal diáspora, sin ubicación física
- **Colecta Solidaria PROANIMALES Quibdó y Tadó** — sin rastro de esta organización
- **Fundación Médicos Amigos - Misión Médica en Chocó** — sede real está en Barranquilla, no en Chocó
- **Rescate animal Mi Mejor Amigo** (Quibdó) — ninguna organización con este nombre confirmada en Quibdó

## C. No tienen ubicación física fija por diseño — probablemente nunca deberían tener un pin

- **Colegio Médico Colombiano - Brigada de Salud** (Buenaventura/Quibdó) — oficina de coordinación en Bogotá, la brigada viaja sin sede fija
- **Cámara de Comercio de Dosquebradas** — solo cuentas para donación en dinero
- **Cámara de Comercio de Manizales** (3 fondos distintos) — solo cuentas para donación en dinero
- **Red Farmacéutica** (Manizales, vía Secretaría de Salud) — red de puntos, no un punto único
- **Fundación Solidaridad por Colombia - "Caminata de la Solidaridad 2026"** (Pereira) — evento nacional en Bogotá, Pereira solo es ciudad de entrega de kits
- **Jornadas Extramurales de Donación de Sangre** (Popayán) — evento itinerante en 3 ubicaciones distintas por día
- **Recorrido Solidario por comunas de Popayán** — es una ruta a pie/vehicular por 12 sectores, no un punto fijo
- **Diócesis de Quibdó - cuentas de donación** — canal bancario
- **ONE Inversión Social - Una noche por Chocó** — evento/fondo
- **Mestizo Centro Cultural y Artístico** (Bogotá, ligado a San José del Palmar) — Bogotá no es una de las 11 ciudades rastreadas por el proyecto, no hay a qué municipio asignarlo
- **Pajaros Tejedores / red Mestizo** — coordinación telefónica hacia San Pedro de Ingará, sin punto de recogida fijo

## D. "Detección automática — revisar" (16 puntos, sin nombre real capturado)

Estos vienen de un proceso de detección automática (probablemente de comentarios/posts de redes sociales) que no logró extraer un nombre de organización o lugar. No son investigables por búsqueda — hay que abrir el registro original en el admin (`/admin` o donde se gestionen los AidPoints) y ver cuál fue la fuente/comentario original que los generó, para decidir si son puntos reales que merecen un nombre y dirección, o si deberían borrarse por ser ruido.

- 15 en Armenia
- 1 en Dosquebradas
- 1 en Manizales
- 1 en Pereira

---

**Resumen de la sesión:** se pasó de 105/235 a 167/235 puntos geocodificados (+62), usando investigación web + redes sociales para encontrar direcciones nuevas, dos motores de geocodificación (Nominatim y Photon/Komoot) con verificación de distancia contra el centroide de cada municipio, y reversión activa de coincidencias sospechosas (mismo punto genérico para dos lugares distintos, o un nombre de sitio adivinado que resultó ser el lugar equivocado). Nada se inventó — cada dirección aplicada tiene una fuente rastreable, y cada punto que sigue sin dirección tiene documentado el motivo específico arriba.
