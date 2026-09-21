// Worker de bolanosnavarro.com
// Sirve los archivos estáticos (env.ASSETS) y agrega una API mínima para testimonios:
//   POST /api/testimonios            el formulario guarda un testimonio como "pendiente"
//   GET  /api/testimonios            testimonios aprobados, ya listos para mostrar en el sitio
//   GET  /api/admin/testimonios      todos, para la página privada /admin (requiere X-Admin-Key)
//   POST /api/admin/testimonios/:id  cambia estado (aprobado | rechazado | pendiente), unidad o materia

const ESTADOS = ['pendiente', 'aprobado', 'rechazado'];
const UNIDADES = ['inmo', 'desp'];
const PUBLICA = ['nombre', 'pila', 'iniciales'];

const SCHEMA = `CREATE TABLE IF NOT EXISTS testimonios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creado TEXT NOT NULL DEFAULT (datetime('now')),
  unidad TEXT NOT NULL,
  nombre TEXT NOT NULL,
  publica TEXT NOT NULL,
  materia TEXT NOT NULL DEFAULT '',
  texto TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  revisado TEXT
)`;

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(req);
    try {
      await env.DB.prepare(SCHEMA).run();
      return await api(req, env, url);
    } catch (e) {
      console.error(e);
      return json({ error: 'Error del servidor' }, 500);
    }
  },
};

async function api(req, env, url) {
  const p = url.pathname.replace(/\/+$/, '');

  if (p === '/api/testimonios' && req.method === 'POST') return crear(req, env);
  if (p === '/api/testimonios' && req.method === 'GET') return publicados(env);

  if (p.startsWith('/api/admin/')) {
    if (!env.ADMIN_KEY) return json({ error: 'Falta configurar ADMIN_KEY' }, 503);
    if (!(await mismaClave(req.headers.get('X-Admin-Key') || '', env.ADMIN_KEY))) {
      return json({ error: 'Clave incorrecta' }, 401);
    }
    if (p === '/api/admin/testimonios' && req.method === 'GET') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM testimonios ORDER BY CASE estado WHEN \'pendiente\' THEN 0 ELSE 1 END, id DESC'
      ).all();
      return json(results);
    }
    const m = p.match(/^\/api\/admin\/testimonios\/(\d+)$/);
    if (m && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      // Cambios permitidos: estado (aprobar/rechazar) y reclasificación (unidad, materia).
      const sets = [], vals = [];
      if (body.estado !== undefined) {
        if (!ESTADOS.includes(body.estado)) return json({ error: 'Estado inválido' }, 400);
        sets.push("estado = ?", "revisado = datetime('now')"); vals.push(body.estado);
      }
      if (body.unidad !== undefined) {
        if (!UNIDADES.includes(body.unidad)) return json({ error: 'Unidad inválida' }, 400);
        sets.push('unidad = ?'); vals.push(body.unidad);
      }
      if (body.materia !== undefined) { sets.push('materia = ?'); vals.push(limpiar(body.materia, 120)); }
      if (!sets.length) return json({ error: 'Nada que cambiar' }, 400);
      const r = await env.DB.prepare(
        `UPDATE testimonios SET ${sets.join(', ')} WHERE id = ?`
      ).bind(...vals, Number(m[1])).run();
      if (!r.meta.changes) return json({ error: 'No existe' }, 404);
      return json({ ok: true });
    }
  }
  return json({ error: 'No encontrado' }, 404);
}

async function crear(req, env) {
  const b = await req.json().catch(() => null);
  if (!b) return json({ error: 'Solicitud inválida' }, 400);
  // Campo trampa: los humanos no lo ven; si viene lleno es un bot. Respondemos ok sin guardar.
  if (b.sitio) return json({ ok: true });

  const nombre = limpiar(b.nombre, 80);
  const texto = limpiar(b.texto, 2000);
  const materia = limpiar(b.materia, 120);
  if (!UNIDADES.includes(b.unidad) || !PUBLICA.includes(b.publica)) return json({ error: 'Datos inválidos' }, 400);
  if (!nombre || texto.length < 20) return json({ error: 'Completa tu nombre y tu testimonio' }, 400);
  if (b.consent !== true) return json({ error: 'Falta la autorización' }, 400);

  await env.DB.prepare(
    'INSERT INTO testimonios (unidad, nombre, publica, materia, texto) VALUES (?, ?, ?, ?, ?)'
  ).bind(b.unidad, nombre, b.publica, materia, texto).run();
  return json({ ok: true }, 201);
}

async function publicados(env) {
  const { results } = await env.DB.prepare(
    "SELECT unidad, nombre, publica, materia, texto FROM testimonios WHERE estado = 'aprobado' ORDER BY revisado DESC, id DESC LIMIT 60"
  ).all();
  // Solo sale la forma de nombre que el cliente autorizó; el nombre completo no se expone si no lo eligió.
  const lista = results.map((r) => ({
    t: r.texto,
    n: nombrePublico(r.nombre, r.publica),
    u: r.unidad,
    m: r.materia.replace(/\s*\(.*\)\s*$/, ''),
    src: 'form',
  }));
  return json(lista, 200, { 'Cache-Control': 'public, max-age=60' });
}

function nombrePublico(nombre, publica) {
  const partes = nombre.split(/\s+/).filter(Boolean);
  if (publica === 'pila') return partes[0];
  if (publica === 'iniciales') return partes.map((x) => x[0].toUpperCase() + '.').join(' ');
  return nombre;
}

function limpiar(v, max) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);
}

async function mismaClave(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  return crypto.subtle.timingSafeEqual(ha, hb);
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}
