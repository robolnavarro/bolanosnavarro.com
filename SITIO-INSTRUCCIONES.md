# Sitio bolanosnavarro.com — instrucciones para Claude Code

Este repositorio es el sitio en vivo de bolanosnavarro.com, publicado con
Cloudflare Pages conectado a este repo: cada push a `main` se publica solo
en ~1 minuto. No hay proceso de build: son archivos HTML estáticos.

## Archivos
- `index.html` — sitio maestro. Tres vistas por hash: #inicio, #inmobiliaria, #despacho.
  Deep links de campaña (ManyChat): #checklist, #torre, #foraneo, #credito, #inversion.
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
