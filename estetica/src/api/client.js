const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function normalizeUser(user) {
  return {
    id: user.id,
    name: user.full_name || user.name,
    email: user.email,
    phone: user.phone || '',
    roleId: user.role_id || user.roleId,
    roleName: user.role_name || user.roleName,
    canAccessDashboard: Boolean(user.can_access_dashboard),
  }
}

function normalizeRoom(room) {
  return {
    id: room.id,
    roomId: room.id,
    name: `${room.hotel_name} - Habitacion ${room.room_number}`,
    location: room.hotel_location,
    rating: 4.8,
    reviews: 0,
    price: Number(room.price_per_night),
    originalPrice: null,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    amenities: [room.room_type, `${room.capacity} huespedes`, room.status],
    featured: room.status === 'available',
    roomNumber: room.room_number,
    roomType: room.room_type,
    capacity: room.capacity,
    status: room.status,
    images: room.images || [],
  }
}

async function request(path, options = {}) {
  const { headers = {}, ...requestOptions } = options
  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar la solicitud.')
  }

  return data
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function loginUser(credentials) {
  const user = await request('/api/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  return normalizeUser(user)
}

export async function registerUser(payload) {
  const user = await request('/api/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return normalizeUser(user)
}

export async function getUserProfile(userId) {
  const user = await request(`/api/profile/${userId}`)
  return normalizeUser(user)
}

export async function getPublicRooms() {
  const rooms = await request('/api/rooms')
  return rooms.map(normalizeRoom)
}

export async function createReservation(payload) {
  return request('/api/reservations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getReservations(userId) {
  return request('/api/reservations', {
    headers: { 'x-user-id': String(userId) },
  })
}

export async function downloadReservationPdf(payload) {
  const response = await fetch(`${API_URL}/api/reservations/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message || 'No se pudo generar el PDF.')
  }

  const blob = await response.blob()
  downloadBlob(blob, `reservacion-${payload.reservationNumber}.pdf`)
}

export async function getAdminRooms(userId) {
  return request('/api/admin/rooms', {
    headers: { 'x-user-id': String(userId) },
  })
}

export async function createAdminRoom(userId, payload) {
  return request('/api/admin/rooms', {
    method: 'POST',
    headers: { 'x-user-id': String(userId) },
    body: JSON.stringify(payload),
  })
}

export async function updateAdminRoom(userId, roomId, payload) {
  return request(`/api/admin/rooms/${roomId}`, {
    method: 'PUT',
    headers: { 'x-user-id': String(userId) },
    body: JSON.stringify(payload),
  })
}

export async function deleteAdminRoom(userId, roomId) {
  return request(`/api/admin/rooms/${roomId}`, {
    method: 'DELETE',
    headers: { 'x-user-id': String(userId) },
  })
}

export async function uploadRoomImage(userId, roomId, dataUrl, fileName) {
  return request(`/api/admin/rooms/${roomId}/images`, {
    method: 'POST',
    headers: { 'x-user-id': String(userId) },
    body: JSON.stringify({ dataUrl, fileName }),
  })
}
