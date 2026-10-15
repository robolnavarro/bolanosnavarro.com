# Sitio bolanosnavarro.com — instrucciones para Claude Code

Este repositorio es el sitio en vivo de bolanosnavarro.com, publicado como
Cloudflare Worker (proyecto `bolanosnavarro`) conectado a este repo: cada push
a `main` se publica solo en ~1 minuto (Workers Builds corre `wrangler deploy`
con `wrangler.jsonc`). Las páginas son HTML estático; `src/worker.js` solo
atiende `/api/*` (testimonios) y lo demás lo sirve de los archivos.
`.assetsignore` evita publicar `src/`, `wrangler.jsonc` y este archivo.
Copia de prueba: https://bolanosnavarro.rodrigo-825.workers.dev

## Dominio y DNS
- El dominio está registrado en Squarespace, pero el DNS lo maneja Cloudflare.
- `bolanosnavarro.com` es el dominio personalizado del Worker.
- `www` redirige con 301 a `bolanosnavarro.com` (regla de Redirect en Cloudflare).
- No tocar los registros de correo de Google Workspace: MX `smtp.google.com`,
  TXT SPF y TXT `google._domainkey` (DKIM).
- Cloudflare usa URLs limpias: `/testimonio.html` redirige a `/testimonio`.

## Archivos
- `index.html` — sitio maestro. Vistas por hash: #inicio, #inmobiliaria, #despacho
  y #segale (landing de inmueble, sin pestaña propia; marca Inmobiliaria como activa).
  #inmuebles baja a la sección Inmuebles dentro de Inmobiliaria (ver `ANCLAS`).
  Deep links de campaña (ManyChat): #checklist, #torre, #foraneo, #credito,
  #inversion, #comparador (alias #contado y #banco),
  #arrendamiento (alias #contrato y #renta).
  #inmobiliaria muestra un botón "Abrir" por entregable (lista `.hub`); cada deep
  link abre ese entregable solo, con "← Todas las herramientas" para volver.
- Enlaces cortos para CTAs: `checklist.html`, `torre.html`, `foraneo.html`,
  `credito.html`, `inversion.html`, `comparador.html`, `arrendamiento.html`,
  `inmuebles.html`, `segale.html` → se sirven como bolanosnavarro.com/torre, etc.
  Solo redirigen a /#torre (conservando ?utm) y traen título/descripción propios
  para la vista previa de WhatsApp. Si se agrega un entregable: tarjeta en `.hub`,
  entrada en `TOOLMAP` y su archivo corto.
- `testimonio.html` — formulario de testimonios (Grupo Navarro + despacho), no
  enlazado desde el sitio. Guarda en la base D1 `testimonios` como "pendiente";
  si falla, ofrece mandarlo por WhatsApp al 443 128 1399.
- `admin.html` — panel privado en bolanosnavarro.com/admin. Pide la clave
  `ADMIN_KEY` (secreto del Worker en Cloudflare, nunca en el repo) y permite
  aprobar, quitar o rechazar. Solo los aprobados salen en el sitio.
- Prueba local: `npx wrangler dev --local` con `ADMIN_KEY` en `.dev.vars`
  (ignorado por git).

## Dónde editar cada cosa (dentro de index.html)
- **Testimonios**: array `TESTIMONIOS` en el <script> final (los fijos, p. ej.
  reseñas de Google). Formato: {t:'texto', n:'nombre', u:'inmo'|'desp',
  src:'google' (opcional), m:'materia' (opcional)}. Al cargar, el sitio agrega
  antes los aprobados de `/api/testimonios`. Se pintan en Inicio (todos) y en
  Despacho (solo u:'desp').
- **Cifras de la banda**: buscar `1,000+` / `$500M+` en la sección .band.
- **Precios y parámetros de las corridas San Pedro**: constantes
  `PRECIO=1278250, TASA=0.105/12, NPER=240, CAPPCT=0.325, SEG=1.12` en el <script>.
- **Comparador contado vs crédito** (herramienta 06, `t5`): réplica de la hoja
  de Drive `Entregables/Mi_Comparador_BANCO`. Valores por defecto: precio
  3,000,000 · gastos 6% · enganche 20% · tasa 10.5% · plazo 20 · seguros 12% ·
  rendimiento 9% · horizonte 10. Modelo: montos capitalizan mensualmente
  (rend/12) y la mensualidad se invierte como anualidad vencida; la posición con
  crédito resta el saldo insoluto al horizonte. Textos de perfiles en
  `CC_PERFILES`. Si cambia la hoja, actualizar aquí también.
- **Checklist de arrendamiento** (herramienta 07, `t6`): réplica del documento
  de Drive `Entregables/Checklist_Contrato_Arrendamiento`. Los 18 puntos viven
  en `ARR_BLOQUES` (4 bloques con título, «debe decir» y señal de alerta); el
  semáforo es 16-18 / 10-15 / menos de 10. Si cambia el documento, actualizar
  `ARR_BLOQUES`.
