export const demoUsers = [
  {
    id: 'usr-001',
    name: 'Laura Administradora',
    email: 'admin@hotel.com',
    password: 'admin123',
    roleId: 'super-admin',
    roleName: 'Super Admin',
  },
  {
    id: 'usr-002',
    name: 'Marco Gerente',
    email: 'gerente@hotel.com',
    password: 'gerente123',
    roleId: 'gerente',
    roleName: 'Gerente',
  },
  {
    id: 'usr-003',
    name: 'Sofia Recepcion',
    email: 'recepcion@hotel.com',
    password: 'recepcion123',
    roleId: 'recepcionista',
    roleName: 'Recepcionista',
  },
  {
    id: 'usr-004',
    name: 'Elena Huesped',
    email: 'huesped@hotel.com',
    password: 'huesped123',
    roleId: 'huesped',
    roleName: 'Huesped',
  },
]

function publicUser(user) {
  const safeUser = { ...user }
  delete safeUser.password
  return safeUser
}

export function authenticateUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase()
  const user = demoUsers.find(
    (candidate) =>
      candidate.email.toLowerCase() === normalizedEmail &&
      candidate.password === password
  )

  return user ? publicUser(user) : null
}
