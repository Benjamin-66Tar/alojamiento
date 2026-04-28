import { useState } from 'react'
import './Dashboard.css'
import DashboardHeader from './DashboardHeader'
import StatsCards from './StatsCards'
import RevenueChart from './RevenueChart'
import RecentBookings from './RecentBookings'
import HotelPerformance from './HotelPerformance'

const roles = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    group: 'Administrativo',
    description: 'Control total de hoteles, usuarios, finanzas y configuracion.',
    permissions: ['Usuarios', 'Hoteles', 'Finanzas', 'Auditoria', 'Configuracion'],
  },
  {
    id: 'gerente',
    name: 'Gerente',
    group: 'Administrativo',
    description: 'Gestion comercial y operativa de propiedades asignadas.',
    permissions: ['Reservas', 'Tarifas', 'Reportes', 'Equipo', 'Ocupacion'],
  },
  {
    id: 'recepcionista',
    name: 'Recepcionista',
    group: 'Operativo',
    description: 'Check-in, check-out, cobros, disponibilidad y atencion directa.',
    permissions: ['Check-in', 'Check-out', 'Reservas', 'Pagos'],
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    group: 'Operativo',
    description: 'Estado de habitaciones, limpieza, prioridades y consumibles.',
    permissions: ['Limpieza', 'Habitaciones', 'Inventario', 'Incidencias'],
  },
  {
    id: 'mantenimiento',
    name: 'Mantenimiento',
    group: 'Operativo',
    description: 'Ordenes de trabajo, reparaciones, inspecciones y SLA.',
    permissions: ['Ordenes', 'Reparaciones', 'Inspecciones', 'SLA'],
  },
  {
    id: 'huesped',
    name: 'Huesped',
    group: 'Portal cliente',
    description: 'Reservas personales, pagos, solicitudes y preferencias.',
    permissions: ['Mis reservas', 'Pagos', 'Solicitudes', 'Perfil'],
  },
]

const roleContent = {
  'super-admin': {
    headline: 'Vista global del negocio',
    summary: 'Supervisa propiedades, ingresos, usuarios activos y riesgos operativos desde un solo lugar.',
    actions: ['Crear usuario', 'Agregar hotel', 'Revisar auditoria', 'Configurar permisos'],
    modules: [
      { title: 'Gestion de usuarios', detail: '84 usuarios activos, 6 roles y 12 invitaciones pendientes.' },
      { title: 'Finanzas globales', detail: '$287,640 acumulado anual con margen operativo del 34%.' },
      { title: 'Auditoria', detail: '3 cambios criticos requieren revision antes del cierre diario.' },
    ],
  },
  gerente: {
    headline: 'Control de propiedad',
    summary: 'Prioriza ocupacion, tarifas, reservas del dia y rendimiento del equipo.',
    actions: ['Ajustar tarifas', 'Asignar turno', 'Exportar reporte', 'Revisar ocupacion'],
    modules: [
      { title: 'Ocupacion', detail: '85% mensual, con alta demanda para el proximo fin de semana.' },
      { title: 'Equipo', detail: 'Recepcion cubierta; housekeeping requiere 2 habitaciones prioritarias.' },
      { title: 'Tarifas', detail: '3 habitaciones premium pueden subir precio por demanda.' },
    ],
  },
  recepcionista: {
    headline: 'Operacion de recepcion',
    summary: 'Gestiona llegadas, salidas, pagos pendientes y disponibilidad inmediata.',
    actions: ['Registrar check-in', 'Procesar pago', 'Asignar habitacion', 'Crear reserva'],
    modules: [
      { title: 'Llegadas de hoy', detail: '18 check-ins esperados; 4 VIP y 2 solicitudes especiales.' },
      { title: 'Salidas', detail: '12 check-outs programados antes de las 12:00.' },
      { title: 'Pagos pendientes', detail: '$1,240 por confirmar en mostrador.' },
    ],
  },
  housekeeping: {
    headline: 'Estado de habitaciones',
    summary: 'Coordina limpieza, habitaciones bloqueadas, prioridades y reportes de insumos.',
    actions: ['Marcar limpia', 'Reportar incidencia', 'Solicitar insumos', 'Ver prioridades'],
    modules: [
      { title: 'Pendientes', detail: '24 habitaciones por limpiar, 8 con prioridad alta.' },
      { title: 'Listas para venta', detail: '36 habitaciones limpias y verificadas.' },
      { title: 'Insumos', detail: 'Toallas y amenidades en nivel de reposicion.' },
    ],
  },
  mantenimiento: {
    headline: 'Ordenes de mantenimiento',
    summary: 'Da seguimiento a reparaciones, tiempos de respuesta y habitaciones fuera de servicio.',
    actions: ['Abrir orden', 'Cerrar reparacion', 'Agendar inspeccion', 'Escalar urgencia'],
    modules: [
      { title: 'Ordenes abiertas', detail: '9 activas; 2 urgentes por aire acondicionado.' },
      { title: 'Fuera de servicio', detail: '3 habitaciones bloqueadas temporalmente.' },
      { title: 'SLA', detail: 'Tiempo promedio de respuesta: 42 minutos.' },
    ],
  },
  huesped: {
    headline: 'Portal personal',
    summary: 'Consulta tu reserva, pagos, servicios contratados y solicitudes durante la estancia.',
    actions: ['Ver reserva', 'Pagar saldo', 'Solicitar servicio', 'Actualizar perfil'],
    modules: [
      { title: 'Proxima estancia', detail: 'Grand Plaza Hotel, 10 May - 13 May, habitacion Deluxe.' },
      { title: 'Servicios', detail: 'Desayuno incluido y spa reservado para el segundo dia.' },
      { title: 'Solicitudes', detail: 'Almohada extra confirmada; transporte pendiente de respuesta.' },
    ],
  },
}

