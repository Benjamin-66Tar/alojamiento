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

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar la solicitud.')
  }

  return data
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
