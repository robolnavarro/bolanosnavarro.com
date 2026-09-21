# Sitio bolanosnavarro.com — instrucciones para Claude Code

Este repositorio es el sitio en vivo de bolanosnavarro.com, publicado como
Cloudflare Worker (proyecto `bolanosnavarro`) conectado a este repo: cada push
a `main` se publica solo en ~1 minuto. No hay proceso de build: son archivos
HTML estáticos. Copia de prueba: https://bolanosnavarro.rodrigo-825.workers.dev

## Dominio y DNS
- El dominio está registrado en Squarespace, pero el DNS lo maneja Cloudflare.
- `bolanosnavarro.com` es el dominio personalizado del Worker.
- `www` redirige con 301 a `bolanosnavarro.com` (regla de Redirect en Cloudflare).
- No tocar los registros de correo de Google Workspace: MX `smtp.google.com`,
  TXT SPF y TXT `google._domainkey` (DKIM).
- Cloudflare usa URLs limpias: `/testimonio.html` redirige a `/testimonio`.

## Archivos
- `index.html` — sitio maestro. Tres vistas por hash: #inicio, #inmobiliaria, #despacho.
  Deep links de campaña (ManyChat): #checklist, #torre, #foraneo, #credito, #inversion.
  #inmobiliaria muestra un botón "Abrir" por entregable (lista `.hub`); cada deep
  link abre ese entregable solo, con "← Todas las herramientas" para volver.
- Enlaces cortos para CTAs: `checklist.html`, `torre.html`, `foraneo.html`,
  `credito.html`, `inversion.html` → se sirven como bolanosnavarro.com/torre, etc.
  Solo redirigen a /#torre (conservando ?utm) y traen título/descripción propios
  para la vista previa de WhatsApp. Si se agrega un entregable: tarjeta en `.hub`,
  entrada en `TOOLMAP` y su archivo corto.
- `testimonio.html` — formulario de testimonios (Grupo Navarro + despacho),
  envía por WhatsApp al 443 128 1399.

## Dónde editar cada cosa (dentro de index.html)
- **Testimonios**: array `TESTIMONIOS` en el <script> final.
  Formato: {t:'texto', n:'nombre', u:'inmo'|'desp', src:'google' (opcional), m:'materia' (opcional)}.
  Se pintan solos en Inicio (todos) y en Despacho (solo u:'desp').
- **Cifras de la banda**: buscar `1,000+` / `$500M+` en la sección .band.
- **Precios y parámetros de las corridas San Pedro**: constantes
  `PRECIO=1278250, TASA=0.105/12, NPER=240, CAPPCT=0.325, SEG=1.12` en el <script>.
- **Datos de Torre Paseo del Parque**: inputs por defecto `pdpPrecio` (3300000)
  y `pdpRenta` (15977), y las barras comparativas de $/m².
- **Números de WhatsApp**: `WA_GN='524434101638'` (campañas inmobiliarias)
  y `WA_RB='524431281399'` (despacho y general).

## Reglas
1. Todo cambio se hace por edición directa del HTML, se verifica la sintaxis
   del <script> y se hace commit + push a `main`. Eso ya lo publica.
2. Nunca borrar los disclaimers legales (.legal) ni la autorización del
   formulario de testimonios.
3. Los testimonios se publican textuales, con atribución (Reseña de Google
   o formulario) y solo con autorización del cliente.
4. Después de cada push, confirmar en https://bolanosnavarro.com que el
   cambio quedó en vivo.
