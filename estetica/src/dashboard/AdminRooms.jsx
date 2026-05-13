import { useEffect, useState } from 'react'
import './AdminRooms.css'
import {
  createAdminRoom,
  deleteAdminRoom,
  getAdminRooms,
  updateAdminRoom,
  uploadRoomImage,
} from '../api/client'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const initialForm = {
  hotelName: 'Hotel',
  hotelLocation: 'Ciudad principal',
  roomTypeName: 'Deluxe',
  capacity: '2',
  pricePerNight: '120',
  roomNumber: '',
  status: 'available',
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function AdminRooms({ currentUser }) {
  const [rooms, setRooms] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingRoomId, setEditingRoomId] = useState(null)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  const loadRooms = async () => {
    try {
      setStatus('loading')
      const data = await getAdminRooms(currentUser.id)
      setRooms(data)
      setStatus('ready')
    } catch (error) {
      setMessage(error.message)
      setStatus('error')
    }
  }

  useEffect(() => {
    let active = true

    getAdminRooms(currentUser.id)
      .then((data) => {
        if (!active) return
        setRooms(data)
        setStatus('ready')
      })
      .catch((error) => {
        if (!active) return
        setMessage(error.message)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [currentUser.id])

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }))
  }

  const handleSubmitRoom = async (event) => {
    event.preventDefault()
    setMessage(editingRoomId ? 'Guardando cambios...' : 'Creando habitacion...')

    try {
      if (editingRoomId) {
        const room = await updateAdminRoom(currentUser.id, editingRoomId, form)
        setRooms((currentRooms) =>
          currentRooms.map((currentRoom) => currentRoom.id === editingRoomId ? room : currentRoom)
        )
        setEditingRoomId(null)
        setForm(initialForm)
        setMessage('Habitacion actualizada.')
        return
      }

      const room = await createAdminRoom(currentUser.id, form)
      setRooms((currentRooms) => [room, ...currentRooms])
      setForm((currentForm) => ({ ...currentForm, roomNumber: '' }))
      setMessage('Habitacion creada.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handleEditRoom = (room) => {
    setEditingRoomId(room.id)
    setForm({
      hotelName: room.hotel_name,
      hotelLocation: room.hotel_location,
      roomTypeName: room.room_type,
      capacity: String(room.capacity),
      pricePerNight: String(room.price_per_night),
      roomNumber: room.room_number,
      status: room.status,
    })
    setMessage(`Editando habitacion ${room.room_number}.`)
  }

  const handleCancelEdit = () => {
    setEditingRoomId(null)
    setForm(initialForm)
    setMessage('')
  }

  const handleDeleteRoom = async (roomId) => {
    setMessage('Eliminando habitacion...')

    try {
      await deleteAdminRoom(currentUser.id, roomId)
      setRooms((currentRooms) => currentRooms.filter((room) => room.id !== roomId))
      if (editingRoomId === roomId) handleCancelEdit()
      setMessage('Habitacion eliminada.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const handleUploadImage = async (roomId, file) => {
    if (!file) return

    setMessage('Subiendo captura...')
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const result = await uploadRoomImage(currentUser.id, roomId, dataUrl, file.name)
      setRooms((currentRooms) =>
        currentRooms.map((room) =>
          room.id === roomId
            ? { ...room, images: [result.imageUrl, ...(room.images || [])] }
            : room
        )
      )
      setMessage('Captura subida.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section className="admin-rooms">
      <div className="admin-rooms-header">
        <div>
          <p className="dashboard-eyebrow">Modulo administrador</p>
          <h2>Habitaciones</h2>
          <p>Agrega habitaciones y sube capturas para mostrarlas en el sistema.</p>
        </div>
        <button type="button" onClick={loadRooms}>Actualizar</button>
      </div>

      <form className="room-form" onSubmit={handleSubmitRoom}>
        <label>
          Hotel
          <input
            type="text"
            value={form.hotelName}
            onChange={(event) => updateField('hotelName', event.target.value)}
            required
          />
        </label>
        <label>
          Ubicacion
          <input
            type="text"
            value={form.hotelLocation}
            onChange={(event) => updateField('hotelLocation', event.target.value)}
            required
          />
        </label>
        <label>
          Tipo
          <input
            type="text"
            value={form.roomTypeName}
            onChange={(event) => updateField('roomTypeName', event.target.value)}
            required
          />
        </label>
        <label>
          Capacidad
          <input
            type="number"
            min="1"
            value={form.capacity}
            onChange={(event) => updateField('capacity', event.target.value)}
            required
          />
        </label>
        <label>
          Precio por noche
          <input
            type="number"
            min="1"
            step="0.01"
            value={form.pricePerNight}
            onChange={(event) => updateField('pricePerNight', event.target.value)}
            required
          />
        </label>
        <label>
          Numero
          <input
            type="text"
            value={form.roomNumber}
            onChange={(event) => updateField('roomNumber', event.target.value)}
            required
          />
        </label>
        <label>
          Estado
          <select
            value={form.status}
            onChange={(event) => updateField('status', event.target.value)}
          >
            <option value="available">Disponible</option>
            <option value="occupied">Ocupada</option>
            <option value="maintenance">Mantenimiento</option>
          </select>
        </label>
        <button type="submit">{editingRoomId ? 'Guardar cambios' : 'Agregar habitacion'}</button>
        {editingRoomId && (
          <button type="button" className="secondary-action" onClick={handleCancelEdit}>
            Cancelar
          </button>
        )}
      </form>

      {message && <p className="admin-room-message">{message}</p>}

      {status === 'loading' && <div className="rooms-state">Cargando habitaciones...</div>}
      {status === 'error' && <div className="rooms-state error">No se pudieron cargar las habitaciones.</div>}

      <div className="rooms-list">
        {rooms.map((room) => (
          <article key={room.id} className="room-item">
            <div>
              <span className="role-group">{room.status}</span>
              <h3>Habitacion {room.room_number}</h3>
              <p>{room.hotel_name} - {room.hotel_location}</p>
              <p>{room.room_type} para {room.capacity} huespedes - ${Number(room.price_per_night).toFixed(2)}</p>
            </div>

            <div className="room-images">
              {(room.images || []).map((image) => (
                <img key={image} src={`${API_URL}${image}`} alt={`Habitacion ${room.room_number}`} />
              ))}
            </div>

            <label className="image-upload">
              Subir captura
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => handleUploadImage(room.id, event.target.files?.[0])}
              />
            </label>
            <div className="room-actions">
              <button type="button" onClick={() => handleEditRoom(room)}>Editar</button>
              <button type="button" className="danger" onClick={() => handleDeleteRoom(room.id)}>Remover</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
