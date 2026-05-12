import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { pool, testConnection } from './db.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173']
const dashboardRoles = ['super-admin', 'gerente']

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

function verifyPassword(password, storedHash) {
  if (!storedHash) return false
  if (!storedHash.startsWith('scrypt$')) return password === storedHash

  const [, salt, hash] = storedHash.split('$')
  const testHash = scryptSync(password, salt, 64)
  const storedBuffer = Buffer.from(hash, 'hex')

  return storedBuffer.length === testHash.length && timingSafeEqual(storedBuffer, testHash)
}

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.json({
    ok: true,
    name: 'Hotel API',
    routes: {
      health: '/api/health',
      services: '/api/services',
      login: '/api/login',
      register: '/api/register',
      profile: '/api/profile/:id',
      servicesPage: '/servicios.html',
      dashboardPage: '/dashboard.html',
    },
  })
})

app.get('/api/health', async (req, res) => {
  try {
    const database = await testConnection()
    res.json({
      ok: true,
      database,
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'No se pudo conectar a PostgreSQL.',
      detail: error.message,
    })
  }
})

app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, summary, price FROM services WHERE is_active = true ORDER BY name'
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({
      message: 'No se pudieron obtener los servicios.',
      detail: error.message,
    })
  }
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ message: 'Correo y contrasena son obligatorios.' })
    return
  }

  try {
    const result = await pool.query(
      `SELECT
        users.id,
        users.full_name,
        users.email,
        users.phone,
        users.password_hash,
        roles.code AS role_id,
        roles.name AS role_name
      FROM users
      INNER JOIN roles ON roles.id = users.role_id
      WHERE users.email = $1
      LIMIT 1`,
      [email]
    )

    if (result.rowCount === 0) {
      res.status(401).json({ message: 'Usuario no encontrado.' })
      return
    }

    const user = result.rows[0]
    if (!verifyPassword(password, user.password_hash)) {
      res.status(401).json({ message: 'Contrasena incorrecta.' })
      return
    }

    delete user.password_hash
    res.json({
      ...user,
      can_access_dashboard: dashboardRoles.includes(user.role_id),
    })
  } catch (error) {
    res.status(500).json({
      message: 'No se pudo iniciar sesion.',
      detail: error.message,
    })
  }
})

app.post('/api/register', async (req, res) => {
  const { fullName, email, password, phone } = req.body

  if (!fullName || !email || !password) {
    res.status(400).json({ message: 'Nombre, correo y contrasena son obligatorios.' })
    return
  }

  if (password.length < 6) {
    res.status(400).json({ message: 'La contrasena debe tener al menos 6 caracteres.' })
    return
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (role_id, full_name, email, password_hash, phone)
      VALUES (
        (SELECT id FROM roles WHERE code = 'huesped'),
        $1,
        LOWER($2),
        $3,
        $4
      )
      RETURNING
        id,
        full_name,
        email,
        phone,
        'huesped' AS role_id,
        'Huesped' AS role_name`,
      [fullName, email, hashPassword(password), phone || null]
    )

    res.status(201).json({
      ...result.rows[0],
      can_access_dashboard: false,
    })
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ message: 'Ese correo ya esta registrado.' })
      return
    }

    res.status(500).json({
      message: 'No se pudo registrar el usuario.',
      detail: error.message,
    })
  }
})

app.get('/api/profile/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        users.id,
        users.full_name,
        users.email,
        users.phone,
        roles.code AS role_id,
        roles.name AS role_name
      FROM users
      INNER JOIN roles ON roles.id = users.role_id
      WHERE users.id = $1
      LIMIT 1`,
      [req.params.id]
    )

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Perfil no encontrado.' })
      return
    }

    const user = result.rows[0]
    res.json({
      ...user,
      can_access_dashboard: dashboardRoles.includes(user.role_id),
    })
  } catch (error) {
    res.status(500).json({
      message: 'No se pudo obtener el perfil.',
      detail: error.message,
    })
  }
})

app.listen(port, () => {
  console.log(`API corriendo en http://localhost:${port}`)
})
