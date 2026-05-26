import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto'
import { pool, testConnection } from './db.js'
import { openApiSpec } from './openapi.js'
import { createReservationPdf } from './pdf.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173']
const dashboardRoles = ['super-admin', 'gerente']

function createReservationNumber() {
  return `RSV-${Date.now().toString().slice(-6)}`
}

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

async function requireDashboardUser(req, res) {
  const userId = req.get('x-user-id')

  if (!userId) {
    res.status(401).json({ message: 'Usuario requerido.' })
    return null
  }

  const result = await pool.query(
    `SELECT roles.code
    FROM users
    INNER JOIN roles ON roles.id = users.role_id
    WHERE users.id = $1
    LIMIT 1`,
    [userId]
  )

  if (result.rowCount === 0 || !dashboardRoles.includes(result.rows[0].code)) {
    res.status(403).json({ message: 'Solo gerentes y administradores pueden usar este modulo.' })
    return null
  }

  return { id: Number(userId), role: result.rows[0].code }
}

async function ensureRoomImagesTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS room_images (
      id SERIAL PRIMARY KEY,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      image_url TEXT,
      image_data BYTEA,
      mime_type VARCHAR(80),
      file_name VARCHAR(180),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  )
  await pool.query('ALTER TABLE room_images ADD COLUMN IF NOT EXISTS image_data BYTEA')
  await pool.query('ALTER TABLE room_images ADD COLUMN IF NOT EXISTS mime_type VARCHAR(80)')
  await pool.query('ALTER TABLE room_images ADD COLUMN IF NOT EXISTS file_name VARCHAR(180)')
  await pool.query('ALTER TABLE room_images ALTER COLUMN image_url DROP NOT NULL')
}

async function getRoomsWithImages() {
  await ensureRoomImagesTable()

  const roomsResult = await pool.query(
    `SELECT
      rooms.id,
      rooms.room_number,
      rooms.status,
      hotels.name AS hotel_name,
      hotels.location AS hotel_location,
      room_types.name AS room_type,
      room_types.description,
      room_types.capacity,
      room_types.price_per_night
    FROM rooms
    INNER JOIN hotels ON hotels.id = rooms.hotel_id
    INNER JOIN room_types ON room_types.id = rooms.room_type_id
    ORDER BY rooms.id DESC`
  )

  const imagesResult = await pool.query(
    'SELECT id, room_id, image_url, image_data FROM room_images ORDER BY id DESC'
  )
  const imagesByRoom = imagesResult.rows.reduce((groupedImages, image) => {
    groupedImages[image.room_id] = groupedImages[image.room_id] || []
    groupedImages[image.room_id].push(
      image.image_data ? `/api/room-images/${image.id}` : image.image_url
    )
    return groupedImages
  }, {})

  return roomsResult.rows.map((room) => ({
    ...room,
    images: imagesByRoom[room.id] || [],
  }))
}

async function getReservationTypesByName(name) {
  const result = await pool.query(
    'SELECT id, name FROM reservation_types WHERE LOWER(name) = LOWER($1) LIMIT 1',
    [name]
  )

  if (result.rowCount > 0) return result.rows[0]

  const fallback = await pool.query(
    'SELECT id, name FROM reservation_types ORDER BY id ASC LIMIT 1'
  )
  return fallback.rows[0]
}

async function ensureGuestUser({ guestId, guestName, reservationNumber }) {
  if (guestId) {
    const existingUser = await pool.query(
      'SELECT id, full_name FROM users WHERE id = $1 LIMIT 1',
      [guestId]
    )
    if (existingUser.rowCount > 0) return existingUser.rows[0]
  }

  const guestEmail = `${reservationNumber.toLowerCase()}@reservacion.local`
  const result = await pool.query(
    `INSERT INTO users (role_id, full_name, email, password_hash)
    VALUES (
      (SELECT id FROM roles WHERE code = 'huesped'),
      $1,
      $2,
      $3
    )
    RETURNING id, full_name`,
    [guestName, guestEmail, hashPassword(randomUUID())]
  )

  return result.rows[0]
}

function parseImageDataUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/)

  if (!match) {
    return null
  }

  const extensionByMime = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  }

  return {
    mimeType: match[1],
    extension: extensionByMime[match[1]],
    buffer: Buffer.from(match[2], 'base64'),
  }
}

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '10mb' }))
app.use(express.static('public'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

app.get('/openapi.json', (req, res) => {
  res.json(openApiSpec)
})

app.get('/', (req, res) => {
  res.json({
    ok: true,
    name: 'Hotel API',
    routes: {
      health: '/api/health',
      services: '/api/services',
      rooms: '/api/rooms',
      roomImage: '/api/room-images/:id',
      login: '/api/login',
      register: '/api/register',
      profile: '/api/profile/:id',
      reservations: '/api/reservations',
      reservationPdf: '/api/reservations/pdf',
      adminRooms: '/api/admin/rooms',
      swagger: '/api-docs',
      openapiJson: '/openapi.json',
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

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await getRoomsWithImages()
    res.json(rooms)
  } catch (error) {
    res.status(500).json({
      message: 'No se pudieron obtener las habitaciones.',
      detail: error.message,
    })
  }
})

app.get('/api/room-images/:id', async (req, res) => {
  try {
    await ensureRoomImagesTable()
    const result = await pool.query(
      'SELECT image_data, mime_type FROM room_images WHERE id = $1 LIMIT 1',
      [req.params.id]
    )

    if (result.rowCount === 0 || !result.rows[0].image_data) {
      res.status(404).json({ message: 'Imagen no encontrada.' })
      return
    }

    res.setHeader('Content-Type', result.rows[0].mime_type || 'application/octet-stream')
    res.setHeader('Cache-Control', 'public, max-age=31536000')
    res.send(result.rows[0].image_data)
  } catch (error) {
    res.status(500).json({
      message: 'No se pudo obtener la imagen.',
      detail: error.message,
    })
  }
})

app.post('/api/reservations/pdf', (req, res) => {
  const {
    guestName,
    reservationNumber,
    checkIn,
    checkOut,
    amountPaid,
    reservationType,
    hotelName,
    nights,
  } = req.body

  if (!guestName || !reservationNumber || !checkIn || !checkOut || !amountPaid || !reservationType || !hotelName) {
    res.status(400).json({ message: 'Faltan datos para generar el PDF.' })
    return
  }

  const pdf = createReservationPdf({
    guestName,
    reservationNumber,
    checkIn,
    checkOut,
    amountPaid,
    reservationType,
    hotelName,
    nights,
  })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="reservacion-${reservationNumber}.pdf"`)
  res.send(pdf)
})

app.get('/api/reservations', async (req, res) => {
  try {
    const dashboardUser = await requireDashboardUser(req, res)
    if (!dashboardUser) return

    const result = await pool.query(
      `SELECT
        reservations.id,
        reservations.reservation_number,
        users.full_name AS guest_name,
        hotels.name AS hotel_name,
        room_types.name AS room_type,
        reservations.check_in,
        reservations.check_out,
        reservations.status,
        reservations.total_amount,
        reservations.paid_amount
      FROM reservations
      INNER JOIN users ON users.id = reservations.guest_id
      INNER JOIN hotels ON hotels.id = reservations.hotel_id
      LEFT JOIN room_types ON room_types.id = reservations.room_type_id
      ORDER BY reservations.created_at DESC
      LIMIT 20`
    )

    res.json(result.rows)
  } catch (error) {
    res.status(500).json({
      message: 'No se pudieron obtener las reservaciones.',
      detail: error.message,
    })
  }
})

app.post('/api/reservations', async (req, res) => {
  const {
    guestId,
    guestName,
    roomId,
    checkIn,
    checkOut,
    guestsCount,
    reservationType,
    totalAmount,
    paidAmount,
  } = req.body

  if (!guestName || !roomId || !checkIn || !checkOut || !reservationType || !totalAmount) {
    res.status(400).json({ message: 'Faltan datos obligatorios de la reservacion.' })
    return
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const roomResult = await client.query(
      `SELECT
        rooms.id,
        rooms.hotel_id,
        rooms.room_type_id,
        hotels.name AS hotel_name,
        room_types.name AS room_type
      FROM rooms
      INNER JOIN hotels ON hotels.id = rooms.hotel_id
      INNER JOIN room_types ON room_types.id = rooms.room_type_id
      WHERE rooms.id = $1
      LIMIT 1`,
      [roomId]
    )

    if (roomResult.rowCount === 0) {
      await client.query('ROLLBACK')
      res.status(404).json({ message: 'Habitacion no encontrada.' })
      return
    }

    const reservationNumber = createReservationNumber()
    const guest = await ensureGuestUser({ guestId, guestName, reservationNumber })
    const reservationTypeRow = await getReservationTypesByName(reservationType)

    const reservationResult = await client.query(
      `INSERT INTO reservations (
        reservation_number,
        guest_id,
        hotel_id,
        room_type_id,
        reservation_type_id,
        check_in,
        check_out,
        guests_count,
        status,
        total_amount,
        paid_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmada', $9, $10)
      RETURNING id, reservation_number, check_in, check_out, status, total_amount, paid_amount`,
      [
        reservationNumber,
        guest.id,
        roomResult.rows[0].hotel_id,
        roomResult.rows[0].room_type_id,
        reservationTypeRow.id,
        checkIn,
        checkOut,
        Number(guestsCount || 1),
        Number(totalAmount),
        Number(paidAmount || totalAmount),
      ]
    )

    await client.query(
      `INSERT INTO payments (reservation_id, amount, payment_method, payment_status)
      VALUES ($1, $2, 'demo', 'paid')`,
      [reservationResult.rows[0].id, Number(paidAmount || totalAmount)]
    )

    await client.query('COMMIT')

    const reservation = reservationResult.rows[0]
    res.status(201).json({
      id: reservation.id,
      reservationNumber: reservation.reservation_number,
      guestName: guest.full_name,
      hotelName: roomResult.rows[0].hotel_name,
      roomType: roomResult.rows[0].room_type,
      checkIn: reservation.check_in,
      checkOut: reservation.check_out,
      amountPaid: reservation.paid_amount,
      totalAmount: reservation.total_amount,
      reservationType: reservationTypeRow.name,
      status: reservation.status,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    res.status(500).json({
      message: 'No se pudo crear la reservacion.',
      detail: error.message,
    })
  } finally {
    client.release()
  }
})

app.get('/api/admin/rooms', async (req, res) => {
  try {
    const dashboardUser = await requireDashboardUser(req, res)
    if (!dashboardUser) return

    const rooms = await getRoomsWithImages()
    res.json(rooms)
  } catch (error) {
    res.status(500).json({
      message: 'No se pudieron obtener las habitaciones.',
      detail: error.message,
    })
  }
})

app.post('/api/admin/rooms', async (req, res) => {
  const {
    hotelName,
    hotelLocation,
    roomTypeName,
    description,
    capacity,
    pricePerNight,
    roomNumber,
    status,
  } = req.body

  if (!hotelName || !hotelLocation || !roomTypeName || !description || !capacity || !pricePerNight || !roomNumber) {
    res.status(400).json({ message: 'Faltan datos obligatorios de la habitacion.' })
    return
  }

  const client = await pool.connect()

  try {
    const dashboardUser = await requireDashboardUser(req, res)
    if (!dashboardUser) return

    await client.query('BEGIN')

    let hotelResult = await client.query(
      'SELECT id FROM hotels WHERE LOWER(name) = LOWER($1) AND LOWER(location) = LOWER($2) LIMIT 1',
      [hotelName, hotelLocation]
    )

    if (hotelResult.rowCount === 0) {
      hotelResult = await client.query(
        'INSERT INTO hotels (name, location) VALUES ($1, $2) RETURNING id',
        [hotelName, hotelLocation]
      )
    }

    const hotelId = hotelResult.rows[0].id
    let roomTypeResult = await client.query(
      'SELECT id FROM room_types WHERE hotel_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1',
      [hotelId, roomTypeName]
    )

    if (roomTypeResult.rowCount === 0) {
      roomTypeResult = await client.query(
        `INSERT INTO room_types (hotel_id, name, description, capacity, price_per_night)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [hotelId, roomTypeName, description, Number(capacity), Number(pricePerNight)]
      )
    } else {
      await client.query(
        'UPDATE room_types SET description = $1, capacity = $2, price_per_night = $3 WHERE id = $4',
        [description, Number(capacity), Number(pricePerNight), roomTypeResult.rows[0].id]
      )
    }

    const roomResult = await client.query(
      `INSERT INTO rooms (hotel_id, room_type_id, room_number, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id`,
      [hotelId, roomTypeResult.rows[0].id, roomNumber, status || 'available']
    )

    await client.query('COMMIT')
    const rooms = await getRoomsWithImages()
    const room = rooms.find((candidate) => candidate.id === roomResult.rows[0].id)
    res.status(201).json(room)
  } catch (error) {
    await client.query('ROLLBACK')

    if (error.code === '23505') {
      res.status(409).json({ message: 'Ya existe una habitacion con ese numero en el hotel.' })
      return
    }

    res.status(500).json({
      message: 'No se pudo crear la habitacion.',
      detail: error.message,
    })
  } finally {
    client.release()
  }
})

app.put('/api/admin/rooms/:id', async (req, res) => {
  const {
    hotelName,
    hotelLocation,
    roomTypeName,
    description,
    capacity,
    pricePerNight,
    roomNumber,
    status,
  } = req.body

  if (!hotelName || !hotelLocation || !roomTypeName || !description || !capacity || !pricePerNight || !roomNumber) {
    res.status(400).json({ message: 'Faltan datos obligatorios de la habitacion.' })
    return
  }

  const client = await pool.connect()

  try {
    const dashboardUser = await requireDashboardUser(req, res)
    if (!dashboardUser) return

    await client.query('BEGIN')

    let hotelResult = await client.query(
      'SELECT id FROM hotels WHERE LOWER(name) = LOWER($1) AND LOWER(location) = LOWER($2) LIMIT 1',
      [hotelName, hotelLocation]
    )

    if (hotelResult.rowCount === 0) {
      hotelResult = await client.query(
        'INSERT INTO hotels (name, location) VALUES ($1, $2) RETURNING id',
        [hotelName, hotelLocation]
      )
    }

    const hotelId = hotelResult.rows[0].id
    let roomTypeResult = await client.query(
      'SELECT id FROM room_types WHERE hotel_id = $1 AND LOWER(name) = LOWER($2) LIMIT 1',
      [hotelId, roomTypeName]
    )

    if (roomTypeResult.rowCount === 0) {
      roomTypeResult = await client.query(
        `INSERT INTO room_types (hotel_id, name, description, capacity, price_per_night)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [hotelId, roomTypeName, description, Number(capacity), Number(pricePerNight)]
      )
    } else {
      await client.query(
        'UPDATE room_types SET description = $1, capacity = $2, price_per_night = $3 WHERE id = $4',
        [description, Number(capacity), Number(pricePerNight), roomTypeResult.rows[0].id]
      )
    }

    const roomResult = await client.query(
      `UPDATE rooms
      SET hotel_id = $1,
        room_type_id = $2,
        room_number = $3,
        status = $4
      WHERE id = $5
      RETURNING id`,
      [hotelId, roomTypeResult.rows[0].id, roomNumber, status || 'available', req.params.id]
    )

    if (roomResult.rowCount === 0) {
      await client.query('ROLLBACK')
      res.status(404).json({ message: 'Habitacion no encontrada.' })
      return
    }

    await client.query('COMMIT')
    const rooms = await getRoomsWithImages()
    const room = rooms.find((candidate) => candidate.id === Number(req.params.id))
    res.json(room)
  } catch (error) {
    await client.query('ROLLBACK')

    if (error.code === '23505') {
      res.status(409).json({ message: 'Ya existe una habitacion con ese numero en el hotel.' })
      return
    }

    res.status(500).json({
      message: 'No se pudo editar la habitacion.',
      detail: error.message,
    })
  } finally {
    client.release()
  }
})

app.delete('/api/admin/rooms/:id', async (req, res) => {
  try {
    const dashboardUser = await requireDashboardUser(req, res)
    if (!dashboardUser) return

    const result = await pool.query(
      'DELETE FROM rooms WHERE id = $1 RETURNING id',
      [req.params.id]
    )

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Habitacion no encontrada.' })
      return
    }

    res.json({ ok: true, id: Number(req.params.id) })
  } catch (error) {
    if (error.code === '23503') {
      res.status(409).json({
        message: 'No se puede eliminar una habitacion con reservaciones asociadas.',
      })
      return
    }

    res.status(500).json({
      message: 'No se pudo eliminar la habitacion.',
      detail: error.message,
    })
  }
})

app.post('/api/admin/rooms/:id/images', async (req, res) => {
  const { dataUrl, fileName } = req.body

  try {
    const dashboardUser = await requireDashboardUser(req, res)
    if (!dashboardUser) return

    const parsedImage = parseImageDataUrl(dataUrl)
    if (!parsedImage) {
      res.status(400).json({ message: 'La captura debe ser PNG, JPG o WEBP.' })
      return
    }

    if (parsedImage.buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ message: 'La captura no debe superar 5 MB.' })
      return
    }

    await ensureRoomImagesTable()
    const safeFileName = fileName || `${req.params.id}-${randomUUID()}.${parsedImage.extension}`
    const result = await pool.query(
      `INSERT INTO room_images (room_id, image_data, mime_type, file_name)
      VALUES ($1, $2, $3, $4)
      RETURNING id`,
      [req.params.id, parsedImage.buffer, parsedImage.mimeType, safeFileName]
    )
    const imageUrl = `/api/room-images/${result.rows[0].id}`

    res.status(201).json({ imageUrl })
  } catch (error) {
    res.status(500).json({
      message: 'No se pudo subir la captura.',
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