- **Inmuebles**: sección `#inmuebles` en la vista Inmobiliaria con una tarjeta
  `.inm-card` por propiedad. Para agregar otro inmueble: tarjeta nueva + una
  vista `<main id="..." class="view">` como la de `#segale`, el id en `views`, y
  su archivo de enlace corto. Fotos en `img/` (vienen del lienzo de diseño
  «Ficha Técnica Torre Segale»).
- **Formulario de Torre Segale** (`segForm`): no guarda nada; abre WhatsApp con
  el resumen hacia `WA_RB` (443 128 1399). Precios y disponibilidad de los 8
  departamentos están en el HTML de `#segale` (bloque `.deps`) y en el `select`
  del formulario: si cambian, actualizar los dos.
- **Datos de Torre Paseo del Parque**: inputs por defecto `pdpPrecio` (3300000)
  y `pdpRenta` (15977), y las barras comparativas de $/m².
- **Números de WhatsApp**: desde el 14-oct-2026 **todo** lo del sitio va al
  443 128 1399 (`WA_GN` y `WA_RB` valen `524431281399`). El 443 410 1638 de Grupo
  Navarro ya no se usa en el sitio.
- **Origen del prospecto**: `ORIGEN` agrega « · vía <utm_source>-<UTM_CAMPAIGN>» al
  mensaje de WhatsApp cuando la visita trae `utm_campaign` (los enlaces cortos
  conservan el `?utm`).
- **Aviso de privacidad**: `aviso-de-privacidad.html` → bolanosnavarro.com/aviso-de-privacidad.
  Se genera desde el repo GBN (`05-infraestructura/scripts/documentos-navarro`,
  `node html.js aviso-privacidad.js`); no editarlo a mano. Ligado desde el pie y
  desde la leyenda `.legal.consent` bajo los botones `lWA`, `aWA` y `ccWA`
  (consentimiento expreso para datos financieros: no borrarla).

## Infraestructura y accesos (cuenta de Rodrigo)
- GitHub: `robolnavarro/bolanosnavarro.com`, repo **público**, rama `main`.
  Desde una computadora nueva: `git clone` y, en el primer push, un token
  fine-grained con permiso Contents (lectura y escritura) solo para este repo.
- Cloudflare: Worker `bolanosnavarro` (cuenta rodrigo-825), conectado al repo
  por Workers Builds. `keep_vars: true` en `wrangler.jsonc` conserva las
  variables creadas desde el panel.
- Base de datos D1 `testimonios` (id en `wrangler.jsonc`). La tabla se crea sola
  en el primer uso de la API.
- `ADMIN_KEY` es un **secreto del Worker** (Settings → Variables and Secrets).
  Solo Rodrigo la conoce; nunca pedirla, pegarla ni guardarla en el repo.
- Google Analytics: etiqueta `G-Q00EQZ4N8N` en `index.html` y `testimonio.html`,
  una sola vez por página, justo después de `<head>`. Los archivos de enlace
  corto no la llevan, para no contar doble.
- Prueba local: `npx wrangler@4 dev --local` con `ADMIN_KEY` en `.dev.vars`.
  Ojo: `compatibility_date` no puede ser posterior a la versión de wrangler que
  tengas instalada, o el servidor local no arranca.
- El DNS del proveedor del usuario (Telmex) puede seguir mostrando la página
  vieja «Próximamente» por caché. Eso es del proveedor, no del sitio.

## Pendientes (al 14 de octubre de 2026)
1. Hay **3 testimonios pendientes** de aprobar en bolanosnavarro.com/admin.
   Rodrigo pidió aprobarlos «clasificándolos correctamente» (negocio y tipo de
   experiencia); el panel ya permite reclasificar, pero hay que entrar con la
   clave, que solo tiene él.
2. Falta decidir los números de WhatsApp de la landing de Torre Segale: los
   botones «Agenda tu visita» y WhatsApp usan 443 410 1638 (como el diseño
   original) y el formulario usa 443 128 1399. Preguntar si se unifican.
3. Si cambian las fuentes en Drive (`Entregables/Mi_Comparador_BANCO` y
   `Entregables/Checklist_Contrato_Arrendamiento`), actualizar las herramientas
   06 y 07.

## Reglas
1. Todo cambio se hace por edición directa del HTML, se verifica la sintaxis
   del <script> y se hace commit + push a `main`. Eso ya lo publica.
2. Nunca borrar los disclaimers legales (.legal) ni la autorización del
   formulario de testimonios.
3. Los testimonios se publican textuales, con atribución (Reseña de Google
   o formulario) y solo con autorización del cliente.
4. Después de cada push, confirmar en https://bolanosnavarro.com que el
   cambio quedó en vivo.
