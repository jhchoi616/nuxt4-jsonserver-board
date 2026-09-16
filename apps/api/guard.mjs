import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import http from 'node:http'

const PUBLIC_PORT = process.env.PORT ?? 4100
const INTERNAL_PORT = 4101
const ALLOWED_ORIGIN = process.env.WEB_ORIGIN ?? 'http://localhost:3500'
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const jsonServer = spawn(process.execPath, ['node_modules/json-server/lib/bin.js', 'db.json', '--port', String(INTERNAL_PORT)], {
  stdio: 'inherit',
})
process.on('exit', () => jsonServer.kill())

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function loadCollection(name) {
  try {
    const data = JSON.parse(readFileSync('db.json', 'utf-8'))
    return Array.isArray(data[name]) ? data[name] : []
  } catch {
    return []
  }
}

function forward(req, res, body) {
  return new Promise((resolve, reject) => {
    const headers = { ...req.headers }
    if (body) headers['content-length'] = Buffer.byteLength(body)
    const upstream = http.request(
      { host: 'localhost', port: INTERNAL_PORT, path: req.url, method: req.method, headers },
      (upstreamRes) => {
        res.writeHead(upstreamRes.statusCode, upstreamRes.headers)
        upstreamRes.pipe(res)
        upstreamRes.on('end', resolve)
        upstreamRes.on('error', reject)
      },
    )
    upstream.on('error', reject)
    if (body) upstream.end(body)
    else req.pipe(upstream)
  })
}

// ponytail: single in-process queue, not a cross-process lock — fine for one guard.mjs instance,
// would need a real lock (or move the check into json-server itself) if this ever runs scaled out.
let queue = Promise.resolve()
function serialized(task) {
  const run = queue.then(task, task)
  queue = run.then(
    () => {},
    () => {},
  )
  return run
}

const proxy = http.createServer(async (req, res) => {
  if (WRITE_METHODS.has(req.method) && req.headers.origin !== ALLOWED_ORIGIN) {
    res.writeHead(403, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'blocked: write requests must come from the web app' }))
    return
  }

  // Create requests (POST /:name): enforce unique id instead of trusting the client or json-server's own random id.
  if (req.method === 'POST') {
    await serialized(async () => {
      const collection = req.url.split('?')[0].split('/').filter(Boolean)[0]
      const rawBody = await readBody(req)
      let body
      try {
        body = rawBody.length ? JSON.parse(rawBody.toString('utf-8')) : {}
      } catch {
        body = null
      }
      if (body && typeof body === 'object') {
        const hasId = body.id !== undefined && body.id !== null && body.id !== ''
        if (hasId) {
          const duplicate = loadCollection(collection).some((item) => String(item.id) === String(body.id))
          if (duplicate) {
            res.writeHead(409, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: `id "${body.id}" already exists in "${collection}"` }))
            return
          }
        } else {
          body.id = randomUUID()
        }
        await forward(req, res, Buffer.from(JSON.stringify(body)))
        return
      }
      await forward(req, res, rawBody)
    })
    return
  }

  forward(req, res)
})

proxy.listen(PUBLIC_PORT, () => {
  console.log(`guard listening on :${PUBLIC_PORT} -> json-server :${INTERNAL_PORT} (allowed origin: ${ALLOWED_ORIGIN})`)
})