export default function Dashboard({ onNavigateToHome }) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedRoleId, setSelectedRoleId] = useState('super-admin')
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0]
  const content = roleContent[selectedRole.id]
  const isGuest = selectedRole.id === 'huesped'
  const isOperational = selectedRole.group === 'Operativo'

  return (
    <div className="dashboard">
      <DashboardHeader onNavigateToHome={onNavigateToHome} roleName={selectedRole.name} />

      <div className="dashboard-content">
        <div className="dashboard-header-section">
          <div>
            <p className="dashboard-eyebrow">{selectedRole.group}</p>
            <h1>{content.headline}</h1>
            <p className="dashboard-summary">{content.summary}</p>
          </div>
          <div className="period-selector" aria-label="Seleccionar periodo">
            <button
              type="button"
              className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('week')}
            >
              Esta semana
            </button>
            <button
              type="button"
              className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('month')}
            >
              Este mes
            </button>
            <button
              type="button"
              className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('year')}
            >
              Este año
            </button>
          </div>
        </div>

        <section className="role-switcher" aria-label="Seleccionar rol">
          {roles.map((role) => (
            <button
              type="button"
              key={role.id}
              className={`role-card ${selectedRole.id === role.id ? 'active' : ''}`}
              onClick={() => setSelectedRoleId(role.id)}
            >
              <span className="role-group">{role.group}</span>
              <strong>{role.name}</strong>
              <span>{role.description}</span>
            </button>
          ))}
        </section>

        <section className="access-panel">
          <div className="access-card">
            <h2>Accesos de {selectedRole.name}</h2>
            <div className="permission-list">
              {selectedRole.permissions.map((permission) => (
                <span key={permission} className="permission-chip">{permission}</span>
              ))}
            </div>
          </div>

          <div className="access-card">
            <h2>Acciones rapidas</h2>
            <div className="quick-actions">
              {content.actions.map((action) => (
                <button type="button" key={action} className="quick-action">{action}</button>
              ))}
            </div>
          </div>
        </section>

        {!isGuest && <StatsCards period={selectedPeriod} />}

        <section className="module-grid">
          {content.modules.map((module) => (
            <article key={module.title} className="module-card">
              <h3>{module.title}</h3>
              <p>{module.detail}</p>
            </article>
          ))}
        </section>

        {!isGuest && !isOperational && (
          <div className="dashboard-grid">
            <div className="grid-col-2">
              <RevenueChart period={selectedPeriod} />
            </div>
            <div className="grid-col-1">
              <HotelPerformance />
            </div>
          </div>
        )}

        {!isGuest && (
          <div className="dashboard-grid">
            <div className="grid-col-1">
              <RecentBookings />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
