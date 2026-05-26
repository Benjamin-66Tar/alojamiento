export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Hotel API',
    version: '1.0.0',
    description: 'API para servicios, usuarios, login, registro y perfiles del sistema Hotel.',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Sistema', description: 'Estado del backend y base de datos' },
    { name: 'Servicios', description: 'Servicios disponibles del hotel' },
    { name: 'Usuarios', description: 'Login, registro y perfil de usuario' },
    { name: 'Reservaciones', description: 'Comprobantes y documentos de reservacion' },
    { name: 'Administracion', description: 'Modulo administrativo de habitaciones' },
  ],
  paths: {
    '/': {
      get: {
        tags: ['Sistema'],
        summary: 'Informacion general de la API',
        responses: {
          200: {
            description: 'Rutas disponibles',
          },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Sistema'],
        summary: 'Verifica la conexion con PostgreSQL',
        responses: {
          200: {
            description: 'Conexion exitosa',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
          500: {
            description: 'Error de conexion con PostgreSQL',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/services': {
      get: {
        tags: ['Servicios'],
        summary: 'Lista los servicios activos',
        responses: {
          200: {
            description: 'Servicios activos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Service' },
                },
              },
            },
          },
          500: {
            description: 'Error consultando servicios',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/room-images/{id}': {
      get: {
        tags: ['Administracion'],
        summary: 'Obtiene una captura de habitacion guardada en PostgreSQL',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Imagen de habitacion',
            content: {
              'image/png': {
                schema: { type: 'string', format: 'binary' },
              },
              'image/jpeg': {
                schema: { type: 'string', format: 'binary' },
              },
              'image/webp': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          404: {
            description: 'Imagen no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/rooms': {
      get: {
        tags: ['Servicios'],
        summary: 'Lista habitaciones visibles al publico',
        responses: {
          200: {
            description: 'Habitaciones con capturas',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Room' },
                },
              },
            },
          },
        },
      },
    },
    '/api/login': {
      post: {
        tags: ['Usuarios'],
        summary: 'Inicia sesion con correo y contrasena',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Usuario autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: {
            description: 'Datos faltantes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          401: {
            description: 'Credenciales invalidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/register': {
      post: {
        tags: ['Usuarios'],
        summary: 'Registra un nuevo huesped',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario creado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: {
            description: 'Datos invalidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          409: {
            description: 'Correo ya registrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/profile/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'Obtiene el perfil de un usuario',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID del usuario',
          },
        ],
        responses: {
          200: {
            description: 'Perfil encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          404: {
            description: 'Perfil no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/reservations/pdf': {
      post: {
        tags: ['Reservaciones'],
        summary: 'Genera un comprobante PDF de reservacion',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReservationPdfRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Archivo PDF generado',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
          400: {
            description: 'Datos faltantes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/reservations': {
      get: {
        tags: ['Reservaciones'],
        summary: 'Lista reservaciones recientes para dashboard',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Reservaciones recientes',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Reservation' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Reservaciones'],
        summary: 'Crea una reservacion en PostgreSQL',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateReservationRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Reservacion creada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReservationCreated' },
              },
            },
          },
        },
      },
    },
    '/api/admin/rooms': {
      get: {
        tags: ['Administracion'],
        summary: 'Lista habitaciones con capturas',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Habitaciones',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Room' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Administracion'],
        summary: 'Agrega una habitacion',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateRoomRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Habitacion creada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Room' },
              },
            },
          },
        },
      },
    },
    '/api/admin/rooms/{id}/images': {
      post: {
        tags: ['Administracion'],
        summary: 'Sube una captura de habitacion',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UploadRoomImageRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Captura subida',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    imageUrl: { type: 'string', example: '/uploads/rooms/1-demo.png' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/admin/rooms/{id}': {
      put: {
        tags: ['Administracion'],
        summary: 'Edita una habitacion',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateRoomRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Habitacion actualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Room' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Administracion'],
        summary: 'Elimina una habitacion',
        parameters: [
          {
            name: 'x-user-id',
            in: 'header',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Habitacion eliminada',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    id: { type: 'integer', example: 1 },
                  },
                },
              },
            },
          },
          409: {
            description: 'La habitacion tiene reservaciones asociadas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      HealthResponse: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
          database: {
            type: 'object',
            properties: {
              server_time: {
                type: 'string',
                format: 'date-time',
                example: '2026-05-12T15:55:48.182Z',
              },
            },
          },
        },
      },
      Service: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'WiFi premium' },
          summary: {
            type: 'string',
            example: 'Internet de mayor velocidad para trabajo, streaming y videollamadas.',
          },
          price: { type: 'string', example: '12.00' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'usuario@hotel.com' },
          password: { type: 'string', format: 'password', example: '123456' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string', example: 'Juan Perez' },
          email: { type: 'string', format: 'email', example: 'juan@hotel.com' },
          password: { type: 'string', format: 'password', example: '123456' },
          phone: { type: 'string', example: '+52 555 123 4567' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          full_name: { type: 'string', example: 'Juan Perez' },
          email: { type: 'string', format: 'email', example: 'juan@hotel.com' },
          phone: { type: 'string', nullable: true, example: '+52 555 123 4567' },
          role_id: { type: 'string', example: 'huesped' },
          role_name: { type: 'string', example: 'Huesped' },
          can_access_dashboard: { type: 'boolean', example: false },
        },
      },
      ReservationPdfRequest: {
        type: 'object',
        required: ['guestName', 'reservationNumber', 'checkIn', 'checkOut', 'amountPaid', 'reservationType', 'hotelName'],
        properties: {
          guestName: { type: 'string', example: 'Juan Perez' },
          reservationNumber: { type: 'string', example: 'RSV-123456' },
          checkIn: { type: 'string', format: 'date', example: '2026-05-20' },
          checkOut: { type: 'string', format: 'date', example: '2026-05-22' },
          amountPaid: { type: 'number', example: 240 },
          reservationType: { type: 'string', example: 'Flexible' },
          hotelName: { type: 'string', example: 'Hotel' },
          nights: { type: 'integer', example: 2 },
        },
      },
      CreateReservationRequest: {
        type: 'object',
        required: ['guestName', 'roomId', 'checkIn', 'checkOut', 'reservationType', 'totalAmount'],
        properties: {
          guestId: { type: 'integer', example: 1 },
          guestName: { type: 'string', example: 'Juan Perez' },
          roomId: { type: 'integer', example: 1 },
          checkIn: { type: 'string', format: 'date', example: '2026-05-20' },
          checkOut: { type: 'string', format: 'date', example: '2026-05-22' },
          guestsCount: { type: 'integer', example: 2 },
          reservationType: { type: 'string', example: 'Flexible' },
          totalAmount: { type: 'number', example: 240 },
          paidAmount: { type: 'number', example: 240 },
        },
      },
      ReservationCreated: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          reservationNumber: { type: 'string', example: 'RSV-123456' },
          guestName: { type: 'string', example: 'Juan Perez' },
          hotelName: { type: 'string', example: 'Hotel' },
          roomType: { type: 'string', example: 'Deluxe' },
          checkIn: { type: 'string', format: 'date', example: '2026-05-20' },
          checkOut: { type: 'string', format: 'date', example: '2026-05-22' },
          amountPaid: { type: 'string', example: '240.00' },
          totalAmount: { type: 'string', example: '240.00' },
          reservationType: { type: 'string', example: 'Flexible' },
          status: { type: 'string', example: 'confirmada' },
        },
      },
      Reservation: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          reservation_number: { type: 'string', example: 'RSV-123456' },
          guest_name: { type: 'string', example: 'Juan Perez' },
          hotel_name: { type: 'string', example: 'Hotel' },
          room_type: { type: 'string', example: 'Deluxe' },
          check_in: { type: 'string', format: 'date', example: '2026-05-20' },
          check_out: { type: 'string', format: 'date', example: '2026-05-22' },
          status: { type: 'string', example: 'confirmada' },
          total_amount: { type: 'string', example: '240.00' },
          paid_amount: { type: 'string', example: '240.00' },
        },
      },
      CreateRoomRequest: {
        type: 'object',
        required: ['hotelName', 'hotelLocation', 'roomTypeName', 'description', 'capacity', 'pricePerNight', 'roomNumber'],
        properties: {
          hotelName: { type: 'string', example: 'Hotel' },
          hotelLocation: { type: 'string', example: 'Av. Principal 123, Ciudad principal' },
          roomTypeName: { type: 'string', example: 'Deluxe' },
          description: {
            type: 'string',
            example: 'Habitacion amplia con cama king, escritorio y vista a la ciudad.',
          },
          capacity: { type: 'integer', example: 2 },
          pricePerNight: { type: 'number', example: 120 },
          roomNumber: { type: 'string', example: '101' },
          status: { type: 'string', example: 'available' },
        },
      },
      UploadRoomImageRequest: {
        type: 'object',
        required: ['dataUrl'],
        properties: {
          dataUrl: {
            type: 'string',
            example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          },
          fileName: { type: 'string', example: 'habitacion-101.png' },
        },
      },
      Room: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          room_number: { type: 'string', example: '101' },
          status: { type: 'string', example: 'available' },
          hotel_name: { type: 'string', example: 'Hotel' },
          hotel_location: { type: 'string', example: 'Av. Principal 123, Ciudad principal' },
          room_type: { type: 'string', example: 'Deluxe' },
          description: {
            type: 'string',
            example: 'Habitacion amplia con cama king, escritorio y vista a la ciudad.',
          },
          capacity: { type: 'integer', example: 2 },
          price_per_night: { type: 'string', example: '120.00' },
          images: {
            type: 'array',
            items: { type: 'string', example: '/uploads/rooms/1-demo.png' },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'No se pudo completar la solicitud.' },
          detail: { type: 'string', example: 'Detalle tecnico del error' },
        },
      },
    },
  },
}
